import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

// Type-aware lint gate. Project rule (AGENTS.md): no deprecated APIs or members.
export default defineConfig([
  globalIgnores(['dist/', 'coverage/', '.agents/', '.claude/', '.idea/']),
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js', 'scripts/*.mjs'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
]);
