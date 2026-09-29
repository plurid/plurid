// #region imports
    // #region libraries
    import {
        useEffect,
        useState,
    } from 'react';

    import {
        PLURID_PUBSUB_TOPIC,
    } from '@plurid/plurid-data';
    import type {
        PluridApi,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion external


    // #region internal
    import {
        validateAgentInput,
    } from './schema';
    import type {
        PluridAgentSchema,
    } from './schema';
    import {
        waitForRest,
    } from './settle';
    import {
        observeSpace,
    } from './observe';
    import type {
        PluridAgentObservation,
        PluridAgentObserveOptions,
        PluridAgentPlane,
        PluridAgentLink,
    } from './observe';
    import {
        pluridAgentTools,
        PluridAgentError,
    } from './tools';
    import type {
        PluridAgentTool,
        PluridAgentToolName,
        PluridAgentErrorCode,
        PluridAgentRuntime,
    } from './tools';
    import {
        registerWebMCPTools,
        webMCPContext,
    } from './webmcp';
    import type {
        PluridWebMCPRegistration,
    } from './webmcp';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridAgentOptions {
    /**
     * Where this application's planes are in the page: an element, or a function returning one (the
     * view, or anything around it). Default: the document — enough for one application per page;
     * with several, give each agent its own (`[data-plurid-application="…"]`).
     */
    root?: ParentNode | (() => ParentNode | null | undefined);
    /** The tools offered, by name (default: all of them). */
    tools?: PluridAgentToolName[];
    /** Offer only the tools that read (`plurid_observe`). */
    readOnly?: boolean;
    /** Asked before every call that passed validation: return `false` to refuse it (the model is told so). */
    onCall?: (call: { name: PluridAgentToolName; input: Record<string, unknown> }) => boolean | void | Promise<boolean | void>;
    /** How long a call waits for the space to come to rest before answering, ms (default 4000). */
    settleTimeout?: number;
    /** Characters of each plane's text in an observation (default 600). */
    textLength?: number;
}

/** What changed in the space during a call, by plane id. */
export interface PluridAgentChanges {
    opened: string[];
    closed: string[];
    removed: string[];
    /** the docked page before and after, when it changed */
    docked?: { from: string | null; to: string | null };
}

export interface PluridAgentResult {
    ok: boolean;
    tool: string;
    /** what was done, in a sentence */
    summary?: string;
    changes?: PluridAgentChanges;
    /** `false` when the space was still moving when the answer was given */
    settled?: boolean;
    /** the space after the call */
    observation?: PluridAgentObservation;
    error?: { code: PluridAgentErrorCode; message: string };
}

/** A tool as the MCP (and WebMCP) catalog lists it. */
export interface PluridAgentMCPTool {
    name: PluridAgentToolName;
    description: string;
    inputSchema: PluridAgentSchema;
    annotations: { readOnlyHint: boolean; destructiveHint: boolean };
}

/** A tool as the Claude Messages API takes it (`tools`); `strict` guarantees schema-valid input. */
export interface PluridAgentAnthropicTool {
    name: PluridAgentToolName;
    description: string;
    input_schema: PluridAgentSchema;
    strict?: true;
}

export interface PluridAgent {
    /** The tools offered, in the MCP / WebMCP shape (`inputSchema`). */
    tools: () => PluridAgentMCPTool[];
    /** The tools in the Claude Messages API shape (`input_schema`), `strict` when asked. */
    anthropicTools: (options?: { strict?: boolean }) => PluridAgentAnthropicTool[];
    /**
     * Run a tool: the input is validated against its schema, `onCall` is asked, the action runs,
     * the answer waits for the space to come to rest and carries the space as it is then. Never
     * throws: a failure is `{ ok: false, error }`, written for the model to act on. Calls run one
     * at a time, in the order they were made.
     */
    call: (name: string, input?: unknown) => Promise<PluridAgentResult>;
    /** The space as a model reads it, now. */
    observe: (options?: PluridAgentObserveOptions) => PluridAgentObservation;
    /** Register the tools with the browser's WebMCP context, where there is one. */
    exposeToWebMCP: () => Promise<PluridWebMCPRegistration>;
    /**
     * Put `{ tools, call, observe }` on `window[name]` (default `__PLURID_AGENT__`) for an agent that
     * drives the page from outside (a browser-automation agent evaluating script in it). Opt-in:
     * anything the page runs can then call the tools. Returns the undo.
     */
    exposeGlobal: (name?: string) => () => void;
    /** Withdraw every registration this agent made. */
    dispose: () => void;
}


const DEFAULT_SETTLE_TIMEOUT = 4000;
const DEFAULT_TEXT_LENGTH = 600;

const changesBetween = (
    before: PluridAgentObservation,
    after: PluridAgentObservation,
): PluridAgentChanges => {
    const shownBefore = new Map(before.planes.map((plane) => [plane.id, plane.shown]));
    const presentAfter = new Set(after.planes.map((plane) => plane.id));
    const changes: PluridAgentChanges = {
        opened: after.planes
            .filter((plane) => plane.shown && shownBefore.get(plane.id) !== true)
            .map((plane) => plane.id),
        closed: after.planes
            .filter((plane) => !plane.shown && shownBefore.get(plane.id) === true)
            .map((plane) => plane.id),
        removed: before.planes
            .filter((plane) => !presentAfter.has(plane.id))
            .map((plane) => plane.id),
    };
    if (before.docked !== after.docked) {
        changes.docked = { from: before.docked, to: after.docked };
    }
    return changes;
};

const failure = (
    tool: string,
    code: PluridAgentErrorCode,
    message: string,
): PluridAgentResult => ({ ok: false, tool, error: { code, message } });


/**
 * AGENT CONTROL: a plurid application operated by an AI agent, through the same bus its host uses.
 * `api` is what `onReady` gives (or the `ref` handle, which extends it). The agent observes the
 * space as a reader would read it and acts on it with a small set of tools, each described for a
 * model and validated before it runs; it depends on no model provider — hand `tools()` or
 * `anthropicTools()` to whichever runs the model, and route its tool calls to `call`.
 */
export const createPluridAgent = (
    api: PluridApi,
    options: PluridAgentOptions = {},
): PluridAgent => {
    const settleTimeout = options.settleTimeout ?? DEFAULT_SETTLE_TIMEOUT;
    const textLength = options.textLength ?? DEFAULT_TEXT_LENGTH;
    const root = () => {
        const given = typeof options.root === 'function' ? options.root() : options.root;
        return given ?? (typeof document !== 'undefined' ? document : undefined);
    };
    const getState = () => api.store.getState() as unknown as AppState;

    const offered: PluridAgentTool[] = pluridAgentTools().filter((tool) => (
        (!options.readOnly || tool.readOnly)
        && (!options.tools || options.tools.includes(tool.name))
    ));
    const byName = new Map(offered.map((tool) => [tool.name as string, tool]));

    const runtime: PluridAgentRuntime = {
        getState,
        publish: (topic, data) => {
            api.pubsub.publish({ topic, data } as any);
        },
        listen: (match, timeout) => {
            let selector: string | undefined;
            let timer: ReturnType<typeof setTimeout> | undefined;
            let settle: (value: any) => void = () => {};
            const answer = new Promise<any>((resolve) => {
                settle = resolve;
            });
            const cancel = () => {
                if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                }
                if (selector) {
                    api.pubsub.unsubscribe(selector);
                    selector = undefined;
                }
            };
            selector = api.pubsub.subscribe({
                topic: PLURID_PUBSUB_TOPIC.CHANGED,
                callback: (data: any) => {
                    if (match(String(data?.kind ?? ''), data?.value)) {
                        cancel();
                        settle(data.value);
                    }
                },
            } as any) as unknown as string;
            timer = setTimeout(() => {
                cancel();
                settle(undefined);
            }, timeout);
            return { answer, cancel };
        },
        root,
        settleTimeout,
        frame: () => new Promise<void>((resolve) => {
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => resolve());
                return;
            }
            setTimeout(resolve, 16);
        }),
    };

    const observe = (observeOptions: PluridAgentObserveOptions = {}) => observeSpace(
        getState(),
        root(),
        { textLength, ...observeOptions },
    );

    const run = async (
        name: string,
        input: unknown,
    ): Promise<PluridAgentResult> => {
        const tool = byName.get(name);
        if (!tool) {
            return failure(name, 'unknown_tool', `there is no tool "${name}" here; the tools: ${offered.map((item) => item.name).join(', ')}`);
        }
        const given = input === undefined || input === null ? {} : input;
        const problem = validateAgentInput(tool.inputSchema, given);
        if (problem) {
            return failure(name, 'invalid_input', problem);
        }
        const record = given as Record<string, unknown>;
        if (options.onCall) {
            try {
                if (await options.onCall({ name: tool.name, input: record }) === false) {
                    return failure(name, 'not_allowed', `the application did not allow ${name} here`);
                }
            } catch (error) {
                return failure(name, 'not_allowed', `the application did not allow ${name}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        const before = observe({ textLength: 0 });
        let summary: string;
        try {
            summary = await tool.run(record, runtime);
        } catch (error) {
            if (error instanceof PluridAgentError) {
                return failure(name, error.code, error.message);
            }
            return failure(name, 'failed', `${name} failed: ${error instanceof Error ? error.message : String(error)}`);
        }

        const settled = tool.readOnly ? true : await waitForRest(api.store, settleTimeout);
        const observation = tool.name === 'plurid_observe'
            ? observe({
                ...(typeof record.planeID === 'string' ? { planeID: record.planeID } : {}),
                ...(typeof record.textLength === 'number' ? { textLength: record.textLength } : {}),
            })
            : observe();
        return {
            ok: true,
            tool: name,
            summary,
            changes: changesBetween(before, observe({ textLength: 0 })),
            settled,
            observation,
        };
    };

    // one call at a time: a model's parallel calls would otherwise interleave on one space, and
    // each answer would describe a space another call was still changing
    let queue: Promise<unknown> = Promise.resolve();
    const call = (
        name: string,
        input?: unknown,
    ) => {
        const next = queue.then(() => run(name, input));
        queue = next.catch(() => undefined);
        return next;
    };

    const disposers = new Set<() => void>();

    const tools = (): PluridAgentMCPTool[] => offered.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { readOnlyHint: tool.readOnly, destructiveHint: tool.destructive },
    }));

    return {
        tools,
        anthropicTools: (formatOptions = {}) => offered.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema,
            ...(formatOptions.strict ? { strict: true as const } : {}),
        })),
        call,
        observe,
        exposeToWebMCP: async () => {
            const registration = await registerWebMCPTools(tools().map((tool) => ({
                ...tool,
                execute: async (input: unknown) => {
                    const result = await call(tool.name, input);
                    return {
                        content: [{ type: 'text' as const, text: JSON.stringify(result) }],
                        ...(result.ok ? {} : { isError: true }),
                    };
                },
            })));
            disposers.add(registration.dispose);
            return registration;
        },
        exposeGlobal: (name = '__PLURID_AGENT__') => {
            if (typeof window === 'undefined') {
                return () => {};
            }
            const target = window as unknown as Record<string, unknown>;
            target[name] = { tools, call, observe };
            const undo = () => {
                if (target[name] && (target[name] as { call?: unknown }).call === call) {
                    delete target[name];
                }
            };
            disposers.add(undo);
            return undo;
        },
        dispose: () => {
            for (const dispose of disposers) {
                dispose();
            }
            disposers.clear();
        },
    };
};


export interface UsePluridAgentOptions extends PluridAgentOptions {
    /** Register the tools with the browser's WebMCP context while mounted, where there is one. */
    webmcp?: boolean;
    /** Put the agent on `window` while mounted: `true` for `__PLURID_AGENT__`, or a name. */
    global?: boolean | string;
}

/**
 * The agent of an application in React: created once `api` exists (`onReady`), exposed to WebMCP
 * or on `window` as asked, withdrawn on unmount. `undefined` until the application is ready.
 */
export const usePluridAgent = (
    api: PluridApi | undefined,
    options: UsePluridAgentOptions = {},
): PluridAgent | undefined => {
    const [agent, setAgent] = useState<PluridAgent>();
    const {
        webmcp,
        global,
    } = options;

    useEffect(() => {
        if (!api) {
            setAgent(undefined);
            return;
        }
        const created = createPluridAgent(api, options);
        if (webmcp) {
            void created.exposeToWebMCP();
        }
        if (global) {
            created.exposeGlobal(typeof global === 'string' ? global : undefined);
        }
        setAgent(created);
        return () => {
            created.dispose();
        };
        // the options are read when the agent is made; a new api makes a new agent
    }, [api, webmcp, global]);

    return agent;
};


export {
    PluridAgentError,
    webMCPContext,
    validateAgentInput,
};

export type {
    PluridAgentToolName,
    PluridAgentErrorCode,
    PluridAgentObservation,
    PluridAgentObserveOptions,
    PluridAgentPlane,
    PluridAgentLink,
    PluridAgentSchema,
    PluridWebMCPRegistration,
};
// #endregion module
