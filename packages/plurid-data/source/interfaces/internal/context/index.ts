import {
    PluridPlaneContext,
    IndexedPluridPlane,
} from '../../external';

import {
    PluridInternalContextUniverse,
} from '../universe';



export interface PluridContext {
    planeContext?: PluridPlaneContext<any>,
    planeContextValue?: any,
    universes: Record<string, PluridInternalContextUniverse>;
    indexedPlanes?: Map<string, IndexedPluridPlane>;
}
