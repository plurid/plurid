// #region imports
    // #region libraries
    import {
        LAYOUT_TYPES,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** The layouts the engine lays out: every `LAYOUT_TYPES` member but META, which is typed and never implemented. */
export type ImplementedLayoutType = Exclude<LAYOUT_TYPES, LAYOUT_TYPES.META>;

export interface ResolvedLayoutType {
    type: ImplementedLayoutType;
    /** Why the configured type was not taken as written (a development warning); unset when it was. */
    reason?: string;
}


const IMPLEMENTED_LAYOUT_TYPES: string[] = [
    LAYOUT_TYPES.COLUMNS,
    LAYOUT_TYPES.ROWS,
    LAYOUT_TYPES.FACE_TO_FACE,
    LAYOUT_TYPES.ZIG_ZAG,
    LAYOUT_TYPES.SHEAVES,
];

/** A type name by its letters alone: `columns`, `face to face`, `face-to-face`, `faceToFace` and `ZIG_ZAG` / `zigzag` read unambiguously. */
const letters = (
    value: string,
): string => value.toUpperCase().replace(/[^A-Z]/g, '');

const MEMBERS_BY_LETTERS = new Map<string, LAYOUT_TYPES>(
    Object.values(LAYOUT_TYPES).map((member) => [letters(member), member]),
);

/** Any value as a warning can quote it (a BigInt or a null-prototype object must not throw here). */
const describe = (
    value: unknown,
): string => {
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return typeof value;
    }
};


/**
 * THE LAYOUT A CONFIGURED TYPE IS LAID OUT BY. A type the engine does not lay out used to return no
 * roots at all, and the space went empty: META (offered by the toolbar), a JS host's `'columns'`, a
 * typo. Now an implemented member is taken as it is; a name that reads as one member by its letters
 * alone (`'columns'`, `'face to face'`) is taken as that member; META — typed, never implemented —
 * and anything else are laid out as COLUMNS. Whatever was not taken as written carries a `reason`
 * for a development warning.
 */
export const resolveLayoutType = (
    type: unknown,
): ResolvedLayoutType => {
    if (typeof type === 'string') {
        if (IMPLEMENTED_LAYOUT_TYPES.includes(type)) {
            return {
                type: type as ImplementedLayoutType,
            };
        }

        const member = MEMBERS_BY_LETTERS.get(letters(type));
        if (member === LAYOUT_TYPES.META) {
            return {
                type: LAYOUT_TYPES.COLUMNS,
                reason: 'the layout type \'' + type + '\' (META) is not implemented: the roots are laid out as COLUMNS',
            };
        }
        if (member) {
            return {
                type: member as ImplementedLayoutType,
                reason: 'the layout type \'' + type + '\' is read as LAYOUT_TYPES.' + member,
            };
        }
    }

    return {
        type: LAYOUT_TYPES.COLUMNS,
        reason: 'the layout type ' + describe(type) + ' is not a layout: the roots are laid out as COLUMNS',
    };
};
// #endregion module
