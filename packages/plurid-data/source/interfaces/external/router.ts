export interface PluridRoutingComponent<T> {
    view: T;
    component: React.FC<any>;
}


export interface PluridRoutingRoute<T> {
    path: string;
    view: T;
}
