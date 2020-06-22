import {
    PluridPlaneContext,
} from '../../external';

import {
    RegisteredPluridPlane,
} from '../../external/plane';



export interface PluridContext {
    planesRegistry: Map<string, RegisteredPluridPlane>;
    planeContext?: PluridPlaneContext<any>;
    planeContextValue?: any;
}
