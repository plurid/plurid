import * as Types from './types';



export const setUniverses = (
    state: Types.State,
    action: Types.DataSetUniversesAction,
): Types.State => {
    return {
        ...state,
        universes: {
            ...action.payload,
        },
    };
}


export const setPlaneSources = (
    state: Types.State,
    action: Types.DataSetPlaneSourcesAction,
): Types.State => {
    return {
        ...state,
        planeSources: {
            ...action.payload,
        },
    };
}
