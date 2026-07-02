// #region imports
    // #region libraries
    import baseStyled, {
        WebTarget,
    } from 'styled-components';

    import isPropValid from '@emotion/is-prop-valid';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Style-only prop names that are ALSO valid HTML attributes, so
 * `@emotion/is-prop-valid` would forward them to the DOM as junk
 * (`size` on PureButton's button, `selected` on Selector's div).
 * Safe to deny globally: the library styles no input/select/option
 * host elements (tag census 2026-07-02).
 */
const STYLE_ONLY_PROPS = new Set([
    'size',
    'selected',
]);


/**
 * The prop filter for every styled component in this library: custom style
 * props (`level`, `isDisabled`, `inline`, `active`, ...) stay in CSS land and
 * never reach the DOM, matching the filter `@plurid/plurid-react` applies
 * inside `PluridApplication` (StyleSheetManager + @emotion/is-prop-valid),
 * so components behave identically inside and outside a plurid space.
 *
 * Composed component targets (`styled(Component)`) forward everything -
 * the inner component may legitimately consume any prop.
 *
 * Exported so consumer applications can reuse the exact same semantics in
 * their own `<StyleSheetManager shouldForwardProp={pluridShouldForwardProp}>`.
 */
export const pluridShouldForwardProp = (
    propertyName: string,
    target: unknown,
): boolean => {
    if (typeof target !== 'string') {
        return true;
    }

    if (STYLE_ONLY_PROPS.has(propertyName)) {
        return false;
    }

    return isPropValid(propertyName);
};


const filteredFactory = (
    target: WebTarget,
) => baseStyled(target).withConfig({
    shouldForwardProp: pluridShouldForwardProp,
});

/**
 * Only intercept the `styled.div`-style tag shorthands; anything else
 * (function internals like `call`/`apply`/`name`, symbols) passes through
 * to the base factory untouched - real function properties are `in` the
 * target, tag names are not.
 */
const TAG_SHORTHAND = /^[a-z][a-z0-9]*$/;


/**
 * Drop-in `styled` with the identical call surface (`styled.div`, generics,
 * `styled(Component)`, `.attrs` chains); only adds the prop filter.
 */
export const styled = new Proxy(filteredFactory, {
    get: (target, property, receiver) => {
        if (
            typeof property === 'string'
            && !(property in target)
            && TAG_SHORTHAND.test(property)
        ) {
            return filteredFactory(property as unknown as WebTarget);
        }

        return Reflect.get(target, property, receiver);
    },
}) as any as typeof baseStyled;


export default styled;
// #endregion module
