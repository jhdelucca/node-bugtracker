const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const GoogleSpreadsheet = require('google-spreadsheet');
const credentials = require('./bugtracker.json');
const { promisify } = require('util');
const sgMail = require('@sendgrid/mail');

const docId = '1tfBEtaxBpdXkuRXytXKHZt9nO4KiT6XcacxSTBVgIno';
const worksheetIndex = 0;
const sendGridKey = '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';
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    response.render('home');
});

app.post('/', async (request, response) => {
    try {
        const doc = new GoogleSpreadsheet(docId);
        await promisify(doc.useServiceAccountAuth)(credentials);
        console.log('planilha aberta');
        const info = await promisify(doc.getInfo)();
        const worksheet = info.worksheets[worksheetIndex];
        await promisify(worksheet.addRow)({
            name: request.body.name,
            email: request.body.email,
            issueType: request.body.issueType,
            source: request.query.source || 'direct',
            howToReproduce: request.body.howToReproduce,
            expectedOuput: request.body.expectedOuput,
            receivedOuput: request.body.receivedOuput,
            userAgent: request.body.userAgent,
            userDate: request.body.userDate
        });

        // se for critico
        if(request.body.issueType === 'CRITICAL') {
        sgMail.setApiKey(sendGridKey);
        const msg = {
            to: 'delucca62@gmail.com',
            from: 'jhdbarros@hotmail.com',
            subject: 'BUG critico reportado',
            text: ` O usuário ${request.body.name} reportou um problema. `,
            html: ` O usuário ${request.body.name} reportou um problema. `
        };
        await sgMail.send(msg);
    }
        response.render('sucess')
    } catch{
        response.send("Erro ao enviar formulario");
        console.log(err);
    }
});




app.listen(3000, (err) => {
    if (err) {
        console.log('aconteceu um erro', err)
    } else {
        console.log('bugtracker rodando na porta 3000')
    }
});

