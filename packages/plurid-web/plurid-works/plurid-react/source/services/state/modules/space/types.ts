// #region imports
    // #region libraries
    import {
        PluridStateSpace,
        LinkCoordinates,
        PlaneLink,
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

export interface UpdatePlaneLinkPayload {
    id: string;
    update: Partial<Omit<PlaneLink, 'id'>>;
}

export interface TransformSelectedPlanesPayload {
    deltaX?: number;
    deltaY?: number;
    deltaZ?: number;
}

export interface ZoomAtPointPayload {
    /** Multiplicative zoom factor (preferred). */
    factor?: number;
    /** Additive scale delta — the legacy payload; ignored when `factor` is given. */
    deltaScale?: number;
    /** Anchor in view px. */
    originX: number;
    originY: number;
}

export interface FitToViewPayload {
    /** Look at the space front-on (yaw 0, pitch 0). Default `true`. */
    faceOn?: boolean;
    /** Fraction of the view the content may fill. Default `0.85`. */
    margin?: number;
    /** Size assumed for planes that have not been measured yet. */
    fallbackWidth?: number;
    fallbackHeight?: number;
}

export interface SetPlaneSizePayload {
    planeID: string;
    width: number;
    height: number;
    sizeMode?: 'measured' | 'manual' | 'declared';
}
// #endregion module
