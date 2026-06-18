// #region imports
    // #region external
    import {
        shuffle as arraysShuffle,
    } from '../arrays';
    // #endregion external
// #endregion imports



// #region module
export const removeWhitespace = (
    value: string | undefined,
) => {
    if (!value) {
        return '';
    }

    return value
        .replace(/\s+/g, ' ')
        .trim();
}


/**
 * Capitalizes the first letter of the word.
 *
 * ``` text
 * e.g. foo -> Foo
 * ```
 *
 * @param value
 */
export const capitalize = (
    value: string,
) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}


/**
 * Capitalizes the first letter of every word.
 *
 * ``` text
 * e.g. foo boo -> Foo Boo
 * ```
 *
 * @param value
 */
export const capitalizeAll = (
    value: string,
) => {
    const splits = value.split(' ');

    const capitalizedSplits = splits.map(split => {
        return capitalize(split);
    });

    return capitalizedSplits.join(' ');
}


/**
 * Truncates the `value` to a given `length` adding the `ending`.
 *
 * ``` text
 * e.g. 1234567890 -> 1234…
 * ```
 *
 * ``` typescript
 * truncate('1234567890', 4)
 * ```
 *
 * @param value
 * @param length default `100`
 * @param ending default `'…'`
 * @returns
 */
export const truncate = (
    value: string | undefined,
    length: number = 50,
    ending: string = '…',
) => {
    if (!value) {
        return '';
    }

    if (value.length <= length) {
        return value;
    }

    return value.slice(0, length) + ending;
}


/**
 * Trims the middle of the `value` keeping the lateral `length`
 * and replacing with the `middle`.
 *
 * ``` text
 * e.g. 12345678901234567890 -> 123456…567890
 * ```
 *
 * @param value
 * @param length default `6`
 * @param middle default `'…'`
 * @param startLength
 * @param endLength
 * @returns
 */
export const trimMiddle = (
    value: string | undefined,
    length: number = 6,
    middle: string = '…',
    startLength?: number,
    endLength?: number,
) => {
    if (!value) {
        return '';
    }

    const lengthSum = (startLength ?? length) + (endLength ?? length);

    if (value.length < (lengthSum + middle.length)) {
        return value;
    }

    const start = value.slice(0, startLength ?? length);
    const end = value.slice(value.length - (endLength ?? length));
    const trim = start + middle + end;

    return trim;
}


/**
 * Given a text string, e.g. 'one two three',
 * it removes the last word, 'three', returning 'one two'.
 *
 * If the text string is one word, 'one', it returns ''.
 *
 * @param text Text string.
 */
export const removeLastWord = (
    text: string,
): string => {
    const wordsArray = text.split(' ');
    if (wordsArray.length === 1) {
        return '';
    }

    const removedLastWordArray = wordsArray.slice(0, wordsArray.length - 1);
    const words = removedLastWordArray.join(' ');

    return words;
}


/**
 * Given `PascalCaseValue` it returns `pascal.case.value`.
 *
 * @param value
 * @param lowercase default `true`
 * @returns
 */
export const pascalCaseToDotNotation = (
    value: string,
    lowercase = true,
) => {
    let newValue = '';

    for (let i = 0; i < value.length; i++) {
        const letter = value[i];

        if (letter === letter.toUpperCase()) {
            if (i !== 0) {
                newValue += '.';
            }

            if (lowercase) {
                newValue += letter.toLowerCase();
            } else {
                newValue += letter;
            }
        } else {
            newValue += letter;
        }
    }

    return newValue;
}


/**
 * Given `PascalCaseValue` it returns `Pascal_Case_Value`.
 *
 * @param value
 * @returns
 */
export const pascalCaseToSnakeCase = (
    value: string,
) => {
    const snakeCase = value
        .replace(/([A-Z][a-z])/g,' $1')
        .trim()
        .split(' ')
        .join('_');

    return snakeCase;
}


/**
 * Given `Pascal_Case_Value` it returns `PascalCaseValue`.
 *
 * @param value
 * @returns
 */
export const snakeCaseToPascalCase = (
    value: string,
) => {
    const pascalCase = value.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    return pascalCase;
}



/**
 * Converts `Camel Case Value` to `camelCaseValue`.
 *
 * @param text
 */
export const toCamelCase = (
    value: string
) => {
    return value
        .toLowerCase()
        .replace(
            /[^a-zA-Z0-9]+(.)/g,
            (_, character) => character.toUpperCase(),
        );
}


/**
 * Shuffles the characters of the `text`.
 *
 * @param text
 * @returns
 */
export const shuffle = (
    text: string,
): string => {
    const shuffled = arraysShuffle(text.split(''));

    return shuffled.join('');
}


/**
 * Removes the `character` at the start of the `value`.
 *
 * @param value
 * @param character
 * @param count default `1`
 * @returns
 */
 export const trimStart = (
    value: string,
    character: string,
    count = 1,
): string => {
    if (count = 0) {
        return value;
    }

    if (value[0] === character) {
        return trimStart(
            value.slice(1),
            character,
            count - 1,
        );
    }

    return value;
}


/**
 * Removes the `character` at the end of the `value`.
 *
 * @param value
 * @param character
 * @param count default `1`
 * @returns
 */
export const trimEnd = (
    value: string,
    character: string,
    count = 1,
): string => {
    if (count = 0) {
        return value;
    }

    if (value[value.length - 1] === character) {
        return trimEnd(
            value.slice(0, value.length - 1),
            character,
            count - 1,
        );
    }

    return value;
}


/**
 * Pluralizes a `text` based on a `value`.
 *
 * ``` typescript
 * pluralize(1, 'day'); // '1 day'
 * pluralize(2, 'day'); // '2 days'
 *
 * pluralize(1, 'bus', 'es'); // '1 bus'
 * pluralize(2, 'bus', 'es'); // '1 buses'
 *
 * pluralize(1, 'wolf', { replace: 'wolves' }); // '1 wolf'
 * pluralize(2, 'wolf', { replace: 'wolves' }); // '2 wolves'
 * ```
 *
 * @param value
 * @param text
 * @param overload `string | { replace: string }`
 * @returns
 */
export function pluralize(
    value: number,
    text: string,
    end: string,
): string;
export function pluralize(
    value: number,
    text: string,
    options: {
        replace: string;
    },
): string;
export function pluralize(
    value: any,
    text: any,
    overload: any,
) {
    if (
        typeof value !== 'number'
        || typeof text !== 'string'
    ) {
        return '';
    }

    let end = 's';
    let replace;
    if (typeof overload === 'string') {
        end = overload;
    } else {
        replace = overload.replace;
    }

    const space = ' ';

    if (value === 1) {
        return value + space + text;
    }

    if (replace) {
        return value + space + replace;
    }

    return value + space + text + end;
}
// #endregion module
