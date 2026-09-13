/**
 * @jest-environment jsdom
 */

// #region imports
    // #region internal
    import {
        copy,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The LEGACY clipboard write: a hidden textarea and `execCommand('copy')`. It predates the async
 * clipboard API and is still the path that works with no permission prompt in every browser, which
 * is why three places in the repo still reach for it. Its whole contract is about what it leaves
 * behind — a stray textarea would be a visible artefact on the page, and a lost selection would take
 * the reader's own highlight away — and nothing asserted either until 2026-09-13.
 */
const withExecCommand = (
    onCopy: (value: string) => void,
) => {
    const original = (document as { execCommand?: unknown }).execCommand;
    // jsdom has no `execCommand`: the copy it stands for is "whatever is selected in the textarea
    // the function just put on the page"
    (document as unknown as { execCommand: unknown }).execCommand = jest.fn((command: string) => {
        if (command === 'copy') {
            onCopy(document.body.querySelector('textarea')?.value ?? '');
        }
        return true;
    });
    return () => {
        (document as unknown as { execCommand: unknown }).execCommand = original;
    };
};


describe('the legacy clipboard copy', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('puts the text through a textarea and takes the textarea back out', () => {
        const copied: string[] = [];
        const restore = withExecCommand((value) => copied.push(value));

        try {
            copy('a fragment of a space');

            expect(copied).toEqual(['a fragment of a space']);
            // nothing is left on the page
            expect(document.body.querySelector('textarea')).toBeNull();
        } finally {
            restore();
        }
    });

    it('THE READER\'S OWN SELECTION SURVIVES: what was highlighted is highlighted after', () => {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'the reader had selected this';
        document.body.appendChild(paragraph);

        const range = document.createRange();
        range.selectNodeContents(paragraph);
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);

        const restore = withExecCommand(() => {});
        try {
            copy('something else entirely');

            expect(selection.rangeCount).toBe(1);
            expect(selection.getRangeAt(0).toString()).toBe('the reader had selected this');
        } finally {
            restore();
        }
    });

    it('with NOTHING selected it does not invent a selection to restore', () => {
        const selection = window.getSelection()!;
        selection.removeAllRanges();

        const restore = withExecCommand(() => {});
        try {
            expect(() => copy('text')).not.toThrow();
            expect(selection.rangeCount).toBe(0);
            expect(document.body.querySelector('textarea')).toBeNull();
        } finally {
            restore();
        }
    });

    it('the textarea it uses is READ-ONLY and off-screen, never something a reader can reach', () => {
        let seen: { readOnly: boolean; left: string; position: string } | undefined;
        const restore = withExecCommand(() => {
            const element = document.body.querySelector('textarea')!;
            seen = {
                readOnly: element.hasAttribute('readonly'),
                left: element.style.left,
                position: element.style.position,
            };
        });

        try {
            copy('text');
            expect(seen).toEqual({ readOnly: true, left: '-9999px', position: 'absolute' });
        } finally {
            restore();
        }
    });
});
// #endregion module
