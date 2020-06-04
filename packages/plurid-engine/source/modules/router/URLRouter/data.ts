export const CATCH_ALL_ROUTE = '*';


export interface MatchedRoute {
    elements: RouteElements;
    route: string;
    parameters?: any;
}


export interface URLRouterRoute {
    route: string;
    parameters?: any;
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
