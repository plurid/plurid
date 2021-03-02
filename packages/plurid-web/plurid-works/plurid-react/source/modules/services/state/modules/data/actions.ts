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


export const setPlaneSources = (
    payload: Record<string, string>,
): Types.DataSetPlaneSourcesAction => {
    return {
        type: Types.DATA_SET_PLANE_SOURCES,
        payload,
    };
}
