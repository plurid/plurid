// #region imports
    // #region libraries
    import {
        PLURID_SHORTCUTS,
        PLURID_SHORTCUT_GROUP_TITLES,
        PLURID_POINTER_GESTURES,

        PluridShortcutDefinition,
        PluridShortcutGroup,
        PluridShortcutID,
        PluridConfigurationSpaceShortcuts,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const definitionsByID = new Map<PluridShortcutID, PluridShortcutDefinition>(
    PLURID_SHORTCUTS.map((definition) => [definition.id, definition]),
);


export const getShortcutDefinition = (
    id: PluridShortcutID,
): PluridShortcutDefinition | undefined => definitionsByID.get(id);


/** The effective `event.code` for a shortcut: the host `keymap` entry, else the default. */
export const resolveShortcutCode = (
    id: PluridShortcutID,
    shortcuts?: PluridConfigurationSpaceShortcuts,
): string | undefined => shortcuts?.keymap?.[id] ?? definitionsByID.get(id)?.code;


export const isShortcutDisabled = (
    id: PluridShortcutID,
    shortcuts?: PluridConfigurationSpaceShortcuts,
): boolean => {
    if (!shortcuts?.disabled) {
        return false;
    }
    if (shortcuts.disabled === true) {
        return true;
    }
    return shortcuts.disabled.includes(id);
};


/** The `hold` shortcuts (keys tracked down/up: grab-hold, the fly keys), with their effective codes. */
export const resolveHoldShortcuts = (
    shortcuts?: PluridConfigurationSpaceShortcuts,
): { id: PluridShortcutID; code: string; when?: PluridShortcutDefinition['when'] }[] => PLURID_SHORTCUTS
    .filter((definition) => definition.kind === 'hold' && !isShortcutDisabled(definition.id, shortcuts))
    .map((definition) => ({
        id: definition.id,
        code: resolveShortcutCode(definition.id, shortcuts) || definition.code || '',
        when: definition.when,
    }))
    .filter((entry) => entry.code.length > 0);


const CODE_LABELS: Record<string, string> = {
    Space: 'Space',
    Escape: 'Esc',
    Tab: 'Tab',
    Period: '.',
    Comma: ',',
    Slash: '/',
    Backslash: '\\',
    Minus: '-',
    Equal: '=',
    ShiftLeft: 'Shift',
    ShiftRight: 'Shift',
    Enter: 'Enter',
    Home: 'Home',
    End: 'End',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
};


/** A display chip for an `event.code`: `KeyG` → `G`, `Digit0` → `0`, `Period` → `.`. */
export const labelForCode = (
    code: string,
): string => {
    if (CODE_LABELS[code]) {
        return CODE_LABELS[code];
    }
    if (code.startsWith('Key') && code.length === 4) {
        return code.slice(3);
    }
    if (code.startsWith('Digit') && code.length === 6) {
        return code.slice(5);
    }
    if (code.startsWith('Numpad')) {
        return 'Num ' + code.slice(6);
    }
    return code;
};


const isMac = (): boolean => typeof navigator !== 'undefined'
    && /Mac|iPhone|iPad/.test(navigator.platform || '');


export interface ShortcutHelpItem {
    id?: PluridShortcutID;
    keys: string[];
    label: string;
}

export interface ShortcutHelpGroup {
    id: PluridShortcutGroup | 'pointer';
    title: string;
    items: ShortcutHelpItem[];
}


/**
 * The help content, generated from the shortcut table with the host's `keymap`/`disabled` applied
 * — what the `?` overlay and the toolbar drawer render, so neither can drift from the bindings.
 */
/** What the help is described for: a binding with a `when` shows only where it applies. */
export interface ShortcutHelpContext {
    presentation?: 'space' | 'page';
    grabMode?: boolean;
    firstPerson?: boolean;
}

const appliesIn = (
    when: PluridShortcutDefinition['when'],
    context: ShortcutHelpContext,
): boolean => {
    switch (when) {
        case 'page': return context.presentation === undefined || context.presentation === 'page';
        case 'grabMode': return context.grabMode === undefined || context.grabMode;
        case 'firstPerson': return context.firstPerson === undefined || context.firstPerson;
        default: return true;
    }
};

export const describeShortcuts = (
    shortcuts?: PluridConfigurationSpaceShortcuts,
    context: ShortcutHelpContext = {},
): ShortcutHelpGroup[] => {
    const modifierKey = isMac() ? '⌘' : 'Ctrl';
    const groups = new Map<PluridShortcutGroup, ShortcutHelpItem[]>();

    for (const definition of PLURID_SHORTCUTS) {
        if (isShortcutDisabled(definition.id, shortcuts)) {
            continue;
        }
        if (!appliesIn(definition.when, context)) {
            continue;
        }

        const remapped = shortcuts?.keymap?.[definition.id];
        let keys: string[];
        if (remapped) {
            keys = [labelForCode(remapped)];
        } else if (definition.keys) {
            keys = definition.keys;
        } else if (definition.code) {
            keys = [labelForCode(definition.code)];
        } else {
            keys = [];
        }

        const modifiers: string[] = [];
        if (definition.modifiers?.ctrlOrMeta) {
            modifiers.push(modifierKey);
        }
        if (definition.modifiers?.alt) {
            modifiers.push('Alt');
        }
        if (definition.modifiers?.shift && !(definition.keys && !remapped)) {
            modifiers.push('Shift');
        }

        const items = groups.get(definition.group) || [];
        items.push({
            id: definition.id,
            keys: [...modifiers, ...keys],
            label: definition.kind === 'hold'
                ? definition.label + ' (hold)'
                : definition.label,
        });
        groups.set(definition.group, items);
    }

    const ordered: PluridShortcutGroup[] = ['navigate', 'fly', 'transform', 'planes', 'roots', 'help'];
    const result: ShortcutHelpGroup[] = [];

    for (const group of ordered) {
        const items = groups.get(group);
        if (!items || items.length === 0) {
            continue;
        }
        result.push({
            id: group,
            title: PLURID_SHORTCUT_GROUP_TITLES[group],
            items,
        });
        if (group === 'navigate') {
            result.push({
                id: 'pointer',
                title: 'Pointer',
                items: PLURID_POINTER_GESTURES.map((gesture) => ({
                    keys: gesture.keys.map((key) => (key.includes('⌘') ? key.replace('⌘ / Ctrl', modifierKey) : key)),
                    label: gesture.label,
                })),
            });
        }
    }

    return result;
};
// #endregion module
