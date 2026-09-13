// #region imports
    // #region internal
    import {
        readSlot,
        writeSlot,
        writeClipboardText,
        readClipboardText,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE CLIPBOARD SEAM: the browser's own `copy` / `paste` events are the path a reader takes, and this
 * module is the path a HOST takes (`space.copy`, `space.paste`) — the async clipboard where it is
 * allowed, and a module slot everywhere else, so a copy works in a headless test, in a browser that
 * refuses the permission, and between two applications on one page. It had no test (2026-09-13),
 * although a fragment that never reaches the slot is a paste that silently does nothing.
 */
const withClipboard = (
    clipboard: unknown,
) => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', {
        value: clipboard === undefined ? undefined : { clipboard },
        configurable: true,
        writable: true,
    });
    return () => {
        if (original) {
            Object.defineProperty(globalThis, 'navigator', original);
        } else {
            delete (globalThis as { navigator?: unknown }).navigator;
        }
    };
};


describe('the clipboard seam', () => {
    beforeEach(() => {
        writeSlot(null);
    });

    it('a write always reaches the SLOT, whatever the browser allows', () => {
        const restore = withClipboard({ writeText: () => Promise.resolve() });

        writeClipboardText('a fragment');
        expect(readSlot()).toBe('a fragment');

        restore();
    });

    it('a write reaches the system clipboard when there is one', () => {
        const written: string[] = [];
        const restore = withClipboard({ writeText: (text: string) => { written.push(text); return Promise.resolve(); } });

        writeClipboardText('to the system');
        expect(written).toEqual(['to the system']);

        restore();
    });

    it('a REFUSED clipboard is not an error the reader sees — the slot still has it', () => {
        const restore = withClipboard({ writeText: () => Promise.reject(new Error('denied')) });

        expect(() => writeClipboardText('denied but kept')).not.toThrow();
        expect(readSlot()).toBe('denied but kept');

        restore();
    });

    it('a clipboard that THROWS synchronously is survivable too', () => {
        const restore = withClipboard({ writeText: () => { throw new Error('no permission'); } });

        expect(() => writeClipboardText('still kept')).not.toThrow();
        expect(readSlot()).toBe('still kept');

        restore();
    });

    it('no clipboard at all (a server, an old browser): the slot is the whole story', async () => {
        const restore = withClipboard(undefined);

        writeClipboardText('slot only');
        expect(readSlot()).toBe('slot only');
        await expect(readClipboardText()).resolves.toBe('slot only');

        restore();
    });

    it('a read prefers the system clipboard, and falls back to the slot when it is empty or refused', async () => {
        writeSlot('what this document copied');

        const reading = withClipboard({ readText: () => Promise.resolve('what the system holds') });
        await expect(readClipboardText()).resolves.toBe('what the system holds');
        reading();

        const empty = withClipboard({ readText: () => Promise.resolve('') });
        await expect(readClipboardText()).resolves.toBe('what this document copied');
        empty();

        const denied = withClipboard({ readText: () => Promise.reject(new Error('denied')) });
        await expect(readClipboardText()).resolves.toBe('what this document copied');
        denied();
    });

    it('a read with nothing anywhere resolves to null rather than rejecting', async () => {
        const restore = withClipboard({ readText: () => Promise.reject(new Error('denied')) });
        await expect(readClipboardText()).resolves.toBeNull();
        restore();
    });
});
// #endregion module
