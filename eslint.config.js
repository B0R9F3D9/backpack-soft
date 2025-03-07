import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
];
