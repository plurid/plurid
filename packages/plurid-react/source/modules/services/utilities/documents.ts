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
const createInternalStateDocument = (
    document: PluridDocument,
): PluridInternalStateDocument => {
    const statePages = document.pages.map(page => {
        const internalStatePage = createInternalStatePage(page);
        return internalStatePage;
    });

    const stateDocument: PluridInternalStateDocument = {
        name: document.name,
        pages: statePages,
        id: document.id || uuid(),
        ordinal: document.ordinal || 0,
    }

    return stateDocument;
}

/**
 * from PluridDocument create PluridInternalStateDocument
 */
const createInternalContextDocument = (
    document: PluridDocument,
): PluridInternalContextDocument => {
    const contextPages = document.pages.map(page => {
        const internalStatePage = createInternalStatePage(page);
        return internalStatePage;
    });

    const contextDocument: PluridInternalContextDocument = {
        name: document.name,
        pages: contextPages,
        id: document.id || uuid(),
    }

    return contextDocument;
}
