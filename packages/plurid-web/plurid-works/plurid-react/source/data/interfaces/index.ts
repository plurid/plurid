// #region imports
    // #region libraries
    import React from 'react';

    import {
        ComponentWithPlurid,
        PluridPlane,
        PluridRoute,
        PluridRoutePlane,
        PluridPlaneComponentProperty,
        PluridRouteComponentProperty,
        IsoMatcherRouteResult,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface ElementQLComponent {
    name: ElementQLComponentName;
    url?: string;
}

export type ElementQLComponentName = string;

export type PluridReactFunctionalComponent<
    T = any,
    W = PluridPlaneComponentProperty | PluridRouteComponentProperty
> = React.FC<
    ComponentWithPlurid<T, W>
>;

export type PluridReactComponent<
    T = any,
    W = PluridPlaneComponentProperty | PluridRouteComponentProperty
> =
    | PluridReactFunctionalComponent<T, W>
    | ElementQLComponent
    | ElementQLComponentName;

export type PluridReactPlaneComponent<T = any> = PluridReactFunctionalComponent<T, PluridPlaneComponentProperty>;
export type PluridReactRouteComponent<T = any> = PluridReactFunctionalComponent<T, PluridRouteComponentProperty>;

export type PluridReactPlane = PluridPlane<PluridReactComponent>;
export type PluridReactRoute = PluridRoute<PluridReactComponent>;
export type PluridReactRoutePlane = PluridRoutePlane<PluridReactComponent>;



export interface PluridLinkCoordinates {
    x: number;
    y: number;
}



export type PluridRouteMatch = IsoMatcherRouteResult<PluridReactComponent>;
// #endregion module
