import {
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    SET_CONFIGURATION,
    SET_MICRO,
    ConfigurationState,
    ConfigurationActionsType,
} from './types';



const initialState: ConfigurationState = {
    ...defaultConfiguration,
}

const configurationReducer = (
    state: ConfigurationState = initialState,
    action: ConfigurationActionsType,
): ConfigurationState => {
    switch(action.type) {
        case SET_CONFIGURATION:
            return { ...state, ...action.payload };
        case SET_MICRO:
            return {
                ...state,
                toolbar: false,
                planeControls: false,
                viewcube: false,
            };
        default:
            return state;
    }
}


export default configurationReducer;
