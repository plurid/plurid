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
    return internationalization[lamguage][field];
}
// #endregion module



// #region exports
export default internatiolate;
// #endregion exports
