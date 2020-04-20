import {
    Indexed,
    PluridRouterPath,
    RouteDivisions,
} from '@plurid/plurid-data';

import {
    cleanPathElement,
} from '../../utilities';



export const mapPathsToRoutes = <T, V>(
    paths: Indexed<string>,
    view: V,
) => {
    const routes: PluridRouterPath[] = [];

    for (const [key, path] of Object.entries(paths)) {
        const pathView = (view as any)[key];

        if (pathView) {
            const route: PluridRouterPath = {
                value: '',
                // path,
                // view: pathView,
            };
            routes.push(route);
        }
    }

    return routes;
}


// const interplanarExample = '://plane'; // or intraclusterial
// const interclusterialExample = '://cluster://plane'; // or intrauniversal
// const interuniversalExample = '://universe://cluster://plane'; // or intraspatial
// const interspatialExample = '://space://universe://cluster://plane'; // or intraroutal
// const interroutalExample = '://route://space://universe://cluster://plane';
// const pluriversalExample = 'https://origin://route://space://universe://cluster://plane';
// const pluriversalExampleControlledOrigin = 'https://corigin://route://space://universe://cluster://plane';
// const pluriversalExampleForeignOrigin = 'https://forigin://route://space://universe://cluster://plane';


export const pluridLinkPathDivider = (
    route: string,
): RouteDivisions => {
    const split = route
        .split('://')
        .filter(value => value !== '')
        .map(value => cleanPathElement(value));

    let protocol = 'http';
    const host = {
        value: '',
        controlled: false,
    };
    const path = {
        value: '',
        parameters: {},
        query: {},
    };
    const space = {
        value: '',
        parameters: {},
        query: {},
    };
    const universe = {
        value: '',
        parameters: {},
        query: {},
    };
    const cluster = {
        value: '',
        parameters: {},
        query: {},
    };
    const plane = {
        value: '',
        parameters: {},
        query: {},
    };
    let valid = false;

    if (
        split.length === 0
        || split.length > 7
    ) {
        const url = {
            protocol,
            host,
            path,
            space,
            universe,
            cluster,
            plane,
            valid,
        };
        return url;
    }

    switch (split.length) {
        case 1:
            plane.value = split[0];
            break;
        case 2:
            cluster.value = split[0];
            plane.value = split[1];
            break;
        case 3:
            universe.value = split[0];
            cluster.value = split[1];
            plane.value = split[2];
            break;
        case 4:
            space.value = split[0];
            universe.value = split[1];
            cluster.value = split[2];
            plane.value = split[3];
            break;
        case 5:
            path.value = split[0];
            space.value = split[1];
            universe.value = split[2];
            cluster.value = split[3];
            plane.value = split[4];
            break;
        case 6:
            host.value = split[0];
            path.value = split[1];
            space.value = split[2];
            universe.value = split[3];
            cluster.value = split[4];
            plane.value = split[5];
            break;
        case 7:
            protocol = split[0];
            host.value = split[1];
            path.value = split[2];
            space.value = split[3];
            universe.value = split[4];
            cluster.value = split[5];
            plane.value = split[6];
            break;
    }

    const url = {
        protocol,
        host,
        path,
        space,
        universe,
        cluster,
        plane,
        valid: true,
    };

    return url;
}


/**
 * Given a partial `path`, e.g. `/path`, or `://cluster://path`,
 * it resolves it to the absolute form
 * `protocol://origin://route://space://universe://cluster://plane`.
 *
 * @param path
 */
export const resolveAbsolutePluridLinkPath = (
    route: string,
    // protocol = 'http',
    // host = 'localhost:3000',
) => {
    if (!window) {
        return;
    }

    const divisions = pluridLinkPathDivider(route);
    console.log('DIVISIONS', divisions);

    const defaultPathname = divisions.path.value || 'p';

    const protocol = divisions.protocol || window.location.protocol.replace(':', '');
    const host = divisions.host.value
        ? divisions.host
        : {
            value: window.location.host,
            controlled: true,
        };
    const path = divisions.path.value
        ? divisions.path
        : {
            value: defaultPathname,
            parameters: {},
            query: {},
        };
    const space = divisions.space.value
        ? divisions.space
        : {
            value: 's',
            parameters: {},
            query: {},
        };
    const universe = divisions.universe.value
        ? divisions.universe
        : {
            value: 'u',
            parameters: {},
            query: {},
        };
    const cluster = divisions.cluster.value
        ? divisions.cluster
        : {
            value: 'c',
            parameters: {},
            query: {},
        };
    const plane = divisions.plane;

    const separator = '://';

    const resolvers = [
        protocol,
        host.value,
        path.value,
        space.value,
        universe.value,
        cluster.value,
        cleanPathElement(plane.value),
    ];

    const resolvedPath = resolvers.join(separator);

    return resolvedPath;
}
