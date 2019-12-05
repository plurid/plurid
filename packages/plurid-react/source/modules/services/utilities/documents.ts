import {
    PluridPage,
    PluridDocument,
} from '@plurid/plurid-data';


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
 * from PluridDocument create PluridInternalDocument
 */
const createInternalDocument = (
    document: PluridDocument
) => {

}
