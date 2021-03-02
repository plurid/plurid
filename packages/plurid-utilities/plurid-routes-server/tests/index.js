const PluridRoutesServer = require('../distribution').default;



const queryRoute = async (
    route,
) => {
    console.log('queryRoute', route);

    return {
        elementql: '/path/to/element',
    };
}

const registerRoute = async (
    route,
    data,
) => {
    console.log('registerRoute', route, data);

    return true;
}

const verifyToken = async (
    token,
) => {
    console.log('verifyToken', token);

    return true;
}


const server = new PluridRoutesServer({
    queryRoute,
    registerRoute,
    verifyToken,
});

server.start();
