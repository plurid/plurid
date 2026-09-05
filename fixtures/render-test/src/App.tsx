import React, { useMemo, useState } from 'react';
import {
    PluridApplication,
} from '@plurid/plurid-react';

import {
    HarnessFlags,
    readFlags,
} from './harness/flags';
import { buildConfiguration } from './harness/config';
import { buildPlanes } from './harness/planes';
import {
    installHarnessGlobals,
    installStaticGlobals,
} from './harness/globals';
import Setup from './harness/Setup';
import { fixtureByName } from './fixtures/catalog';


installStaticGlobals();

/**
 * The CAD verification harness. THE URL IS THE FIXTURE: every option is a query flag
 * (`harness/flags.ts`), a named fixture (`fixtures/catalog.ts`) is a set of them, and the setup
 * panel edits the URL — the layout switches on the live instance, the plane set / sizes / persist
 * remount the application, everything else reloads.
 */
const App = () => {
    const [flags, setFlags] = useState<HarnessFlags>(() => readFlags(
        typeof location !== 'undefined' ? location.search : '',
        (name) => fixtureByName(name)?.query,
    ));

    const configuration = useMemo(() => buildConfiguration(flags), [flags]);
    const built = useMemo(() => buildPlanes(flags), [flags]);

    // A throwaway in-memory backend so a test can confirm writes land HERE (not localStorage).
    const memoryAdapter = useMemo(() => {
        if (flags.store !== 'memory') return undefined;
        const map: Map<string, string> = ((window as any).__rtStore = (window as any).__rtStore || new Map());
        return {
            getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
            setItem: (k: string, v: string) => { map.set(k, v); },
            removeItem: (k: string) => { map.delete(k); },
        };
    }, [flags.store]);

    const stress = !!flags.planes;
    // The plane set, the sizes and persistence re-create the application; a layout change does
    // not (an animated relayout on the live instance, children attached).
    const applicationKey = [stress ? 'stress-' + flags.planes : 'base', flags.sizes, flags.persist ? 'p' : ''].join('-');

    return (
        <>
            <Setup flags={flags} onChange={setFlags} />

            {flags.hostileCss && (
                <style>{`
                    button, input, select { min-height: 42px; min-width: 120px; padding: 12px 18px; font-size: 20px; font-family: serif; border: 3px solid red; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.2em; line-height: 2.4; }
                    body { line-height: 2; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; }
                `}</style>
            )}

            <PluridApplication
                key={applicationKey}
                configuration={configuration}
                planes={built.planes}
                view={built.view}
                useLocalStorage={flags.persist || flags.store === 'memory'}
                storageAdapter={memoryAdapter}
                id={'rt' + (stress ? '-stress' : '')}
                onPersistContent={() => (window as any).__rtContent}
                onRestoreContent={(c) => { (window as any).__rtRestored = c; }}
                onViewpointChange={(v) => { (window as any).__rtViewpoint = v; }}
                onReady={(api) => installHarnessGlobals(api, flags, built.declared)}
                renderToolbar={flags.slotToolbar
                    ? () => (
                        <div
                            id="rt-custom-toolbar"
                            style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 9999, color: '#7ee787' }}
                        >
                            CUSTOM TOOLBAR
                        </div>
                    )
                    : undefined}
            />
        </>
    );
};


export default App;
