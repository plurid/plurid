// #region module
export const deleteTypenames = (
    data: any,
) => {
    let dataObject = null;
    if (Array.isArray(data)) {
        dataObject = [ ...data ];
    } else {
        dataObject = { ...data };
    }

    for (const property in dataObject) {
        if (property === '__typename') {
            delete dataObject[property];
        }

        if (typeof dataObject[property] === 'object' && dataObject[property] !== null) {
            const dataObjectProperty = deleteTypenames(dataObject[property]);
            dataObject[property] = dataObjectProperty;
        }
    }

    return dataObject;
}
// #endregion module
