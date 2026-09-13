// #region imports
    // #region external
    import internationalizationFields from '~constants/internationalization/fields';
    // #endregion external
// #endregion imports



// #region module
export type InternationalizationArabic = 'arabic';
export type InternationalizationChinese = 'chinese';
export type InternationalizationEnglish = 'english';
export type InternationalizationFrench = 'french';
export type InternationalizationGerman = 'german';
export type InternationalizationHindi = 'hindi';
export type InternationalizationItalian = 'italian';
export type InternationalizationJapanese = 'japanese';
export type InternationalizationNorwegian = 'norwegian';
export type InternationalizationRomanian = 'romanian';
export type InternationalizationSpanish = 'spanish';
export type InternationalizationUkrainian = 'ukrainian';


export type InternationalizationLanguageType =
    | InternationalizationArabic
    | InternationalizationChinese
    | InternationalizationEnglish
    | InternationalizationFrench
    | InternationalizationGerman
    | InternationalizationHindi
    | InternationalizationItalian
    | InternationalizationJapanese
    | InternationalizationNorwegian
    | InternationalizationRomanian
    | InternationalizationSpanish
    | InternationalizationUkrainian;


export type InternationalizationFields = typeof internationalizationFields;

export type InternationalizationFieldType = keyof InternationalizationFields;

export type Internationalization = Record<InternationalizationFieldType, string>;
// #endregion module
