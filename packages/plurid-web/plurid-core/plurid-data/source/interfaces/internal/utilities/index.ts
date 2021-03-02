// #region module
export interface Coordinates {
    x: number;
    y: number;
    z: number;
}

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
// #endregion module
