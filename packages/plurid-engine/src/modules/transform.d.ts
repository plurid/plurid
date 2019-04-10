export declare function getMatrixValues(matrix3d: string): number[];
export declare function getRotationMatrix(matrix3d: string): number[];
export declare function getTranslationMatrix(matrix3d: string): number[];
export declare function getScalationValue(matrix3d: string): number;
export declare function setTransform(rotationMatrix: number[], translationMatrix: number[], scalationMatrix: number[]): string;
interface RotationValues {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
}
export declare function getTransformRotate(matrix3d: string): RotationValues;
interface TranslationValues {
    translateX: number;
    translateY: number;
    translateZ: number;
}
export declare function getTransformTranslate(matrix3d: string): TranslationValues;
interface ScalationValue {
    scale: number;
}
export declare function getTransformScale(matrix3d: string): ScalationValue;
export declare function rotatePlurid(matrix3d: string, direction?: string, angleIncrement?: number): string;
export declare function translatePlurid(matrix3d: string, direction?: string, linearIncrement?: number): string;
export declare function scalePlurid(matrix3d: string, direction?: string, scaleIncrement?: number): string;
export {};
