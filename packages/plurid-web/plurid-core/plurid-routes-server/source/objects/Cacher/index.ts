// #region imports
    // #region libraries
    import {
        time,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        ONE_DAY,
    } from '../../data/constants';
    // #endregion external
// #endregion imports



// #region module
class Cacher {
    private routes = new Map();

    public get(
        route: string,
    ) {
        const cached = this.routes.get(route);

        if (!cached) {
            return;
        }

        if (time.now() > cached.expiration) {
            return;
        }

        return cached.data;
    }

    public set(
        route: string,
        data: any,
    ) {
        this.routes.set(
            route,
            {
                data,
                expiration: time.now() + ONE_DAY,
            },
        );
    }
}
// #endregion module



// #region exports
export default Cacher;
// #endregion exports
