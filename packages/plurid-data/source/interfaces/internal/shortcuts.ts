import {
    InternationalizationFieldType,
} from './internationalization';



export interface ShortcutName {
    name: InternationalizationFieldType;
    internationalizedKey?: boolean;
    key: string;
    modifier?: string | string[];
}


export interface ShortcutNames {
    TOGGLE_FIRST_PERSON: ShortcutName;
    MOVE_FORWARD: ShortcutName;
    MOVE_BACKWARD: ShortcutName;
    MOVE_LEFT: ShortcutName;
    MOVE_RIGHT: ShortcutName;
    MOVE_UP: ShortcutName;
    MOVE_DOWN: ShortcutName;
    TURN_LEFT: ShortcutName;
    TURN_RIGHT: ShortcutName;
    TURN_UP: ShortcutName;
    TURN_DOWN: ShortcutName;

    ROTATE_UP: ShortcutName;
    ROTATE_DOWN: ShortcutName;
    ROTATE_LEFT: ShortcutName;
    ROTATE_RIGHT: ShortcutName;
    TOGGLE_ROTATE: ShortcutName;

    TRANSLATE_UP: ShortcutName;
    TRANSLATE_DOWN: ShortcutName;
    TRANSLATE_LEFT: ShortcutName;
    TRANSLATE_RIGHT: ShortcutName;
    TRANSLATE_IN: ShortcutName;
    TRANSLATE_OUT: ShortcutName;
    TOGGLE_TRANSLATE: ShortcutName;

    SCALE_UP: ShortcutName;
    SCALE_DOWN: ShortcutName;
    TOGGLE_SCALE: ShortcutName;
}
