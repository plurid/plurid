import {
    Indexed,
    PluridInternalStateUniverse,
} from '@plurid/plurid-data';



export const DATA_SET_UNIVERSES = 'DATA_SET_UNIVERSES';
export interface DataSetUniversesAction {
    type: typeof DATA_SET_UNIVERSES;
    payload: Indexed<PluridInternalStateUniverse>;
}



export interface State {
    universes: Indexed<PluridInternalStateUniverse>;
}


export type Actions = DataSetUniversesAction;
