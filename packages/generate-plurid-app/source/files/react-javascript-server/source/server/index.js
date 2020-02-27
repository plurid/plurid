import PluridServer from '@plurid/plurid-react-server';

import Application from '../client/App';



const PORT = 33000;


const routes = [
    // route objects
];

const middleware = [
    // express-like middleware
];

const options = {
    root: 'plurid-app',
    open: true,
};


const pluridServer = new PluridServer({
    Application,
    routes,
    middleware,
    options,
});


pluridServer.start(PORT);
