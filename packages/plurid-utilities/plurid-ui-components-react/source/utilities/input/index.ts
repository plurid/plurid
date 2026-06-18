// #region module
/**
 * https://github.com/facebook/react/issues/10135#issuecomment-314441175
 */
export const setNativeValue = (
    element: any,
    value: any,
) => {
    const valueSetter = (Object as any).getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = (Object as any).getOwnPropertyDescriptor(prototype, 'value').set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}
// #endregion module
