// #region imports
    // #region external
    import {
        PluridUniverse,
        PluridPlane,
    } from '../../external';

    import {
        Identified,
    } from '../../helpers';

    import {
        PluridInternalStatePlane,
        PluridInternalContextPlane,
    } from '../plane';

    import {
        PathParameters,
        PathQuery,
    } from '../tree';
    // #endregion external
// #endregion imports



// #region module
export interface IdentifiedPluridUniverse<C> extends Identified<PluridUniverse<C>> {
    planes: Identified<PluridPlane<C>>[];
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

export interface PluridInternalContextUniverse<C> extends PluridInternalUniverse {
    planes: Record<string, PluridInternalContextPlane<C>>;
}


export interface PlanePath {
    id: string;
    pageID: string;
    address: string;
    parameters?: PathParameters;
    query?: PathQuery;
}
// #endregion module
