import {
    PluridDocument,
    PluridPage,
} from '../external';

import {
    Identified,
    Indexed,
} from '../helpers';

import {
    PluridInternalStatePage,
    PluridInternalContextPage,
} from './page';

import {
    PathParameters,
    PathQuery,
} from './tree';



export interface IdentifiedPluridDocument extends Identified<PluridDocument> {
    pages: Identified<PluridPage>[];
}


export interface PluridInternalDocument {
    id: string;
    name: string;
}

export interface PluridInternalStateDocument extends PluridInternalDocument {
    pages: Indexed<PluridInternalStatePage>;
    paths: Indexed<PagePath>;
    ordinal: number;
    active: boolean;
}

export interface PluridInternalContextDocument extends PluridInternalDocument {
    pages: Indexed<PluridInternalContextPage>;
}


export interface PagePath {
    id: string;
    pageID: string;
    address: string;
    parameters?: PathParameters;
    query?: PathQuery;
}
