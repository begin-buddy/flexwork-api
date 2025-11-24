// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    // Function 타입 허용 설정
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'warn',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // 개발자 편의성 우선 설정 (nestjs-jsonapi 스타일)
      '@typescript-eslint/no-explicit-any': 'warn', // any 타입 경고만
      '@typescript-eslint/no-unsafe-assignment': 'warn', // unsafe 할당 경고만
      '@typescript-eslint/no-unsafe-member-access': 'warn', // unsafe 멤버 접근 경고만
      '@typescript-eslint/no-unsafe-call': 'warn', // unsafe 호출 경고만
      '@typescript-eslint/no-unsafe-return': 'warn', // unsafe 반환 경고만
      '@typescript-eslint/no-unsafe-argument': 'warn', // unsafe 인자 경고만
      '@typescript-eslint/await-thenable': 'warn', // await 오용 경고만
      '@typescript-eslint/no-floating-promises': 'warn', // floating promise 경고만
      '@typescript-eslint/require-await': 'warn', // 불필요한 async 경고만
      '@typescript-eslint/no-unused-vars': [
        'warn', // error에서 warn으로 변경
        {
          argsIgnorePattern: '^_', // _ 접두사 허용
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_', // catch된 에러도 _ 허용
        },
      ],
      'no-console': 'warn', // console.log 경고만 (테스트 제외)
      '@typescript-eslint/restrict-template-expressions': 'off', // 템플릿 리터럴 허용
      '@typescript-eslint/no-base-to-string': 'warn', // toString 경고만
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
