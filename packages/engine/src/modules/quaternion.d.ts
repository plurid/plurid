export declare const degToRad: (deg: number) => number;
export declare const radToDeg: (rad: number) => number;
interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}
export declare const makeQuaternion: (x: number, y: number, z: number, w: number) => Quaternion;
export declare const zeroQuaternion: () => Quaternion;
export declare function inverseQuaternion(quaternion: Quaternion): Quaternion;
export declare function conjugateQuaternion(quaternion: Quaternion): Quaternion;
export declare function computeQuaternionFromEulers(alpha: number, beta: number, gamma: number): Quaternion;
export declare function quaternionFromAxisAngle(x: number, y: number, z: number, angle: number): Quaternion;
export declare function quaternionMultiply(quaternionArray: Quaternion[]): Quaternion;
export declare function rotatePointViaQuaternion(pointRotate: any, quaternion: Quaternion): Quaternion;
export declare function makeRotationMatrixFromQuaternion(quaternion: Quaternion): number[];
export {};
