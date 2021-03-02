// #region imports
    // #region libraries
    import {
        compareTypes,
        CompareType,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        ParserResponse,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
 export const checkParameterLength = (
    parameter: string,
    length: number,
    compareType?: CompareType,
) => {
    const parameterLength = parameter.length;

    switch (compareType) {
        case compareTypes.equal:
            return parameterLength === length;
        case compareTypes.equalLessThan:
            return parameterLength <= length;
        case compareTypes.lessThan:
            return parameterLength < length;
        case compareTypes.equalGreaterThan:
            return parameterLength >= length;
        case compareTypes.greaterThan:
            return parameterLength > length;
        default:
            return parameterLength <= length;
    }
}



export const checkValidPath = (
    data: ParserResponse,
) => {
    const {
        path,
        parameters,
    } = data;

    const {
        parameters: validationParameters,
    } = path;

    if (validationParameters) {
        for (const [parameterKey, parameterData] of Object.entries(validationParameters)) {
            const {
                length,
                lengthType,
                startsWith,
                endsWith,
                includes,
            } = parameterData;

            const paramaterValue = parameters[parameterKey];

            if (!paramaterValue) {
                return false;
            }

            if (startsWith && !paramaterValue.startsWith(startsWith)) {
                return false;
            }

            if (endsWith && !paramaterValue.endsWith(endsWith)) {
                return false;
            }

            if (includes && !includes.includes(paramaterValue)) {
                return false;
            }

            if (length) {
                const validLength = checkParameterLength(
                    paramaterValue,
                    length,
                    lengthType,
                );
                return validLength;
            }
        }
    }

    return true;
}
// #endregion module
