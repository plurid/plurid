interface Deltas {
    deltaX: number;
    deltaY: number;
}
export declare const getWheelDirection: (deltas: Deltas, ABSTHRESHOLD?: number, THRESHOLD?: number) => string;
export {};
