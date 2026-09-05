// #region imports
    // #region libraries
    import {
        PluridDocument,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        generalEngine,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
const {
    mergeDocuments,
    normalizeDocument,
    isEmptyDocument,
} = generalEngine.document;


export type PluridDocumentBaseLayer = 'route' | 'planes';

/**
 * The per-application (client) / per-request (server) collector of document layers: the route's
 * head, the shown planes' heads, and every in-render `usePluridDocument` declaration in RENDER
 * order (the order key is taken during render, parent first, so a deeper declaration wins).
 * `snapshot()` is the merge; it is cached until the next write. Subscribers are notified on a
 * microtask (coalesced).
 */
export interface PluridDocumentRegistry {
    readonly server: boolean;
    nextOrder: () => number;
    /** Idempotent: an equal document for the same order is a no-op. */
    set: (order: number, document: PluridDocument | undefined) => void;
    remove: (order: number) => void;
    setBase: (layer: PluridDocumentBaseLayer, document: PluridDocument | undefined) => void;
    snapshot: () => PluridDocument;
    subscribe: (listener: () => void) => () => void;
}


export const createDocumentRegistry = (
    options: { server?: boolean } = {},
): PluridDocumentRegistry => {
    const server = options.server ?? (typeof window === 'undefined');
    let counter = 0;
    const entries = new Map<number, { document: PluridDocument; key: string }>();
    const base: Record<PluridDocumentBaseLayer, { document: PluridDocument; key: string } | undefined> = {
        route: undefined,
        planes: undefined,
    };
    const listeners = new Set<() => void>();
    let cached: PluridDocument | undefined;
    let scheduled = false;

    // Declarations are collected DURING render (so a hydration render already knows the whole
    // head and claims the server-serialized tags); listeners are told one microtask later, never
    // while another component renders, and several writes in one pass coalesce into one update.
    const notify = () => {
        cached = undefined;
        if (scheduled || listeners.size === 0) {
            return;
        }
        scheduled = true;
        const flush = () => {
            scheduled = false;
            for (const listener of listeners) {
                listener();
            }
        };
        if (typeof queueMicrotask === 'function') {
            queueMicrotask(flush);
        } else {
            Promise.resolve().then(flush);
        }
    };

    const normalizedEntry = (document: PluridDocument | undefined) => {
        if (isEmptyDocument(document)) {
            return undefined;
        }
        const normalized = normalizeDocument(document);
        return {
            document: normalized,
            key: JSON.stringify(normalized),
        };
    };

    return {
        server,
        nextOrder: () => {
            counter += 1;
            return counter;
        },
        set: (order, document) => {
            const entry = normalizedEntry(document);
            const previous = entries.get(order);
            if (!entry) {
                if (previous) {
                    entries.delete(order);
                    notify();
                }
                return;
            }
            if (previous && previous.key === entry.key) {
                return;
            }
            entries.set(order, entry);
            notify();
        },
        remove: (order) => {
            if (entries.delete(order)) {
                notify();
            }
        },
        setBase: (layer, document) => {
            const entry = normalizedEntry(document);
            const previous = base[layer];
            if ((!entry && !previous) || (entry && previous && entry.key === previous.key)) {
                return;
            }
            base[layer] = entry;
            notify();
        },
        snapshot: () => {
            if (!cached) {
                const ordered = [...entries.entries()]
                    .sort((a, b) => a[0] - b[0])
                    .map(([, entry]) => entry.document);
                cached = mergeDocuments(
                    base.route?.document,
                    base.planes?.document,
                    ...ordered,
                );
            }
            return cached;
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};
// #endregion module
