import {
    PluridServerRoute,
} from './external';



export interface PluridRendererConfiguration {
    head: string;
    styles: string;
    content: string;
    store: string;
    root?: string;
    script?: string;
}


export interface PluridRouterConfiguration {
    routes: PluridServerRoute[];
}
