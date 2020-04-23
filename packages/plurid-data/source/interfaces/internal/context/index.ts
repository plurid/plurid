import {
    IndexedPluridPlane,
    PluridPlaneContext,
} from '../../external';



export interface PluridContext {
    planesMap: Map<string, IndexedPluridPlane>;
    planeContext?: PluridPlaneContext<any>,
    planeContextValue?: any,
}
