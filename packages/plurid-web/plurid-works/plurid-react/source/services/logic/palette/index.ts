// #region imports
    // #region libraries
    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        PluridPubSub as IPluridPubSub,
        PluridConfigurationSpaceShortcuts,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import actions from '~services/state/actions';

    import {
        planeAddressPath,
    } from '~services/engine';

    import {
        describeShortcuts,
    } from '~services/logic/shortcuts/registry';
    import {
        runShortcut,
    } from '~services/logic/shortcuts';

    import {
        cameraCommand,
        framePlaneByID,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
/** What a palette row needs to do its work — the same seams a shortcut's `run` gets. */
export interface PaletteContext {
    dispatch: ThunkDispatch<any, any, AnyAction>;
    state: AppState;
    pubsub: IPluridPubSub;
    shortcuts?: PluridConfigurationSpaceShortcuts;
}

export interface PaletteRow {
    /** Unique within the list (the React key, the `aria-activedescendant` target). */
    id: string;
    /** What the row reads as — what the query is matched against. */
    title: string;
    /** The group's title, shown as a heading above the first row of each group. */
    group: string;
    /** The shortcut's key chips, when the row has a key. */
    keys?: string[];
    run: (context: PaletteContext) => void;
}


/** Every shown plane, in tree order (a palette row per plane: "go to …"). */
const shownPlanes = (
    nodes: TreePlane[],
    into: TreePlane[] = [],
): TreePlane[] => {
    for (const node of nodes) {
        if (node.show === false) {
            continue;
        }
        into.push(node);
        if (node.children) {
            shownPlanes(node.children, into);
        }
    }
    return into;
};

/** A plane's name in the palette: its declared document title, else its path. */
const planeTitle = (
    node: TreePlane,
    registered?: { head?: { title?: string } },
): string => registered?.head?.title
    || planeAddressPath(node.route)
    || node.route
    || node.planeID;


export interface PaletteRowsOptions {
    /** The registrar's entries by route, for a plane's declared document title. */
    titleOf?: (route: string) => string | undefined;
}

/**
 * THE PALETTE'S CONTENT, from the state: every shortcut that applies right now (the `when` gate and
 * the host's `keymap` / `disabled` through `describeShortcuts`, so the palette can never drift from
 * the bindings), then the space's bookmarks and the configured presets, then every shown plane.
 * A shortcut row runs the SAME `run` the key press runs (`runShortcut`).
 */
export const paletteRows = (
    state: AppState,
    options: PaletteRowsOptions = {},
): PaletteRow[] => {
    const configuration = state.configuration;
    const shortcuts = configuration.space.shortcuts;
    const rows: PaletteRow[] = [];

    const groups = describeShortcuts(shortcuts, {
        presentation: configuration.space.presentation ?? 'space',
        grabMode: !!state.ui?.grabMode,
        firstPerson: !!configuration.space.firstPerson,
    });
    for (const group of groups) {
        for (const item of group.items) {
            // a pointer gesture has no id: it is help, not a command
            if (!item.id) {
                continue;
            }
            const id = item.id;
            rows.push({
                id: 'shortcut:' + id,
                title: item.label,
                group: group.title,
                keys: item.keys,
                run: (context) => {
                    runShortcut(id, context, context.shortcuts ?? shortcuts);
                },
            });
        }
    }

    // what undo and redo would do, by name (the shortcut rows above say only "Undo")
    const history = state.space.history;
    const last = history.past[history.past.length - 1];
    if (last) {
        rows.push({
            id: 'history:undo',
            title: 'Undo ' + last.label,
            group: 'History',
            run: ({ dispatch }) => {
                dispatch(actions.space.undo());
            },
        });
    }
    const next = history.future[0];
    if (next) {
        rows.push({
            id: 'history:redo',
            title: 'Redo ' + next.label,
            group: 'History',
            run: ({ dispatch }) => {
                dispatch(actions.space.redo());
            },
        });
    }

    for (const name of Object.keys(state.space.bookmarks ?? {})) {
        rows.push({
            id: 'bookmark:' + name,
            title: 'Go to the bookmark ' + name,
            group: 'Bookmarks',
            run: ({ dispatch }) => {
                dispatch(cameraCommand({ kind: 'bookmark', name, action: 'go' }, { animate: true }) as any);
            },
        });
    }

    for (const name of Object.keys(configuration.space.navigation?.presets ?? {})) {
        rows.push({
            id: 'preset:' + name,
            title: 'Go to the preset ' + name,
            group: 'Bookmarks',
            run: ({ dispatch }) => {
                dispatch(cameraCommand({ kind: 'preset', name }, { animate: true }) as any);
            },
        });
    }

    for (const node of shownPlanes(state.space.tree)) {
        const title = options.titleOf?.(node.route) || planeTitle(node);
        rows.push({
            id: 'plane:' + node.planeID,
            title: 'Go to the plane ' + title,
            group: 'Planes',
            run: ({ dispatch }) => {
                dispatch(framePlaneByID(node.planeID, true) as any);
            },
        });
    }

    return rows;
};


/**
 * How well a query matches a title: the query's characters in order, case-insensitively, scoring a
 * run of adjacent matches and a match at a word's start higher; `-1` when a character is missing.
 * An empty query matches everything at 0, so the list keeps its natural order.
 */
export const scoreMatch = (
    query: string,
    title: string,
): number => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
        return 0;
    }
    const hay = title.toLowerCase();
    let score = 0;
    let at = 0;
    let previous = -2;
    for (const character of needle) {
        if (character === ' ') {
            continue;
        }
        const found = hay.indexOf(character, at);
        if (found === -1) {
            return -1;
        }
        score += 1;
        if (found === previous + 1) {
            score += 4;
        }
        if (found === 0 || /[\s\-/·(]/.test(hay[found - 1])) {
            score += 3;
        }
        previous = found;
        at = found + 1;
    }
    // an early match reads as the better one
    return score * 100 - previous;
};

/** The rows a query leaves, best first; ties keep the natural order (shortcuts, bookmarks, planes). */
export const filterRows = (
    rows: PaletteRow[],
    query: string,
): PaletteRow[] => {
    if (!query.trim()) {
        return rows;
    }
    return rows
        .map((row, index) => ({ row, index, score: scoreMatch(query, row.title) }))
        .filter((entry) => entry.score >= 0)
        .sort((a, b) => (b.score - a.score) || (a.index - b.index))
        .map((entry) => entry.row);
};
// #endregion module
