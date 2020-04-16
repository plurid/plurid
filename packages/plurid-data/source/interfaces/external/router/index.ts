import {
    Indexed,
} from '../../helpers';

import {
    CompareType,
} from '../compare';



export interface PluridRouterComponent<T> {
    view: T;
    component: React.FC<any>;
}


export interface PluridRouterRoute<T> {
    /**
     * The `path` can:
     *
     * * be a simple string,
     * e.g. `'/path/to/page'`;
     *
     * * be a parametric location,
     * e.g. `'/path/to/:page'`, where `:page` is the parameter name;
     *
     * * receive query `key=value` pairs,
     * e.g. `'/path/to/page?id=1&show=true'`, where `id=1` and `show=true` are `key=value` pairs;
     *
     * * specify a text fragment,
     * e.g. `'/path/to/page#:~:text=A%20door,is%20opened.,[0]'`,
     * where the fragment `#:~:text=A%20door,is%20opened.,[0]`
     * is loosely based on the https://github.com/WICG/ScrollToTextFragment specification,
     * and indicates the link to bring into view the first occurence `[0]`, if any,
     * of the text fragment starting with `A door` and ending with `is opened.`;
     *
     * * specify a page element,
     * e.g. `'/path/to/page#:~:element=123,[1]'`,
     * where the fragment `#:~:element=123,[1]`
     * indicates the link to bring into view the second occurence `[1]`, if any,
     * of the element with the attribute `data-plurid-element=123`;
     *
     * The text fragment and page element work only for plurid' pages
     * and not directly from the browser's URL bar.
     */
    path: string;

    /**
     * The view is a string, usually ALL_CAPS,
     * indicating the global container to be used by the router
     * at render time if it's a positive match.
     */
    view: T;

    /**
     * Constrain the path to be of a certain length.
     * Generally, useful for parametric paths.
     *
     * The length refers to the length of the pathname,
     * and doesn't take into consideration query, or fragments.
     *
     * If a `Indexed<number>` type is used,
     * then the index must be the parameter name.
     */
    length?: number | Indexed<number>;

    /**
     * Ensure that the `length` of the path is of a certain type:
     *
     * * `'=='`     - equal,
     * * `'<='`     - equal or less than,
     * * `'<'`      - less than,
     * * `'>='`     - equal or greater than,
     * * `'>'`      - greater than.
     *
     * Default `'<='`, if a `length` is provided.
     *
     * If a `Indexed<CompareType>` type is used,
     * then the index must be the parameter name.
     */
    lengthType?: CompareType | Indexed<CompareType>;
}


export interface PluridRouterRouting<T> {
    routes: PluridRouterRoute<T>[];
    components: PluridRouterComponent<T>[];
}



export interface PluridRouting {
    hosts: PluridRoutingHost[];
}

export interface PluridRoutingHost {
    protocol: string;
    hostname: string;
    paths: PluridRoutingPath[];
}

/**
 * A routing path can be spaces or exterior-based.
 */
export interface PluridRoutingPath {
    value: string;

    /**
     * Accepts a component which will be rendered outside of the plurid applications
     */
    exterior?: PluridRoutingComponent;

    spaces?: PluridRoutingSpace[];

    /**
     * Pass the rendered `spaces` components as a property to the `exterior` component
     * to be rendered in their proper slot.
     */
    slottedSpaces?: boolean;
}

export interface PluridRoutingSpace {
    value: string;
    universes: PluridRoutingUniverse[];
}

export interface PluridRoutingUniverse {
    value: string;
    clusters: PluridRoutingCluster[];
}

export interface PluridRoutingCluster {
    value: string;
    planes: PluridRoutingPlane[];
}

export interface PluridRoutingPlane {
    component: PluridRoutingComponent;
    value: string;
}


export interface PluridRoutingComponentBase {
    kind: 'elementql' | 'react';
}

export interface PluridRoutingComponentElementQL extends PluridRoutingComponentBase {
    kind: 'elementql';
    endpoint: string;
    component: string;
}

export interface PluridRoutingComponentReact extends PluridRoutingComponentBase {
    kind: 'react';
    component: React.FC<any>;
}

export type PluridRoutingComponent =
    | PluridRoutingComponentElementQL
    | PluridRoutingComponentReact;
