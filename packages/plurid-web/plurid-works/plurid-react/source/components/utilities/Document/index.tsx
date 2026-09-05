// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridDocument as PluridDocumentDescriptor,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        generalEngine,
    } from '~services/engine';

    import {
        usePluridDocument,
        documentFromChildren,
    } from '~services/document';
    // #endregion external
// #endregion imports



// #region module
export type PluridDocumentProperties = React.PropsWithChildren<PluridDocumentDescriptor>;


/**
 * Declare a document layer as a component: the descriptor as props, and / or Helmet-style
 * children (`<title>`, `<meta>`, `<link>`, `<script>`, `<style>`, `<base>`, `<noscript>`,
 * `<html>`, `<body>`) — `<Helmet>` → `<PluridDocument>` is the whole migration. Renders nothing.
 */
const PluridDocument: React.FC<PluridDocumentProperties> = ({
    children,
    ...descriptor
}) => {
    const fromChildren = documentFromChildren(children);
    usePluridDocument(generalEngine.document.mergeDocuments(descriptor, fromChildren));

    return null;
};
// #endregion module



// #region exports
export default PluridDocument;

export { default as PluridDocumentScope } from './Scope';
export { default as PluridDocumentHead } from './Head';
export { default as PluridDocumentPlanes } from './Planes';
// #endregion exports
