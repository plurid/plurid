const {
    PluridLiveServer,
} = require('@plurid/plurid-react-server');



const liveServer = new PluridLiveServer({
    server: './source/server/index.js',
});
liveServer.start();
