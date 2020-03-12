import express from 'express';

import store from '../services/store';


const app = express();
const port = 33800;

app.get('/access/:accessCode', (req, res) => res.send(req.params.accessCode || ''));


const authenticateCommand = async () => {
    // start server on port 33800
    app.listen(port);

    // open account.plurid.com?cli=33800

    // the user logins into account, creates an account

    // the user is redirected to http://localhost:33800/access/<access-code>

    // the server listens for the access code and queries api.plurid.com for the tokens

    console.log('authenticate');
}


export default authenticateCommand;
