// #region imports
    // #region libraries
    import {
        TreePlane,
        DockingURLBinding,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        planeAddressPath,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
/** What the location's history entry carries for the docked page. */
export interface DockingURLState {
    docked: string;
    path: string;
}

const cleanPath = (
    value: string | null | undefined,
): string | null => {
    if (!value) {
        return null;
    }
    const trimmed = value.replace(/\/+$/, '');
    return trimmed.startsWith('/') ? (trimmed || '/') : '/' + trimmed;
};

/** The page path the location names under `binding` (`null` on the server, or when it names nothing). */
export const readDockingURLTarget = (
    binding: DockingURLBinding,
): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (binding.mode === 'query') {
        return cleanPath(new URLSearchParams(window.location.search).get(binding.param));
    }
    return cleanPath(window.location.pathname);
};

/** The docked page a history entry recorded, if this binding wrote it. */
export const readDockingURLState = (
    state: unknown,
): DockingURLState | null => {
    const plurid = (state as { plurid?: DockingURLState } | null)?.plurid;
    return plurid && typeof plurid.docked === 'string' ? plurid : null;
};

/**
 * Write the docked page's path to the location: the pathname (the query and the hash untouched — the
 * host's flags and the viewpoint's `?v=` survive), or `?<param>=<path>` in the query mode; the entry's
 * state keeps whatever the host put there plus `{ plurid: { docked, path } }`, so Back can resolve the
 * page by state before the path.
 */
export const writeDockingURL = (
    binding: DockingURLBinding,
    path: string,
    planeID: string,
    options: { replace: boolean },
): void => {
    if (typeof window === 'undefined') {
        return;
    }
    const url = new URL(window.location.href);
    if (binding.mode === 'query') {
        url.searchParams.set(binding.param, path);
    } else {
        url.pathname = path;
    }
    const state = {
        ...((window.history.state && typeof window.history.state === 'object') ? window.history.state : {}),
        plurid: { docked: planeID, path },
    };
    if (options.replace) {
        window.history.replaceState(state, '', url.toString());
    } else {
        window.history.pushState(state, '', url.toString());
    }
};

/** The path of a tree plane (its address reduced), `null` for a foreign-host plane. */
export const treePlanePath = (
    plane: TreePlane,
): string | null => planeAddressPath(plane.route);

/** The plane in the tree whose path is `path` — a shown one first, else a hidden one; `undefined` when none. */
export const findTreePlaneByPath = (
    tree: TreePlane[],
    path: string,
): TreePlane | undefined => {
    let hidden: TreePlane | undefined;
    const walk = (nodes: TreePlane[]): TreePlane | undefined => {
        for (const node of nodes) {
            if (treePlanePath(node) === path) {
                if (node.show !== false) {
                    return node;
                }
                hidden = hidden ?? node;
            }
            if (node.children) {
                const found = walk(node.children);
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    };
    return walk(tree) ?? hidden;
};

export interface LinkToPath {
    parentPlaneID: string;
    /** The link's resolved address (`data-plurid-link-route`). */
    route: string;
    linkElement: HTMLElement;
    planeElement: HTMLElement;
}

/**
 * The mounted `PluridLink` that opens `path`: a link whose route reduces to the path, inside a mounted
 * plane; when several planes hold one, the plane whose own path is the longest prefix of `path` (the
 * nearest ancestor) wins, then DOM order.
 */
export const linkElementToPath = (
    viewElement: HTMLElement,
    path: string,
): LinkToPath | undefined => {
    const candidates: (LinkToPath & { depth: number })[] = [];
    const links = viewElement.querySelectorAll<HTMLElement>('[data-plurid-plane] [data-plurid-link-route]');
    links.forEach((linkElement) => {
        const route = linkElement.getAttribute('data-plurid-link-route') || '';
        if (planeAddressPath(route) !== path) {
            return;
        }
        const planeElement = linkElement.closest<HTMLElement>('[data-plurid-plane]');
        const parentPlaneID = planeElement?.getAttribute('data-plurid-plane');
        if (!planeElement || !parentPlaneID) {
            return;
        }
        const parentPath = planeAddressPath(parentPlaneID) || '/';
        const depth = path.startsWith(parentPath === '/' ? '/' : parentPath + '/') ? parentPath.length : -1;
        candidates.push({ parentPlaneID, route, linkElement, planeElement, depth });
    });
    candidates.sort((a, b) => b.depth - a.depth);
    return candidates[0];
};

/** The parent path of `path` (`/page-1/about` → `/page-1`), `null` at the root. */
export const parentPath = (
    path: string,
): string | null => {
    const index = path.lastIndexOf('/');
    if (index <= 0) {
        return null;
    }
    return path.slice(0, index);
};
// #endregion module
