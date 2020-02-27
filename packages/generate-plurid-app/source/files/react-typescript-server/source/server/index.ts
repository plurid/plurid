import PluridServer, {
    PluridServerRoute,
    PluridServerMiddleware,
    PluridServerAddons,
    PluridServerPartialOptions,
} from '@plurid/plurid-react-server';

import Application from '../client/App';
import helmet from '../client/App/services/helmet';



const PORT = 33000;


const routes: PluridServerRoute[] = [
    // route objects
];

const styles: string[] = [
    // custom styles to be loaded into the template
]

const middleware: PluridServerMiddleware[] = [
    // express-like middleware
];

const addons: PluridServerAddons[] = [
    // addons to be used in the application,
    'GraphQL',
    'Redux',
];

const options: PluridServerPartialOptions = {
    root: 'plurid-app',
    open: true,
};


const pluridServer = new PluridServer({
    Application,
    routes,
    helmet,
    styles,
    middleware,
    addons,
    options,
});


pluridServer.start(PORT);
