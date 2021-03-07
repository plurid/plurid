// #region imports
    // #region libraries
    import {
        time,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        RouteElement,
        CachedRouteElement,
    } from '../../data/interfaces';

    import {
        ONE_DAY,
    } from '../../data/constants';
    // #endregion external
// #endregion imports



// #region module
class Cacher {
    private routes: Map<string, CachedRouteElement> = new Map();

    public get(
        route: string,
    ) {
        const cached = this.routes.get(route);

        if (!cached) {
            return;
        }

        if (time.now() > cached.expiration) {
            this.routes.delete(route);
            return;
        }

        return cached.data;
    }

    public set(
        route: string,
        data: RouteElement,
    ) {
        this.routes.set(
            route,
            {
                data,
                expiration: time.now() + ONE_DAY,
            },
        );
    }

    public reset() {
        this.routes = new Map();
    }
}
// #endregion module



// #region exports
export default Cacher;
// #endregion exports
