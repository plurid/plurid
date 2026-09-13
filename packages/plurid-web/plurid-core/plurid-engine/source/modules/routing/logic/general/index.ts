// #region imports
    // #region imports
    import {
        protocols,
        PLURID_PROTOCOL,
        HTTPS_PROTOCOL,
        HTTP_PROTOCOL,
    } from '@plurid/plurid-data';
    // #endregion imports


    // #region external
    import {
        extractPathname,
    } from '~modules/routing/Parser/logic';
    // #endregion external
// #endregion imports



// #region module
export const stringInsertInitial = (
    value: string,
    insert: string,
) => {
    if (!value.startsWith(insert)) {
        value = insert + value;
    }

    return value;
}

export const stringRemoveTrailing = (
    value: string,
    trail: string,
) => {
    if (value.endsWith(trail)) {
        value = value.slice(0, value.length - trail.length);
    }

    return value;
}


const PATH_SEPARATOR = '/';

/** A route's `?query#fragment` part as written (`''` for none): what a link carries beyond its pathname. */
export const routeSuffix = (
    value: string,
): string => {
    const query = value.indexOf('?');
    const hash = value.indexOf('#');
    const at = query === -1 ? hash : (hash === -1 ? query : Math.min(query, hash));
    return at === -1 ? '' : value.slice(at);
};

/** A path with one leading separator and no trailing ones (`'/'` alone becomes `''`). */
export const cleanupPath = (
    value: string,
) => {
    value = stringInsertInitial(value, PATH_SEPARATOR);
    while (value.endsWith(PATH_SEPARATOR)) {
        value = value.slice(0, value.length - PATH_SEPARATOR.length);
    }
    return value;
}


export const computePlaneAddress = (
    plane: string,
    route?: string,
    origin: string = 'origin',
) => {
    if (origin === 'origin' && typeof location !== 'undefined' && location.host) {
        origin = location.host;
    }

    const cleanPlane = extractPathname(plane);

    const planeAddressType = checkPlaneAddressType(cleanPlane);

    switch(planeAddressType) {
        case 'http':
        case 'https':
        case 'pttp':
            return cleanPlane;
    }

    origin = stringRemoveTrailing(origin, '/');

    const absolutePlane = isAbsolutePlane(plane)

    const path = route && route !== '/'
        ? absolutePlane
            ? cleanupPath(cleanPlane)
            : cleanupPath(route) + cleanupPath(cleanPlane)
        : cleanupPath(cleanPlane);

    const planeAddress = protocols.plurid + origin + path;

    return planeAddress;
}

/**
 * The pathname a plane address names — the inverse of `computePlaneAddress` for the address bar:
 * `plurid://host/page-1/about` → `/page-1/about`; a plane id's `@…` suffix dropped (`/page-1@0` →
 * `/page-1`, but `/users/@alice` kept — the suffix follows a segment, never a slash); the query and
 * the hash dropped; a bare host → `/`; an `http(s)` address (a foreign host) → `null`.
 */
export const planeAddressPath = (
    address: string,
): string | null => {
    const type = checkPlaneAddressType(address);
    if (type === HTTP_PROTOCOL || type === HTTPS_PROTOCOL) {
        return null;
    }
    let value = address.trim();
    if (type === 'pttp') {
        value = value.slice(protocols.plurid.length);
        const slash = value.indexOf('/');
        value = slash === -1 ? '' : value.slice(slash);
    }
    value = extractPathname(value);
    value = value.replace(/(?<=[^/])@[A-Za-z0-9_-]+$/, '');
    return cleanupPath(value) || '/';
}


/** A location's pathname or query value as a page path: a leading slash, no trailing one, `null` for nothing. */
const cleanDockingPath = (
    value: string | null | undefined,
): string | null => value ? (cleanupPath(value) || '/') : null;

/** A pathname as written when its escapes are malformed (`decodeURIComponent` throws on them). */
const decodePathname = (
    pathname: string,
): string => {
    try {
        return decodeURIComponent(pathname);
    } catch {
        return pathname;
    }
};

/**
 * The page path a location names under an address-bar binding (`docking.url`): the query parameter
 * in the query mode (the first of its name, `+` a space, as `URLSearchParams` reads it); else the
 * decoded pathname under `base` (`/docs/page-1` → `/page-1`, `/docs` → `/`), or `null` OUTSIDE
 * the base — the binding is passive there. Pure: the browser gives `window.location`, the server
 * the request.
 */
export const dockingURLTarget = (
    binding: { mode: 'path' | 'query'; param: string; base: string },
    location: { pathname: string; search: string },
): string | null => {
    if (binding.mode === 'query') {
        return cleanDockingPath(new URLSearchParams(location.search).get(binding.param));
    }
    const pathname = cleanDockingPath(decodePathname(location.pathname)) || '/';
    if (!binding.base) {
        return pathname;
    }
    if (pathname === binding.base) {
        return '/';
    }
    if (!pathname.startsWith(binding.base + '/')) {
        return null;
    }
    return pathname.slice(binding.base.length);
};


export const isAbsolutePlane = (
    value: string,
) => {
    return value[0] === '/';
}


export const checkPlaneAddressType = (
    value: string,
) => {
    value = value
        .toLowerCase()
        .trim();

    if (value.startsWith(protocols.plurid)) {
        return 'pttp';
    }

    if (value.startsWith(protocols.https)) {
        return HTTPS_PROTOCOL;
    }

    if (value.startsWith(protocols.http)) {
        return HTTP_PROTOCOL;
    }

    return 'relative';
}


export const removeTrailingSlash = (
    value: string,
) => {
    if (value.endsWith('/') && value.length > 1) {
        return value.slice(0, value.length - 1);
    }

    return value;
}


export const cleanPathValue = (
    value: string,
) => {
    const queryStart = value.indexOf('?');
    if (queryStart < 0) {
        return removeTrailingSlash(
            value,
        );
    }

    return removeTrailingSlash(
        value.substring(0, queryStart),
    );
}
// #endregion module
