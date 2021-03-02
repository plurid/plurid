// #region module
export interface PluridAnimation {
    duration: number;

    /**
     * list of Plurid Plane IDs
     */
    affect: string[];

    effect: PluridAnimationEffect;
}


export interface PluridAnimationEffect {
    from: PluridAnimationLocation;
    to: PluridAnimationLocation;
}


export type PluridAnimationLocation =
    | 'rendered'
    | 'origin'
    | 'current'
    | PluridAnimationLocationData;


export interface PluridAnimationLocationData {
    x: number;
    y: number;
    z: number;
}
// #endregion module
