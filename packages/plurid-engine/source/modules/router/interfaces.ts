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


export interface RouteQuery {
    [key: string]: string;
}


export interface TwithPath {
    [key: string]: any;
    path: string;
}

export interface MatchResponse<T> {
    route: T;
    parameters: RouteParameters;
    query: RouteQuery;
}
