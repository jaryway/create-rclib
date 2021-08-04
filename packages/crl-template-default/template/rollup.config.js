import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
const NpmImportPlugin = require("less-plugin-npm-import");
const rucksack = require("rucksack-css");
const autoprefixer = require("autoprefixer");

const pkg = require("./package.json");
const babelRuntimeVersion = pkg.dependencies["@babel/runtime"].replace(
  /^[^0-9]*/,
  ""
);

const babelPlugin = (libraryDirectory = "lib") => {
  return babel({
    babelHelpers: "runtime",
    extensions: [".tsx", ".ts", ".js"],
    plugins: [
      ["@babel/plugin-transform-runtime", { version: babelRuntimeVersion }],
      ["import", { libraryName: "antd", libraryDirectory, style: true }, "ant"],
      [
        "import",
        {
          libraryName: "@ant-design/icons",
          libraryDirectory: `${libraryDirectory}/icons`,
          camel2DashComponentName: false,
        },
        "antdicons",
      ],
    ],
  });
};

const plugins = [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({ clean: true }),
  json(),
  postcss({
    extensions: [".css", ".less"],
    use: {
      less: {
        javascriptEnabled: true,
        plugins: [new NpmImportPlugin({ prefix: "~" })], // 解决 less @import 问题
      },
    },
    plugins: [rucksack(), autoprefixer()],
  }),
];

export default [
  {
    input: "src/index.tsx",
    output: {
      dir: "lib",
      format: "cjs",
      exports: "auto",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [...plugins, babelPlugin()],
  },
  {
    input: "src/index.tsx",
    output: {
      dir: "es",
      format: "esm",
      exports: "auto",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [...plugins, babelPlugin("es")],
  },
];
