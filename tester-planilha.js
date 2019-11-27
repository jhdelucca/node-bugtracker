const GoogleSpreadsheet = require('google-spreadsheet');
const credentials = require('./bugtracker.json');

const doc = new GoogleSpreadsheet('1tfBEtaxBpdXkuRXytXKHZt9nO4KiT6XcacxSTBVgIno');
doc.useServiceAccountAuth(credentials, (err) => {
    if (err) {
        console.log('não foi possivel acessar a planilha')
    } else {
        console.log('planilha aberta');
        doc.getInfo((err, info) => {
            const worksheet = info.worksheets[0];
            worksheet.addRow({name:'João H' , email:'test@hotmail.com'}, err => {
                console.log("Linha inserida !");
            });

        });
    }
});