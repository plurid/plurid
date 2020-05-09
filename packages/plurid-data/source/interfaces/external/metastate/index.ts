import {
    PluridState,
} from '../../internal/state';



export type PluridMetastateState = Pick<
    PluridState,
    | 'configuration'
    | 'space'
    | 'ui'
>


export interface PluridMetastate {
    states: Record<string, PluridMetastateState>;
}
