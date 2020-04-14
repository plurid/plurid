import {
    TreePlane,
} from '../../interfaces/internal';



export const defaultTreePlane: TreePlane = {
    sourceID: '',
    planeID: '',
    path: '',
    pathDivisions: {
        protocol: '',
        origin: {
            value: '',
            controlled: false,
        },
        route: {
            value: '',
            parameters: {},
            query: {},
        },
        space: {
            value: '',
            parameters: {},
            query: {},
        },
        universe: {
            value: '',
            parameters: {},
            query: {},
        },
        cluster: {
            value: '',
            parameters: {},
            query: {},
        },
        plane: {
            value: '',
            parameters: {},
            query: {},
        },
        valid: false,
    },
    height: 0,
    width: 0,
    location: {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
    },
    show: true,
};
