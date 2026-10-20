// #region module
/**
 * The values of `property` in an element's own styled rule (`suffix`: a rule nested on it, such as
 * `[data-plurid-aside]`), in source order: the LAST is the one a browser applies. jsdom cannot
 * resolve a `var()`, so the computed style says nothing about these; the emitted text does.
 */
export const styledDeclarations = (
    element: Element,
    property: string,
    suffix = '',
): string[] => {
    const css = Array.from(document.querySelectorAll('style')).map((style) => style.textContent || '').join('');
    const selector = suffix.replace(/[[\]'"=-]/g, (character) => '\\' + character);
    const values: string[] = [];
    for (const name of Array.from(element.classList)) {
        for (const rule of css.matchAll(new RegExp('(?:^|})\\.' + name + selector + '\\{([^}]*)\\}', 'g'))) {
            for (const declaration of rule[1].split(';')) {
                const separator = declaration.indexOf(':');
                if (declaration.slice(0, separator).trim() === property) {
                    values.push(declaration.slice(separator + 1).trim());
                }
            }
        }
    }
    return values;
};
// #endregion module
