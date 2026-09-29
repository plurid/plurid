// #region imports
    // #region libraries
    import {
        PLURID_PUBSUB_TOPIC,
        PLURID_SHORTCUTS,
        LAYOUT_TYPES,
    } from '@plurid/plurid-data';
    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion external


    // #region internal
    import type {
        PluridAgentSchema,
    } from './schema';
    import {
        observeSpace,
        linkRoute,
        readableText,
    } from './observe';
    // #endregion internal
// #endregion imports



// #region module
export type PluridAgentToolName =
    | 'plurid_observe'
    | 'plurid_follow_link'
    | 'plurid_open_plane'
    | 'plurid_go_to_plane'
    | 'plurid_close_plane'
    | 'plurid_remove_plane'
    | 'plurid_scroll_plane'
    | 'plurid_camera'
    | 'plurid_select'
    | 'plurid_arrange'
    | 'plurid_history'
    | 'plurid_bookmark'
    | 'plurid_command'
    | 'plurid_configure';

export type PluridAgentErrorCode =
    | 'unknown_tool'
    | 'invalid_input'
    | 'not_found'
    | 'ambiguous'
    | 'not_allowed'
    | 'unavailable'
    | 'no_effect'
    | 'failed';

/** A failure a model can act on: what went wrong, and what to do instead. */
export class PluridAgentError extends Error {
    constructor(
        public readonly code: PluridAgentErrorCode,
        message: string,
    ) {
        super(message);
        this.name = 'PluridAgentError';
    }
}

/** What a tool's run reaches: the engine's state and bus, and the page the planes are in. */
export interface PluridAgentRuntime {
    getState: () => AppState;
    publish: (topic: string, data?: unknown) => void;
    /** resolve with the first `space.changed` value `match` accepts, else `undefined` after `timeout` ms */
    listen: (match: (kind: string, value: any) => boolean, timeout: number) => { answer: Promise<any>; cancel: () => void };
    root: () => ParentNode | null | undefined;
    settleTimeout: number;
    /**
     * One rendered frame. The bus's handlers read the state the application last RENDERED, so a
     * command that depends on the one before it waits for that render in between.
     */
    frame: () => Promise<void>;
}

export interface PluridAgentTool {
    name: PluridAgentToolName;
    description: string;
    inputSchema: PluridAgentSchema;
    /** reads, never changes the space */
    readOnly: boolean;
    /** removes something an undo is needed to bring back */
    destructive: boolean;
    /** the action, as a sentence; throws a `PluridAgentError` when it cannot */
    run: (input: any, runtime: PluridAgentRuntime) => Promise<string>;
}


const token = () => 'agent-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

const cssString = (
    value: string,
) => value.replace(/["\\]/g, '\\$&');

const collapse = (
    text: string,
) => text.replace(/\s+/g, ' ').trim();

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

/** The plane with this id, or a `not_found` naming the ids there are. */
const requirePlane = (
    state: AppState,
    planeID: string,
): TreePlane => {
    const planes = flatten(state.space.tree);
    const plane = planes.find((node) => node.planeID === planeID);
    if (!plane) {
        const known = planes.slice(0, 12).map((node) => node.planeID).join(', ');
        throw new PluridAgentError(
            'not_found',
            `no plane with the id "${planeID}"; the space has ${planes.length} plane(s)${known ? ': ' + known : ''}${planes.length > 12 ? ', …' : ''} (plurid_observe lists them with their titles)`,
        );
    }
    return plane;
};

const requirePlanes = (
    state: AppState,
    planeIDs: string[],
) => {
    for (const planeID of planeIDs) {
        requirePlane(state, planeID);
    }
};

const planeElement = (
    runtime: PluridAgentRuntime,
    planeID: string,
): HTMLElement | null => runtime.root()?.querySelector<HTMLElement>(`[data-plurid-plane="${cssString(planeID)}"]`) ?? null;

/** The layouts a model may pick: `META` composes other layouts and is set by the host, not picked. */
const AGENT_LAYOUTS = (Object.values(LAYOUT_TYPES) as string[]).filter((type) => type !== LAYOUT_TYPES.META);

/** The shortcut commands a model may run: the pressed ones, not the modes a pointer holds. */
const AGENT_COMMANDS = PLURID_SHORTCUTS.filter((shortcut) => shortcut.kind === 'press' && ![
    'grabMode',
    'exitGrabMode',
    'exitTransformMode',
    'toggleFirstPerson',
    'modeRotation',
    'modeTranslation',
    'modeScale',
    'transformNudge',
    'focusRootIndex',
    'help',
    'palette',
].includes(shortcut.id));


const planeIDProperty: PluridAgentSchema = {
    type: 'string',
    description: 'A plane id, as plurid_observe lists it (`planes[].id`).',
};

const TOOLS: PluridAgentTool[] = [
    {
        name: 'plurid_observe',
        description: 'Read the plurid space: every plane (id, route, title, a text excerpt, its links, whether it is shown, docked, on screen, selected), the docked page, the selection, the camera and whether undo/redo are possible. Call it first to learn the plane ids the other tools take, and with `planeID` to read one plane\'s whole text. Every other tool also returns this observation after it acts.',
        inputSchema: {
            type: 'object',
            properties: {
                planeID: { ...planeIDProperty, description: 'Read only this plane, with its whole text.' },
                textLength: { type: 'integer', description: 'Characters of text per plane (default 600; 0 leaves the text out).' },
            },
            additionalProperties: false,
        },
        readOnly: true,
        destructive: false,
        run: async (input, runtime) => {
            if (input.planeID) {
                requirePlane(runtime.getState(), input.planeID);
            }
            if (typeof input.textLength === 'number' && input.textLength < 0) {
                throw new PluridAgentError('invalid_input', 'input.textLength must be 0 or more');
            }
            return input.planeID ? `read the plane ${input.planeID}` : 'read the space';
        },
    },
    {
        name: 'plurid_follow_link',
        description: 'Follow a link inside a plane exactly as a reader clicking it would: in the page presentation it goes to the linked page; in a space it opens the linked plane beside the plane it is in, joined by a bridge (and closes it again if that plane is already open). Use it to navigate by the links you see in plurid_observe (`planes[].links`).',
        inputSchema: {
            type: 'object',
            properties: {
                planeID: { ...planeIDProperty, description: 'The plane the link is in.' },
                link: { type: 'string', description: 'The link\'s text (as plurid_observe gives it; case and spacing do not matter) or its route (`/about`).' },
            },
            required: ['planeID', 'link'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const plane = requirePlane(runtime.getState(), input.planeID);
            if (plane.show === false) {
                throw new PluridAgentError('unavailable', `the plane ${input.planeID} is closed; bring it back with plurid_go_to_plane first`);
            }
            const element = planeElement(runtime, input.planeID);
            if (!element) {
                throw new PluridAgentError('unavailable', `the plane ${input.planeID} is not rendered (outside the view and culled); bring it into view with plurid_go_to_plane, or open the route with plurid_open_plane`);
            }
            const links = Array.from(element.querySelectorAll<HTMLElement>('[data-plurid-entity="PluridLink"]'))
                .filter((link) => link.closest('[data-plurid-plane]') === element);
            const wanted = collapse(String(input.link)).toLowerCase();
            const described = links.map((link) => ({
                element: link,
                text: readableText(link),
                route: linkRoute(link),
                address: link.getAttribute('data-plurid-link-route') ?? '',
            }));
            const exact = described.filter((link) => link.route === input.link || link.address === input.link || link.text.toLowerCase() === wanted);
            const partial = exact.length > 0 ? exact : described.filter((link) => wanted && link.text.toLowerCase().includes(wanted));
            if (partial.length === 0) {
                const available = described.map((link) => `"${link.text}" (${link.route})`).join(', ');
                throw new PluridAgentError('not_found', `no link "${input.link}" in the plane ${input.planeID}; its links: ${available || 'none'}`);
            }
            const routes = new Set(partial.map((link) => link.route));
            if (routes.size > 1) {
                throw new PluridAgentError('ambiguous', `"${input.link}" matches ${partial.length} links in the plane ${input.planeID}: ${partial.map((link) => `"${link.text}" (${link.route})`).join(', ')}; name one by its route`);
            }
            const target = partial[0];
            target.element.click();
            return `followed the link "${target.text}" (${target.route}) in the plane ${input.planeID}`;
        },
    },
    {
        name: 'plurid_open_plane',
        description: 'Open a route as a new plane: as a child of `parentPlaneID` (joined to it by a bridge, as a link would), or as a new root beside the others when no parent is given. Use it to open a route that no visible link points to; to follow a link you can see, use plurid_follow_link.',
        inputSchema: {
            type: 'object',
            properties: {
                route: { type: 'string', description: 'The route to open, as the application registers it (`/about`).' },
                parentPlaneID: { ...planeIDProperty, description: 'Open it as a child of this plane; leave out to open a new root.' },
            },
            required: ['route'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            if (input.parentPlaneID) {
                requirePlane(runtime.getState(), input.parentPlaneID);
            }
            const request = token();
            const answer = runtime.listen((kind, value) => kind === 'plane' && value?.token === request, runtime.settleTimeout);
            if (input.parentPlaneID) {
                runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE, { route: input.route, parentPlaneID: input.parentPlaneID, token: request });
            } else {
                runtime.publish(PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE, { planeID: input.route, token: request });
            }
            const opened = await answer.answer;
            if (!opened) {
                throw new PluridAgentError('no_effect', `no plane opened for the route "${input.route}": the application registers no plane at that route, or it did not render in time`);
            }
            const where = input.parentPlaneID ? `a child of ${input.parentPlaneID}` : 'a root';
            return opened.planeID
                ? `opened the route ${input.route} as the plane ${opened.planeID} (${where})`
                : `opened the route ${input.route} (${where})`;
        },
    },
    {
        name: 'plurid_go_to_plane',
        description: 'Bring a plane into view: in the page presentation the camera docks on it (it fills the view and its path goes to the address bar); in a space the camera frames it, with `framing: "pair"` showing the plane it was opened from beside it. A closed plane is reopened first.',
        inputSchema: {
            type: 'object',
            properties: {
                planeID: planeIDProperty,
                framing: { type: 'string', enum: ['plane', 'pair'], description: '`plane` (default) frames it alone, face-on; `pair` frames it with the plane it came from.' },
            },
            required: ['planeID'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const plane = requirePlane(runtime.getState(), input.planeID);
            const reopened = plane.show === false;
            if (reopened) {
                runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_SET_PLANE_SHOW, { planeID: input.planeID, show: true });
                await runtime.frame();
            }
            runtime.publish(PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE, { planeID: input.planeID, ...(input.framing ? { framing: input.framing } : {}) });
            return `${reopened ? 'reopened and went' : 'went'} to the plane ${input.planeID}`;
        },
    },
    {
        name: 'plurid_close_plane',
        description: 'Close a plane: it is hidden (with the planes opened from it) and stays in the space, so plurid_go_to_plane or its link brings it back. When it was the plane in view, the camera returns to the plane it was opened from.',
        inputSchema: {
            type: 'object',
            properties: {
                planeID: planeIDProperty,
            },
            required: ['planeID'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const plane = requirePlane(runtime.getState(), input.planeID);
            if (plane.show === false) {
                throw new PluridAgentError('no_effect', `the plane ${input.planeID} is already closed`);
            }
            runtime.publish(PLURID_PUBSUB_TOPIC.CLOSE_PLANE, { planeID: input.planeID });
            return `closed the plane ${input.planeID}`;
        },
    },
    {
        name: 'plurid_remove_plane',
        description: 'Remove a plane, and every plane opened from it, from the space. Unlike closing, it cannot be brought back by going to it; plurid_history can undo it. Use it only when asked to remove or discard a plane.',
        inputSchema: {
            type: 'object',
            properties: {
                planeID: planeIDProperty,
            },
            required: ['planeID'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: true,
        run: async (input, runtime) => {
            requirePlane(runtime.getState(), input.planeID);
            runtime.publish(PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE, { planeID: input.planeID });
            return `removed the plane ${input.planeID}`;
        },
    },
    {
        name: 'plurid_scroll_plane',
        description: 'Scroll a plane\'s content: to its top or bottom, or by a number of pixels (positive scrolls down). Use it to bring more of a long page into view; plurid_observe with `planeID` reads a plane\'s whole text without scrolling.',
        inputSchema: {
            type: 'object',
            properties: {
                planeID: planeIDProperty,
                to: { type: 'string', enum: ['top', 'bottom'], description: 'Scroll to the top or the bottom.' },
                by: { type: 'number', description: 'Scroll by this many pixels (positive: down).' },
            },
            required: ['planeID'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            requirePlane(runtime.getState(), input.planeID);
            if (input.to === undefined && input.by === undefined) {
                throw new PluridAgentError('invalid_input', 'give `to` (top or bottom) or `by` (pixels)');
            }
            const element = planeElement(runtime, input.planeID);
            if (!element) {
                throw new PluridAgentError('unavailable', `the plane ${input.planeID} is not rendered; bring it into view with plurid_go_to_plane first`);
            }
            const candidates = [element, ...Array.from(element.querySelectorAll<HTMLElement>('*'))];
            const scroller = candidates.find((candidate) => candidate.scrollHeight > candidate.clientHeight + 1
                && /(auto|scroll)/.test(getComputedStyle(candidate).overflowY))
                ?? element.querySelector<HTMLElement>('[data-plurid-entity="PluridPlaneContent"]');
            if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) {
                throw new PluridAgentError('no_effect', `the plane ${input.planeID} has nothing to scroll: its content fits`);
            }
            const top = input.to === 'top'
                ? 0
                : input.to === 'bottom'
                    ? scroller.scrollHeight
                    : scroller.scrollTop + input.by;
            scroller.scrollTop = Math.max(0, Math.min(top, scroller.scrollHeight - scroller.clientHeight));
            return `scrolled the plane ${input.planeID} to ${Math.round(scroller.scrollTop)} of ${Math.round(scroller.scrollHeight - scroller.clientHeight)} px`;
        },
    },
    {
        name: 'plurid_camera',
        description: 'Move the camera. `fit` frames every plane; `home` goes to the home viewpoint; `reset` returns to the start; `reveal` pulls back from a docked page to show the space; `dock` docks on a page (`planeID`, else the one nearest the view centre); `frame` frames `planeIDs` together; `move` turns (`yaw`, `pitch`, degrees), pans (`panX`, `panY`, pixels) and zooms (`zoom`, a factor: 2 is twice as close).',
        inputSchema: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['fit', 'home', 'reset', 'reveal', 'dock', 'frame', 'move'], description: 'What the camera does.' },
                planeID: { ...planeIDProperty, description: '`dock`: the page to dock on.' },
                planeIDs: { type: 'array', items: { type: 'string' }, description: '`frame`: the planes to frame together.' },
                yaw: { type: 'number', description: '`move`: turn left/right, degrees.' },
                pitch: { type: 'number', description: '`move`: turn up/down, degrees.' },
                panX: { type: 'number', description: '`move`: pan right, pixels.' },
                panY: { type: 'number', description: '`move`: pan down, pixels.' },
                zoom: { type: 'number', description: '`move`: zoom factor (above 1 closer, below 1 farther).' },
            },
            required: ['action'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const state = runtime.getState();
            switch (input.action) {
                case 'fit':
                    runtime.publish(PLURID_PUBSUB_TOPIC.FIT_TO_VIEW, {});
                    return 'framed every plane';
                case 'home':
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_HOME, {});
                    return 'went to the home viewpoint';
                case 'reset':
                    runtime.publish(PLURID_PUBSUB_TOPIC.RESET_TRANSFORM, {});
                    return 'reset the camera';
                case 'reveal':
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_REVEAL, {});
                    return 'revealed the space';
                case 'dock':
                    if (input.planeID) {
                        requirePlane(state, input.planeID);
                    }
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_DOCK, input.planeID ? { planeID: input.planeID } : {});
                    return input.planeID ? `docked on the plane ${input.planeID}` : 'docked on the page nearest the view centre';
                case 'frame': {
                    const planeIDs: string[] = input.planeIDs ?? (input.planeID ? [input.planeID] : []);
                    if (planeIDs.length === 0) {
                        throw new PluridAgentError('invalid_input', '`frame` needs `planeIDs` (or one `planeID`)');
                    }
                    requirePlanes(state, planeIDs);
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_FRAME, { planeIDs });
                    return `framed ${planeIDs.join(', ')}`;
                }
                case 'move': {
                    const delta: Record<string, unknown> = {};
                    if (typeof input.yaw === 'number') delta.yaw = input.yaw;
                    if (typeof input.pitch === 'number') delta.pitch = input.pitch;
                    if (typeof input.panX === 'number' || typeof input.panY === 'number') {
                        delta.pan = { x: input.panX ?? 0, y: input.panY ?? 0 };
                    }
                    if (typeof input.zoom === 'number') {
                        if (!(input.zoom > 0)) {
                            throw new PluridAgentError('invalid_input', 'input.zoom must be above 0 (a factor: 2 is twice as close, 0.5 twice as far)');
                        }
                        delta.zoom = { factor: input.zoom };
                    }
                    if (Object.keys(delta).length === 0) {
                        throw new PluridAgentError('invalid_input', '`move` needs at least one of yaw, pitch, panX, panY, zoom');
                    }
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { ...delta, animate: true });
                    return 'moved the camera';
                }
                default:
                    throw new PluridAgentError('invalid_input', `unknown camera action "${input.action}"`);
            }
        },
    },
    {
        name: 'plurid_select',
        description: 'Change the selection, the planes plurid_arrange and the copy/cut commands act on: `set` it to `planeIDs`, `toggle` each of `planeIDs` in or out, select `all`, `invert` it, or `clear` it.',
        inputSchema: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['set', 'toggle', 'all', 'invert', 'clear'], description: 'How the selection changes.' },
                planeIDs: { type: 'array', items: { type: 'string' }, description: '`set` / `toggle`: the planes.' },
            },
            required: ['action'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const state = runtime.getState();
            switch (input.action) {
                case 'set':
                case 'toggle': {
                    const planeIDs: string[] = input.planeIDs ?? [];
                    if (input.action === 'toggle' && planeIDs.length === 0) {
                        throw new PluridAgentError('invalid_input', '`toggle` needs `planeIDs`');
                    }
                    requirePlanes(state, planeIDs);
                    if (input.action === 'set') {
                        runtime.publish(PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs });
                        return planeIDs.length ? `selected ${planeIDs.join(', ')}` : 'cleared the selection';
                    }
                    for (const planeID of planeIDs) {
                        runtime.publish(PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION, { planeID });
                    }
                    return `toggled ${planeIDs.join(', ')}`;
                }
                case 'all':
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_SELECT_ALL, {});
                    return 'selected every plane';
                case 'invert':
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_INVERT_SELECTION, {});
                    return 'inverted the selection';
                case 'clear':
                    runtime.publish(PLURID_PUBSUB_TOPIC.CLEAR_SELECTION, {});
                    return 'cleared the selection';
                default:
                    throw new PluridAgentError('invalid_input', `unknown selection action "${input.action}"`);
            }
        },
    },
    {
        name: 'plurid_arrange',
        description: 'Arrange planes in the space: `move` them by `deltaX`/`deltaY` pixels (the `planeIDs`, else the selection); `align` the selection\'s `edge`; `distribute` the selection evenly along an `axis`; `duplicate` the selection. Every arrangement can be undone with plurid_history.',
        inputSchema: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['move', 'align', 'distribute', 'duplicate'], description: 'The arrangement.' },
                planeIDs: { type: 'array', items: { type: 'string' }, description: '`move`: the planes (default: the selection).' },
                deltaX: { type: 'number', description: '`move`: pixels to the right.' },
                deltaY: { type: 'number', description: '`move`: pixels down.' },
                edge: { type: 'string', enum: ['left', 'right', 'top', 'bottom', 'centerX', 'centerY'], description: '`align`: the edge or centre line to line up on.' },
                axis: { type: 'string', enum: ['x', 'y'], description: '`distribute`: the axis.' },
            },
            required: ['action'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const state = runtime.getState();
            switch (input.action) {
                case 'move': {
                    if (typeof input.deltaX !== 'number' && typeof input.deltaY !== 'number') {
                        throw new PluridAgentError('invalid_input', '`move` needs deltaX or deltaY');
                    }
                    if (input.planeIDs) {
                        requirePlanes(state, input.planeIDs);
                    } else if (state.space.selectedPlaneIDs.length === 0) {
                        throw new PluridAgentError('invalid_input', '`move` needs planeIDs, or a selection (plurid_select)');
                    }
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_MOVE_PLANES, {
                        deltaX: input.deltaX ?? 0,
                        deltaY: input.deltaY ?? 0,
                        ...(input.planeIDs ? { planeIDs: input.planeIDs } : {}),
                    });
                    return `moved ${input.planeIDs ? input.planeIDs.join(', ') : 'the selection'}`;
                }
                case 'align':
                case 'distribute':
                case 'duplicate': {
                    if (state.space.selectedPlaneIDs.length === 0) {
                        throw new PluridAgentError('invalid_input', `\`${input.action}\` acts on the selection, which is empty: select planes with plurid_select first`);
                    }
                    if (input.action === 'align') {
                        if (!input.edge) {
                            throw new PluridAgentError('invalid_input', '`align` needs `edge`');
                        }
                        runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_ALIGN, { edge: input.edge });
                        return `aligned the selection on ${input.edge}`;
                    }
                    if (input.action === 'distribute') {
                        if (!input.axis) {
                            throw new PluridAgentError('invalid_input', '`distribute` needs `axis`');
                        }
                        runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE, { axis: input.axis });
                        return `distributed the selection along ${input.axis}`;
                    }
                    runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_DUPLICATE, {});
                    return 'duplicated the selection';
                }
                default:
                    throw new PluridAgentError('invalid_input', `unknown arrangement "${input.action}"`);
            }
        },
    },
    {
        name: 'plurid_history',
        description: 'Undo or redo changes to the space\'s arrangement (planes opened, closed, removed, moved): `steps` at a time (default 1). The camera\'s moves are not in the history.',
        inputSchema: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['undo', 'redo'], description: 'Undo or redo.' },
                steps: { type: 'integer', description: 'How many steps (default 1).' },
            },
            required: ['action'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const history = runtime.getState().space.history;
            const steps = input.steps ?? 1;
            if (!(steps >= 1)) {
                throw new PluridAgentError('invalid_input', 'input.steps must be 1 or more');
            }
            const available = input.action === 'undo' ? history.undoDepth : history.redoDepth;
            if (available === 0) {
                throw new PluridAgentError('no_effect', `nothing to ${input.action}`);
            }
            const taken = Math.min(steps, available);
            if (taken === 1) {
                runtime.publish(input.action === 'undo' ? PLURID_PUBSUB_TOPIC.UNDO : PLURID_PUBSUB_TOPIC.REDO, {});
            } else {
                runtime.publish(PLURID_PUBSUB_TOPIC.HISTORY_GO_TO, { index: input.action === 'undo' ? -taken : taken });
            }
            return `${input.action === 'undo' ? 'undid' : 'redid'} ${taken} step(s)`;
        },
    },
    {
        name: 'plurid_bookmark',
        description: 'Keep camera viewpoints by name: `save` the current one under `name`, `go` to a saved one, or `remove` it. plurid_observe lists the saved names (`bookmarks`).',
        inputSchema: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['save', 'go', 'remove'], description: 'What to do with the bookmark.' },
                name: { type: 'string', description: 'The bookmark\'s name.' },
            },
            required: ['action', 'name'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const known = Object.keys(runtime.getState().space.bookmarks ?? {});
            if (input.action !== 'save' && !known.includes(input.name)) {
                throw new PluridAgentError('not_found', `no bookmark "${input.name}"; the bookmarks: ${known.join(', ') || 'none'}`);
            }
            runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: input.name, action: input.action });
            return input.action === 'save' ? `saved the viewpoint as "${input.name}"` : input.action === 'go' ? `went to the bookmark "${input.name}"` : `removed the bookmark "${input.name}"`;
        },
    },
    {
        name: 'plurid_command',
        description: 'Run one of the space\'s keyboard commands by id, exactly as its key would, on the plane in focus where it needs one: ' + AGENT_COMMANDS.map((shortcut) => `\`${shortcut.id}\` (${shortcut.label})`).join('; ') + '. Prefer the dedicated tools when one fits; this reaches the rest.',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', enum: AGENT_COMMANDS.map((shortcut) => shortcut.id), description: 'The command.' },
            },
            required: ['id'],
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            const answer = runtime.listen((kind, value) => kind === 'command' && value?.id === input.id, 1000);
            runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_COMMAND, { id: input.id });
            const report = await answer.answer;
            if (report && report.ran === false) {
                throw new PluridAgentError('no_effect', `the command ${input.id} did not run (${report.reason ?? 'declined'}): it needs a plane in focus, a selection, or something to act on`);
            }
            return `ran the command ${input.id}`;
        },
    },
    {
        name: 'plurid_configure',
        description: 'Change how the space is presented: `presentation` (`page`: one plane at a time, docked, like a site; `space`: planes arranged in 3D) and the roots\' `layout` (with `columns` or `rows` for the grid layouts). Use it only when asked to change the layout or the presentation.',
        inputSchema: {
            type: 'object',
            properties: {
                presentation: { type: 'string', enum: ['page', 'space'], description: 'One page at a time, or the space.' },
                layout: { type: 'string', enum: AGENT_LAYOUTS, description: 'How the roots are arranged.' },
                columns: { type: 'integer', description: 'The `COLUMNS` layout: how many columns.' },
                rows: { type: 'integer', description: 'The `ROWS` layout: how many rows.' },
            },
            additionalProperties: false,
        },
        readOnly: false,
        destructive: false,
        run: async (input, runtime) => {
            if (input.presentation === undefined && input.layout === undefined && input.columns === undefined && input.rows === undefined) {
                throw new PluridAgentError('invalid_input', 'give `presentation`, `layout`, `columns` or `rows`');
            }
            for (const key of ['columns', 'rows'] as const) {
                if (input[key] !== undefined && !(input[key] >= 1)) {
                    throw new PluridAgentError('invalid_input', `input.${key} must be 1 or more`);
                }
            }
            const current = runtime.getState().configuration.space.layout as unknown as Record<string, unknown>;
            const type = input.layout ?? current.type;
            if (input.columns !== undefined && type !== LAYOUT_TYPES.COLUMNS) {
                throw new PluridAgentError('invalid_input', `\`columns\` belongs to the COLUMNS layout, and the layout is ${type}: give \`layout: "COLUMNS"\` with it, or \`rows\` for ROWS`);
            }
            if (input.rows !== undefined && type !== LAYOUT_TYPES.ROWS) {
                throw new PluridAgentError('invalid_input', `\`rows\` belongs to the ROWS layout, and the layout is ${type}: give \`layout: "ROWS"\` with it, or \`columns\` for COLUMNS`);
            }
            // the same layout keeps the host's settings (gap, angle, …); another starts from its defaults
            const layout = input.layout !== undefined || input.columns !== undefined || input.rows !== undefined
                ? {
                    layout: {
                        ...(type === current.type ? current : {}),
                        type,
                        ...(input.columns !== undefined ? { columns: input.columns } : {}),
                        ...(input.rows !== undefined ? { rows: input.rows } : {}),
                    },
                }
                : {};
            const wasPage = runtime.getState().configuration.space.presentation === 'page';
            runtime.publish(PLURID_PUBSUB_TOPIC.CONFIGURATION, {
                space: {
                    ...(input.presentation !== undefined ? { presentation: input.presentation } : {}),
                    ...layout,
                },
            });
            // a space turned into pages is relaid, not docked: dock it on the page nearest the centre
            if (input.presentation === 'page' && !wasPage) {
                await runtime.frame();
                runtime.publish(PLURID_PUBSUB_TOPIC.SPACE_DOCK, {});
            }
            return [
                input.presentation !== undefined ? `presentation ${input.presentation}` : '',
                input.layout !== undefined ? `layout ${input.layout}` : '',
                input.columns !== undefined ? `${input.columns} columns` : '',
                input.rows !== undefined ? `${input.rows} rows` : '',
            ].filter(Boolean).join(', ').replace(/^/, 'set the ');
        },
    },
];


/** The catalog, in its order. */
export const pluridAgentTools = (): PluridAgentTool[] => TOOLS;

/** Read the space for a tool's answer. */
export const observeFor = (
    runtime: PluridAgentRuntime,
    options: { planeID?: string; textLength?: number },
) => observeSpace(runtime.getState(), runtime.root(), options);
// #endregion module
