/**
 * @jest-environment jsdom
 */

// #region imports
    // #region internal
    import {
        getEventPath,
        verifyPathInputElement,
        verifyEventInput,
        downloadContent,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `dom` answers one question the whole engine asks constantly: IS THE READER TYPING? Every keyboard
 * shortcut, every clipboard event and every gesture is gated on it, so a `false` where a `true`
 * belongs means a shortcut fires while someone is writing in a field — and nothing asserted it
 * until 2026-09-13.
 */
const inside = (
    build: (root: HTMLElement) => HTMLElement,
): HTMLElement => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    return build(root);
};

const eventOn = (
    target: HTMLElement,
): Event => {
    const event = new Event('keydown', { bubbles: true });
    target.dispatchEvent(event);
    return event;
};


describe('the event path', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('is the composed path, from the target outward', () => {
        const button = inside((root) => {
            const element = document.createElement('button');
            root.appendChild(element);
            return element;
        });

        let path: HTMLElement[] = [];
        button.addEventListener('keydown', (event) => { path = getEventPath(event); });
        eventOn(button);

        expect(path[0]).toBe(button);
        expect(path).toContain(document.body);
    });

    it('a browser with no `composedPath` falls back to `path`, and to nothing at all', () => {
        const withPath = { path: ['an element'] } as unknown as Event;
        expect(getEventPath(withPath)).toEqual(['an element']);

        expect(getEventPath({} as Event)).toEqual([]);
    });
});


describe('is the reader typing?', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    const pathOf = (
        tagName: string,
        contentEditable?: string,
    ) => {
        const element = document.createElement(tagName);
        if (contentEditable !== undefined) {
            element.contentEditable = contentEditable;
        }
        return [element, document.body] as HTMLElement[];
    };

    it('an INPUT, a TEXTAREA and anything contenteditable are all typing', () => {
        expect(verifyPathInputElement(pathOf('input'))).toBe(true);
        expect(verifyPathInputElement(pathOf('textarea'))).toBe(true);
        expect(verifyPathInputElement(pathOf('div', 'true'))).toBe(true);
    });

    it('a button, a div and an empty or missing path are not', () => {
        expect(verifyPathInputElement(pathOf('button'))).toBe(false);
        expect(verifyPathInputElement(pathOf('div'))).toBe(false);
        expect(verifyPathInputElement(pathOf('div', 'false'))).toBe(false);
        expect(verifyPathInputElement([])).toBe(false);
        expect(verifyPathInputElement(undefined)).toBe(false);
    });

    it('ANYWHERE ALONG THE PATH counts: a click inside a field\'s wrapper is still typing', () => {
        const span = inside((root) => {
            const field = document.createElement('textarea');
            const element = document.createElement('span');
            root.appendChild(field);
            field.appendChild(element);
            return element;
        });

        let typing: boolean | undefined;
        span.addEventListener('keydown', (event) => { typing = verifyEventInput(event); });
        eventOn(span);

        expect(typing).toBe(true);
    });

    it('and an event outside every field is not', () => {
        const button = inside((root) => {
            const element = document.createElement('button');
            root.appendChild(element);
            return element;
        });

        let typing: boolean | undefined;
        button.addEventListener('keydown', (event) => { typing = verifyEventInput(event); });
        eventOn(button);

        expect(typing).toBe(false);
    });
});


describe('downloading content', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('hands the browser a named, encoded link — and leaves no element behind', () => {
        const clicked: { href: string; download: string }[] = [];
        const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            clicked.push({
                href: this.getAttribute('href') ?? '',
                download: this.getAttribute('download') ?? '',
            });
        });

        try {
            downloadContent('space.json', '{"a": 1 & 2}');

            expect(clicked).toHaveLength(1);
            expect(clicked[0].download).toBe('space.json');
            expect(clicked[0].href.startsWith('data:text/plain;charset=utf-8,')).toBe(true);
            // the content is ENCODED: an ampersand cannot end the data URL early
            expect(clicked[0].href).toContain('%26');
            expect(decodeURIComponent(clicked[0].href.split(',')[1])).toBe('{"a": 1 & 2}');

            // the anchor is a means, not a leftover
            expect(document.body.querySelector('a')).toBeNull();
        } finally {
            click.mockRestore();
        }
    });

    it('a caller may give its own data string (a CSV, an image)', () => {
        const hrefs: string[] = [];
        const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            hrefs.push(this.getAttribute('href') ?? '');
        });

        try {
            downloadContent('table.csv', 'a,b', 'data:text/csv;charset=utf-8,');
            expect(hrefs[0]).toBe('data:text/csv;charset=utf-8,a%2Cb');
        } finally {
            click.mockRestore();
        }
    });
});
// #endregion module
