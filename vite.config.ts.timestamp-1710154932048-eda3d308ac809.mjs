// vite.config.ts
import { defineConfig } from "file:///home/admin123/nostr-opinion-plugin/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/admin123/nostr-opinion-plugin/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
var vite_config_default = defineConfig({
  plugins: [
    svelte({
      emitCss: false,
      compilerOptions: {
        customElement: true,
        css: "injected"
      }
    })
  ],
  build: {
    target: "es2018",
    lib: {
      entry: "./src/main.ts",
      name: "nostrOpinion",
      formats: ["es"]
    }
  },
  define: {}
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hZG1pbjEyMy9ub3N0ci1vcGluaW9uLXBsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvYWRtaW4xMjMvbm9zdHItb3Bpbmlvbi1wbHVnaW4vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvYWRtaW4xMjMvbm9zdHItb3Bpbmlvbi1wbHVnaW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0cGx1Z2luczogW1xuXHRcdHN2ZWx0ZSh7XG5cdFx0XHRlbWl0Q3NzOiBmYWxzZSxcblx0XHRcdGNvbXBpbGVyT3B0aW9uczoge1xuXHRcdFx0XHRjdXN0b21FbGVtZW50OiB0cnVlLFxuXHRcdFx0XHRjc3M6ICdpbmplY3RlZCdcblx0XHRcdH1cblx0XHR9KVxuXHRdLFxuXHRidWlsZDoge1xuXHRcdHRhcmdldDogJ2VzMjAxOCcsXG5cdFx0bGliOiB7XG5cdFx0XHRlbnRyeTogJy4vc3JjL21haW4udHMnLFxuXHRcdFx0bmFtZTogJ25vc3RyT3BpbmlvbicsXG5cdFx0XHRmb3JtYXRzOiBbJ2VzJ11cblx0XHR9XG5cdH0sXG5cdGRlZmluZToge31cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUixTQUFTLG9CQUFvQjtBQUN4VCxTQUFTLGNBQWM7QUFHdkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsaUJBQWlCO0FBQUEsUUFDaEIsZUFBZTtBQUFBLFFBQ2YsS0FBSztBQUFBLE1BQ047QUFBQSxJQUNELENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixLQUFLO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsSUFBSTtBQUFBLElBQ2Y7QUFBQSxFQUNEO0FBQUEsRUFDQSxRQUFRLENBQUM7QUFDVixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
