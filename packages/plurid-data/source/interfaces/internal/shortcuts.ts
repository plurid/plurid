import {
    SHORTCUTS,
} from '../../enumerations';

import {
    InternationalizationFieldType,
} from './internationalization';



export interface ShortcutName {
    name: InternationalizationFieldType;
    internationalizedKey?: boolean;
    key: string;
    modifier?: string | string[];
}


export type ShortcutNamesTypes = keyof typeof SHORTCUTS;


export type ShortcutNames = Record<ShortcutNamesTypes, ShortcutName>;
