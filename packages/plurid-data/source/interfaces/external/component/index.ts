import React from 'react';

import {
    RouteHostDivision,
    RouteDivision,
    RoutePlaneDivision,
} from '../../internal/tree';



export interface PluridComponentBase {
    kind: PluridComponentKind;

    /**
     * The `properties` will be passed to the `element` at runtime.
     */
    properties?: Record<string, any>;
}


export type PluridComponentKind =
    | 'elementql'
    | 'react';


export interface PluridComponentElementQL extends PluridComponentBase {
    kind: 'elementql';
    endpoint: string;
    element: string;
}


export interface PluridComponentReact extends PluridComponentBase {
    kind: 'react';

    /**
     * The `element` will receive the properties, if any,
     * and the `plurid` property.
     */
    element: React.FC<ReactComponentWithPlurid<any>>;
}


export type ReactComponentWithPlurid<T> = T & WithPluridComponentProperty;


export interface WithPluridComponentProperty {
    plurid: PluridComponentProperty;
}


export interface PluridComponentProperty {
    metadata: PluridComponentPropertyMetadata;
    route: PluridComponentPropertyRoute;
}

export interface PluridComponentPropertyMetadata {
    planeID: string;
    parentPlaneID?: string;
}

export interface PluridComponentPropertyRoute {
    protocol: string;
    host: RouteHostDivision;
    path: RouteDivision;
    space: RouteDivision;
    universe: RouteDivision;
    cluster: RouteDivision;
    plane: RoutePlaneDivision;
}



export type PluridComponent =
    | PluridComponentElementQL
    | PluridComponentReact;
