import {
    PluridComponentReact,
} from '../external';



export interface PluridInternalPage {
    id: string;
    path: string;
}

export interface PluridInternalStatePage extends PluridInternalPage {
    root: boolean;
    ordinal: number;
}

export interface PluridInternalContextPage extends PluridInternalPage {
    component: PluridComponentReact;
}
