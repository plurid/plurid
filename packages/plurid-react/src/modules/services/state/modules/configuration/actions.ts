import {
    PluridAppConfiguration,
} from '../../../../data/interfaces';

import {
    SetConfigurationAction,
    SET_CONFIGURATION,
} from './types'



export const setConfiguration = (payload: PluridAppConfiguration): SetConfigurationAction => {
    return {
        type: SET_CONFIGURATION,
        payload,
    };
}
