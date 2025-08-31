import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [
      ".next",
  "src/generated/**", // ignore Prisma client and runtime types
  // Ignore legacy/sports-era modules during refactor
  "src/actions/**",
  "src/components/admin/**",
  "src/components/dashboard/**",
  "src/components/venue/**",
  "src/app/admin/**",
  "src/app/dashboard/**",
  "src/app/api/profile/**",
  "src/app/api/bookings/**",
  "src/app/api/debug/**",
  "src/app/api/webhooks/**",
  "src/lib/admin-utils.ts",
  "src/lib/auth-utils.ts",
  "src/lib/reservation-cleanup.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
  "@typescript-eslint/restrict-template-expressions": "off",
  // General TS style relaxations for app code
  "@typescript-eslint/consistent-indexed-object-style": "off",
  "@typescript-eslint/prefer-optional-chain": "off",
  "@typescript-eslint/no-floating-promises": "off",
  "@typescript-eslint/no-unnecessary-type-assertion": "warn",
  "react/no-unescaped-entities": "off",
  "@next/next/no-html-link-for-pages": "off",
  "@next/next/no-img-element": "off",
  "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
