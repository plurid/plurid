// origin://route://space://universe://cluster://plane

// export interface Path {
//     component: any;
//     origin: string;
//     route: string;
//     space: string;
//     universe: string;
//     cluster: string;
//     plane: string;
// }

// export interface PathCluster {
//     origin: string;
//     route: string;
//     space: string;
//     universe: string;
//     cluster: string;
//     planes: any[];
// }

// export interface PathUniverse {
//     origin: string;
//     route: string;
//     space: string;
//     universe: string;
//     clusters: any[];
// }

// export interface PathSpace {
//     origin: string;
//     route: string;
//     space: string;
//     universes: any[];
// }

// export interface PathRoute {
//     origin: string;
//     route: string;
//     spaces: string;
// }

// export interface PathOrigin {
//     origin: string;
//     routes: any[];
// }

export interface Route {
    protocol: string;
    host: string;
    routes: RoutePath[];
}

export interface RoutePath {
    value: string;

    /**
     * Accepts a component which will be rendered outside of the plurid applications
     */
    exterior?: any;

    spaces: RouteSpace[];
}

export interface RouteSpace {
    value: string;
    universes: RouteUniverse[];
}

export interface RouteUniverse {
    value: string;
    clusters: RouteCluster[];
}

export interface RouteCluster {
    value: string;
    planes: RoutePlane[];
}

export interface RoutePlane {
    component: any;
    value: string;
}

// https://depict.plurid.com://imagelist/1234://s://u://c://4321

const a: Route = {
    protocol: 'https',
    host: 'depict.plurid.com',
    routes: [
        {
            value: '/',
            spaces: [
                // {
                    // how to allow for unspecified spaces? dynamically allocated
                // },
            ],
        },
        {
            value: 'imagelist/:imagelistID',
            exterior: () => {},
            spaces: [
                {
                    value: '',
                    universes: [
                        {
                            value: '',
                            clusters: [
                                {
                                    value: '',
                                    planes: [
                                        {
                                            component:  {},
                                            value: '/:imageID',
                                        },
                                        {
                                            component:  {},
                                            value: '/:commentID',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
