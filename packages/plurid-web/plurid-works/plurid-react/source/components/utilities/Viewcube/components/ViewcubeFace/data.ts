// #region module
export const faceTypes = {
    topLeft: 'TopLeft',
    topCenter: 'TopCenter',
    topRight: 'TopRight',

    middleLeft: 'MiddleLeft',
    middleCenter: 'MiddleCenter',
    middleRight: 'MiddleRight',

    bottomLeft: 'BottomLeft',
    bottomCenter: 'BottomCenter',
    bottomRight: 'BottomRight',
};


export const zoneCodes = {
    frontTopLeft: 'A1',
    frontTopCenter: 'A2',
    frontTopRight: 'A3',
    frontMiddleLeft: 'B1',
    frontMiddleCenter: 'B2',
    frontMiddleRight: 'B3',
    frontBottomLeft: 'C1',
    frontBottomCenter: 'C2',
    frontBottomRight: 'C3',

    rightTopLeft: 'A3',
    rightTopCenter: 'A4',
    rightTopRight: 'A5',
    rightMiddleLeft: 'B3',
    rightMiddleCenter: 'B4',
    rightMiddleRight: 'B5',
    rightBottomLeft: 'C3',
    rightBottomCenter: 'C4',
    rightBottomRight: 'C5',

    backTopLeft: 'A5',
    backTopCenter: 'A6',
    backTopRight: 'A7',
    backMiddleLeft: 'B5',
    backMiddleCenter: 'B6',
    backMiddleRight: 'B7',
    backBottomLeft: 'C5',
    backBottomCenter: 'C6',
    backBottomRight: 'C7',

    leftTopLeft: 'A7',
    leftTopCenter: 'A8',
    leftTopRight: 'A1',
    leftMiddleLeft: 'B7',
    leftMiddleCenter: 'B8',
    leftMiddleRight: 'B1',
    leftBottomLeft: 'C7',
    leftBottomCenter: 'C8',
    leftBottomRight: 'C1',

    topTopLeft: 'A7',
    topTopCenter: 'A6',
    topTopRight: 'A5',
    topMiddleLeft: 'A8',
    topMiddleCenter: 'D1',
    topMiddleRight: 'A4',
    topBottomLeft: 'A1',
    topBottomCenter: 'A2',
    topBottomRight: 'A3',

    baseTopLeft: 'C1',
    baseTopCenter: 'C2',
    baseTopRight: 'C3',
    baseMiddleLeft: 'C8',
    baseMiddleCenter: 'E1',
    baseMiddleRight: 'C4',
    baseBottomLeft: 'C7',
    baseBottomCenter: 'C6',
    baseBottomRight: 'C5',
};


export const faceTransform = {
    A1: { rotateX: -45, rotateY: 45 },
    A2: { rotateX: -45, rotateY: 0 },
    A3: { rotateX: -45, rotateY: -45 },
    B1: { rotateX: 0, rotateY: 45 },
    B2: { rotateX: 0, rotateY: 0 },
    B3: { rotateX: 0, rotateY: -45 },
    C1: { rotateX: 45, rotateY: 45 },
    C2: { rotateX: 45, rotateY: 0 },
    C3: { rotateX: 45, rotateY: -45 },

    A4: { rotateX: -45, rotateY: -90 },
    A5: { rotateX: -45, rotateY: -135 },
    B4: { rotateX: 0, rotateY: -90 },
    B5: { rotateX: 0, rotateY: -135 },
    C4: { rotateX: 45, rotateY: -90 },
    C5: { rotateX: 45, rotateY: -135 },

    A6: { rotateX: -45, rotateY: 180 },
    A7: { rotateX: -45, rotateY: 135 },
    B6: { rotateX: 0, rotateY: 180 },
    B7: { rotateX: 0, rotateY: 135 },
    C6: { rotateX: 45, rotateY: 180 },
    C7: { rotateX: 45, rotateY: 135 },

    A8: { rotateX: -45, rotateY: 90 },
    B8: { rotateX: 0, rotateY: 90 },
    C8: { rotateX: 45, rotateY: 90 },

    D1: { rotateX: -90, rotateY: 0 },

    E1: { rotateX: 90, rotateY: 0 },
};


// #endregion module
