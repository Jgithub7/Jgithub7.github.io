import { dew as _aureliaPalDewDew } from "./aurelia-pal.dew.js";
var exports = {},
    _dewExec = false;
export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _aureliaPal = _aureliaPalDewDew();

  Object.keys(_aureliaPal).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function get() {
        return _aureliaPal[key];
      }
    });
  });
  return exports;
}