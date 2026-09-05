// #region imports
    // #region libraries
    import {
        useContext,
        useState,
        useLayoutEffect,
        useEffect,
    } from 'react';

    import {
        PluridDocument,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        warnOnce,
    } from '~services/logic/development/warn';
    // #endregion external


    // #region internal
    import PluridDocumentRegistryContext from './context';
    // #endregion internal
// #endregion imports



// #region module
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;


/**
 * Declare a document layer from anywhere under an application / provider: the title, meta,
 * links, JSON-LD, html/body attributes this component wants while it is mounted. Layers merge
 * in render order — a component deeper in the tree wins over its ancestors — above the route's
 * and the planes' heads. The declaration is collected during render on both sides (the server
 * knows the head before the document is written; a hydration render claims the server's tags)
 * and withdrawn on unmount. Outside any scope it is ignored (a development warning).
 */
export const usePluridDocument = (
    document: PluridDocument | undefined,
): void => {
    const registry = useContext(PluridDocumentRegistryContext);
    const [order] = useState(() => (registry ? registry.nextOrder() : -1));
    if (!registry) {
        warnOnce(
            'document-scope',
            'usePluridDocument() / <PluridDocument> rendered outside a PluridApplication or PluridProvider: the document is ignored.',
        );
    } else {
        // The render IS the collection, on both sides: the server has no effects, and a hydration
        // render must already hold the whole head to claim the server-serialized tags (a title
        // added in an effect would be a SECOND title). Idempotent by value; listeners hear about
        // it a microtask later, so nothing updates while this component renders.
        registry.set(order, document);
    }

    useIsomorphicLayoutEffect(() => {
        if (!registry || registry.server) {
            return undefined;
        }
        return () => {
            registry.remove(order);
        };
    }, [registry, order]);
};
// #endregion module
