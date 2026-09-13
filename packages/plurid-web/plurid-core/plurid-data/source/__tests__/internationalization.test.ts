// #region imports
    // #region external
    import {
        internationalization,
    } from '../constants/internationalization';

    import internationalizationFields from '../constants/internationalization/fields';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE TRANSLATIONS CANNOT DRIFT. `Internationalization` is `Record<field, string>`, so a MISSING key
 * is already a type error — what a type cannot catch is the drift this suite exists for, all of it
 * found in the shipped files on 2026-09-13: a language whose keys are in a different order than the
 * fields (a merge reading as a diff of everything), a value left in English, an empty value, and the
 * worst kind — ONE VALUE FOR TWO DIFFERENT FIELDS, which is how `left` and `right` both read
 * "leftover" in Chinese, `right` read "correct" in Japanese and Hindi, `top` read "best" in Chinese,
 * and `allow rotation y` read "allow rotation x" in Romanian.
 */
const FIELDS = Object.keys(internationalizationFields);
const LANGUAGES = internationalization.languages;
const translations = internationalization as unknown as Record<string, Record<string, string>>;

/**
 * Words a language legitimately shares with English — a real word there, not an untranslated one.
 * Add to it only with a reason.
 */
const SHARED_WITH_ENGLISH: Record<string, string[]> = {
    german: ['transparent'],
};

/**
 * Pairs of fields that may read the same: only where the DISTINCTION English draws does not exist in
 * a language. Empty today — "always opaque" is the one phrase repeated between two drawers and
 * English repeats it too, so the rule (compare only fields English tells apart) already allows it.
 */
const SHARED_BETWEEN_FIELDS: string[][] = [];

const allowedPair = (
    first: string,
    second: string,
): boolean => SHARED_BETWEEN_FIELDS.some((pair) => pair.includes(first) && pair.includes(second));


describe('the internationalization', () => {
    it('lists every language exactly once, alphabetically, and each one is a translation table', () => {
        expect(LANGUAGES.length).toBeGreaterThan(1);
        expect(new Set(LANGUAGES).size).toBe(LANGUAGES.length);
        expect([...LANGUAGES].sort()).toEqual(LANGUAGES);

        for (const language of LANGUAGES) {
            expect(typeof translations[language]).toBe('object');
        }
        // and the record holds nothing else: `fields` and `languages` are the only other entries
        const entries = Object.keys(internationalization).filter((key) => key !== 'fields' && key !== 'languages');
        expect(entries.sort()).toEqual([...LANGUAGES].sort());
    });

    it('every language carries every field, in the fields\' own order, with nothing empty', () => {
        for (const language of LANGUAGES) {
            const table = translations[language];
            expect({ language, keys: Object.keys(table) }).toEqual({ language, keys: FIELDS });
            for (const [field, value] of Object.entries(table)) {
                expect({ language, field, empty: value.trim().length === 0 }).toEqual({ language, field, empty: false });
            }
        }
    });

    it('no value is left in English, except the words a language really shares with it', () => {
        const english = translations.english;
        for (const language of LANGUAGES) {
            if (language === 'english') {
                continue;
            }
            const shared = SHARED_WITH_ENGLISH[language] ?? [];
            const untranslated = Object.entries(translations[language])
                .filter(([field, value]) => english[field] === value && !shared.includes(value) && !/^[↑↓←→]/.test(value))
                .map(([field]) => field);
            expect({ language, untranslated }).toEqual({ language, untranslated: [] });
        }
    });

    it('two fields English tells apart are told apart in every language', () => {
        const english = translations.english;
        for (const language of LANGUAGES) {
            const table = translations[language];
            const collisions: string[] = [];
            for (let index = 0; index < FIELDS.length; index += 1) {
                for (let other = index + 1; other < FIELDS.length; other += 1) {
                    const first = FIELDS[index];
                    const second = FIELDS[other];
                    if (english[first] === english[second] || table[first] !== table[second]) {
                        continue;
                    }
                    if (!allowedPair(first, second)) {
                        collisions.push(first + ' = ' + second + ' = "' + table[first] + '"');
                    }
                }
            }
            expect({ language, collisions }).toEqual({ language, collisions: [] });
        }
    });
});
// #endregion module
