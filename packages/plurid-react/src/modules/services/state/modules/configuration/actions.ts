import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    SetConfigurationAction,
    SET_CONFIGURATION,
    SetMicroAction,
    SET_MICRO,
} from './types';



export const setConfiguration = (payload: PluridConfiguration): SetConfigurationAction => {
    return {
        type: SET_CONFIGURATION,
        payload,
    };
}


export const setMicro = (): SetMicroAction => {
    return {
        type: SET_MICRO,
    };
}
