import {
    splitPath,
} from '../Parser/logic';



export interface ProcessedParameter {
    position: number;
}

export type ProcessedParameters = Record<string, ProcessedParameter>;

export interface ProcessedPath {
    path: string;
    parameters: ProcessedParameters;
}


export const processPath = (
    path: string,
): ProcessedPath => {
    const routeElements = splitPath(path);
    const parameters: ProcessedParameters = {};

    routeElements.map((routeElement, index) => {
        if (routeElement[0] === ':') {
            parameters[routeElement] = {
                position: index,
            };
        }
    });

    return {
        path,
        parameters,
    };
}
