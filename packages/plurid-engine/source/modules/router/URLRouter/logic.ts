import {
    splitPath,
    computeComparingPath,
    extractParametersValues,
} from '../Parser/logic';



export interface ProcessedPath {
    path: string;
    parameters: string[];
}


export const processPath = (
    path: string,
): ProcessedPath => {
    const routeElements = splitPath(path);
    const parameters: string[] = [];

    routeElements.map(routeElement => {
        if (routeElement[0] === ':') {
            parameters.push(routeElement);
        } else {
            parameters.push('');
        }
    });

    return {
        path,
        parameters,
    };
}


export const matchPath = (
    path: string,
    paths: Record<string, ProcessedPath>,
) => {
    for (const processedPath of Object.values(paths)) {
        const {
            locationElements,
            comparingPath,
        } = computeComparingPath(
            path,
            processedPath.parameters,
        );

        if (comparingPath !== processedPath.path) {
            return;
        }

        const parametersValues = extractParametersValues(
            processedPath.parameters,
            locationElements,
        );
        return {
            path: processedPath.path,
            parameters: parametersValues,
        };
    }

    return;
}
