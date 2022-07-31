module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "jsdoc",
    "prefer-arrow",
    "simple-import-sort",
    "prettier",
    "plugin:svelte/prettier",
  ],
  extends: [
    "prettier"
  ],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-definitions": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true
      },
    ],
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          accessors: "explicit",
          constructors: "off",
          parameterProperties: "explicit",
        },
      },
    ],
    "@typescript-eslint/member-ordering": [
      "error",
      {
        default: [
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "public-static-method",
          "protected-static-method",
          "private-static-method",
          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "constructor",
          "public-instance-method",
          "protected-instance-method",
          "private-instance-method",
        ],
      },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      {
        selector: "typeLike",
        format: ["PascalCase"]
      },
      {
        selector: "enumMember",
        format: ["PascalCase"]
      },
    ],
    // "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-extraneous-class": "error",
    //"@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-this-alias": ["error", {
      allowDestructuring: true
    }],
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/quotes": ["error", "single", {
      avoidEscape: true
    }],
    "arrow-body-style": ["error", "as-needed"],
    "constructor-super": "error",
    curly: ["error", "multi-line"],
    eqeqeq: "error",
    "import/no-duplicates": "error",
    "jsdoc/check-alignment": "error",
    "new-parens": "error",
    "no-caller": "error",
    "no-cond-assign": ["error", "always"],
    "no-debugger": "error",
    "no-duplicate-case": "error",
    "no-else-return": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-fallthrough": "error",
    "no-new-wrappers": "error",
    "no-param-reassign": "error",
    "no-restricted-globals": [
      "error",
      "length",
      "name",
      {
        name: "isFinite",
        message: "Use the more strict Number.isFinite.",
      },
      {
        name: "isNaN",
        message: "Use the more strict Number.isNaN.",
      },
    ],
    "no-restricted-properties": [
      "error",
      {
        property: "bind",
        message: "Native? Use an arrow function. jQuery? Use .on()",
      },
    ],
    "no-return-await": "error",
    "no-self-compare": "error",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "no-sequences": "error",
    "no-sparse-arrays": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-unsafe-finally": "error",
    "no-var": "error",
    "no-with": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-arrow/prefer-arrow-functions": "error",
    "prefer-const": ["error", {
      destructuring: "all"
    }],
    "prefer-object-spread": "error",
    "prefer-rest-params": "error",
    radix: "error",
    "simple-import-sort/sort": [
      "error",
      {
        groups: [
          // Side effect imports (e.g. `import 'foo';`)
          ["^\\u0000"],
          // Third-party code
          [
            "^(@susisu/mte-kernel,obsidian)(/.*|$)",
          ],
          // Our intra-package imports
          ["(?<!\\.scss)$"],
        ],
      },
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          markers: ["#region", "#endregion"]
        },
        block: {
          balanced: true
        },
      },
    ],
    "use-isnan": "error",
    "linebreak-style": ["error", "windows"],
  },
};