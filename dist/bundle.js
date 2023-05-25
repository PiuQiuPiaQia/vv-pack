!(function (graph) {
  function require(module) {
    console.log(module);
    function newRequire(e) {
        console.log(e);
      return require(graph[module].dependencies[e]);
    }
    var exports = {};
    return (
      (function (require, exports, code) {
        eval(code);
      })(newRequire, exports, graph[module].code),
      exports
    );
  }
  require("./src/main.js");
})({
  "./src/main.js": {
    dependencies: { "./two.js": "./src\\two.js" },
    code: '"use strict";\n\nvar _two = require("./two.js");\nconsole.log(_two.two);',
  },
  "./src\\two.js": {
    dependencies: { "./one.js": "./src\\one.js" },
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.two = void 0;\nvar _one = require("./one.js");\nvar two = _one.one + 2;\nexports.two = two;',
  },
  "./src\\one.js": {
    dependencies: {},
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.one = void 0;\nvar one = 1;\nexports.one = one;',
  },
});
