// #region module
export const SET_GENERAL_FIELD = 'SET_GENERAL_FIELD';
export interface SetGeneralFieldPayload<T = any> {
    field: string;
    value: T;
}
export interface SetGeneralFieldAction<T = any> {
    type: typeof SET_GENERAL_FIELD;
    payload: SetGeneralFieldPayload<T>;
}


export interface State {
    notFoundFace: string;
}


export type Actions =
    | SetGeneralFieldAction;
// #endregion module
