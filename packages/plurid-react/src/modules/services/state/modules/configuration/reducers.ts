import {
    SET_CONFIGURATION,
    ConfigurationState,
    ConfigurationActionsType,
} from './types';



const initialState: ConfigurationState = {
    theme: 'plurid',
    micro: false,
    toolbar: true,
    planeControls: true,
    viewcube: true,
    planeDomainURL: true,
    planeWidth: 1,
    space: {
        layout: {
            type: 'COLUMNS',
            columns: 2,
        },
        perspective: 1000,
    }
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
