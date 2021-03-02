// #region module
export const loadHammer = async () => {
    const hammer = await import('hammerjs');
    return hammer;
};
// #endregion module
