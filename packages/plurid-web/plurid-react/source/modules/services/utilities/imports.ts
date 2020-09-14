export const loadHammer = async () => {
    const hammer = await import('hammerjs');
    return hammer;
};
