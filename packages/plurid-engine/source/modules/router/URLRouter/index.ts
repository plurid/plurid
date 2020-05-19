import {
    ProcessedPath,
    processPath,
} from './logic';



class URLRouter {
    private paths: Record<string, ProcessedPath>;

    constructor(
        paths: string[],
    ) {
        this.paths = this.processPaths(paths);
    }

    public match(
        path: string,
    ) {
        // check if path is a parametric match
        const matchedPath = this.paths[path];

        if (matchedPath) {
            return matchedPath;
        }

        return;
    }

    private processPaths(
        paths: string[],
    ) {
        const index: Record<string, ProcessedPath> = {};

        for (const path of paths) {
            const processedPath = processPath(path);
            index[processedPath.path] = {
                ...processedPath,
            };
        }

        return index;
    }
}


export default URLRouter;
