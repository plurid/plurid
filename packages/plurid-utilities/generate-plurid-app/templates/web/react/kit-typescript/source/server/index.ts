import config from '../../plurid.config';
import {
    startPluridServer,
} from '@plurid/plurid-kit/server';



// creates the server from the config and starts it on `$PORT` (the `plurid` CLI sets it)
startPluridServer(config);
