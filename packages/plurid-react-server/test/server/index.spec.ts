import Server from '../../src/';
// import { ServerOptions } from '../../src/server';

// const options: ServerOptions = {
//     quiet: false,
// }

// const server = new Server(options);

const server = new Server({ quiet: false});

server.logs('testing');
