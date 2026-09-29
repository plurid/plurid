/**
 * @jest-environment jsdom
 */
/**
 * APPLICATIONS SHARE A PAGE, AND THE CHROME IS THE CHROME'S (2026-09-29).
 *
 * Two applications on one page had one id for each dialog's label, and one stick drove both. In fly
 * mode a click on the toolbar captured the pointer, so the menu it opened sat under a hidden cursor.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import PluridApplication from '../index';

import {
    installPointerEvents,
    installMatchMedia,
    installFrameClock,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Page: React.FC = () => <div>page</div>;
const planes = [{ route: '/a', component: Page }];

const settle = () => act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
});


describe('two applications on a page', () => {
    let root: Root;
    let container: HTMLElement;

    beforeEach(() => {
        installPointerEvents();
        installMatchMedia();
        (Element.prototype as any).scrollIntoView = () => {};
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => { root.unmount(); });
        container.remove();
    });

    it('label their dialogs with ids of their own', async () => {
        await act(async () => {
            root.render(
                <>
                    <PluridApplication id="one" planes={planes as any} view={['/a']} />
                    <PluridApplication id="two" planes={planes as any} view={['/a']} />
                </>,
            );
        });
        await settle();
        const triggers = Array.from(container.querySelectorAll('[data-plurid-control="shortcuts"]')) as HTMLElement[];
        expect(triggers).toHaveLength(2);
        await act(async () => {
            triggers.forEach((trigger) => trigger.click());
        });
        const labelled = Array.from(container.querySelectorAll('[aria-labelledby]')).map((node) => node.getAttribute('aria-labelledby'));
        expect(labelled).toHaveLength(2);
        expect(new Set(labelled).size).toBe(2);
        for (const id of labelled) {
            expect(document.getElementById(id!)).not.toBeNull();
        }
    });

    it('drive one application from one gamepad: the one with the keyboard, else the first', async () => {
        const clock = installFrameClock();
        const pad = {
            id: 'stub', index: 0, connected: true, mapping: 'standard', timestamp: 0,
            axes: [0, 0, 0.8, 0],
            buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })),
        };
        const originalGetGamepads = (navigator as any).getGamepads;
        (navigator as any).getGamepads = () => [pad];
        try {
            const apis: any[] = [];
            const configuration = { space: { gestures: { gamepad: { enabled: true } } } } as any;
            await act(async () => {
                root.render(
                    <>
                        <PluridApplication id="one" planes={planes as any} view={['/a']} configuration={configuration} onReady={(api) => { apis[0] = api; }} />
                        <PluridApplication id="two" planes={planes as any} view={['/a']} configuration={configuration} onReady={(api) => { apis[1] = api; }} />
                    </>,
                );
            });
            const yaw = (index: number) => apis[index].getSnapshot().space.camera.yaw;
            const frames = (count: number) => act(async () => {
                for (let frame = 0; frame < count; frame += 1) {
                    clock.advance(16);
                }
            });

            await frames(10);
            expect(yaw(0)).not.toBe(0);
            expect(yaw(1)).toBe(0);

            const second = container.querySelectorAll('[data-plurid-entity="PluridView"]')[1] as HTMLElement;
            await act(async () => {
                second.focus();
            });
            const first = yaw(0);
            await frames(10);
            expect(yaw(1)).not.toBe(0);
            expect(yaw(0)).toBe(first);
        } finally {
            (navigator as any).getGamepads = originalGetGamepads;
            clock.restore();
        }
    });
});


describe('fly mode', () => {
    it('captures the pointer on the space, never on the chrome', async () => {
        installPointerEvents();
        installMatchMedia();
        const lock = jest.fn();
        const original = (HTMLElement.prototype as any).requestPointerLock;
        (HTMLElement.prototype as any).requestPointerLock = lock;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        try {
            await act(async () => {
                root.render(
                    <PluridApplication
                        planes={planes as any}
                        view={['/a']}
                        configuration={{ space: { firstPerson: true } } as any}
                    />,
                );
            });
            await settle();
            const more = container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement;
            await act(async () => {
                more.click();
            });
            expect(lock).not.toHaveBeenCalled();

            const view = container.querySelector('[data-plurid-entity="PluridView"]') as HTMLElement;
            await act(async () => {
                view.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            });
            expect(lock).toHaveBeenCalledTimes(1);
        } finally {
            (HTMLElement.prototype as any).requestPointerLock = original;
            await act(async () => { root.unmount(); });
            container.remove();
        }
    });
});
