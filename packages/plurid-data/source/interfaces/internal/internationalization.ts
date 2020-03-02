export type InternationalizationEnglish = 'english';
export type InternationalizationFrench = 'french';
export type InternationalizationGerman = 'german';
export type InternationalizationItalian = 'italian';
export type InternationalizationRomanian = 'romanian';
export type InternationalizationSpanish = 'spanish';

export type InternationalizationLanguages = InternationalizationEnglish
    | InternationalizationFrench
    | InternationalizationGerman
    | InternationalizationItalian
    | InternationalizationRomanian
    | InternationalizationSpanish;


export type InternationalizationFieldViewcubeFront = 'viewcubeFront';
export type InternationalizationFieldViewcubeBack = 'viewcubeBack';
export type InternationalizationFieldViewcubeLeft = 'viewcubeLeft';
export type InternationalizationFieldViewcubeRight = 'viewcubeRight';
export type InternationalizationFieldViewcubeTop = 'viewcubeTop';
export type InternationalizationFieldViewcubeBase = 'viewcubeBase';
export type InternationalizationFieldToolbarTransformRotate = 'toolbarTransformRotate';
export type InternationalizationFieldToolbarTransformScale = 'toolbarTransformScale';
export type InternationalizationFieldToolbarTransformTranslate = 'toolbarTransformTranslate';

export type InternationalizationFields = InternationalizationFieldViewcubeFront
    | InternationalizationFieldViewcubeBack
    | InternationalizationFieldViewcubeLeft
    | InternationalizationFieldViewcubeRight
    | InternationalizationFieldViewcubeTop
    | InternationalizationFieldViewcubeBase
    | InternationalizationFieldToolbarTransformRotate
    | InternationalizationFieldToolbarTransformScale
    | InternationalizationFieldToolbarTransformTranslate;


export interface Internationalization {
    viewcubeFront: string;
    viewcubeBack: string;
    viewcubeLeft: string;
    viewcubeRight: string;
    viewcubeTop: string;
    viewcubeBase: string;
    toolbarTransformRotate: string;
    toolbarTransformScale: string;
    toolbarTransformTranslate: string;
}
