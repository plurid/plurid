import PluridServer from '@plurid/plurid-react-server';



export const setRouteHandlers = (
    server: PluridServer,
) => {
    // mock-up API request handler
    server.post('/api/v1/status', (request, response, next) => {
        response.setHeader('Content-Type', 'application/json');
        response.end(
            JSON.stringify(
                { status: true },
            ),
        );
    });
}
