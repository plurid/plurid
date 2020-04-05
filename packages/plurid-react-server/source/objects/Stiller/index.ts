import {
    StillerOptions,
} from '../../data/interfaces';



/**
 * The Server will parse the given application routes,
 * and will decide which ones to send to the Stiller.
 *
 * The Stiller spins a server, accesses the routes,
 * views the application routes as a browser,
 * extracts the HTML of the plurid pages,
 * and returns a data structure which will be used by the Server
 * to serve the adequate plurid space structure when asked for the given route.
 */
class Stiller {
    private routes: string[];

    constructor(
        options: StillerOptions,
    ) {
        const {
            routes,
        } = options;

        this.routes = routes;
    }

    async * still () {
        for (const route of this.routes) {
            yield route;
        }
    }
}


export default Stiller;
