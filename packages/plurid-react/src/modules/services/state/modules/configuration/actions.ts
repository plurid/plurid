import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    SetConfigurationAction,
    SET_CONFIGURATION,
} from './types';



export const setConfiguration = (payload: PluridConfiguration): SetConfigurationAction => {
    return {
        type: SET_CONFIGURATION,
        payload,
    };
}
