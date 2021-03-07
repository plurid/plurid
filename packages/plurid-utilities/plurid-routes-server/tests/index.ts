// #region imports
import PluridRoutesServer, {
    QueryRoute,
    RegisterRoute,
    VerifyToken,
    RouteElement,
} from '../distribution';
// #endregion imports



// #region data
/**
 * Mock-up data.
 *
 * In the real case, the `initialRoutes` would be loaded from a database,
 * and the `validToken` would assume an authentication/authorization mechanism.
 */

/**
 * Record of `RouteElement | any` to account for the invalid example
 */
 const initialRoutes: Record<string, RouteElement | any> = {
    '/example-valid-registered': {
        id: '/example-valid-registered',
    },
    '/example-valid-elementql': {
        elementql: '/example-valid-elementql',
    },
    '/example-invalid': {
    },
};

/**
 * Map of `any` to account for the invalid example.
 * Regular case assumes `Map<string, RouteElement>`
 */
const routes: Map<string, any> = new Map(
    Object.entries(initialRoutes),
);

const validToken = 'token';
// #endregion data



// #region functions
const queryRoute: QueryRoute = async (
    route,
) => {
    console.log('queryRoute', route);

    return routes.get(route);
}

const registerRoute: RegisterRoute = async (
    route,
    data,
) => {
    console.log('registerRoute', route, data);

    routes.set(route, data);

    return true;
}

const verifyToken: VerifyToken = async (
    token,
) => {
    console.log('verifyToken', token);

    return token === validToken;
}
// #endregion functions



// #region server
const server = new PluridRoutesServer({
    queryRoute,
    registerRoute,
    verifyToken,
});


server.handle().post(
    '/cache-reset',
    (request, response) => {
        try {
            if (!request.body.token) {
                console.log('cacheReset bad request');
                response
                    .status(405)
                    .send('Bad Request');
                return;
            }

            if (request.body.token !== validToken) {
                console.log('cacheReset invalid token');
                response
                    .status(403)
                    .send('Forbidden');
                return;
            }

            console.log('cacheReset');
            server.cacheReset();

            response.send('Cache Reseted');
        } catch (error) {
            console.log('cacheReset error', error);

            response
                .status(500)
                .send('Server Error');
        }
    }
)

server.start();
// #endregion server
