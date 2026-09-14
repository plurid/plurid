import * as fs from 'fs';
import * as path from 'path';


/**
 * A BACKTICK INSIDE A STYLED TEMPLATE IS SILENT AND TOTAL.
 *
 * It closes the template. TypeScript then reads what follows as
 * `styled.div`…` as `…`` — a type assertion onto a template-literal type — so
 * `tsc --noEmit` passes, no lint fires, nothing warns at runtime, and every
 * rule after the backtick is discarded. The component renders with no styles
 * at all and the only symptom is that the page looks wrong.
 *
 * This cost three separate fixes in one day (two in CSS comments that happened
 * to produce a syntax error, and one in the command palette that did not and
 * therefore shipped). The check is cheap and exact, so it is a test.
 */
const SOURCE = path.join(__dirname, '..');

const OPENERS = /(?:\bstyled(?:\.\w+|\([^)]*\))(?:<[^>]*>)?|\bcss|\bcreateGlobalStyle(?:<[^>]*>)?|\bkeyframes)\s*`/g;

const walk = (
    directory: string,
    found: string[] = [],
): string[] => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (entry.name !== '__tests__' && entry.name !== 'node_modules') {
                walk(full, found);
            }
            continue;
        }

        if (/\.tsx?$/.test(entry.name)) {
            found.push(full);
        }
    }

    return found;
};

/**
 * Where a styled template closes, and whether that is where the code meant.
 *
 * Scan from the opener to the first unescaped backtick that is not inside a
 * `${…}` interpolation — that is where the template ACTUALLY ends. A template
 * that ended where it was meant to is followed by the end of its expression:
 * `;`, `,`, `)` or `}`. Anything else (a letter, most tellingly `as`) means a
 * backtick inside the CSS closed it early and the rest was reinterpreted.
 *
 * Checking what follows the real close, rather than guessing which backtick is
 * the stray one, is what makes this catch every shape of the mistake.
 */
const straysIn = (
    source: string,
): { line: number; after: string }[] => {
    const strays: { line: number; after: string }[] = [];

    OPENERS.lastIndex = 0;
    let opener: RegExpExecArray | null;

    while ((opener = OPENERS.exec(source)) !== null) {
        /**
         * Not an opener if it is PROSE. A doc comment saying "the engine used
         * to inject a `createGlobalStyle`" carries the same characters as the
         * real thing; scanning from there reported a stray in a file that had
         * none. A comment line starts with `*` or `//` after its indent.
         */
        const lineStart = source.lastIndexOf('\n', opener.index) + 1;
        if (/^\s*(?:\*|\/\/)/.test(source.slice(lineStart, opener.index))) {
            OPENERS.lastIndex = opener.index + opener[0].length;
            continue;
        }

        let index = opener.index + opener[0].length;
        let depth = 0;

        while (index < source.length) {
            const character = source[index];

            if (character === '\\') {
                index += 2;
                continue;
            }

            if (character === '$' && source[index + 1] === '{') {
                depth += 1;
                index += 2;
                continue;
            }

            if (depth > 0) {
                if (character === '{') {
                    depth += 1;
                }
                if (character === '}') {
                    depth -= 1;
                }
                if (character === '`') {
                    // a nested template inside an interpolation is legal
                    index += 1;
                    while (index < source.length && source[index] !== '`') {
                        index += source[index] === '\\' ? 2 : 1;
                    }
                }
                index += 1;
                continue;
            }

            if (character === '`') {
                const after = source.slice(index + 1).replace(/^\s+/, '');
                if (!/^[;,)}]/.test(after)) {
                    strays.push({
                        line: source.slice(0, index).split('\n').length,
                        after: after.slice(0, 24),
                    });
                }
                break;
            }

            index += 1;
        }

        OPENERS.lastIndex = index + 1;
    }

    return strays;
};


describe('styled-components templates', () => {
    const files = walk(SOURCE).filter((file) => {
        const source = fs.readFileSync(file, 'utf8');
        return /\bstyled[.(]|\bcreateGlobalStyle|\bkeyframes\s*`/.test(source);
    });

    it('finds the styled files at all, so a passing run means something', () => {
        expect(files.length).toBeGreaterThan(20);
    });

    it.each(files.map((file) => [path.relative(SOURCE, file), file]))(
        'no stray backtick closes the template early in %s',
        (relative, file) => {
            const strays = straysIn(fs.readFileSync(file as string, 'utf8'));

            expect({
                file: relative,
                closedEarlyAt: strays,
            }).toEqual({
                file: relative,
                closedEarlyAt: [],
            });
        },
    );
});
