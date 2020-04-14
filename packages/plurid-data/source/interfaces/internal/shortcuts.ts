import {
    InternationalizationFieldType,
} from './internationalization';



export interface ShortcutName {
    name: InternationalizationFieldType;
    internationalizedKey?: boolean;
    key: string;
    modifier?: string | string[];
}


export type ShortcutNamesTypes =
    | 'TOGGLE_FIRST_PERSON'
    | 'MOVE_FORWARD'
    | 'MOVE_BACKWARD'
    | 'MOVE_LEFT'
    | 'MOVE_RIGHT'
    | 'MOVE_UP'
    | 'MOVE_DOWN'
    | 'TURN_LEFT'
    | 'TURN_RIGHT'
    | 'TURN_UP'
    | 'TURN_DOWN'

    | 'ROTATE_UP'
    | 'ROTATE_DOWN'
    | 'ROTATE_LEFT'
    | 'ROTATE_RIGHT'
    | 'TOGGLE_ROTATE'

    | 'TRANSLATE_UP'
    | 'TRANSLATE_DOWN'
    | 'TRANSLATE_LEFT'
    | 'TRANSLATE_RIGHT'
    | 'TRANSLATE_IN'
    | 'TRANSLATE_OUT'
    | 'TOGGLE_TRANSLATE'

    | 'SCALE_UP'
    | 'SCALE_DOWN'
    | 'TOGGLE_SCALE';


export type ShortcutNames = Record<ShortcutNamesTypes, ShortcutName>
