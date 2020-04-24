import {
    uuid,
} from '@plurid/plurid-functions';

import {
    PluridPlane,

    PluridInternalStatePlane,
    PluridInternalContextPlane,
} from '@plurid/plurid-data';



export const createInternalStatePlane = (
    plane: PluridPlane,
): PluridInternalStatePlane => {
    const statePlane: PluridInternalStatePlane = {
        id: plane.id || uuid.generate(),
        path: plane.path,
        // root: page.root || false,
        // ordinal: page.ordinal || 0,
    };

    return statePlane;
}


export const createInternalContextPlane = (
    plane: PluridPlane,
): PluridInternalContextPlane => {
    const {
        id,
        path,
        component,
    } = plane;

    const contextPlane: PluridInternalContextPlane = {
        id: id || uuid.generate(),
        path,
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
