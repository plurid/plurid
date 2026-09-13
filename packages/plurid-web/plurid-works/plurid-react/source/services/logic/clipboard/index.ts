// #region module
/**
 * THE CLIPBOARD, as one seam with two transports.
 *
 * A press of ⌘/Ctrl+C, X or V is the BROWSER'S: it fires a `copy` / `cut` / `paste` event carrying a
 * `DataTransfer`, which reads and writes the system clipboard with no permission and no prompt. That
 * is the path a reader takes (`useClipboard` in the View), and the only one that can READ the
 * clipboard at all in most browsers.
 *
 * A host that copies from its own menu has no such event, so the same text is also written through
 * the async clipboard API when it is available. Either way the text is kept in this module's SLOT,
 * so a paste works even where the system clipboard is unreachable — a headless test, a browser that
 * refuses the permission, an embedded view — and so a copy in one application can be pasted into
 * another ON THE SAME PAGE without the clipboard at all.
 */
let slot: string | null = null;


/** What was last copied from a plurid space in this document, whatever the system clipboard holds. */
export const readSlot = (): string | null => slot;

export const writeSlot = (
    text: string | null,
): void => {
    slot = text;
};


/**
 * Write to the system clipboard, best effort, and always to the slot. Never throws and never waits
 * on the caller: a denied permission is not an error the reader should see.
 */
export const writeClipboardText = (
    text: string,
): void => {
    slot = text;

    try {
        const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
        void clipboard?.writeText?.(text)?.catch?.(() => {});
    } catch {
        // no clipboard, no permission, not a secure context: the slot is the fallback
    }
};


/**
 * Read the system clipboard, falling back to the slot. Resolves to `null` rather than rejecting.
 * NOTE: most browsers grant `readText` only with an explicit permission — the `paste` event is the
 * path that always works, and this is for a host's own command.
 */
export const readClipboardText = async (): Promise<string | null> => {
    try {
        const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
        const text = await clipboard?.readText?.();
        if (typeof text === 'string' && text.length > 0) {
            return text;
        }
    } catch {
        // fall through to the slot
    }

    return slot;
};
// #endregion module
