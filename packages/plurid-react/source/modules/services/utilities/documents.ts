import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import {
    PluridPage,
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



/**
 * from PluridDocument create PluridInternalDocument
 */
const createDefaultDocument = (
    pages: PluridPage[],
): PluridDocument => {
    const defaultDocument: PluridDocument = {
        name: 'default',
        pages: [...pages],
    };

    return defaultDocument;
}



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

    const stateDocument: PluridInternalStateDocument = {
        name: document.name,
        pages: indexedStatePages,
        id: document.id || uuid(),
        ordinal: document.ordinal || 0,
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
