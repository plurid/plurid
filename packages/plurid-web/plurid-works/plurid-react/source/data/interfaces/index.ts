// #region imports
    // #region libraries
    import React from 'react';

    import {
        ComponentWithPlurid,
        PluridApplication,
        PluridPlane,
        PluridRenderSlot,
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

/**
 * What a plane, a route, a shell or an exterior renders. Only the React component is rendered: an
 * ElementQL name or `{ name, url }` is not a component, and a plane given one shows its error card
 * (with a development warning) instead of rendering a stray `<Name>` element or nothing
 * (2026-09-29). An exterior or a shell given one is skipped.
 */
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
export type PluridReactRoute<G = any> = PluridRoute<PluridReactComponent, G>;
export type PluridReactRoutePlane = PluridRoutePlane<PluridReactComponent>;


/**
 * A render slot as React calls it: given its context, it returns what React renders. The data
 * package types a slot's result as `unknown` to stay framework-free, so a slot returning an object
 * (`renderMinimap={() => ({ not: 'a node' })}`) compiled and then took the whole application down
 * with "Objects are not valid as a React child" (2026-09-29).
 */
export type PluridReactRenderSlot<Context = any> = (context: Context) => React.ReactNode;

/** `Properties` with every `render*` slot returning a React node, its context kept. */
export type PluridReactSlots<Properties> = {
    [Key in keyof Properties]: Key extends `render${string}`
        ? (NonNullable<Properties[Key]> extends PluridRenderSlot<infer Context>
            ? PluridReactRenderSlot<Context>
            : Properties[Key])
        : Properties[Key];
};

/** The props of `<PluridApplication>`: the data package's, with React's render slots. */
export type PluridReactApplicationProperties = PluridReactSlots<PluridApplication<PluridReactComponent>>;



export interface PluridLinkCoordinates {
    x: number;
    y: number;
}



export type PluridRouteMatch = IsoMatcherRouteResult<PluridReactComponent>;
// #endregion module



// #region exports
export * from './utility';
// #endregion exports
