// #region imports
    import * as Types from '../types';
// #endregion imports



// #region module
const initialState: Types.State = {
    loading: true,
    transform: 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)',
    animatedTransform: false,
    transformTime: 450,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    initialTree: [],
    tree: [],
    activeUniverseID: '',
    camera: {
        x: 0,
        y: 0,
        z: 0,
    },
    viewSize: {
        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
        height: typeof window === 'undefined' ? 821 : window.innerHeight,
    },
    spaceSize: {
        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
        height: typeof window === 'undefined' ? 821 : window.innerHeight,
        depth: 0,
        topCorner: {
            x: 0,
            y: 0,
            z: 0,
        },
    },
    view: [],
    culledView: [],
    activePlaneID: '',
    isolatePlane: '',
};
// #endregion module



// #region exports
export default initialState;
// #endregion exports
