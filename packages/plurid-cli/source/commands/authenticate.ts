import express from 'express';

import open from 'open';

import store from '../services/store';



const app = express();
app.get('/access/:accessCode', (req, res) => {
    const accessCode = req.params.accessCode || '';
    store.set('accessCode', accessCode);
    console.log(`\n\tSet access code: ${accessCode}`);

    res.send(accessCode);
});


const authenticateCommand = async () => {
    // start server on port 33800
    // get useable port
    const port = 33800;
    const server = app.listen(port);


    // open account.plurid.com?cli=33800
    // the user logins into account, creates an account
    // the user is redirected to http://localhost:33800/access/<access-code>
    const accountLink = `https://account.plurid.com?cli=${port}`;
    open(accountLink);
    console.log(`\n\tOpened ${accountLink} in the default browser.`);


    // listen for accessCode to be set in store
    const interval = setInterval(() => {
        const accessCode = store.get('accessCode');

        if (accessCode) {
            // queries api.plurid.com for the tokens
            const username = 'username';
            console.log(`\n\tYou are now logged in as ${username}.`);

            store.set('accessCode', '');
            server.close();
            clearInterval(interval);
            return;
        }

        // check if more than 5 minutes have passed and close server
    }, 1500);
}


export default authenticateCommand;
