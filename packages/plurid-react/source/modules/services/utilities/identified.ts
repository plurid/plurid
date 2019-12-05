import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';

import {
    PluridPage,
    PluridDocument,

    Identified,
    IdentifiedPluridDocument,
} from '@plurid/plurid-data';



export const identifyPages = (
    pages: PluridPage[],
): Identified<PluridPage>[] => {
    const identifiedPages = pages.map(page => {
        const updatedPage: Identified<PluridPage> = {
            ...page,
            id: page.id || uuid(),
        };
        return updatedPage;
    });
    return identifiedPages;
}


export const identifyDocuments = (
    documents: PluridDocument[],
): IdentifiedPluridDocument[] => {
    const identifiedDocuments = documents.map(document => {
        const updatedDocument: IdentifiedPluridDocument = {
            ...document,
            pages: identifyPages(document.pages),
            id: document.id || uuid(),
        };
        return updatedDocument;
    });
    return identifiedDocuments;
}
