import React from 'react';

import PluridServer, {
    PluridServerPartialOptions,
} from '@plurid/plurid-react-server';

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
const middleware: any[] = [
    // express-like middleware
];
const options: PluridServerPartialOptions = {
    root: 'foo',
    // plurid' server specific options
};


const pluridServer = new PluridServer({
    Application,
    routes,
    middleware,
    options,
});


pluridServer.start(PORT);
