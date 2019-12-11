import {
    PluridPageContext,
} from '../external';

import {
    Indexed,
} from '../helpers';

import {
    PluridInternalContextDocument,
} from './document';



export interface PluridContext {
    pageContext?: PluridPageContext<any>,
    pageContextValue?: any,
    documents: Indexed<PluridInternalContextDocument>;
}
