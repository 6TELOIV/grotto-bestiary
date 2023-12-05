import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/api/v2/schema/*.graphql",
  generates: {
    "src/generated/graphql.mts": {
      plugins: ["typescript", "typescript-resolvers"]
    }
  }
};

export default config;
