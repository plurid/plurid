import {
    SET_GLOBAL_SHORTCUTS,
    UNSET_GLOBAL_SHORTCUTS,

    ShortcutsState,
    ShortcutsActions,
} from './types';



const initialState: ShortcutsState = {
    global: true,
}

const selectedThemeReducer = (
    state: ShortcutsState = initialState,
    action: ShortcutsActions,
): ShortcutsState => {
    switch(action.type) {
        case SET_GLOBAL_SHORTCUTS:
            return {
                ...state,
                global: true,
            };
        case UNSET_GLOBAL_SHORTCUTS:
            return {
                ...state,
                global: false,
            };
        default:
            return {
                ...state,
            };
    }
}


export default selectedThemeReducer;
