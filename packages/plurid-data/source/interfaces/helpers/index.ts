export interface Indexed<T> {
    [key: string]: T;
}


export interface WithID {
    id: string;
}

export type Identified<T> = T & WithID;


export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
