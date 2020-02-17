import {
    PathParameters
} from '@plurid/plurid-data';



export const extractParameters = (
    pagePath: string,
    parameters?: PathParameters,
) => {
    if (!parameters) {
        return {};
    }

    const re = /\/([^/]+)/g;
    const match = pagePath.match(re);
    if (!match) {
        return {};
    }

    const extractedParameters: PathParameters = {};

    // for (const [index, matched] of match.entries()) {
    //     for (const [parameterIndex, parameterValue] of Object.entries(parameters)) {
    //         if (parameterIndex === index) {
    //             const cleanedParameter = matched.slice(1,);
    //             extractedParameters[parameterValue] = cleanedParameter;
    //         }
    //     }
    // }

    return extractedParameters;
}
