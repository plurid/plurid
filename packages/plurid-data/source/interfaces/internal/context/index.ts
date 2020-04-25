import {
    IndexedPluridPlane,
    PluridPlaneContext,
} from '../../external';



export interface PluridContext {
    planesMap: Map<string, IndexedPluridPlane>;
    planesProperties: Map<string, any>;
    planeContext?: PluridPlaneContext<any>;
    planeContextValue?: any;
}
