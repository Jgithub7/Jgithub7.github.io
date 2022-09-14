import _path from "path";
import _fs from "fs";
import _process from "process";
import _module from "module";
var exports = {},
    _dewExec = false;
export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;

  var _nodeRequire = function () {
    var Module = _module.Module;

    if (Module) {
      var m = new Module("");
      m.filename = import.meta.url.substr(7 + (Module._nodeModulePaths("/")[0].length > 13));
      m.paths = Module._nodeModulePaths(m.filename.substr(0, m.filename.lastIndexOf("/")));
      return m.require.bind(m);
    } else {
      return function _nodeRequire(id) {
        var e = new Error("Cannot find module '" + id + "'");
        e.code = "MODULE_NOT_FOUND";
        throw e;
      };
    }
  }();

  var process = _process;
  const path = _path;
  const fs = _fs;
  const packageJsonPath = path.resolve(import.meta.url.startsWith('file:') ? decodeURI(import.meta.url.slice(0, import.meta.url.lastIndexOf('/')).slice(7 + (typeof process !== 'undefined' && process.platform === 'win32'))) : new URL(import.meta.url.slice(0, import.meta.url.lastIndexOf('/'))).pathname, '../package.json');

  try {
    const packageName = _nodeRequire(packageJsonPath).name;

    const dtsPath = path.resolve(import.meta.url.startsWith('file:') ? decodeURI(import.meta.url.slice(0, import.meta.url.lastIndexOf('/')).slice(7 + (typeof process !== 'undefined' && process.platform === 'win32'))) : new URL(import.meta.url.slice(0, import.meta.url.lastIndexOf('/'))).pathname, `../dist/${packageName}.d.ts`);
    let defs = fs.readFileSync(dtsPath).toString(); // aggregate external imports

    const packages = {};
    const importRegex = /^\s*import\s+\{([^}]+)\}\s*from\s*'([\w|-]+)'/gm;
    let importMatch = importRegex.exec(defs);

    while (importMatch) {
      const packageName = importMatch[2];
      const imports = packages[packageName] || (packages[packageName] = []);
      const bindings = importMatch[1].split(',').map(x => x.trim());

      for (let binding of bindings) {
        if (imports.indexOf(binding) === -1) {
          imports.push(binding);
        }
      }

      importMatch = importRegex.exec(defs);
    } // remove leading declare module


    defs = defs.replace(/^declare module ".*" \{/, ''); // remove "} declare module {"

    defs = defs.replace(/\}\r?\ndeclare module ".*" \{/g, ''); // remove closing "}"

    defs = defs.replace(/\}\r?\n$/, ''); // remove imports

    defs = defs.replace(/^\s+import.*;$/gm, ''); // remove "export *"

    defs = defs.replace(/^\s+export \*.*;$/gm, ''); // write imports

    for (let packageName in packages) {
      if (packages.hasOwnProperty(packageName)) {
        const imports = packages[packageName];
        defs = `import {${imports.sort()}} from '${packageName}';\n` + defs;
      }
    }

    fs.writeFileSync(dtsPath, defs);
    console.log(`Shaped the dist/doc-temp/${packageName}.d.ts file.`);
  } catch (e) {
    console.error(`Unable to shape the .d.ts file.`);
    console.error(e.message);
  }

  return exports;
}