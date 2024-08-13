import { defineConfig } from 'astro/config';
import auth from "auth-astro";
import node from '@astrojs/node';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [auth(), tailwind()],
  output: 'server',
  adapter: node({
    mode: "standalone"
  }),
  vite: {
      ssr: {
        noExternal: ['path-to-regexp'],
      },
    },
});
