// #region imports
    // #region libraries
    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        planeAddressPath,
    } from '~services/engine';
    import selectors from '~services/state/selectors';
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
/** A link inside a plane: its text, the route it opens, and whether the plane it opens is shown. */
export interface PluridAgentLink {
    text: string;
    route: string;
    /** the plane it opened is in the space and shown */
    open: boolean;
}

/** One plane, as a model reads it. */
export interface PluridAgentPlane {
    /** the plane's id: what every tool takes */
    id: string;
    /** its path (`/about`) */
    route: string;
    /** its declared document title, else its path */
    title: string;
    /** the plane it was opened from (a link's parent), `null` for a root */
    parent: string | null;
    /** the planes opened from it */
    children: string[];
    /** shown (a closed plane stays in the tree, hidden, until it is removed) */
    shown: boolean;
    /** the page the camera is docked on (the page presentation), or the one a docking swing lands on */
    docked: boolean;
    /** selected */
    selected: boolean;
    /** part of it is inside the view (the browser's layout) */
    onScreen: boolean;
    /** its text, whitespace collapsed, cut at the excerpt length (`…` when cut) */
    text: string;
    /** the links inside it */
    links: PluridAgentLink[];
}

/** The space, as a model reads it: what is there, what is in view, what can be done next. */
export interface PluridAgentObservation {
    /** `page`: one plane at a time, docked, a site; `space`: planes arranged in 3D */
    presentation: 'page' | 'space';
    /** the docked page's id, `null` when the camera is off every page */
    docked: string | null;
    /** the plane in focus: the one keyboard commands (`plurid_command`) act on, `null` for none */
    active: string | null;
    /** how the roots are arranged (`COLUMNS`, `ROWS`, …) */
    layout: string;
    /** the camera: angles in degrees, the zoom, and whether it is moving */
    camera: { yaw: number; pitch: number; scale: number; moving: boolean };
    view: { width: number; height: number };
    planes: PluridAgentPlane[];
    selection: string[];
    history: { canUndo: boolean; canRedo: boolean };
    bookmarks: string[];
}


export interface PluridAgentObserveOptions {
    /** characters of each plane's text (default 600; 0 leaves the text out) */
    textLength?: number;
    /** one plane only, with its whole text */
    planeID?: string;
}


const round = (
    value: number,
    digits = 2,
) => Math.round(value * 10 ** digits) / 10 ** digits;

const collapse = (
    text: string,
) => text.replace(/\s+/g, ' ').trim();

const excerpt = (
    text: string,
    length: number,
) => {
    if (length <= 0) {
        return '';
    }
    return text.length > length ? text.slice(0, length).trimEnd() + '…' : text;
};

const cssString = (
    value: string,
) => value.replace(/["\\]/g, '\\$&');

/** The element the planes are looked for in: the host's, else the document. */
export type PluridAgentRoot = () => ParentNode | null | undefined;

const planeElement = (
    root: ParentNode | null | undefined,
    planeID: string,
): HTMLElement | null => {
    if (!root) {
        return null;
    }
    return root.querySelector<HTMLElement>(`[data-plurid-plane="${cssString(planeID)}"]`);
};

/** Elements whose text is not read: code, styles, and what is never shown. */
const UNREAD = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
/** Elements that run inside a line: no word break around them (`<b>bold</b>er` is one word). */
const INLINE = new Set(['A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'CODE', 'DATA', 'DFN', 'EM', 'I', 'KBD', 'MARK', 'Q', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U', 'VAR', 'LABEL']);

/**
 * An element's text as a reader reads it, whitespace collapsed. Read from the document, not from the
 * layout (`innerText`): a page the camera is not docked on is inert and hidden, and a model still
 * reads it to decide where to go; a break is kept between blocks (`<h2>Title</h2><p>Body</p>`).
 */
export const readableText = (
    element: Element,
): string => {
    const parts: string[] = [];
    const walk = (node: Node) => {
        for (const child of Array.from(node.childNodes)) {
            if (child.nodeType === 3) {
                parts.push(child.nodeValue ?? '');
                continue;
            }
            if (child.nodeType !== 1 || UNREAD.has((child as Element).tagName)) {
                continue;
            }
            const block = !INLINE.has((child as Element).tagName);
            if (block) {
                parts.push(' ');
            }
            walk(child);
            if (block) {
                parts.push(' ');
            }
        }
    };
    walk(element);
    return collapse(parts.join(''));
};

const textOf = (
    element: HTMLElement | null,
): string => {
    if (!element) {
        return '';
    }
    const content = element.querySelector<HTMLElement>('[data-plurid-entity="PluridPlaneContent"]') ?? element;
    return readableText(content);
};

/** A link's route as a path (`/two`): the anchor carries the plane address (`plurid://host/two`). */
export const linkRoute = (
    link: Element,
): string => {
    const address = link.getAttribute('data-plurid-link-route') ?? link.getAttribute('href') ?? '';
    return planeAddressPath(address) ?? address;
};

const linksOf = (
    element: HTMLElement | null,
): PluridAgentLink[] => {
    if (!element) {
        return [];
    }
    return Array.from(element.querySelectorAll<HTMLElement>('[data-plurid-entity="PluridLink"]'))
        // a link inside a nested plane belongs to that plane
        .filter((link) => link.closest('[data-plurid-plane]') === element)
        .map((link) => ({
            text: readableText(link),
            route: linkRoute(link),
            open: link.getAttribute('data-plurid-link-open') === 'true',
        }));
};

const onScreen = (
    element: HTMLElement | null,
    view: { width: number; height: number },
    viewElement: Element | null,
): boolean => {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
        return false;
    }
    const box = element.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) {
        return false;
    }
    const frame = viewElement?.getBoundingClientRect() ?? { left: 0, top: 0, right: view.width, bottom: view.height };
    return box.right > frame.left && box.left < frame.right && box.bottom > frame.top && box.top < frame.bottom;
};

const flatten = (
    tree: TreePlane[],
): TreePlane[] => {
    const planes: TreePlane[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            planes.push(node);
            walk(node.children ?? []);
        }
    };
    walk(tree);
    return planes;
};


/**
 * THE SPACE, AS A MODEL READS IT. The engine's state says what is there (the plane tree, the docked
 * page, the selection, the camera, the history); the page says what a reader sees of it (each
 * plane's title, text and links, and whether it is on screen). Positions and matrices are left out:
 * a model acts on planes, links and pages, and the tools take ids, not coordinates.
 */
export const observeSpace = (
    state: AppState,
    root: ParentNode | null | undefined,
    options: PluridAgentObserveOptions = {},
): PluridAgentObservation => {
    const space = state.space;
    const docked = selectors.space.getDockedPlaneID(state);
    const selected = new Set(space.selectedPlaneIDs);
    const viewElement = root && 'querySelector' in root
        ? (root as ParentNode).querySelector('[data-plurid-entity="PluridView"]') ?? (root instanceof Element && root.matches('[data-plurid-entity="PluridView"]') ? root : null)
        : null;
    const textLength = options.planeID ? Number.POSITIVE_INFINITY : (options.textLength ?? 600);

    const planes = flatten(space.tree)
        .filter((node) => !options.planeID || node.planeID === options.planeID)
        .map((node): PluridAgentPlane => {
            const element = planeElement(root, node.planeID);
            const route = planeAddressPath(node.route) ?? node.route;
            return {
                id: node.planeID,
                route,
                title: element?.getAttribute('aria-label') || route,
                parent: node.parentPlaneID || null,
                children: (node.children ?? []).map((child) => child.planeID),
                shown: node.show !== false,
                docked: node.planeID === docked,
                selected: selected.has(node.planeID),
                onScreen: node.show !== false && onScreen(element, space.viewSize, viewElement),
                text: excerpt(textOf(element), textLength),
                links: linksOf(element),
            };
        });

    return {
        presentation: state.configuration.space.presentation === 'page' ? 'page' : 'space',
        docked: docked || null,
        active: space.activePlaneID || null,
        layout: String(state.configuration.space.layout?.type ?? ''),
        camera: {
            yaw: round(space.camera.yaw),
            pitch: round(space.camera.pitch),
            scale: round(space.camera.scale, 3),
            moving: space.motion !== 'idle',
        },
        view: { width: space.viewSize.width, height: space.viewSize.height },
        planes,
        selection: [...space.selectedPlaneIDs],
        history: { canUndo: !!space.history?.canUndo, canRedo: !!space.history?.canRedo },
        bookmarks: Object.keys(space.bookmarks ?? {}),
    };
};
// #endregion module
