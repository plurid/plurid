import {
    Indexed,
    PluridInternalStateUniverse,
} from '@plurid/plurid-data';

import * as Types from './types';



export const setUniverses = (
    payload: Indexed<PluridInternalStateUniverse>,
): Types.DataSetUniversesAction => {
    return {
        type: Types.DATA_SET_UNIVERSES,
        payload,
    };
}
