import {
    SET_CONFIGURATION,
    ConfigurationState,
    ConfigurationActionsType,
} from './types';



const initialState: ConfigurationState = {
    perspective: 1000,
    theme: 'plurid',
    alterURL: false,
    planes: {
        domainURL: true,
        width: 100,
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
