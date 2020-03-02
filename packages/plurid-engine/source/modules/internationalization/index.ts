import {
    internationalization,
    InternationalizationLanguages,
    InternationalizationFields,
} from '@plurid/plurid-data';



const internatiolate = (
    lamguage: InternationalizationLanguages,
    field: InternationalizationFields,
) => {
    return internationalization[lamguage][field];
}


export default internatiolate;
