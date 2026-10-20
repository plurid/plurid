// #region imports
    // #region libraries
    import {
        PluridPlane,
        PluridPlaneObject,
        PluridRoutePlane,
        PluridRoutePlaneObject,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export const resolvePluridPlaneData = <C>(
    plane: PluridPlane<C>,
): PluridPlaneObject<C> => {
    if (
        Array.isArray(plane)
    ) {
        const [
            route,
            component,
            options,
        ] = plane;

        return {
            route,
            component,
            ...options,
        };
    }

    return plane;
}


export const resolvePluridRoutePlaneData = <C>(
    plane: PluridRoutePlane<C>,
): PluridRoutePlaneObject<C> => {
    if (
        Array.isArray(plane)
    ) {
        const [
            value,
            component,
            options,
        ] = plane;

        return {
            value,
            component,
            ...options,
        };
    }

    return plane;
}


/** The id of the plane `element` is in, or is: the search started at its parent, skipping the plane itself (2026-10-20). */
export const getPluridPlaneIDByData = (
    element: HTMLElement | null,
): string => {
    if (!element) {
        return '';
    }

    const plane = element.closest<HTMLElement>('[data-plurid-plane]');
    return plane?.dataset.pluridPlane || '';
}
// #endregion module
