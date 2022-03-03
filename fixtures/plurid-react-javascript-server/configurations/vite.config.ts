import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';



process.env.PLURID_LIVE_SERVER = 'true';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        react(),
    ],
    envDir: './environment',
    define: {
        'process.env': process.env,
    },
    publicDir: './source/public',
});
