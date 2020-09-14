import {
    internationalization,
    InternationalizationLanguageType,
    InternationalizationFieldType,
} from '@plurid/plurid-data';



const internatiolate = (
    lamguage: InternationalizationLanguageType,
    field: InternationalizationFieldType,
) => {
    return internationalization[lamguage][field];
}


export default internatiolate;
