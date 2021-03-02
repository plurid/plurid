// #region imports
    // #region external
    import {
        PluridComponent,
    } from '../../external';
    // #endregion external
// #endregion imports



// #region module
export interface PluridInternalPlane {
    id: string;
    path: string;
}

export interface PluridInternalStatePlane extends PluridInternalPlane {
    // root: boolean;
    // ordinal: number;
}

export interface PluridInternalContextPlane extends PluridInternalPlane {
    component: PluridComponent;
}
// #endregion module
