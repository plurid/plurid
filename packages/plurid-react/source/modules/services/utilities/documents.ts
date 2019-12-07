import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import {
    PluridDocument,

    PluridInternalStateDocument,
    PluridInternalContextDocument,
} from '@plurid/plurid-data';

import {
    createInternalStatePage,
    createInternalContextPage,
} from './pages';

import {
    createIndexed,
} from './indexed';

import {
    registerPaths,
} from './paths';



/**
 * from PluridDocument create PluridInternalStateDocument
 */
export const createInternalStateDocument = (
    document: PluridDocument,
): PluridInternalStateDocument => {
    const statePages = document.pages.map(page => {
        const internalStatePage = createInternalStatePage(page);
        return internalStatePage;
    });
    const indexedStatePages = createIndexed(statePages);

    const paths = registerPaths(statePages);
    const indexedPaths = createIndexed(paths);
    console.log(paths);

    const stateDocument: PluridInternalStateDocument = {
        name: document.name,
        pages: indexedStatePages,
        paths: indexedPaths,
        id: document.id || uuid(),
        ordinal: document.ordinal || 0,
        active: document.active || false,
    }

    return stateDocument;
}

/**
 * from PluridDocument create PluridInternalStateDocument
 */
export const createInternalContextDocument = (
    document: PluridDocument,
): PluridInternalContextDocument => {
    const contextPages = document.pages.map(page => {
        const internalContextPage = createInternalContextPage(page);
        return internalContextPage;
    });
    const indexedContextPages = createIndexed(contextPages);

    const contextDocument: PluridInternalContextDocument = {
        name: document.name,
        pages: indexedContextPages,
        id: document.id || uuid(),
    }

    return contextDocument;
}


/**
 * Get the documentID if any of the `documents` is active.
 *
 * If no document is active, returns the id of the first document.
 *
 * @param documents
 */
export const findActiveDocument = (
    documents: PluridInternalStateDocument[]
) => {
    let activeDocumentID = documents[0].id;

    for (let document of documents) {
        if (document.active) {
            activeDocumentID = document.id;
            break;
        }
    }

    return activeDocumentID;
}
