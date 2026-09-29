// #region imports
    // #region internal
    import type {
        PluridAgentSchema,
    } from './schema';
    // #endregion internal
// #endregion imports



// #region module
/** A tool as WebMCP registers it: the MCP shape, plus the function the browser's agent calls. */
export interface PluridWebMCPTool {
    name: string;
    description: string;
    inputSchema: PluridAgentSchema;
    annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean };
    execute: (input: unknown) => Promise<{ content: { type: 'text'; text: string }[]; isError?: boolean }>;
}

interface ModelContext {
    registerTool: (tool: PluridWebMCPTool, options?: { signal?: AbortSignal }) => unknown;
    /** earlier drafts unregistered by name */
    unregisterTool?: (name: string) => unknown;
}

/**
 * The page's WebMCP context, where the browser offers one: `document.modelContext` (the proposal's
 * current home), else `navigator.modelContext` (its earlier drafts). `undefined` in a browser
 * without it, and on a server.
 */
export const webMCPContext = (): ModelContext | undefined => {
    const candidates = [
        typeof document !== 'undefined' ? (document as unknown as { modelContext?: ModelContext }).modelContext : undefined,
        typeof navigator !== 'undefined' ? (navigator as unknown as { modelContext?: ModelContext }).modelContext : undefined,
    ];
    return candidates.find((context) => !!context && typeof context.registerTool === 'function');
};


export interface PluridWebMCPRegistration {
    /** whether the page has a WebMCP context at all */
    available: boolean;
    /** the tools registered */
    registered: string[];
    /** the tools the context refused (a name already taken, a context that threw), with its reason */
    refused: { name: string; reason: string }[];
    /** unregister every tool registered here */
    dispose: () => void;
}

/**
 * Register `tools` with the page's WebMCP context: each is withdrawn when `dispose` aborts the
 * registration's signal (the proposal's way), and unregistered by name where the context still
 * offers that (its earlier drafts). A context that refuses one tool does not stop the others.
 */
export const registerWebMCPTools = async (
    tools: PluridWebMCPTool[],
): Promise<PluridWebMCPRegistration> => {
    const context = webMCPContext();
    if (!context) {
        return { available: false, registered: [], refused: [], dispose: () => {} };
    }

    const controller = typeof AbortController === 'function' ? new AbortController() : undefined;
    const registered: string[] = [];
    const refused: { name: string; reason: string }[] = [];
    for (const tool of tools) {
        try {
            await context.registerTool(tool, controller ? { signal: controller.signal } : undefined);
            registered.push(tool.name);
        } catch (error) {
            refused.push({ name: tool.name, reason: error instanceof Error ? error.message : String(error) });
        }
    }

    let disposed = false;
    return {
        available: true,
        registered,
        refused,
        dispose: () => {
            if (disposed) {
                return;
            }
            disposed = true;
            controller?.abort();
            if (typeof context.unregisterTool === 'function') {
                for (const name of registered) {
                    try {
                        context.unregisterTool(name);
                    } catch (_) {
                        // withdrawn by the signal already
                    }
                }
            }
        },
    };
};
// #endregion module
