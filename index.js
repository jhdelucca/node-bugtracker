const express = require('express');
const app = express();
var passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');
const GoogleSpreadsheet = require('google-spreadsheet');
const credentials = require('./bugtracker.json');
const { promisify } = require('util');
const sgMail = require('@sendgrid/mail');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');

require('./configs/google.strategy');
app.use(require('express-session')({ secret: 'shhhh...', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const docId = 'ID-SPREADSHEET';
const worksheetIndex = 0;
const sendGridKey = 'SEND-GRID-KEY';
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect('/');
  }

app.get('/', (request, response) => {
    response.render('login');
});

app.get('/home' , ensureAuthenticated , (req,res) => {
    res.render('home');
})

app.post('/home', async (request, response) => {
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
        if (request.body.issueType === 'CRITICAL') {
            sgMail.setApiKey(sendGridKey);
            const msg = {
                to: 'email-desejado',
                from: 'email-desejado',
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

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/home');
    });



app.listen(3000, (err) => {
    if (err) {
        console.log('aconteceu um erro', err)
    } else {
        console.log('bugtracker rodando na porta 3000')
    }
});

