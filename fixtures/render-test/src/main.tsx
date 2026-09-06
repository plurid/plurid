import React from 'react';
import { createRoot } from 'react-dom/client';
import * as PR from '@plurid/plurid-react';
import App from './App';
import RouterDemo from './RouterDemo';
import Gallery from './harness/Gallery';
import { readFlags } from './harness/flags';
import { fixtureByName } from './fixtures/catalog';

// The registry decides (`?router=1` → the PluridRouterBrowser SPA demo; `?gallery=1` → every
// fixture on one page; default = the CAD harness) — the same reader as every other flag.
const flags = readFlags(location.search, (name) => fixtureByName(name)?.query);
// `?gallery=1` is the fixtures sheet; `?gallery=looks` the twelve looks (the flag is a boolean, so the word is read here)
const gallery = flags.gallery || new URLSearchParams(window.location.search).get('gallery') === 'looks';
const Root = flags.router ? RouterDemo : (gallery ? Gallery : App);

// Boot diagnostics only with `?debug=1`: a quiet console is the harness's normal state.
if (flags.debug) {
  console.log('[RT] plurid-react export count =', Object.keys(PR).length,
    '| PluridApplication =', typeof (PR as any).PluridApplication,
    '| SPACE_LAYOUT =', typeof (PR as any).SPACE_LAYOUT);
}

class EB extends React.Component<any, any> {
  state = { err: null as any };
  static getDerivedStateFromError(e: any) { return { err: e }; }
  componentDidCatch(e: any) { console.error('[RT] BOUNDARY caught:', e?.message, '\n', (e?.stack || '').split('\n').slice(0, 8).join('\n')); }
  render() {
    return this.state.err
      ? React.createElement('pre', { style: { color: '#f55', padding: 20, whiteSpace: 'pre-wrap', font: '12px monospace' } }, String(this.state.err?.stack || this.state.err))
      : this.props.children;
  }
}
const el = document.getElementById('plurid-app')!;
try {
  createRoot(el).render(React.createElement(EB, null, React.createElement(Root)));
  if (flags.debug) {
    console.log('[RT] render() returned without throwing');
  }
} catch (e: any) {
  console.error('[RT] SYNC render threw:', e?.message);
}
