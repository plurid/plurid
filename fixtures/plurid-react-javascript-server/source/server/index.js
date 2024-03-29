// #region imports
    // #region libraries
    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries


    // #region external
    import helmet from '../shared/kernel/services/helmet';

    /** uncomment to use services */
    // [START redux import]
    import reduxStore from '../shared/kernel/services/state/store';
    import reduxContext from '../shared/kernel/services/state/context';
    // [END redux import]
    // [START apollo import]
    import apolloClient from '../shared/kernel/services/graphql/client';
    // [END apollo import]
    // [START stripe import]
    // import {
    //     STRIPE_API_KEY as stripeAPIKey,
    // } from '../client/App/data/constants';
    // [END stripe import]

    import {
        shell,
        routes,
        planes,
    } from '../shared';
    // #endregion external


    // #region internal
    import preserves from './preserves';

    import {
        setRouteHandlers,
        setPttpCors,
    } from './handlers';
    // #endregion internal
// #endregion imports



// #region module
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

const quiet = false;
// const debug = isProduction
//     ? 'info'
//     : 'error';
const debug = 'info';

const usePTTP = true;


// // [START stripe script]
// const stripeScript = '<script src="https://js.stripe.com/v3/"></script>';
// // [END stripe script]



/** Custom styles to be loaded into the template. */
const styles = [
    //
];


/** Express-like middleware. */
const middleware = [
    //
];


/** Services to be used in the application. */
const services = [
    /** uncomment to use services */
    // [START stripe service]
    // {
    //     name: 'Stripe',
    //     package: 'react-stripe-elements',
    //     provider: 'StripeProvider',
    //     properties: {
    //         stripe: null,
    //     },
    // },
    // [END stripe service]

    // [START apollo service]
    {
        name: 'Apollo',
        package: '@apollo/client',
        provider: 'ApolloProvider',
        properties: {
            client: apolloClient,
        },
    },
    // [END apollo service]

    // [START redux service]
    {
        name: 'Redux',
        package: 'react-redux',
        provider: 'Provider',
        properties: {
            store: reduxStore({}),
            context: reduxContext,
        },
    },
    // [END redux service]
];


const options = {
    buildDirectory,
    open: openAtStart,
    quiet,
    debug,
};

const template = {
    root: applicationRoot,
};



/** SERVER */
// generate server
const pluridServer = new PluridServer({
    helmet,
    shell,
    routes,
    planes,
    preserves,
    styles,
    middleware,
    services,
    options,
    template,
    usePTTP,
});


// handle non-GET or custom routes (such as API requests, or anything else)
setRouteHandlers(pluridServer);

// if using PTTP
setPttpCors(pluridServer);


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
// #endregion module



// #region exports
export default pluridServer;
// #endregion exports
