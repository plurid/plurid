// #region imports
    // #region libraries
    import {
        internationalization,
        InternationalizationLanguageType,
        InternationalizationFieldType,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const internatiolate = (
    lamguage: InternationalizationLanguageType,
    field: InternationalizationFieldType,
) => {
    // Fall back to English (then the field key) when a locale is missing a string, so a
    // newly-added field doesn't render blank in every non-English locale until it's translated.
    return internationalization[lamguage]?.[field]
        ?? internationalization.english?.[field]
        ?? field;
}
// #endregion module



// #region exports
export default internatiolate;
// #endregion exports
