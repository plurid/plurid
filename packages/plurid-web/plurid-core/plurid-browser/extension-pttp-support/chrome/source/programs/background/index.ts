// #region module
const PTTP = 'pttp://';
const HTTP = 'http://';
const HTTPS = 'https://';


chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    if (!text) {
        return;
    }

    const http = text.replace(PTTP, HTTP);
    const https = text.replace(PTTP, HTTPS);

    suggest([
        {
            content: http,
            description: `HTTP – ${http}`,
        },
        {
            content: https,
            description: `HTTPS – ${https}`,
        },
    ]);
});

chrome.omnibox.onInputEntered.addListener((text) => {
    const url = text.startsWith(PTTP)
        ? text.replace(PTTP, HTTP)
        : text;

    chrome.tabs.update({
        url,
    });
});
// #endregion module
