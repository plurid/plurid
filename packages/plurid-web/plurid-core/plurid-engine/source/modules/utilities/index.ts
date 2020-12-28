export const cleanPathElement = (
    path: string
) => {
    if (path[0] === '/') {
        return path.slice(1);
    }
    return path;
}
