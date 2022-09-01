// #region imports
    // #region libraries
    import {
        PluridStateSpace,
        LinkCoordinates,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface ViewSize {
    width: number;
    height: number;
}

export interface SpaceSize {
    width: number;
    height: number;
    depth: number;
    topCorner: {
        x: number;
        y: number;
        z: number;
    };
}

export interface Coordinates {
    x: number;
    y: number;
    z: number;
}



export interface SetSpaceFieldPayload {
    field: keyof PluridStateSpace;
    value: any;
}

export interface ChangeTransformPayload {
    type: 'rotate' | 'translate' | 'scale';
    kind: 'set' | 'add';
    value: number;
}

export interface SetTransformPayload {
    translationX?: number;
    translationY?: number;
    translationZ?: number;
    rotationX?: number;
    rotationY?: number;
    scale?: number;
}

export interface UpdateSpaceLinkCoordinatesPayload {
    planeID: string;
    linkCoordinates: LinkCoordinates;
}
// #endregion module
