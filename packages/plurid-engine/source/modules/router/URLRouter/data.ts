import {
    PluridRouterParameter,
} from '@plurid/plurid-data';



export const CATCH_ALL_ROUTE = '*';



export interface URLRoute {
    value: string;
    parameters?: Record<string, PluridRouterParameter>;
}


export interface MatchedRoute {
    value: string;
    elements: RouteElements;
    parameters?: Record<string, string>;
}


export interface ProcessedRoute {
    value: string;
    parametersValues: string[];
    parameters?: Record<string, PluridRouterParameter>;
}


export interface InternalMatchedRoute {
    value: string;
    parameters: Record<string, string>;
}


export interface RouteElements {
    path: string;
    query: string;
    fragment: string;
}
