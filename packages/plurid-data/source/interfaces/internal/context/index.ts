import {
    IndexedPluridPlane,
    PluridPlaneContext,
} from '../../external';

import {
    RegisteredPluridPlane,
} from '../../external/plane';



export interface PluridContext {
    planesRegistry: Map<string, RegisteredPluridPlane>;
    // planesMap: Map<string, IndexedPluridPlane>;
    // planesProperties: Map<string, any>;
    planeContext?: PluridPlaneContext<any>;
    planeContextValue?: any;
}
