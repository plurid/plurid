import {
    Indexed,
    PluridRouterRoute,
    PathDivisions,
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


// const interplanarExample = '://plane'; // or intraclusterial
// const interclusterialExample = '://cluster://plane'; // or intrauniversal
// const interuniversalExample = '://universe://cluster://plane'; // or intraspatial
// const interspatialExample = '://space://universe://cluster://plane'; // or intraroutal
// const interroutalExample = '://route://space://universe://cluster://plane';
// const pluriversalExample = 'https://origin://route://space://universe://cluster://plane';
// const pluriversalExampleControlledOrigin = 'https://corigin://route://space://universe://cluster://plane';
// const pluriversalExampleForeignOrigin = 'https://forigin://route://space://universe://cluster://plane';


export const pluridLinkPathDivider = (
    path: string,
): PathDivisions => {
    const split = path.split('://').filter(value => value !== '');

    let protocol = 'https';
    const origin = {
        value: '',
        controlled: false,
    };
    const route = {
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
            origin,
            route,
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
            route.value = split[0];
            space.value = split[1];
            universe.value = split[2];
            cluster.value = split[3];
            plane.value = split[4];
            break;
        case 6:
            origin.value = split[0];
            route.value = split[1];
            space.value = split[2];
            universe.value = split[3];
            cluster.value = split[4];
            plane.value = split[5];
            break;
        case 7:
            protocol = split[0];
            origin.value = split[1];
            route.value = split[2];
            space.value = split[3];
            universe.value = split[4];
            cluster.value = split[5];
            plane.value = split[6];
            break;
    }

    const url = {
        protocol,
        origin,
        route,
        space,
        universe,
        cluster,
        plane,
        valid: true,
    };

    return url;
}
