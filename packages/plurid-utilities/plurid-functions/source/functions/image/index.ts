// #region module
/**
 * Load image from URL in browser.
 *
 * @param url
 * @param anonymous
 */
export const load = (
    url: string,
    anonymous: boolean = true,
) => {
    return new Promise(
        (response) => {
            const image = new Image();
            image.onload = (() => response(image));
            if (anonymous) {
                image.crossOrigin = 'anonymous';
            }
            image.src = url;
        },
    );
};
// #endregion module
