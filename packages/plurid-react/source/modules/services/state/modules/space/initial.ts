import * as Types from './types';



const initialState: Types.State = {
    loading: true,
    animatedTransform: false,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    tree: [],
    activeDocumentID: '',
    camera: {
        x: 0,
        y: 0,
        z: 0,
    },
    viewSize: {
        width: window ? window.innerWidth : 1440,
        height: window ? window.innerHeight : 800,
    },
    spaceSize: {
        width: window ? window.innerWidth : 1440,
        height: window ? window.innerHeight : 800,
        depth: 0,
        topCorner: {
            x: 0,
            y: 0,
            z: 0,
        },
    },
    view: [],
};


export default initialState;
