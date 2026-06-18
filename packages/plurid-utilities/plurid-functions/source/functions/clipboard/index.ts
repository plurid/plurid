// #region module
export const copy = (
    text: string,
) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected = (document as any).getSelection().rangeCount > 0 ? (document as any).getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
        (document as any).getSelection().removeAllRanges();
        (document as any).getSelection().addRange(selected);
    }
};
// #endregion module
