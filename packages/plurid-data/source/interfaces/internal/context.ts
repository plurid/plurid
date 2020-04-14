import {
    PluridPlaneContext,
} from '../external';

import {
    PluridInternalContextUniverse,
} from './universe';



export interface PluridContext {
    pageContext?: PluridPlaneContext<any>,
    pageContextValue?: any,
    universes: Record<string, PluridInternalContextUniverse>;
}
