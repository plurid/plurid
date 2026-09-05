// #region imports
    // #region libraries
    import React, {
        useContext,
        useMemo,
    } from 'react';

    import {
        createSelectorHook,
    } from 'react-redux';

    import {
        TreePlane,
        PluridDocument as PluridDocumentDescriptor,
        PluridDocumentContext,
        PluridDocumentSource,
        PluridPlanesRegistrar as IPluridPlanesRegistrar,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import StateContext from '~services/state/context';
    import type { AppState } from '~services/state/store';

    import {
        generalEngine,
        getPlanesRegistrar,
    } from '~services/engine';

    import PluridDocumentRegistryContext from '~services/document/context';
    // #endregion external
// #endregion imports



// #region module
const useEngineSelector = createSelectorHook(StateContext as any);


/** A plane's `head` resolved synchronously (an async resolver is a server concern). */
export const resolvePlaneDocument = (
    source: PluridDocumentSource | undefined,
    context: PluridDocumentContext,
): PluridDocumentDescriptor | undefined => {
    if (!source) {
        return undefined;
    }
    if (typeof source === 'function') {
        const result = source(context);
        return result && typeof (result as Promise<unknown>).then === 'function'
            ? undefined
            : (result as PluridDocumentDescriptor | undefined);
    }
    return source;
};


/** The merged heads of the SHOWN planes of a tree, in tree order (a later plane wins). */
export const planesDocument = (
    tree: TreePlane[],
    planesRegistrar: IPluridPlanesRegistrar<PluridReactComponent> | undefined,
): PluridDocumentDescriptor | undefined => {
    const registrar = getPlanesRegistrar(planesRegistrar);
    if (!registrar) {
        return undefined;
    }
    const layers: PluridDocumentDescriptor[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.show === false) {
                continue;
            }
            // the registered plane by the node's SOURCE id (the registered route), as `Root` resolves it
            const registered = registrar.get(node.sourceID || node.route);
            const resolved = registered?.head
                ? resolvePlaneDocument(registered.head, {
                    route: registered.route.absolute,
                    parameters: registered.route.parameters,
                    query: registered.route.query,
                    planeID: node.planeID,
                    parentPlaneID: node.parentPlaneID,
                })
                : undefined;
            if (resolved) {
                layers.push(resolved);
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);

    return layers.length > 0
        ? generalEngine.document.mergeDocuments(...layers)
        : undefined;
};


export interface PluridDocumentPlanesProperties {
    planesRegistrar: IPluridPlanesRegistrar<PluridReactComponent> | undefined;
}


/** Keeps the registry's `planes` layer in step with the tree (the shown planes' `head` options). */
const PluridDocumentPlanes: React.FC<PluridDocumentPlanesProperties> = ({
    planesRegistrar,
}) => {
    const registry = useContext(PluridDocumentRegistryContext);
    const tree = useEngineSelector((state: AppState) => state.space.tree);
    const document = useMemo(
        () => planesDocument(tree, planesRegistrar),
        [tree, planesRegistrar],
    );

    // During render on both sides (idempotent by value): the hydration render must already hold
    // the planes' heads to claim the server-serialized tags.
    if (registry) {
        registry.setBase('planes', document);
    }

    return null;
};
// #endregion module



// #region exports
export default PluridDocumentPlanes;
// #endregion exports
