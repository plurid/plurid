import PluridServer, {
    PluridServerRoute,
    PluridServerMiddleware,
    PluridServerPartialOptions,
} from '@plurid/plurid-react-server';

import Application from '../client/App';
import helmet from '../client/App/services/helmet';



const PORT = 33000;


const routes: PluridServerRoute[] = [
    // route objects
];

const middleware: PluridServerMiddleware[] = [
    // express-like middleware
];

const options: PluridServerPartialOptions = {
    root: 'plurid-app',
    open: true,
};


const pluridServer = new PluridServer({
    Application,
    routes,
    helmet,
    middleware,
    options,
});


pluridServer.start(PORT);
