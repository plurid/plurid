import {
    PluridServerRoute,
    PluridRouterConfiguration,
} from '../../data/interfaces';



export default class PluridRouter {
    private routes: PluridServerRoute[];

    constructor(
        configuration: PluridRouterConfiguration,
    ) {
        const {
            routes,
        } = configuration;

        this.routes = routes;
    }

    public match(
        url: string,
    ) {
        return this.routes[0];
    }
}
