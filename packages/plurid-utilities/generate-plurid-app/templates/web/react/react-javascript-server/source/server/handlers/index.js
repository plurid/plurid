// #region imports
    // #region libraries
    import cors from 'cors';

    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries
// #endregion imports



// #region module
export const setRouteHandlers = (
    server,
) => {
    // const handler = server.handle();

    // mock-up API request handler
    // handler.post('/api/v1/status', (request, response, next) => {
    //     response.setHeader('Content-Type', 'application/json');
    //     response.end(
    //         JSON.stringify(
    //             { status: true },
    //         ),
    //     );
    // });
}


export const setPttpCors = (
    server,
) => {
    if (!server.usePTTP) {
        return;
    }

    const instance = server.instance();

    const corsOptions = {
        credentials: true,
        origin: (_, callback,) => {
            return callback(null, true);
        },
    };
    const PTTP_ROUTE = '/pttp';

    instance.options(PTTP_ROUTE, cors(corsOptions));
    instance.use(
        cors(corsOptions),
    );
}
// #endregion module
