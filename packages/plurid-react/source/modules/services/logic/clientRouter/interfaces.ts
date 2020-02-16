import {
    CompareTypes,
} from './compareTypes';



export interface Route<T> {
    path: string;
    view: T;
    length?: number;
    lengthType?: CompareTypes;
}


export interface ActiveRoute<T> extends Route<T> {
    parameters?: RouteParameters;
}


export interface RouteParameters {
    [key: string]: string;
}
