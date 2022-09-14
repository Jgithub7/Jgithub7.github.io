var exports = {},
    _dewExec = false;

var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;

export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  System.register(['./cesium/cesium-imports'], function (exports_1, context_1) {
    "use strict";

    var __moduleName = context_1 && context_1.id;

    var cesium_imports_1;
    var TimerService, lastTime;

    function requestAnimationFramePoly(callback) {
      var currTime = Date.now();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    }

    return {
      setters: [function (cesium_imports_1_1) {
        cesium_imports_1 = cesium_imports_1_1;
      }],
      execute: function () {
        /**
         * Provides timer service
         */
        TimerService = function () {
          function TimerService() {
            (this || _global).frameNumbers = new WeakMap();
          }
          /**
           * Request that the callback function be called for the next frame.
           *
           * @param callback function
           */


          TimerService.prototype.requestFrame = function (callback) {
            var _this = this || _global;

            if (typeof requestAnimationFrame !== 'undefined' && typeof performance !== 'undefined') {
              (this || _global).navigationStartDate = (this || _global).navigationStartDate || cesium_imports_1.JulianDate.fromDate(new Date(performance.timing.navigationStart));
              requestAnimationFrame(function (time) {
                var frameTime = cesium_imports_1.JulianDate.addSeconds(_this.navigationStartDate, time / 1000, new cesium_imports_1.JulianDate(0, 0));
                callback(frameTime, _this.getNextFrameNumber(callback));
              });
            } else {
              requestAnimationFramePoly(function (time) {
                var frameTime = cesium_imports_1.JulianDate.fromDate(new Date(time));
                callback(frameTime, _this.getNextFrameNumber(callback));
              });
            }
          };

          TimerService.prototype.getNextFrameNumber = function (callback) {
            var frameNumber = (this || _global).frameNumbers.get(callback) || 0;

            (this || _global).frameNumbers.set(callback, frameNumber + 1);

            return frameNumber;
          };

          return TimerService;
        }();

        exports_1("TimerService", TimerService);
        lastTime = 0;
      }
    };
  });
  return exports;
}