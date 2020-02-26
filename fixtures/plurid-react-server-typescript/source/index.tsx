import React from 'react';

import PluridServer, {
    PluridServerRoute,
    PluridServerMiddleware,
    PluridServerPartialOptions,
} from '@plurid/plurid-react-server';

// import Application from './client/App';



const Application = () => {
    return (
        <div>Plurid' Application</div>
    );
}


const PORT = 33000;


const routes: PluridServerRoute[] = [
    // route objects
];

const middleware: PluridServerMiddleware[] = [
    // express-like middleware
];

const options: PluridServerPartialOptions = {
    root: 'plurid',
    // plurid' server specific options
};


const pluridServer = new PluridServer({
    Application,
    routes,
    middleware,
    options,
});


pluridServer.start(PORT);
