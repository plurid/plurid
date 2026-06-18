// #region module
export const loadState = (
    name: string,
) => {
    try {
        const serializedState = localStorage.getItem(name);
        if (serializedState === null) {
            return;
        }

        return JSON.parse(serializedState);
    } catch (error) {
        return;
    }
};


export const saveState = <S>(
    state: S,
    name: string,
) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(name, serializedState);
    } catch (error) {
        return;
    }
};
// #endregion module
