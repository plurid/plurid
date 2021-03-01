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
) => {
    console.log('registerRoute', route, data);

    return true;
}


const server = new PluridRoutesServer({
    queryRoute,
    registerRoute,
});

server.start();
