export const getPluridPlaneByData = (element: HTMLElement): any => {
    const parent = element.parentElement;

    if (parent!.dataset.pluridPlane) {
        return parent!.dataset.pluridPlane;
    } else {
        return getPluridPlaneByData(parent!);
    }
}
