import React from 'react';

import PluridServer from '@plurid/plurid-react-server';

// import Application from './client/App';


const Application = () => {
    return (
        <div>Plurid' Application</div>
    );
}


const PORT = 33000;

const routes: any[] = [
    // route objects
];
const index = '/path/to/index';
const middleware: any[] = [
    // express-like middleware
];
const options = {
    // plurid' server specific options
};


const pluridServer = new PluridServer({
    Application,
    routes,
    index,
    middleware,
    options,
});


pluridServer.start(PORT);
