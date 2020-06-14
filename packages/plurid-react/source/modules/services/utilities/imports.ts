export const loadHammer = async () => loadPackage('hammerjs');


export const loadPackage = async (
    packageName: string,
) => {
    return await import(packageName);
}
