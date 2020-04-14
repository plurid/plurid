import {
    PluridUniverse,
    PluridPlane,
} from '../external';

import {
    Identified,
} from '../helpers';

import {
    PluridInternalStatePlane,
    PluridInternalContextPlane,
} from './plane';

import {
    PathParameters,
    PathQuery,
} from './tree';



export interface IdentifiedPluridUniverse extends Identified<PluridUniverse> {
    planes: Identified<PluridPlane>[];
}


export interface PluridInternalUniverse {
    id: string;
    name: string;
}

export interface PluridInternalStateUniverse extends PluridInternalUniverse {
    planes: Record<string, PluridInternalStatePlane>;
    paths: Record<string, PlanePath>;
    ordinal: number;
    active: boolean;
}

export interface PluridInternalContextUniverse extends PluridInternalUniverse {
    planes: Record<string, PluridInternalContextPlane>;
}


export interface PlanePath {
    id: string;
    pageID: string;
    address: string;
    parameters?: PathParameters;
    query?: PathQuery;
}
