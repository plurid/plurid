// #region imports
const PluridRoutesServer = require('../distribution').default;
// #endregion imports



// #region data
const initialRoutes = {
    '/example-valid-registered': {
        id: '/example-valid-registered',
    },
    '/example-valid-elementql': {
        elementql: '/example-valid-elementql',
    },
    '/example-invalid': {
    },
};

const routes = new Map(
    Object.entries(initialRoutes),
);

const validToken = 'token';
// #endregion data



// #region functions
const queryRoute = async (
    route,
) => {
    console.log('queryRoute', route);

    return routes.get(route);
}

const registerRoute = async (
    route,
    data,
) => {
    console.log('registerRoute', route, data);

    routes.set(route, data);

    return true;
}

const verifyToken = async (
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
