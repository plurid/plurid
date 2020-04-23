import React from 'react';



export interface PluridComponentBase {
    kind: 'elementql' | 'react';
}


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
    element: React.FC<ReactComponentWithPluridProperty<any>>;

    /**
     * The `properties` will be passed to the `element` at runtime.
     */
    properties?: Record<string, any>;
}


export type ReactComponentWithPluridProperty<T> = T & WithPluridProperty;

export interface WithPluridProperty {
    plurid: PluridProperty;
}

export interface PluridProperty {
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export type PluridComponent =
    | PluridComponentElementQL
    | PluridComponentReact;
