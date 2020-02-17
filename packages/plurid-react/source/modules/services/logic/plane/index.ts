export const getPluridPlaneIDByData = (
    element: HTMLElement | null,
): any => {
    if (!element) {
        return '';
    }

    const parent = element.parentElement;
    if (parent && parent.dataset.pluridPlane) {
        return parent.dataset.pluridPlane;
    }

    return getPluridPlaneIDByData(parent);
}
