import {
    PageParameter,
    PathParameter,
} from '@plurid/plurid-data';



export const extractParameters = (
    pagePath: string,
    parameters?: PageParameter[],
) => {
    if (!parameters) {
        return {};
    }

    const re = /\/([^/]+)/g;
    const match = pagePath.match(re);
    if (!match) {
        return {};
    }

    const extractedParameters: PathParameter = {};

    for (const [index, matched] of match.entries()) {
        for (const definedParameters of parameters) {
            if (definedParameters.index === index) {
                const cleanedParameter = matched.slice(1,);
                extractedParameters[definedParameters.name] = cleanedParameter;
            }
        }
    }

    return extractedParameters;
}
