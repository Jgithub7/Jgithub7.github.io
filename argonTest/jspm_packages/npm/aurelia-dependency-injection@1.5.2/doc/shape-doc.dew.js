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
  const apiJsonPath = path.resolve(import.meta.url.startsWith('file:') ? decodeURI(import.meta.url.slice(0, import.meta.url.lastIndexOf('/')).slice(7 + (typeof process !== 'undefined' && process.platform === 'win32'))) : new URL(import.meta.url.slice(0, import.meta.url.lastIndexOf('/'))).pathname, './api.json');

  try {
    const packageName = _nodeRequire(packageJsonPath).name;

    let json = _nodeRequire(apiJsonPath).children[0];

    json = {
      name: packageName,
      children: json.children,
      groups: json.groups
    };
    const str = JSON.stringify(json) + '\n';
    fs.writeFileSync(apiJsonPath, str);
    console.log('Shaped the doc/api.json file.');
  } catch (e) {
    console.error('Unable to shape the api.json. The file probably has an incorrect format or doesn\'t exist.');
    console.error(e.message);
  }

  return exports;
}