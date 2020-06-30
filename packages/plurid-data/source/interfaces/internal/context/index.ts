import PluridPubSub from '@plurid/plurid-pubsub';

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

    registerPubSub: (
        pubsub: PluridPubSub,
    ) => void;
}
