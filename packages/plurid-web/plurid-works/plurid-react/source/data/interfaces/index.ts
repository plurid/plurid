// #region imports
    // #region libraries
    import React from 'react';

    import {
        ComponentWithPlurid,
        PluridPlane,
        PluridRoute,
        PluridRoutePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface ElementQLComponent {
    name: ElementQLComponentName;
    url?: string;
}

export type ElementQLComponentName = string;

export type PluridReactFunctionalComponent<T = any> = React.FC<ComponentWithPlurid<T>>;

export type PluridReactComponent<T = any> =
    | PluridReactFunctionalComponent<T>
    | ElementQLComponent
    | ElementQLComponentName;

export type PluridReactPlane = PluridPlane<PluridReactComponent>;
export type PluridReactRoute = PluridRoute<PluridReactComponent>;
export type PluridReactRoutePlane = PluridRoutePlane<PluridReactComponent>;



export interface PluridLinkCoordinates {
    x: number;
    y: number;
}
// #endregion module
