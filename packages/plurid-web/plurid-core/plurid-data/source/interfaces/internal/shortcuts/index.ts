// #region imports
    // #region external
    import {
        SHORTCUTS,
    } from '~enumerations/index';

    import {
        InternationalizationFieldType,
    } from '~interfaces/external/internationalization';
    // #endregion external
// #endregion imports



// #region module
export interface ShortcutName {
    name: InternationalizationFieldType;
    internationalizedKey?: boolean;
    key: string;
    modifier?: string | string[];
}


export type ShortcutNamesTypes = keyof typeof SHORTCUTS;


export type ShortcutNames = Record<ShortcutNamesTypes, ShortcutName>;
// #endregion module
