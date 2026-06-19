import React from 'react';
import { createRoot } from 'react-dom/client';
import * as PR from '@plurid/plurid-react';
import App from './App';
import RouterDemo from './RouterDemo';

// `?router` → exercise PluridRouterBrowser SPA navigation (P3-3); default = the CAD harness.
const Root = /[?&]router/.test(location.search) ? RouterDemo : App;

console.log('[RT] plurid-react export count =', Object.keys(PR).length,
  '| PluridApplication =', typeof (PR as any).PluridApplication,
  '| SPACE_LAYOUT =', typeof (PR as any).SPACE_LAYOUT);

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
  console.log('[RT] render() returned without throwing');
} catch (e: any) {
  console.error('[RT] SYNC render threw:', e?.message);
}
