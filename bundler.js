// bundler.js
const ENTRY = "./src/main.js";

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");
const uglifyjs = require("uglify-js");

const moduleAnalyzer = (filename) => {
  const content = fs.readFileSync(filename, "utf-8");
  const ast = parser.parse(content, {
    sourceType: "module",
  });
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const newFile = "./" + path.join(dirname, node.source.value);
      dependencies[node.source.value] = newFile;
    },
  });
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });
  return {
    filename,
    dependencies,
    code,
  };
};

const buildDependencyGraph = (entry) => {
  const entryModule = moduleAnalyzer(entry);
  const graphArr = [entryModule];
  for (let i = 0; i < graphArr.length; i++) {
    const item = graphArr[i];
    const { dependencies } = item;
    console.log(111, dependencies);
    if (dependencies) {
      for (let j in dependencies) {
        graphArr.push(moduleAnalyzer(dependencies[j]));
      }
    }
  }
  const graph = {};
  graphArr.forEach((item) => {
    console.log(item.code);
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code,
    };
  });
  console.log(graph, "graph");
  return graph;
};

const generateCode = (entry) => {
  const graph = JSON.stringify(buildDependencyGraph(entry));
  return `(function(graph) {
    function require(module){
      function newRequire(relativePath){
        return require(graph[module].dependencies[relativePath])
      }
      var exports = {};
      (function(require, exports, code){
        eval(code)
      })(newRequire, exports, graph[module].code)
      return exports
    }
    require('${entry}')
  })(${graph})`;
};
const code = uglifyjs.minify(generateCode(ENTRY)).code;

if (!fs.existsSync("./dist")) {
  fs.mkdir("./dist", () => {});
}

fs.writeFileSync("./dist/bundle.js", code);
