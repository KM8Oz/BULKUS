import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePluginFonts } from 'vite-plugin-fonts'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import Pages from 'vite-plugin-pages'
// https://vitejs.dev/config/
export default defineConfig({
  build:{
    rollupOptions:{
      output:{
        minifyInternalExports: true,
      }
    }
  },
  plugins: [react(), VitePluginFonts({
    google: {
      families: ['Josefin Sans'],
    },
  }),
  Pages({
    dirs: [
      { dir: 'src/pages',  baseRoute: '/' }
    ],
    
  }),
  // viteExternalsPlugin({
  //   // value support chain, transform to window['React']['lazy']
  //   // lazy: ['React', 'lazy']
  //   // "react-transition-group":"react-transition-group",
  //   // "react-router":"react-router",
  //   // "prop-types":"prop-types"
  // })
  ]
})
