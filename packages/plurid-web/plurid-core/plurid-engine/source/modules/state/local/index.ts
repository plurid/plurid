// #region imports
    // #region libraries
    import {
        PluridState,
        PluridStorageAdapter,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Bump when the persisted shape changes. A stored snapshot with a different version is
 * ignored on load (falls back to a fresh space) rather than risking a partial mis-merge.
 */
const PERSISTED_STATE_VERSION = 2;

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
    'links',
] as const;

interface PersistedSnapshot {
    version: number;
    space: Partial<PluridState['space']>;
}

const storageKey = (
    id: string | undefined,
) => STORAGE_PREFIX + (id || 'default');


/**
 * The default backend: `localStorage` wrapped in the adapter shape, or `undefined` outside the
 * browser (SSR / no storage) — in which case every persistence entry point no-ops. A caller-supplied
 * adapter always wins over this.
 */
const localStorageAdapter = (): PluridStorageAdapter | undefined => {
    if (typeof localStorage === 'undefined') {
        return undefined;
    }

    return {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => { localStorage.setItem(key, value); },
        removeItem: (key) => { localStorage.removeItem(key); },
    };
}


/** Resolve the effective backend: the caller's adapter, else the default localStorage one. */
const resolveAdapter = (
    adapter: PluridStorageAdapter | undefined,
): PluridStorageAdapter | undefined => adapter || localStorageAdapter();


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
 * Persist the focused space snapshot via the storage adapter (default `localStorage`). No-op when
 * there is no state or no available backend.
 */
const save = (
    id: string | undefined,
    state: PluridState | undefined,
    adapter?: PluridStorageAdapter,
) => {
    const store = resolveAdapter(adapter);
    if (!state || !store) {
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
        store.setItem(
            storageKey(id),
            serialized,
        );
    } catch (_error) {
        // storage may be full or disabled (private mode), or a custom adapter threw — persistence
        // is best-effort.
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
    adapter?: PluridStorageAdapter,
): PluridState | undefined => {
    if (!useLocalStorage) {
        return;
    }

    const store = resolveAdapter(adapter);
    if (!store) {
        return;
    }

    try {
        const stateData = store.getItem(storageKey(id));
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


const CONTENT_PREFIX = 'pluridContent-';

const contentKey = (
    id: string | undefined,
) => CONTENT_PREFIX + (id || 'default');


/**
 * Persist an OPAQUE product content blob (the `onPersistContent` seam). Stored under a sibling key
 * to the space snapshot, with NO engine version stamp — the content shape (and any migration) is
 * the product's concern; the engine never inspects it. No-op outside the browser / for `undefined`.
 */
const saveContent = (
    id: string | undefined,
    content: unknown,
    adapter?: PluridStorageAdapter,
) => {
    const store = resolveAdapter(adapter);
    if (content === undefined || !store) {
        return;
    }

    try {
        store.setItem(
            contentKey(id),
            JSON.stringify(content),
        );
    } catch (_error) {
        // best-effort (storage full / disabled / custom adapter threw)
    }
}


/**
 * Load the opaque product content blob, or `undefined` if absent / unparseable.
 */
const loadContent = (
    id: string | undefined,
    adapter?: PluridStorageAdapter,
): unknown => {
    const store = resolveAdapter(adapter);
    if (!store) {
        return undefined;
    }

    try {
        const raw = store.getItem(contentKey(id));
        if (!raw) {
            return undefined;
        }

        return JSON.parse(raw);
    } catch (_error) {
        return undefined;
    }
}
// #endregion module



// #region exports
export {
    serialize,
    save,
    load,
    saveContent,
    loadContent,
};
// #endregion exports
