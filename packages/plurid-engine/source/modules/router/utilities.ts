import {
    Indexed,
    PluridRouterRoute,
} from '@plurid/plurid-data';



export const mapPathsToRoutes = <T, V>(
    paths: Indexed<string>,
    view: V,
) => {
    const routes: PluridRouterRoute<T>[] = [];

    for (const [key, path] of Object.entries(paths)) {
        const pathView = (view as any)[key];

        if (pathView) {
            const route: PluridRouterRoute<T> = {
                path,
                view: pathView,
            };
            routes.push(route);
        }
    }

    return routes;
}



// const intraspatialExample = '://page';
// const interspatialSameRouteExample = '://space://page';
// const interspatialDifferentRouteExample = '://route://space://page';
// const outerspatialControlledOriginExample = 'https://origin://route://space://page';
// const outerspatialForeignOriginExample = 'http://origin://route://space://page';

interface PluridLinkURLDivisions {
    protocol: string;
    origin: string;
    route: string;
    space: string;
    page: string;
    valid: boolean;
}

export const pluridLinkURLDivider = (
    link: string,
): PluridLinkURLDivisions => {
    const split = link.split('://').filter(value => value !== '');

    let protocol = '';
    let origin = '';
    let route = '';
    let space = '';
    let page = '';
    let valid = false;

    if (
        split.length === 0
        || split.length > 5
    ) {
        const url = {
            protocol,
            origin,
            route,
            space,
            page,
            valid,
        };
        return url;
    }

    switch (split.length) {
        case 1:
            page = split[0];
            break;
        case 2:
            page = split[1];
            space = split[0];
            break;
        case 3:
            page = split[2];
            space = split[1];
            route = split[0];
            break;
        case 4:
            page = split[3];
            space = split[2];
            route = split[1];
            origin = split[0];
            protocol = 'https';
            break;
        case 5:
            page = split[4];
            space = split[3];
            route = split[2];
            origin = split[1];
            protocol = split[0];
            break;
    }

    const url = {
        protocol,
        origin,
        route,
        space,
        page,
        valid: true,
    };

    return url;
}
