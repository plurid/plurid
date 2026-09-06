import React, { useEffect, useState } from 'react';

import {
    FLAGS,
    FlagDefinition,
    HarnessFlags,
    SIZE_SET_KEYS,
    buildQuery,
    flagField,
    flagsByGroup,
} from './flags';
import { LAYOUTS } from './layouts';
import { FIXTURES } from '../fixtures/catalog';


export interface SetupProperties {
    flags: HarnessFlags;
    /** a live or remount change (the URL is updated in place) */
    onChange: (flags: HarnessFlags) => void;
}

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const buttonStyle = (active: boolean, color = '#4da3ff'): React.CSSProperties => ({
    padding: '5px 9px', fontSize: 11, letterSpacing: '0.08em', fontFamily: mono,
    cursor: 'pointer', borderRadius: 4,
    border: '1px solid ' + (active ? color : '#ffffff22'),
    background: active ? color + '22' : '#0d0f12cc',
    color: active ? '#e6f0ff' : '#aab2bd',
});

const labelStyle: React.CSSProperties = { fontSize: 10, letterSpacing: '0.14em', color: '#6b7480', margin: '14px 0 6px' };

/** Where the panel (and its button) sit: a corner, so it can be moved off whatever is being debugged. */
interface PanelPosition {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
}
const POSITION_KEY = 'rt-setup-position';
const readPosition = (): PanelPosition => {
    try {
        const stored = JSON.parse(localStorage.getItem(POSITION_KEY) || 'null');
        if (stored && (stored.vertical === 'top' || stored.vertical === 'bottom') && (stored.horizontal === 'left' || stored.horizontal === 'right')) {
            return stored;
        }
    } catch {
        // no storage: the default corner
    }
    return { vertical: 'top', horizontal: 'left' };
};

/**
 * THE SETUP PANEL: one button at the top-left that expands into every option of the harness —
 * the fixtures of the catalog, the layout (live), the plane set and sizes (a remount), and every
 * startup flag of the registry (a reload). The URL is the fixture: each change rewrites the query.
 */
const Setup: React.FC<SetupProperties> = ({ flags, onChange }) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<PanelPosition>(readPosition);
    useEffect(() => {
        try {
            localStorage.setItem(POSITION_KEY, JSON.stringify(position));
        } catch {
            // no storage: the corner lasts for the page
        }
    }, [position]);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const navigate = (next: HarnessFlags) => {
        location.assign('/' + buildQuery(next));
    };
    const apply = (flag: FlagDefinition | undefined, next: HarnessFlags) => {
        if (!flag || flag.apply === 'reload') {
            navigate(next);
            return;
        }
        history.replaceState(null, '', '/' + buildQuery(next));
        onChange(next);
    };
    const set = (key: string, value: unknown) => {
        const flag = FLAGS.find((entry) => entry.key === key);
        const next = { ...flags, [flag ? flagField(flag) : key]: value } as HarnessFlags;
        apply(flag, next);
    };

    const stress = !!flags.planes;
    const summary = `SETUP · ${stress ? `stress ${flags.planes}` : flags.layout}${flags.sizes !== 'default' ? ' · ' + flags.sizes : ''}${flags.fixture ? ' · ' + flags.fixture : ''}`;

    const control = (flag: FlagDefinition) => {
        const field = flagField(flag);
        const value = flags[field];
        const id = 'rt-flag-' + flag.key;
        const common = { 'data-rt-flag': flag.key, id, title: flag.description + ' — ' + flag.exercises };
        if (flag.type === 'boolean') {
            return (
                <label key={flag.key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#aab2bd', padding: '2px 0' }} title={common.title}>
                    <input type="checkbox" checked={!!value} onChange={(event) => set(flag.key, event.target.checked)} data-rt-flag={flag.key} id={id} />
                    <span style={{ color: value ? '#e6e8ea' : '#aab2bd' }}>{flag.key}</span>
                    <span style={{ color: '#5b6470', marginLeft: 'auto', fontSize: 10 }}>{flag.apply}</span>
                </label>
            );
        }
        if (flag.type === 'enum') {
            return (
                <label key={flag.key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#aab2bd', padding: '2px 0' }} title={common.title}>
                    <span style={{ minWidth: 110 }}>{flag.key}</span>
                    <select value={(value as string) ?? ''} onChange={(event) => set(flag.key, event.target.value || undefined)} data-rt-flag={flag.key} id={id} style={{ fontFamily: mono, fontSize: 11, background: '#0d0f12', color: '#e6e8ea', border: '1px solid #ffffff22', borderRadius: 4, padding: '2px 4px', flex: 1 }}>
                        <option value="">{flag.default ? String(flag.default) : '—'}</option>
                        {(flag.values ?? []).filter((option) => option !== flag.default).map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                </label>
            );
        }
        return (
            <label key={flag.key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#aab2bd', padding: '2px 0' }} title={common.title}>
                <span style={{ minWidth: 110 }}>{flag.key}</span>
                <input
                    type={flag.type === 'number' ? 'number' : 'text'}
                    defaultValue={value === undefined ? '' : String(value)}
                    placeholder={flag.type === 'number' ? 'n' : 'text'}
                    onKeyDown={(event) => {
                        if (event.key !== 'Enter') return;
                        const raw = (event.target as HTMLInputElement).value.trim();
                        set(flag.key, raw === '' ? undefined : (flag.type === 'number' ? Number(raw) : raw));
                    }}
                    onBlur={(event) => {
                        const raw = event.target.value.trim();
                        const current = value === undefined ? '' : String(value);
                        if (raw !== current) set(flag.key, raw === '' ? undefined : (flag.type === 'number' ? Number(raw) : raw));
                    }}
                    data-rt-flag={flag.key}
                    id={id}
                    style={{ fontFamily: mono, fontSize: 11, background: '#0d0f12', color: '#e6e8ea', border: '1px solid #ffffff22', borderRadius: 4, padding: '2px 6px', flex: 1, width: 90 }}
                />
            </label>
        );
    };

    const groups = flagsByGroup();
    const skip = new Set(['layout', 'planes', 'sizes', 'persist', 'fixture', 'gallery']);

    return (
        <div
            style={{ position: 'fixed', [position.vertical]: 12, [position.horizontal]: 12, zIndex: 9999, fontFamily: mono }}
            data-rt-setup-position={position.vertical + '-' + position.horizontal}
        >
            <button
                type="button"
                data-rt-setup
                aria-expanded={open}
                aria-controls="rt-setup-panel"
                onClick={() => setOpen((value) => !value)}
                style={{ ...buttonStyle(open), height: 26, padding: '0 10px' }}
                title="Every option of the harness (the URL is the fixture)"
            >
                {summary}
            </button>

            {open && (
                <div
                    id="rt-setup-panel"
                    data-rt-setup-panel
                    style={{
                        position: 'absolute', [position.vertical]: 32, [position.horizontal]: 0, width: 380, maxHeight: 'calc(100vh - 60px)', overflow: 'auto',
                        background: '#0d0f12f2', border: '1px solid #ffffff22', borderRadius: 6, padding: '10px 14px 14px',
                        boxShadow: '0 18px 50px -12px #000c', color: '#e6e8ea',
                    }}
                >
                    <div style={{ ...labelStyle, marginTop: 4 }}>PANEL · corner</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} title="move the panel off whatever is being debugged (remembered)">
                        <button type="button" onClick={() => setPosition((current) => ({ ...current, vertical: 'top' }))} style={buttonStyle(position.vertical === 'top')} data-rt-setup-corner="top">▲ TOP</button>
                        <button type="button" onClick={() => setPosition((current) => ({ ...current, vertical: 'bottom' }))} style={buttonStyle(position.vertical === 'bottom')} data-rt-setup-corner="bottom">▼ BOTTOM</button>
                        <button type="button" onClick={() => setPosition((current) => ({ ...current, horizontal: 'left' }))} style={buttonStyle(position.horizontal === 'left')} data-rt-setup-corner="left">◀ LEFT</button>
                        <button type="button" onClick={() => setPosition((current) => ({ ...current, horizontal: 'right' }))} style={buttonStyle(position.horizontal === 'right')} data-rt-setup-corner="right">▶ RIGHT</button>
                    </div>

                    <div style={labelStyle}>FIXTURES</div>
                    <select
                        value={flags.fixture ?? ''}
                        onChange={(event) => { const name = event.target.value; location.assign(name ? '/?fixture=' + encodeURIComponent(name) : '/'); }}
                        data-rt-fixture
                        style={{ fontFamily: mono, fontSize: 11, background: '#0d0f12', color: '#e6e8ea', border: '1px solid #ffffff22', borderRadius: 4, padding: '4px 6px', width: '100%' }}
                    >
                        <option value="">— none (the flags below) —</option>
                        {FIXTURES.map((fixture) => <option key={fixture.name} value={fixture.name}>{fixture.name} · {fixture.title}</option>)}
                    </select>
                    {flags.fixture && (
                        <div style={{ fontSize: 10, color: '#8a93a0', marginTop: 6 }}>{FIXTURES.find((fixture) => fixture.name === flags.fixture)?.description}</div>
                    )}

                    <div style={labelStyle}>LAYOUT · live</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {LAYOUTS.map((layout) => (
                            <button
                                key={layout.key}
                                type="button"
                                onClick={() => apply(FLAGS.find((entry) => entry.key === 'layout'), { ...flags, layout: layout.key, planes: undefined })}
                                style={buttonStyle(!stress && layout.key === flags.layout)}
                                data-rt-layout={layout.key}
                            >
                                {layout.label}
                            </button>
                        ))}
                    </div>

                    <div style={labelStyle}>PLANES · remount</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => set('planes', undefined)} style={buttonStyle(!stress)} data-rt-planes="base">BASE · 5</button>
                        <button type="button" onClick={() => set('planes', flags.planes || 40)} style={buttonStyle(stress, '#ff7b72')} data-rt-planes="stress">STRESS</button>
                        <input
                            type="number"
                            defaultValue={flags.planes ?? 40}
                            min={1}
                            onKeyDown={(event) => { if (event.key === 'Enter') set('planes', Number((event.target as HTMLInputElement).value) || 40); }}
                            data-rt-flag="planes"
                            title="the stress count (Enter applies)"
                            style={{ fontFamily: mono, fontSize: 11, background: '#0d0f12', color: '#e6e8ea', border: '1px solid #ffffff22', borderRadius: 4, padding: '2px 6px', width: 60 }}
                        />
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: '#aab2bd' }}>
                            sizes
                            <select value={flags.sizes} onChange={(event) => set('sizes', event.target.value)} data-rt-flag="sizes" style={{ fontFamily: mono, fontSize: 11, background: '#0d0f12', color: '#e6e8ea', border: '1px solid #ffffff22', borderRadius: 4, padding: '2px 4px' }}>
                                {SIZE_SET_KEYS.map((key) => <option key={key} value={key}>{key}</option>)}
                            </select>
                        </label>
                        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: flags.persist ? '#bff7c4' : '#aab2bd' }} title="persist the space to localStorage; a reload restores it">
                            <input type="checkbox" checked={flags.persist} onChange={(event) => set('persist', event.target.checked)} data-rt-flag="persist" />
                            PERSIST
                        </label>
                    </div>

                    {[...groups.entries()].map(([group, entries]) => {
                        const shown = entries.filter((flag) => !skip.has(flag.key));
                        if (shown.length === 0) return null;
                        return (
                            <div key={group}>
                                <div style={labelStyle}>{group.toUpperCase()} · reload</div>
                                {shown.map(control)}
                            </div>
                        );
                    })}

                    <div style={labelStyle}>ACTIONS</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => { navigator.clipboard?.writeText(location.href); }} style={buttonStyle(false)} data-rt-action="copy" title="copy this state as a link">COPY LINK</button>
                        <button type="button" onClick={() => location.assign('/')} style={buttonStyle(false)} data-rt-action="reset" title="every flag off">RESET</button>
                        <button type="button" onClick={() => location.assign('/?gallery=1')} style={buttonStyle(false)} data-rt-action="gallery" title="every fixture on one page">GALLERY</button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Setup;
