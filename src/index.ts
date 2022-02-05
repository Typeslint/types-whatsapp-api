import fs = require('fs');
import whatsapp = require('whatsapp-web.js');
import malScraper = require('mal-scraper');
import osu = require('node-osu');
import { osutoken, prefix, DEFAULT_ERROR } from './data/config';
const osuAPI = new osu.Api(osutoken, {
    notFoundAsError: false,
    completeScores: false,
    parseNumeric: false
})

process.on('unhandledRejection', error => {
    console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('uncaughtException:', error)
});

process.on('uncaughtExceptionMonitor', error => {
    console.error('uncaughtExceptionMonitor:', error)
});

const SESSION_FILE_PATH = '../whatsapplogin.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new whatsapp.Client({ puppeteer: { headless: false }, session: sessionCfg });

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
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

client.on('message', async msg => {

    const args = msg.body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    const a = 'foo';
    const b = 'bar';

    if (command == a) {
        msg.reply(b);
        console.info(msg.body);
    }

    if (command === 'osu') {
        if (!args.join(' ')) return msg.reply(DEFAULT_ERROR);
        const data = await osuAPI.getUser({
            u: args[0], m: 3
        });
        if (!data) return msg.reply(DEFAULT_ERROR);
        if (!data.pp.rank || !data.accuracy === null) return msg.reply(DEFAULT_ERROR);
        const resp = 'Name: ' + data.name + '\n\n' + 'Rank: ' + data.pp.rank + '\n\n' + 'Level: ' + data.level + '\n\n' + 'Accuracy: ' + data.accuracy + '\n\n' + 'Joined: ' + data.raw_joinDate + '\n\n' + 'Performance Point: ' + data.pp.raw + '\n\n' + 'URL: ' + `https://osu.ppy.sh/users/${data.id}`;
        const media = await whatsapp.MessageMedia.fromUrl(`https://a.ppy.sh/${data.id}`, {unsafeMime: true});
        await msg.reply(media);
        await msg.reply(resp);
        console.info(msg.body);
    }

    if (command === 'anime') {
        if (!args.join(' ')) return msg.reply(DEFAULT_ERROR);
        const animevalue = args.join('');
        const animescraper = await malScraper.getInfoFromName(animevalue);
        if (!animescraper) return msg.reply(DEFAULT_ERROR);
        const resp = 'Synopsis: ' + animescraper.synopsis;
        const resp2 = 'Title: ' + animescraper.title + '\n\n' + 'Type: ' + animescraper.type + '\n\n' + 'Episode: ' + animescraper.episodes + '\n\n' + 'Duration: ' + animescraper.duration + '\n\n' + 'Genres: ' + animescraper.genres?.join(', ') + '\n\n' + 'Status: ' + animescraper.status + '\n\n' + 'Score: ' + animescraper.score;
        const media = await whatsapp.MessageMedia.fromUrl(animescraper.picture || '');
        await msg.reply(media);
        await msg.reply(resp);
        await msg.reply(resp2);
        console.info(msg.body);
    }

});

client.initialize();