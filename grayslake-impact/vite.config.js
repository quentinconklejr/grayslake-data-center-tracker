import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { readFileSync } from 'node:fs'

// Vite parses .json natively but not .geojson. The parcel data keeps the
// .geojson extension deliberately — it is a committed public-record artifact
// that should be recognisable and openable as GeoJSON on its own, not just an
// app implementation detail. This teaches the bundler to inline it.
function geojson() {
  return {
    name: 'geojson-loader',
    transform(_code, id) {
      if (!id.endsWith('.geojson')) return null
      const json = JSON.parse(readFileSync(id.split('?')[0], 'utf8'))
      return { code: `export default ${JSON.stringify(json)}`, map: null }
    },
  }
}

export default defineConfig({
  plugins: [react(), geojson()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
