import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: {
    "https://teebloc.hasura.app/v1/graphql": {
      headers: {
        "x-hasura-admin-secret":
          "JYe23B2n2UdEMWcDx2J4oNRfhE46LCC8jNJGug5YAj2Q8DxrEH86QeM9heJzLKja",
      },
    },
  },
  // this assumes that all your source files are in a top-level `src/` directory - you might need to adjust this to your file structure
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
