import {
    PluridRouterParameter,
} from '@plurid/plurid-data';



export const CATCH_ALL_ROUTE = '*';


export interface MatchedRoute {
    elements: RouteElements;
    route: string;
    parameters?: Record<string, string>;
}


export interface URLRoute {
    route: string;
    parameters?: Record<string, PluridRouterParameter>;
}


export interface ProcessedRoute {
    route: string;
    parameters: string[];
}


export interface InternalMatchedRoute {
    route: string;
    parameters: Record<string, string>;
}


export interface RouteElements {
    path: string;
    query: string;
    fragment: string;
}
