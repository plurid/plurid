import {
    SET_CONFIGURATION,
    ConfigurationState,
    ConfigurationActionsType,
} from './types';



const initialState: ConfigurationState = {
    theme: 'plurid',
    alterURL: false,
    pluridPlane: {
        showControls: true,
    },
}

const configurationReducer = (
    state: ConfigurationState = initialState,
    action: ConfigurationActionsType,
): ConfigurationState => {
    switch(action.type) {
        case SET_CONFIGURATION:
            return { ...state, ...action.payload };
        default:
            return state;
    }
}


export default configurationReducer;
