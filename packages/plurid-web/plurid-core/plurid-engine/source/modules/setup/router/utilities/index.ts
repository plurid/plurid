// #region imports
    // #region libraries
    import {
        Indexed,
        PluridRoute,
        RouteDivisions,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        cleanPathElement,
    } from '../../../utilities';
    // #endregion external
// #endregion imports



// #region module
export const mapPathsToRoutes = <T, V>(
    paths: Indexed<string>,
    view: V,
) => {
    const routes: PluridRoute[] = [];

    for (const [key, path] of Object.entries(paths)) {
        const pathView = (view as any)[key];

        if (pathView) {
            const route: PluridRoute = {
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
    // console.log('pluridLinkPathDivider route', route);

    const windowProtocol = typeof window === 'undefined'
        ? 'http'
        : window.location.protocol.replace(':', '');
    const windowHost = typeof window === 'undefined'
        ? 'localhost:63000'
        : window.location.host;

    const split = route
        .split('://')
        .filter(value => value !== '')
        .map(value => cleanPathElement(value));
    // console.log('SPLIT', split);

    let protocol = windowProtocol;
    const host = {
        value: windowHost,
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
        fragments: {
            texts: [],
            elements: [],
        },
    };
    const valid = false;

    if (
        split.length === 0
        || split.length > 7
    ) {
        const url = {
            protocol: {
                value: protocol,
                secure: true,
            },
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

    if (route.startsWith('/://')) {
        const routeSplit = split.slice(1);
        switch (routeSplit.length) {
            case 1:
                path.value = routeSplit[0];
                break;
            case 5:
                path.value = routeSplit[0];
                space.value = routeSplit[1];
                universe.value = routeSplit[2];
                cluster.value = routeSplit[3];
                plane.value = routeSplit[4];
                break;
        }

        const url = {
            protocol: {
                value: protocol,
                secure: true,
            },
            host,
            path,
            space,
            universe,
            cluster,
            plane,
            valid: true,
        };
        // console.log('URL', url);

        return url;
    }

    if (
        split[0] !== 'http'
        && split[0] !== 'https'
        && split[0] !== 'chrome-extension'
    ) {
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
            default:
                const url = {
                    protocol: {
                        value: protocol,
                        secure: true,
                    },
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
    } else {
        switch (split.length) {
            case 3:
                protocol = split[0];
                host.value = split[1];
                path.value = split[2];
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
            default:
                const url = {
                    protocol: {
                        value: protocol,
                        secure: true,
                    },
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
    }

    const url = {
        protocol: {
            value: protocol,
            secure: true,
        },
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
 * Given a partial `route`, e.g. `/route`, or `://cluster://route`,
 * it resolves it to the absolute form
 * `protocol://origin://route://space://universe://cluster://plane`.
 *
 * @param path
 */
export const resolveRoute = (
    route: string,
    protocol?: string,
    host?: string,
) => {
    const windowProtocol = typeof window === 'undefined'
        ? protocol || 'http'
        : window.location.protocol.replace(':', '');
    const windowHost = typeof window === 'undefined'
        ? host || 'localhost:63000'
        : window.location.host;

    const divisions = pluridLinkPathDivider(route);

    const defaultPathname = typeof window !== 'undefined'
            ? window.location.pathname === '/'
                ? 'p'
                : window.location.pathname.slice(1)
            : divisions.path.value
                ? divisions.path.value
                : 'p';

    const protocolDivision = divisions.protocol.value || windowProtocol;
    const hostDivision = divisions.host.value
        ? divisions.host
        : {
            value: windowHost,
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

    if (!plane.value && route !== '/') {
        const resolvers = [
            protocolDivision,
            hostDivision.value,
            path.value,
        ];
        const absoluteRoute = resolvers.join(separator);

        return {
            protocol: protocolDivision,
            host: hostDivision,
            path,
            space,
            universe,
            cluster,
            plane,
            route: absoluteRoute,
        };
    }

    const resolvers = [
        protocolDivision,
        hostDivision.value,
        path.value,
        space.value,
        universe.value,
        cluster.value,
        cleanPathElement(plane.value),
    ];
    const absoluteRoute = resolvers.join(separator);

    return {
        protocol: protocolDivision,
        host: hostDivision,
        path,
        space,
        universe,
        cluster,
        plane,
        route: absoluteRoute,
    };
}
// #endregion module
