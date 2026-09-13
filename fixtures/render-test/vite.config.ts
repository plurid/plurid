import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [react()],
    /**
     * NOTE (2026-09-13): `server.allowedHosts: ['host.docker.internal']` used to live here, so the
     * pinned Playwright container could reach this dev server through the host gateway while
     * generating the `linux` visual baselines. That recipe is WRONG and the allowance is gone: a
     * plane's bar renders its full route, so the origin the harness is served from ends up inside
     * every screenshot, and 28 baselines went in reading `plurid://host.docker.internal:5273/…`
     * against a CI that renders `plurid://localhost:5273/…`. The harness must be reached at
     * `localhost:5273` — `e2e/visual.spec.ts` now refuses anything else, and Vite refusing the
     * gateway's Host header is the second lock on the same door.
     */
});
