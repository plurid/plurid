import PluridServer, {
    PluridServerMiddleware,
    PluridServerService,
    PluridServerServicesData,
    PluridServerPartialOptions,
} from '@plurid/plurid-react-server';

import helmet from '../client/App/services/helmet';

/** uncomment to use services */
import reduxStore from '../client/App/services/state/store';
import graphqlClient from '../client/App/services/graphql/client';
// import {
//     STRIPE_API_KEY as stripeAPIKey,
// } from '../client/App/data/constants';

import {
    routing,
} from '../common';



const PORT = process.env.PORT || 33000;

const stripeScript = '<script src="https://js.stripe.com/v3/"></script>';

const styles: string[] = [
    // custom styles to be loaded into the template
]

const middleware: PluridServerMiddleware[] = [
    // express-like middleware
];

const services: PluridServerService[] = [
    // services to be used in the application,
    /** uncomment to use services */
    'Redux',
    'GraphQL',
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
    open: process.env.ENV_MODE === 'production' ? false : true,
};

const pluridServer = new PluridServer({
    routing,
    helmet,
    styles,
    middleware,
    services,
    servicesData,
    options,
});


if (require.main === module) {
    pluridServer.start(PORT);
}


export default pluridServer;
