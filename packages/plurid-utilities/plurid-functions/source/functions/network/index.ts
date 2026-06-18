// #region module

// https://stackoverflow.com/a/36760050/6639124
const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/;

// https://stackoverflow.com/a/50385461/6639124
const ipv6Regex = /(([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4})/;

// https://stackoverflow.com/a/60831867/6639124
const originRegex = /https?:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?((?:\/\w+)|(?:-\w+))*\/?(?![^<]*(?:<\/\w+>|\/?>))/;



export const isIPv4 = (
    value: string | undefined,
) => {
    if (typeof value !== 'string') {
        return false;
    }

    return ipv4Regex.test(value);
}


export const isIPv6 = (
    value: string | undefined,
) => {
    if (typeof value !== 'string') {
        return false;
    }

    return ipv6Regex.test(value);
}


export const isIP = (
    value: string | undefined,
) => {
    const ipv4 = isIPv4(value);
    if (ipv4) {
        return 'ipv4';
    }

    const ipv6 = isIPv6(value);
    if (ipv6) {
        return 'ipv6';
    }

    return;
}


/**
 * Checks the value respects `<scheme> "://" <hostname> [ ":" <port> ]`.
 *
 * @param value
 * @returns
 */
export const isOrigin = (
    value: string | undefined,
) => {
    if (typeof value !== 'string') {
        return false;
    }

    return originRegex.test(value);
}
// #endregion module
