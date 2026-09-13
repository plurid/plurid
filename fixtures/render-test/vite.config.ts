import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [react()],
    server: {
        /**
         * The VISUAL baselines are generated and compared inside the pinned Playwright container
         * (`e2e/visual.spec.ts`), which reaches this dev server through the host gateway. Vite
         * refuses a Host header it does not know, so the gateway's name is allowed here — it is a
         * test harness, served on localhost, never deployed.
         */
        allowedHosts: ['host.docker.internal'],
    },
});
