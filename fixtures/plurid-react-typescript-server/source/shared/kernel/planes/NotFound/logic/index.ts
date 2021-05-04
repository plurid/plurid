// #region imports
    // #region external
    import faces from '../data/faces';
    // #endregion external
// #endregion imports



// #region module
export const getRandomFace = () => {
    const faceIndex = Math.floor(Math.random() * faces.length);
    const face = faces[faceIndex];

    return face;
}
// #endregion module
