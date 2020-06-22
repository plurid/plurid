import {
    PluridRouteParameter,
} from '@plurid/plurid-data';



export const CATCH_ALL_ROUTE = '*';



export interface URLRoute {
    value: string;
    parameters?: Record<string, PluridRouteParameter>;
}


export interface MatchedRoute {
    target: string;
    source: string;
    elements: RouteElements;
    parameters?: Record<string, string>;
}


export interface ProcessedRoute {
    value: string;
    parametersValues: string[];
    parameters?: Record<string, PluridRouteParameter>;
}


export interface InternalMatchedRoute {
    target: string;
    source: string;
    parameters: Record<string, string>;
}


export interface RouteElements {
    path: string;
    query: string;
    fragment: string;
}
