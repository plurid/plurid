import path from 'path';

import express from 'express';

import open from 'open';

import getPort from 'get-port';

import store from '../services/store';

import client from '../services/graphql/client';
import {
    GET_ACCESS_CODE_TOKENS,
} from '../services/graphql/query';



const app = express();
app.use(express.static('server'));
app.get('/access/:accessCode', (req, res) => {
    const accessCode = req.params.accessCode || '';
    store.set('accessCode', accessCode);
    console.log(`\n\tLogging in with access code: ${accessCode}`);

    res.sendFile(path.join(__dirname, './server/access.html'));
});


const authenticateCommand = async () => {
    const port = await getPort({
        port: getPort.makeRange(33800, 33900),
    });
    const server = app.listen(port);

    const accountLink = `https://account.plurid.com?cli=${port}&cliAccess=true`;
    open(accountLink);
    console.log(`\n\tOpened ${accountLink} in the default browser.`);

    const interval = setInterval(async () => {
        const accessCode = store.get('accessCode');

        if (accessCode) {
            store.set('accessCode', '');
            server.close();
            clearInterval(interval);

            const input = {
                value: accessCode,
            };
            const query = await client.query({
                query: GET_ACCESS_CODE_TOKENS,
                variables: {
                    input,
                },
            });

            const response = query.data.getAccessCodeTokens;
            if (!response.status) {
                console.log(`\n\tSomething went wrong. Could not login.\n`);

                return;
            }

            const {
                data,
            } = response;

            const {
                token,
                refreshToken,
            } = data;

            store.set('token', token);
            store.set('refreshToken', refreshToken);

            const username = 'username';
            console.log(`\n\tSuccessfully logged in as ${username}.\n`);
            return;
        }

        // check if more than 5 minutes have passed and close server
    }, 1500);
}


export default authenticateCommand;
