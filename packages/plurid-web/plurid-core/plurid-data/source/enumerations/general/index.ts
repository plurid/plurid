// #region module
export enum SHORTCUTS {
    TOGGLE_FIRST_PERSON = 'TOGGLE_FIRST_PERSON',
    MOVE_FORWARD = 'MOVE_FORWARD',
    MOVE_BACKWARD = 'MOVE_BACKWARD',
    MOVE_LEFT = 'MOVE_LEFT',
    MOVE_RIGHT = 'MOVE_RIGHT',
    MOVE_UP = 'MOVE_UP',
    MOVE_DOWN = 'MOVE_DOWN',
    TURN_LEFT = 'TURN_LEFT',
    TURN_RIGHT = 'TURN_RIGHT',
    TURN_UP = 'TURN_UP',
    TURN_DOWN = 'TURN_DOWN',

    ROTATE_UP = 'ROTATE_UP',
    ROTATE_DOWN = 'ROTATE_DOWN',
    ROTATE_LEFT = 'ROTATE_LEFT',
    ROTATE_RIGHT = 'ROTATE_RIGHT',
    TOGGLE_ROTATE = 'TOGGLE_ROTATE',

    TRANSLATE_UP = 'TRANSLATE_UP',
    TRANSLATE_DOWN = 'TRANSLATE_DOWN',
    TRANSLATE_LEFT = 'TRANSLATE_LEFT',
    TRANSLATE_RIGHT = 'TRANSLATE_RIGHT',
    TRANSLATE_IN = 'TRANSLATE_IN',
    TRANSLATE_OUT = 'TRANSLATE_OUT',
    TOGGLE_TRANSLATE = 'TOGGLE_TRANSLATE',

    SCALE_UP = 'SCALE_UP',
    SCALE_DOWN = 'SCALE_DOWN',
    TOGGLE_SCALE = 'TOGGLE_SCALE',

    FOCUS_PLANE = 'FOCUS_PLANE',
    FOCUS_PARENT = 'FOCUS_PARENT',
    REFRESH_PLANE = 'REFRESH_PLANE',
    ISOLATE_PLANE = 'ISOLATE_PLANE',
    OPEN_CLOSED_PLANE = 'OPEN_CLOSED_PLANE',
    CLOSE_PLANE = 'CLOSE_PLANE',
}


export enum KEY_MODIFIERS {
    SHIFT = 'SHIFT',
    ALT = 'ALT',
    CTRL = 'CTRL',
    META = 'META',
    METACTRL = 'METACTRL',
}



export enum LAYOUT_TYPES {
    COLUMNS = 'COLUMNS',
    ROWS = 'ROWS',
    FACE_TO_FACE = 'FACE_TO_FACE',
    ZIG_ZAG = 'ZIG_ZAG',
    SHEAVES = 'SHEAVES',
    META = 'META',
}


export enum SIZES {
    SMALL = 'SMALL',
    NORMAL = 'NORMAL',
    LARGE = 'LARGE',
}


export enum TRANSFORM_MODES {
    ROTATION = 'ROTATION',
    SCALE = 'SCALE',
    TRANSLATION = 'TRANSLATION',
    ALL = 'ALL',
}


export enum TRANSFORM_TOUCHES {
    SWIPE = 'SWIPE',
    PAN = 'PAN',
}


export enum TOOLBAR_DRAWERS {
    ALL = 'ALL',
    GLOBAL = 'GLOBAL',
    TRANSFORM = 'TRANSFORM',
    SPACE = 'SPACE',
    TOOLBAR = 'TOOLBAR',
    VIEWCUBE = 'VIEWCUBE',
    TECHNICAL = 'TECHNICAL',
    SHORTCUTS = 'SHORTCUTS',
}
// #endregion module
