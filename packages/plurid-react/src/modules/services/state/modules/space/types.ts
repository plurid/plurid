export const SCALE_UP = 'SCALE_UP';

export interface ScaleUpAction {
    type: typeof SCALE_UP;
}


export const SCALE_DOWN = 'SCALE_DOWN';

export interface ScaleDownAction {
    type: typeof SCALE_DOWN;
}


export interface SpaceState {
    scale: number;
}


export type SpaceActionsType = ScaleUpAction
    | ScaleDownAction;
