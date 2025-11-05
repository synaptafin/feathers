import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

const url = process.env.BASE_URL;

export default defineNuxtConfig({

  alias: {
    server: fileURLToPath(new URL('./server', import.meta.url)),
  },

  routeRules: {
    '/': { prerender: true },
    '/linked-nodes/**': { prerender: true },
  },

  css: ['~/assets/main.css'],

  site: {
    indexable: true,
    url,
  },

  runtimeConfig: {
    public: {
      baseUrl: url,
    },
    neonPostgresqlDbHost: process.env.NEON_POSTGRESQL_DB_HOST,
    sqliteDbPath: process.env.SQLITE_DB_PATH,
    jwtSecret: process.env.JWT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },

  // Easy access to enabling sourcemaps for debugging
  sourcemap: {
    // server: true,
    // client: true
  },

  modules: [
    '@nuxt/image',
    '@stefanobartoletti/nuxt-social-share',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxt/content',  // must be after @nuxtjs/sitemap
    'nuxt-schema-org',
    '@nuxt/icon',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@nuxtjs/robots',
  ],

  devServer: {
    url: url,
  },

  fonts: {
    provider: 'bunny',
  },

  image: {
    format: ['webp'],
  },

  sitemap: {
    includeAppSources: true,
    sources: ['/api/__sitemap__/urls'],
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-reading-time': {},
          'remark-math': {},
          // 'remark-mermaidjs': {},
        },
        rehypePlugins: {
          'rehype-katex': {},
          'rehype-mermaid': {},
        },
        highlight: {
          theme: {
            default: 'catppuccin-frappe',
            // Theme used if `html.dark`
            dark: 'github-dark',
          },
          langs: [
            'json',
            'js',
            'javascript',
            'ts',
            'typescript',
            'html',
            'css',
            'vue',
            'shell',
            'bash',
            'mdc',
            'mermaid',
            'md',
            'yaml',
            'python',
            'c',
            'csharp',
            'cs',
            'cpp',
            'sql',
            'java',
            'xml',
            'scala',
            'kotlin',
          ],
        },
      },
    },
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'remove',
      },
    },
  },
  nitro: {
    // prerender: {
    //   routes: ['/api/__sitemap__/urls'],
    // },
    imports: {
      dirs: [
        fileURLToPath(new URL('./server/database/**', import.meta.url)),
        fileURLToPath(new URL('./server/services/**', import.meta.url)),
      ]
    },
  },

  hooks: {
    'nitro:init': () => console.log('nitro:init hook'),
    'app:resolve': () => console.log('app:resolve hook'),
    'imports:dirs': () => console.log('imports:dirs hook'),
    ready: () => console.log('ready hook'),
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ['hyvor-talk-comments'].includes(tag),
    },
  },

  compatibilityDate: '2025-01-01',
});
