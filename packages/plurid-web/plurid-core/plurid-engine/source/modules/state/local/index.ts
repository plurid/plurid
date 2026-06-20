// #region imports
    // #region libraries
    import {
        PluridState,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Bump when the persisted shape changes. A stored snapshot with a different version is
 * ignored on load (falls back to a fresh space) rather than risking a partial mis-merge.
 */
const PERSISTED_STATE_VERSION = 1;

const STORAGE_PREFIX = 'pluridState-';

// Surface a serialization failure exactly once: it means the state holds something
// non-serializable (a cycle, a DOM/function ref leaked into the tree) — a real bug that would
// otherwise silently disable persistence forever. Distinct from the environmental setItem miss.
let serializeFailureWarned = false;

/**
 * Only the meaningful, durable space fields are persisted — NOT the whole Redux state.
 * Excluded on purpose: transient flags (`loading`, `resolvedLayout`, `animatedTransform`,
 * `transformTime`), environmental sizes that are re-measured on mount (`viewSize`,
 * `spaceSize`, `culledView`, `view`), and the other slices (`configuration`, `themes`,
 * `shortcuts`, `ui`) which come from props/defaults each load.
 */
const PERSISTED_SPACE_FIELDS = [
    'rotationX',
    'rotationY',
    'scale',
    'translationX',
    'translationY',
    'translationZ',
    'transform',
    'camera',
    'activePlaneID',
    'isolatePlane',
    'lastClosedPlane',
    'tree',
] as const;

interface PersistedSnapshot {
    version: number;
    space: Partial<PluridState['space']>;
}

const storageKey = (
    id: string | undefined,
) => STORAGE_PREFIX + (id || 'default');


/**
 * Build a focused, versioned snapshot of the persistable space state.
 */
const serialize = (
    state: PluridState,
): string => {
    const space: Partial<PluridState['space']> = {};

    for (const field of PERSISTED_SPACE_FIELDS) {
        const value = (state.space as any)[field];
        if (value !== undefined) {
            (space as any)[field] = value;
        }
    }

    const snapshot: PersistedSnapshot = {
        version: PERSISTED_STATE_VERSION,
        space,
    };

    return JSON.stringify(snapshot);
}


/**
 * Persist the focused space snapshot to localStorage. No-op outside the browser.
 */
const save = (
    id: string | undefined,
    state: PluridState | undefined,
) => {
    if (!state || typeof localStorage === 'undefined') {
        return;
    }

    let serialized: string;
    try {
        serialized = serialize(state);
    } catch (error) {
        // A serialization failure is a CODE bug (the persisted snapshot should be plain data),
        // not the best-effort environmental miss the setItem catch below handles — so it must not
        // be swallowed silently. Warn once and bail (the previous snapshot stays). This is the
        // failure mode that silently drops every save after the offending value enters the tree.
        if (!serializeFailureWarned && typeof console !== 'undefined') {
            serializeFailureWarned = true;
            console.warn(
                '[plurid] state persistence skipped — could not serialize the space snapshot. '
                + 'A non-serializable value (cycle, DOM node, or function) is in the persisted '
                + 'fields. Persistence is disabled until it is removed.',
                error,
            );
        }
        return;
    }

    try {
        localStorage.setItem(
            storageKey(id),
            serialized,
        );
    } catch (_error) {
        // storage may be full or disabled (private mode) — persistence is best-effort.
    }
}


/**
 * Load a previously persisted snapshot. Returns a partial `PluridState` (just `{ space }`)
 * that `compute`/`resolveSpace` merge over a freshly-computed space. Version mismatch,
 * missing data, or parse errors all fall back to a fresh space (return `undefined`).
 */
const load = (
    id: string | undefined,
    useLocalStorage: boolean | undefined,
): PluridState | undefined => {
    if (!useLocalStorage) {
        return;
    }

    if (typeof localStorage === 'undefined') {
        return;
    }

    try {
        const stateData = localStorage.getItem(storageKey(id));
        if (!stateData) {
            return;
        }

        const snapshot: PersistedSnapshot = JSON.parse(stateData);

        if (!snapshot || snapshot.version !== PERSISTED_STATE_VERSION) {
            return;
        }

        if (!snapshot.space) {
            return;
        }

        // Partial state: only `space` is restored; the rest comes from props/defaults.
        return { space: snapshot.space } as PluridState;
    } catch (_error) {
        return;
    }
}
// #endregion module



// #region exports
export {
    serialize,
    save,
    load,
};
// #endregion exports
