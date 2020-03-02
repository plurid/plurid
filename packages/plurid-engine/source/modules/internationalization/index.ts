import {
    internationalization,
} from '@plurid/plurid-data';



const internatiolate = (
    lamguage: string,
    field: string,
) => {
    return (internationalization as any)[lamguage][field];
}


export default internatiolate;
