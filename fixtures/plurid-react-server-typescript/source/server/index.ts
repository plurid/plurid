import PluridServer, {
    PluridServerRoute,
    PluridServerMiddleware,
    PluridServerService,
    PluridServerServicesData,
    PluridServerPartialOptions,
} from '@plurid/plurid-react-server';

import Application from '../client/App';

import helmet from '../client/App/services/helmet';

/** uncomment to use services */
import reduxStore from '../client/App/services/state/store';
import graphqlClient from '../client/App/services/graphql/client';
import {
    STRIPE_API_KEY as stripeAPIKey,
} from '../client/App/data/constants';

import {
    routing,
} from '../common';



const PORT = 33000;

const stripeScript = '<script src="https://js.stripe.com/v3/"></script>';



const routes: PluridServerRoute[] = [
    // route objects
];

const styles: string[] = [
    // custom styles to be loaded into the template
]

const middleware: PluridServerMiddleware[] = [
    // express-like middleware
];

const services: PluridServerService[] = [
    // services to be used in the application,
    /** uncomment to use services */
    // 'Redux',
    // 'GraphQL',
    // 'Stripe',
];

const servicesData: PluridServerServicesData = {
    /** uncomment to use services */
    reduxStore,
    reduxStoreValue: {},
    graphqlClient,
    // stripeAPIKey,
    // stripeScript,
};

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
    services,
    servicesData,
    options,
});


pluridServer.start(PORT);
