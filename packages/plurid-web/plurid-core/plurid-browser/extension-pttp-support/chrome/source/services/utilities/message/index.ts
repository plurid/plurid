export const sendMessage = <T>(
    message: T,
) => {
    chrome.runtime.sendMessage({
        message,
    });
}
