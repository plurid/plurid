import {
    indexing,
} from '@plurid/plurid-functions';

import {
    PluridPlane,
    PluridUniverse,

    Identified,
    IdentifiedPluridUniverse,
} from '@plurid/plurid-data';



// export const identifyPlanes = (
//     pages: PluridPlane[],
// ): Identified<PluridPlane>[] => {
//     return indexing.identify(pages) as Identified<PluridPlane>[];

//     // const identifiedPlanes = pages.map(page => {
//     //     const updatedPlane: Identified<PluridPlane> = {
//     //         ...page,
//     //         id: page.id || uuid(),
//     //     };
//     //     return updatedPlane;
//     // });
//     // return identifiedPlanes;
// }


// export const identifyUniverses = (
//     documents: PluridUniverse[],
// ): IdentifiedPluridUniverse[] => {
//     return indexing.identify(documents) as IdentifiedPluridUniverse[];

//     // const identifiedUniverses = documents.map(document => {
//     //     const updatedUniverse: IdentifiedPluridUniverse = {
//     //         ...document,
//     //         pages: identifyPlanes(document.pages),
//     //         id: document.id || uuid(),
//     //     };
//     //     return updatedUniverse;
//     // });
//     // return identifiedUniverses;
// }
