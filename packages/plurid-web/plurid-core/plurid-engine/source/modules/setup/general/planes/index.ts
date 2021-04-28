// #region imports
    // #region libraries
    import {
        uuid,
    } from '@plurid/plurid-functions';

    import {
        PluridPlane,
        PluridPlaneObject,
        PluridRoutePlane,
        PluridRoutePlaneObject,

        PluridInternalStatePlane,
        PluridInternalContextPlane,
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
        ] = plane;

        return {
            route,
            component,
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


export const createInternalStatePlane = <C>(
    plane: PluridPlane<C>,
): PluridInternalStatePlane => {
    const planeData = resolvePluridPlaneData(plane);

    const statePlane: PluridInternalStatePlane = {
        // id: plane.id || uuid.generate(),
        id: uuid.generate(),
        path: planeData.route,
        // root: page.root || false,
        // ordinal: page.ordinal || 0,
    };

    return statePlane;
}


export const createInternalContextPlane = <C>(
    plane: PluridPlane<C>,
): PluridInternalContextPlane<C> => {
    const planeData = resolvePluridPlaneData(plane);

    const {
        // id,
        route,
        component,
    } = planeData;

    const contextPlane: PluridInternalContextPlane<C> = {
        id: uuid.generate(),
        // id: id || uuid.generate(),
        path: route,
        component,
    };

    return contextPlane;
}


export const getPluridPlaneIDByData = (
    element: HTMLElement | null,
): any => {
    if (!element) {
        return '';
    }

    const parent = element.parentElement;
    if (parent && parent.dataset.pluridPlane) {
        return parent.dataset.pluridPlane;
    }

    return getPluridPlaneIDByData(parent);
}
// #endregion module
