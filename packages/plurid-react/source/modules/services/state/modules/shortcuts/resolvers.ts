import * as Types from './types';



export const setGlobalShortcuts = (
    state: Types.State,
): Types.State => {
    return {
        ...state,
        global: true,
    };
}


export const unsetGlobalShortcuts = (
    state: Types.State,
): Types.State => {
    return {
        ...state,
        global: false,
    };
}
