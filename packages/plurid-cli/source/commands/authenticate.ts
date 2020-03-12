import express from 'express';

import open from 'open';

import getPort from 'get-port';

import store from '../services/store';



const app = express();
app.get('/access/:accessCode', (req, res) => {
    const accessCode = req.params.accessCode || '';
    store.set('accessCode', accessCode);
    console.log(`\n\tSet access code: ${accessCode}`);

    res.send(accessCode);
});


const authenticateCommand = async () => {
    const port = await getPort({
        port: getPort.makeRange(33800, 33900),
    });
    const server = app.listen(port);


    // open account.plurid.com?cli=33800&cliAccess=true
    // the user logins into account, creates an account
    // the user is redirected to http://localhost:33800/access/<access-code>
    const accountLink = `https://account.plurid.com?cli=${port}&cliAccess=true`;
    open(accountLink);
    console.log(`\n\tOpened ${accountLink} in the default browser.`);


    // listen for accessCode to be set in store
    const interval = setInterval(async () => {
        const accessCode = store.get('accessCode');

        if (accessCode) {
            store.set('accessCode', '');
            server.close();
            clearInterval(interval);

            // queries api.plurid.com for the tokens
            // set tokens
            // set user

            const username = 'username';
            console.log(`\n\tSuccessfully logged in as ${username}.`);
            return;
        }

        // check if more than 5 minutes have passed and close server
    }, 1500);
}


export default authenticateCommand;
