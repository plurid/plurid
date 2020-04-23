import {
    Indexed,
    PluridInternalStateUniverse,
} from '@plurid/plurid-data';



export const DATA_SET_UNIVERSES = 'DATA_SET_UNIVERSES';
export interface DataSetUniversesAction {
    type: typeof DATA_SET_UNIVERSES;
    payload: Indexed<PluridInternalStateUniverse>;
}

export const DATA_SET_PLANE_SOURCES = 'DATA_SET_PLANE_SOURCES';
export interface DataSetPlaneSourcesAction {
    type: typeof DATA_SET_PLANE_SOURCES;
    payload: Record<string, string>;
}



export interface State {
    universes: Indexed<PluridInternalStateUniverse>;
    planeSources: Record<string, string>;
}


export type Actions =
    | DataSetUniversesAction
    | DataSetPlaneSourcesAction;
