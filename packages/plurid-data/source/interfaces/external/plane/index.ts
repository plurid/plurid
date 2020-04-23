import {
    PluridComponent,
} from '../component';



export interface PluridPlane {
    /**
     * Custom HTML, React, Vue, or Angular component to be rendered in the PluridPlane.
     */
    component: PluridComponent;

    /**
     * Path to the plane, e.g. `/plane-1`. By convention, it starts with an '/'.
     *
     * If IDs not provided, the paths of all the plane within space must be unique.
     *
     * The path can have parameters, e.g. `/plane/:id`.
     *
     * The parameter, in the example `id`,
     * will be passed in the property `plurid.parameters` to the component,
     * e.g. `componentProperties.plurid.parameters.id`.
     *
     * The path can be used by the `PluridLink`.
     */
    path: string;

    /**
     * Optional, application or document-wide unique identifier (if multiple documents).
     *
     * If provided to one plane, all the planes must have IDs.
     *
     * Once provided, the planes can have similar paths,
     * but the `PluridLink`s should be ID-based to ensure correct linking.
     */
    id?: string;

    /**
     * Optional, application or document-wide unique identifier (if multiple documents).
     *
     * A cluster will ensure that all the planes it contains will be rendered together.
     */
    cluster?: string;
}


export type PluridPlaneContext<T> = React.Context<T>;


export interface IndexedPluridPlane {
    protocol: string;
    host: string;
    path: string;
    space: string;
    universe: string;
    cluster: string;
    plane: string;
    route: string;
    component: PluridComponent;
}
