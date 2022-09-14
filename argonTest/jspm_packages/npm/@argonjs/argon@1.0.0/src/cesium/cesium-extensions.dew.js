var exports = {},
    _dewExec = false;

var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;

export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  // Add functionality for keeping a moving window of samples per SampledProperty,
  // so that the data doesn't accumulate indefinitely
  System.register(['./cesium-imports'], function (exports_1, context_1) {
    "use strict";

    var __moduleName = context_1 && context_1.id;

    var cesium_imports_1;
    var after;

    function removeBeforeDate(property, time) {
      var times = property._times;
      var index = ~cesium_imports_1.binarySearch(times, time, cesium_imports_1.JulianDate.compare);

      if (index > 0) {
        times.splice(0, index);

        property._values.splice(0, index * property._innerType.packedLength);

        property._updateTableLength = true;

        property._definitionChanged.raiseEvent(property);
      }
    }

    function removeOldSamples(property, maxNumSamples) {
      if (maxNumSamples === undefined) return;
      var removeCount = property._times.length - maxNumSamples;

      if (removeCount > 0) {
        property._times.splice(0, removeCount);

        property._values.splice(0, removeCount * property._innerType.packedLength);

        property._updateTableLength = true;
      }
    }

    return {
      setters: [function (cesium_imports_1_1) {
        cesium_imports_1 = cesium_imports_1_1;
      }],
      execute: function () {
        after = function (fn, after) {
          return function () {
            var result = fn.apply(this || _global, arguments);
            after.call(this || _global, result);
            return result;
          };
        };

        cesium_imports_1.SampledProperty.prototype.removeSamplesBeforeDate = function (time) {
          removeBeforeDate(this || _global, time);
        };

        cesium_imports_1.SampledPositionProperty.prototype.removeSamplesBeforeDate = function (time) {
          removeBeforeDate((this || _global)._property, time);
        };

        cesium_imports_1.SampledProperty.prototype.addSample = after(cesium_imports_1.SampledProperty.prototype.addSample, function () {
          removeOldSamples(this || _global, (this || _global).maxNumSamples);
        });
        cesium_imports_1.SampledProperty.prototype.addSamples = after(cesium_imports_1.SampledProperty.prototype.addSamples, function () {
          removeOldSamples(this || _global, (this || _global).maxNumSamples);
        });
        cesium_imports_1.SampledProperty.prototype.addSamplesPackedArray = after(cesium_imports_1.SampledProperty.prototype.addSamplesPackedArray, function () {
          removeOldSamples(this || _global, (this || _global).maxNumSamples);
        });
        cesium_imports_1.SampledPositionProperty.prototype.addSample = after(cesium_imports_1.SampledPositionProperty.prototype.addSample, function () {
          removeOldSamples((this || _global)._property, (this || _global).maxNumSamples);
        });
        cesium_imports_1.SampledPositionProperty.prototype.addSamples = after(cesium_imports_1.SampledPositionProperty.prototype.addSamples, function () {
          removeOldSamples((this || _global)._property, (this || _global).maxNumSamples);
        });
        cesium_imports_1.SampledPositionProperty.prototype.addSamplesPackedArray = after(cesium_imports_1.SampledPositionProperty.prototype.addSamplesPackedArray, function () {
          removeOldSamples((this || _global)._property, (this || _global).maxNumSamples);
        });
      }
    };
  });
  return exports;
}