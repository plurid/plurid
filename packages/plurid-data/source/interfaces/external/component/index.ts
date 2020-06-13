import React from 'react';



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
    metadata: {
        planeID: string;
        // location: any;
        // and other useful data for in plane manipulation
        // data taken from TreePlane (?)
    };
    route: {
        // details about the plane route:
        // protocol - origin - path - space - universe - cluster - plane
        // RouteDivions (?)
        plane: {
            parameters: Record<string, string>;
            query: Record<string, string>;
            value: string;
        };
    };
}


export type PluridComponent =
    | PluridComponentElementQL
    | PluridComponentReact;
