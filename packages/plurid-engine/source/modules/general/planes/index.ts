import {
    uuid,
} from '@plurid/plurid-functions';

import {
    PluridPlane,

    PluridInternalStatePlane,
    PluridInternalContextPlane,
} from '@plurid/plurid-data';



export const createInternalStatePlane = (
    page: PluridPlane,
): PluridInternalStatePlane => {
    const statePlane: PluridInternalStatePlane = {
        id: page.id || uuid.generate(),
        path: page.path,
        // root: page.root || false,
        // ordinal: page.ordinal || 0,
    };

    return statePlane;
}


export const createInternalContextPlane = (
    page: PluridPlane,
): PluridInternalContextPlane => {
    const contextPlane: PluridInternalContextPlane = {
        id: page.id || uuid.generate(),
        path: page.path,
        component: page.component,
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
