// #region imports
    // #region external
    import internationalizationFields from '~constants/internationalization/fields';
    // #endregion external
// #endregion imports



// #region module
export type InternationalizationChinese = 'chinese';
export type InternationalizationEnglish = 'english';
export type InternationalizationFrench = 'french';
export type InternationalizationGerman = 'german';
export type InternationalizationHindi = 'hindi';
export type InternationalizationItalian = 'italian';
export type InternationalizationJapanese = 'japanese';
export type InternationalizationRomanian = 'romanian';
export type InternationalizationRussian = 'russian';
export type InternationalizationSpanish = 'spanish';


export type InternationalizationLanguageType =
    | InternationalizationChinese
    | InternationalizationEnglish
    | InternationalizationFrench
    | InternationalizationGerman
    | InternationalizationHindi
    | InternationalizationItalian
    | InternationalizationJapanese
    | InternationalizationRomanian
    | InternationalizationRussian
    | InternationalizationSpanish;


export type InternationalizationFields = typeof internationalizationFields;

export type InternationalizationFieldType = keyof InternationalizationFields;

export type Internationalization = Record<InternationalizationFieldType, string>;
// #endregion module
