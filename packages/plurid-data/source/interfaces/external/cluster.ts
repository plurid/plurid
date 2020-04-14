import {
    PluridPlane,
} from './plane';

import {
    PluridLayout,
} from './layout';



export interface PluridCluster {
    id: string;
    name?: string;
    planes?: PluridPlane[];
    clusters?: PluridCluster[];
    layout?: PluridLayout;
}
