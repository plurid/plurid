// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    import {
        createRoot,
        Root,
    } from 'react-dom/client';

    import {
        PluridApi,
        CameraState,
        PluridApplication as PluridApplicationProperties,
        PLURID_ATTRIBUTE_ENTITY,
        PLURID_ENTITY_VIEW,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridApplication from '../containers/Application';
    import {
        PluridApplicationHandle,
    } from '../containers/Application/handle';
    import {
        PluridReactComponent,
    } from '../data/interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * `@plurid/plurid-react/testing` — render an application in jsdom, drive it with synthetic
 * gestures and keys, step a deterministic frame clock, and assert on the camera. Built for the
 * host's own test suites (vitest / jest with a DOM), not for the browser.
 */

export type RenderPluridProperties = Partial<PluridApplicationProperties<PluridReactComponent>>;

export interface RenderedPlurid {
    container: HTMLElement;
    /** The view element (the gesture target). */
    view: HTMLElement;
    api: PluridApi;
    handle: PluridApplicationHandle;
    rerender: (properties: RenderPluridProperties) => Promise<void>;
    unmount: () => Promise<void>;
}


/** jsdom has no `PointerEvent` and no pointer capture; the engine needs both. */
export const installPointerEvents = () => {
    if (typeof window === 'undefined') {
        return;
    }
    if (typeof (window as any).PointerEvent === 'undefined') {
        class PointerEventPolyfill extends MouseEvent {
            pointerId: number;
            pointerType: string;
            isPrimary: boolean;
            width: number;
            height: number;
            pressure: number;
            constructor(type: string, init: any = {}) {
                super(type, init);
                this.pointerId = init.pointerId ?? 1;
                this.pointerType = init.pointerType ?? 'mouse';
                this.isPrimary = init.isPrimary ?? true;
                this.width = init.width ?? 1;
                this.height = init.height ?? 1;
                this.pressure = init.pressure ?? 0.5;
            }
        }
        (window as any).PointerEvent = PointerEventPolyfill;
    }
    const prototype = (window as any).Element?.prototype;
    if (prototype && typeof prototype.setPointerCapture !== 'function') {
        prototype.setPointerCapture = () => {};
        prototype.releasePointerCapture = () => {};
        prototype.hasPointerCapture = () => false;
    }
};


/** jsdom has no `matchMedia` (reduced-motion and theme queries); a permissive stub. */
export const installMatchMedia = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'function') {
        return;
    }
    (window as any).matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    });
};


type FrameClock = {
    advance: (milliseconds?: number) => void;
    now: () => number;
    pending: () => number;
    restore: () => void;
};

let frameClock: FrameClock | null = null;


/**
 * A controllable `requestAnimationFrame` + `performance.now`, for tweens, flings and per-frame
 * batchers. Install it BEFORE the input it should drive; `gestures.*` and `flushFrames` step it.
 */
export const installFrameClock = (): FrameClock => {
    if (frameClock) {
        return frameClock;
    }
    let now = 0;
    let queue: FrameRequestCallback[] = [];
    const originalRequest = (window as any).requestAnimationFrame;
    const originalCancel = (window as any).cancelAnimationFrame;
    const originalNow = performance.now;

    (window as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
        queue.push(callback);
        return queue.length;
    };
    (window as any).cancelAnimationFrame = () => {
        queue = [];
    };
    performance.now = () => now;

    const clock: FrameClock = {
        /** Advance by `milliseconds` and run the frame callbacks queued so far. */
        advance: (milliseconds = 1000 / 60) => {
            now += milliseconds;
            const callbacks = queue;
            queue = [];
            for (const callback of callbacks) {
                callback(now);
            }
        },
        now: () => now,
        pending: () => queue.length,
        restore: () => {
            (window as any).requestAnimationFrame = originalRequest;
            (window as any).cancelAnimationFrame = originalCancel;
            performance.now = originalNow;
            frameClock = null;
        },
    };
    frameClock = clock;
    return clock;
};

/** Run `count` frames of `milliseconds` each through the installed frame clock (installed on demand). */
export const flushFrames = async (
    count = 1,
    milliseconds = 1000 / 60,
) => {
    if (!frameClock) {
        frameClock = installFrameClock();
    }
    for (let index = 0; index < count; index += 1) {
        await act(async () => {
            frameClock!.advance(milliseconds);
        });
    }
};


const ensureActEnvironment = () => {
    if ((globalThis as any).IS_REACT_ACT_ENVIRONMENT === undefined) {
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    }
};


/** Render a `PluridApplication` and resolve once `onReady` fired. */
export const renderPlurid = async (
    properties: RenderPluridProperties = {},
): Promise<RenderedPlurid> => {
    ensureActEnvironment();
    installPointerEvents();
    installMatchMedia();

    const container = document.createElement('div');
    container.style.width = '1000px';
    container.style.height = '600px';
    document.body.appendChild(container);

    let api: PluridApi | undefined;
    const handleRef = React.createRef<PluridApplicationHandle>();
    let root: Root | undefined;

    const render = async (nextProperties: RenderPluridProperties) => {
        await act(async () => {
            if (!root) {
                root = createRoot(container);
            }
            root.render(
                <PluridApplication
                    ref={handleRef}
                    {...(nextProperties as any)}
                    onReady={(readyApi) => {
                        api = readyApi;
                        nextProperties.onReady?.(readyApi);
                    }}
                />,
            );
        });
    };

    await render(properties);

    if (!api) {
        throw new Error('[plurid testing] the application did not become ready');
    }
    const view = container.querySelector(`[${PLURID_ATTRIBUTE_ENTITY}="${PLURID_ENTITY_VIEW}"]`) as HTMLElement;

    return {
        container,
        view,
        api,
        handle: handleRef.current as PluridApplicationHandle,
        rerender: async (nextProperties) => {
            await render({ ...properties, ...nextProperties });
        },
        unmount: async () => {
            await act(async () => {
                root?.unmount();
            });
            container.remove();
        },
    };
};


export interface GestureModifiers {
    shiftKey?: boolean;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
}

const pointerEvent = (
    type: string,
    x: number,
    y: number,
    options: GestureModifiers & { button?: number; buttons?: number; pointerType?: string; pointerId?: number } = {},
) => new (window as any).PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: options.button ?? 0,
    buttons: options.buttons ?? (type === 'pointerup' ? 0 : 1),
    pointerId: options.pointerId ?? 1,
    pointerType: options.pointerType ?? 'mouse',
    isPrimary: true,
    shiftKey: !!options.shiftKey,
    altKey: !!options.altKey,
    ctrlKey: !!options.ctrlKey,
    metaKey: !!options.metaKey,
});


/** Synthetic input, dispatched as the browser would (pointer, wheel, keyboard events). */
export const gestures = {
    /** Press, move in `steps`, release. `button` 0 left, 1 middle, 2 right. */
    drag: async (
        target: Element,
        from: { x: number; y: number },
        to: { x: number; y: number },
        options: GestureModifiers & { button?: number; steps?: number; pointerType?: string; pointerId?: number } = {},
    ) => {
        const steps = Math.max(1, options.steps ?? 6);
        const buttons = options.button === 1 ? 4 : (options.button === 2 ? 2 : 1);
        await act(async () => {
            target.dispatchEvent(pointerEvent('pointerdown', from.x, from.y, { ...options, buttons }));
        });
        for (let index = 1; index <= steps; index += 1) {
            const x = from.x + (to.x - from.x) * (index / steps);
            const y = from.y + (to.y - from.y) * (index / steps);
            await act(async () => {
                target.dispatchEvent(pointerEvent('pointermove', x, y, { ...options, buttons }));
            });
            if (frameClock) {
                await act(async () => {
                    frameClock!.advance();
                });
            }
        }
        await act(async () => {
            target.dispatchEvent(pointerEvent('pointerup', to.x, to.y, { ...options, buttons: 0 }));
        });
    },
    /** A pinch: two touch pointers moving apart (or together) about a midpoint. */
    pinch: async (
        target: Element,
        midpoint: { x: number; y: number },
        fromDistance: number,
        toDistance: number,
        steps = 6,
    ) => {
        const at = (distance: number) => [
            { x: midpoint.x - distance / 2, y: midpoint.y },
            { x: midpoint.x + distance / 2, y: midpoint.y },
        ];
        const start = at(fromDistance);
        await act(async () => {
            target.dispatchEvent(pointerEvent('pointerdown', start[0].x, start[0].y, { pointerType: 'touch', pointerId: 1 }));
            target.dispatchEvent(pointerEvent('pointerdown', start[1].x, start[1].y, { pointerType: 'touch', pointerId: 2 }));
        });
        for (let index = 1; index <= steps; index += 1) {
            const points = at(fromDistance + (toDistance - fromDistance) * (index / steps));
            await act(async () => {
                target.dispatchEvent(pointerEvent('pointermove', points[0].x, points[0].y, { pointerType: 'touch', pointerId: 1 }));
                target.dispatchEvent(pointerEvent('pointermove', points[1].x, points[1].y, { pointerType: 'touch', pointerId: 2 }));
            });
            if (frameClock) {
                await act(async () => {
                    frameClock!.advance();
                });
            }
        }
        const end = at(toDistance);
        await act(async () => {
            target.dispatchEvent(pointerEvent('pointerup', end[0].x, end[0].y, { pointerType: 'touch', pointerId: 1, buttons: 0 }));
            target.dispatchEvent(pointerEvent('pointerup', end[1].x, end[1].y, { pointerType: 'touch', pointerId: 2, buttons: 0 }));
        });
    },
    wheel: async (
        target: Element,
        options: GestureModifiers & { deltaX?: number; deltaY?: number; x?: number; y?: number; deltaMode?: number } = {},
    ) => {
        await act(async () => {
            target.dispatchEvent(new WheelEvent('wheel', {
                bubbles: true,
                cancelable: true,
                deltaX: options.deltaX ?? 0,
                deltaY: options.deltaY ?? 0,
                deltaMode: options.deltaMode ?? 0,
                clientX: options.x ?? 0,
                clientY: options.y ?? 0,
                shiftKey: !!options.shiftKey,
                altKey: !!options.altKey,
                ctrlKey: !!options.ctrlKey,
                metaKey: !!options.metaKey,
            }));
        });
        if (frameClock) {
            await act(async () => {
                frameClock!.advance();
            });
        }
    },
    /** A key press (`keydown` then `keyup`) on `target` (the view by default). */
    key: async (
        target: Element,
        code: string,
        options: GestureModifiers & { key?: string } = {},
    ) => {
        const init = {
            bubbles: true,
            cancelable: true,
            code,
            key: options.key ?? code.replace(/^Key|^Digit/, ''),
            shiftKey: !!options.shiftKey,
            altKey: !!options.altKey,
            ctrlKey: !!options.ctrlKey,
            metaKey: !!options.metaKey,
        };
        await act(async () => {
            target.dispatchEvent(new KeyboardEvent('keydown', init));
        });
        await act(async () => {
            target.dispatchEvent(new KeyboardEvent('keyup', init));
        });
    },
};


/** Camera assertions with a tolerance, throwing a readable error. */
export const expectCamera = (
    camera: CameraState,
) => ({
    toBeNear: (
        target: Partial<CameraState>,
        tolerance = 1e-6,
    ) => {
        const differences: string[] = [];
        const compare = (name: string, actual: number, expected: number) => {
            if (Math.abs(actual - expected) > tolerance) {
                differences.push(`${name}: expected ${expected}, got ${actual}`);
            }
        };
        if (target.yaw !== undefined) compare('yaw', camera.yaw, target.yaw);
        if (target.pitch !== undefined) compare('pitch', camera.pitch, target.pitch);
        if (target.scale !== undefined) compare('scale', camera.scale, target.scale);
        if (target.perspective !== undefined) compare('perspective', camera.perspective, target.perspective);
        if (target.pivot) {
            compare('pivot.x', camera.pivot.x, target.pivot.x);
            compare('pivot.y', camera.pivot.y, target.pivot.y);
            compare('pivot.z', camera.pivot.z, target.pivot.z);
        }
        if (target.offset) {
            compare('offset.x', camera.offset.x, target.offset.x);
            compare('offset.y', camera.offset.y, target.offset.y);
            compare('offset.z', camera.offset.z, target.offset.z);
        }
        if (differences.length > 0) {
            throw new Error('[plurid testing] camera differs:\n  ' + differences.join('\n  '));
        }
    },
});
// #endregion module



// #region exports
export type {
    PluridApplicationHandle,
};

export * from './fixtures';
export * from './store';
// #endregion exports
