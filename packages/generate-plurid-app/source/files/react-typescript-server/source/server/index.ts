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
    paths,
} from '../common';



/** ENVIRONMENT */
const watchMode = process.env.PLURID_WATCH_MODE === 'true';
const isProduction = process.env.ENV_MODE === 'production';
const buildDirectory = process.env.PLURID_BUILD_DIRECTORY || 'build';
const port = process.env.PORT || 63000;



/** CONSTANTS */
const applicationRoot = 'plurid-app';
const openAtStart = watchMode
    ? false
    : isProduction
        ? false
        : true;
const debug = isProduction
    ? 'info'
    : 'error';


const stripeScript = '<script src="https://js.stripe.com/v3/"></script>';


/** Custom styles to be loaded into the template. */
const styles: string[] = [
    //
];


/** Express-like middleware. */
const middleware: PluridServerMiddleware[] = [
    //
];


/** Services to be used in the application. */
const services: PluridServerService[] = [
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
    root: applicationRoot,
    buildDirectory,
    open: openAtStart,
    debug,
};



/** SERVER */
const pluridServer = new PluridServer({
    paths,
    helmet,
    styles,
    middleware,
    services,
    servicesData,
    options,
});



/**
 * If the file is called directly, as in `node build/index.js`,
 * it will run the server.
 *
 * The check is in place so that the server can also be imported
 * for programmatic usage.
 */
if (require.main === module) {
    pluridServer.start(port);
}


export default pluridServer;
