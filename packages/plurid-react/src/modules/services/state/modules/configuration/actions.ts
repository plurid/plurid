import {
    SetConfigurationAction,
    SET_CONFIGURATION,
} from './types'



export const setConfiguration = (payload: any): SetConfigurationAction => {
    return {
        type: SET_CONFIGURATION,
        payload,
    };
}
