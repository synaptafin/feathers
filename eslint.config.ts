import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import stylistic from '@stylistic/eslint-plugin';

export default createConfigForNuxt({
  features: {
    tooling: true,
  },
}).append({
  plugins: {
    '@stylistic': stylistic
  },
  rules: {
    // Global
    quotes: ['error', 'single'],
    'quote-props': ['warn', 'as-needed'],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@stylistic/semi':['warn', 'always'],
    'prefer-const': 'warn',


    // Vue
    'vue/multi-word-component-names': 0,
    'vue/max-attributes-per-line': 'off',
    'vue/no-v-html': 0,
    'vue/html-indent': ['error', 2],
    'vue/script-indent': ['error', 2, { baseIndent: 0 }],
  },
});
