import {
    SET_GLOBAL_SHORTCUTS,
    UNSET_GLOBAL_SHORTCUTS,

    ShortcutsState,
    ShortcutsActions,
} from './types';

import {
    setGlobalShortcuts,
    unsetGlobalShortcuts,
} from './resolvers';



const initialState: ShortcutsState = {
    global: true,
};

const shortcutsReducer = (
    state: ShortcutsState = initialState,
    action: ShortcutsActions,
): ShortcutsState => {
    switch(action.type) {
        case SET_GLOBAL_SHORTCUTS:
            return setGlobalShortcuts(state);
        case UNSET_GLOBAL_SHORTCUTS:
            return unsetGlobalShortcuts(state);
        default:
            return {
                ...state,
            };
    }
}


export default shortcutsReducer;
