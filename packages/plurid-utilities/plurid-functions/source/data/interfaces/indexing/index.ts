// #region module
export interface WithID {
    id: string;
}


export type IdentifiedByID<T> = T & WithID;


export interface Indexed<T> {
    [key: string]: T;
}
// #endregion module
