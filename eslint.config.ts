import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import pluginOxlint from 'eslint-plugin-oxlint';
import stylistic from '@stylistic/eslint-plugin';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn'
      ],
      '@stylistic/semi': ['warn', 'always'],
      "vue/multiline-html-element-content-newline": "error",
      "vue/no-unused-vars": "warn",
      "vue/html-indent": ["error", 2],
      "vue/max-attributes-per-line": ["error", {
        singleline: 1,
        multiline: 1
      }],
    }
  }
);
