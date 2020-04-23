import {
    PluridComponent,
} from '../../external';



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
