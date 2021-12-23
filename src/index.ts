import fs = require('fs');
import whatsapp = require('whatsapp-web.js');

const SESSION_FILE_PATH = './whatsapplogin.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new whatsapp.Client({ puppeteer: { headless: false }, session: sessionCfg });

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr); // Required dom lib
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('ready', () => {
    console.log('Client Connected');
});

client.on('message', msg => {

    const command = msg.body 

    const a = 'foo';
    const b = 'bar';

    if (command == a) {
        msg.reply(b);
        console.info(msg.body)
    }

});

client.initialize();