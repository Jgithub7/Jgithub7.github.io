var exports = {},
    _dewExec = false;

var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;

export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  System.register(['aurelia-dependency-injection', './cesium/cesium-imports', './context', 'mobile-detect'], function (exports_1, context_1) {
    "use strict";

    var __moduleName = context_1 && context_1.id;

    var __decorate = (this || _global) && (this || _global).__decorate || function (decorators, target, key, desc) {
      var c = arguments.length,
          r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
          d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    var aurelia_dependency_injection_1, cesium_imports_1, context_2, mobile_detect_1;
    var DeviceService;
    return {
      setters: [function (aurelia_dependency_injection_1_1) {
        aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
      }, function (cesium_imports_1_1) {
        cesium_imports_1 = cesium_imports_1_1;
      }, function (context_2_1) {
        context_2 = context_2_1;
      }, function (mobile_detect_1_1) {
        mobile_detect_1 = mobile_detect_1_1;
      }],
      execute: function () {
        /**
        * Provides pose state for the device.
        */
        DeviceService = function () {
          /**
          * Initialize the DeviceService
          */
          function DeviceService(context) {
            (this || _global).locationUpdatesEnabled = true;
            (this || _global).orientationUpdatesEnabled = true;
            /**
             * An ENU coordinate frame centered at the gps location reported by this device
             */

            (this || _global).geolocationEntity = new cesium_imports_1.Entity({
              id: 'ar.device.geolocation',
              name: 'Device Geolocation'
            });
            /**
             * A frame which represents the orientation of this device relative to it's ENU coordinate frame (geolocationEntity)
             */

            (this || _global).orientationEntity = new cesium_imports_1.Entity({
              id: 'ar.device.orientation',
              name: 'Device Orientation'
            });
            /**
             * A frame which represents the pose of this device
             */

            (this || _global).entity = new cesium_imports_1.Entity({
              id: 'ar.device',
              name: 'Device'
            });
            /**
             * A frame which describes the pose of the display relative to this device
             */

            (this || _global).displayEntity = new cesium_imports_1.Entity({
              id: 'ar.device.display',
              name: 'Device Display',
              position: new cesium_imports_1.ConstantPositionProperty(cesium_imports_1.Cartesian3.ZERO, (this || _global).entity),
              orientation: new cesium_imports_1.ConstantProperty(cesium_imports_1.Quaternion.IDENTITY)
            });
            (this || _global)._scratchCartesian = new cesium_imports_1.Cartesian3();
            (this || _global)._scratchQuaternion1 = new cesium_imports_1.Quaternion();
            (this || _global)._scratchQuaternion2 = new cesium_imports_1.Quaternion();
            (this || _global)._x90Rot = cesium_imports_1.Quaternion.fromAxisAngle(cesium_imports_1.Cartesian3.UNIT_X, cesium_imports_1.CesiumMath.PI_OVER_TWO);
            (this || _global)._headingDrift = 0;
            context.wellKnownReferenceFrames.add((this || _global).geolocationEntity);
            context.wellKnownReferenceFrames.add((this || _global).orientationEntity);
            context.wellKnownReferenceFrames.add((this || _global).entity);
            context.wellKnownReferenceFrames.add((this || _global).displayEntity);

            if (typeof navigator !== 'undefined') {
              (this || _global)._mobileDetect = new mobile_detect_1.default(navigator.userAgent);
            }
          }

          DeviceService.prototype.onIdle = function () {
            if (typeof navigator === 'undefined') return;

            if (cesium_imports_1.defined((this || _global)._geolocationWatchId)) {
              navigator.geolocation.clearWatch((this || _global)._geolocationWatchId);
              (this || _global)._geolocationWatchId = undefined;
            }

            if (cesium_imports_1.defined((this || _global)._deviceorientationListener)) {
              window.removeEventListener('deviceorientation', (this || _global)._deviceorientationListener);
              (this || _global)._deviceorientationListener = undefined;
              (this || _global)._alphaOffset = undefined;
            }
          };

          DeviceService.prototype.onUpdate = function () {
            var _this = this || _global;

            if (typeof navigator !== 'undefined') {
              var interfaceOrientationProperty = (this || _global).displayEntity.orientation;
              var interfaceOrientation = cesium_imports_1.Quaternion.fromAxisAngle(cesium_imports_1.Cartesian3.UNIT_Z, (-window.orientation || 0) * cesium_imports_1.CesiumMath.RADIANS_PER_DEGREE, (this || _global)._scratchQuaternion1);

              if ((this || _global)._mobileDetect && !(this || _global)._mobileDetect.mobile()) {
                // for laptops, rotate device orientation by 90° around +X so that it 
                // corresponds to an upright display rather than the integrated keyboard
                interfaceOrientation = cesium_imports_1.Quaternion.multiply((this || _global)._x90Rot, interfaceOrientation, interfaceOrientation);
              }

              interfaceOrientationProperty.setValue(interfaceOrientation);

              if (!cesium_imports_1.defined((this || _global)._geolocationWatchId) && (this || _global).locationUpdatesEnabled) {
                (this || _global)._geolocationWatchId = navigator.geolocation.watchPosition(function (pos) {
                  if (_this.geolocationEntity.position instanceof cesium_imports_1.SampledPositionProperty === false) {
                    var sampledPostionProperty = new cesium_imports_1.SampledPositionProperty(cesium_imports_1.ReferenceFrame.FIXED);
                    sampledPostionProperty.forwardExtrapolationType = cesium_imports_1.ExtrapolationType.HOLD;
                    sampledPostionProperty.backwardExtrapolationType = cesium_imports_1.ExtrapolationType.HOLD;
                    sampledPostionProperty.maxNumSamples = 10;
                    _this.geolocationEntity.position = sampledPostionProperty;
                  }

                  var positionTime = cesium_imports_1.JulianDate.fromDate(new Date(pos.timestamp));
                  var positionECEF = cesium_imports_1.Cartesian3.fromDegrees(pos.coords.longitude, pos.coords.latitude, pos.coords.altitude || 0, undefined, _this._scratchCartesian);

                  _this.geolocationEntity.position.addSample(positionTime, positionECEF);

                  if (_this.geolocationEntity.orientation instanceof cesium_imports_1.ConstantProperty === false) {
                    _this.geolocationEntity.orientation = new cesium_imports_1.ConstantProperty();
                  }

                  var enuOrientation = cesium_imports_1.Transforms.headingPitchRollQuaternion(positionECEF, 0, 0, 0, undefined, _this._scratchQuaternion1);

                  _this.geolocationEntity.orientation.setValue(enuOrientation);
                }, function (error) {
                  console.error(error);
                }, {
                  enableHighAccuracy: true
                });
              } else if (cesium_imports_1.defined((this || _global)._geolocationWatchId) && !(this || _global).locationUpdatesEnabled) {
                navigator.geolocation.clearWatch((this || _global)._geolocationWatchId);
                (this || _global)._geolocationWatchId = undefined;
              }

              if (!cesium_imports_1.defined((this || _global)._deviceorientationListener) && (this || _global).orientationUpdatesEnabled) {
                (this || _global)._deviceorientationListener = function (e) {
                  var alphaDegrees = e.alpha;

                  if (!cesium_imports_1.defined(alphaDegrees)) {
                    return;
                  }

                  if (e.absolute) {
                    _this._alphaOffset = 0;
                  }

                  var webkitCompassHeading = e['webkitCompassHeading'];
                  var webkitCompassAccuracy = +e['webkitCompassAccuracy']; // when the phone is almost updside down, webkit flips the compass heading 
                  // (not documented anywhere, annoyingly)
                  // if (e.beta >= 130 || e.beta <= -130) webkitCompassHeading = undefined;

                  if ((!cesium_imports_1.defined(_this._alphaOffset) || Math.abs(_this._headingDrift) > 5) && cesium_imports_1.defined(webkitCompassHeading) && webkitCompassAccuracy >= 0 && webkitCompassAccuracy < 50 && webkitCompassHeading >= 0) {
                    if (!cesium_imports_1.defined(_this._alphaOffset)) {
                      _this._alphaOffset = -webkitCompassHeading;
                    } else {
                      _this._alphaOffset -= _this._headingDrift;
                    }
                  }

                  var alphaOffset = _this._alphaOffset || -webkitCompassHeading || 0; // TODO: deal with various browser quirks :\
                  // https://mobiforge.com/design-development/html5-mobile-web-device-orientation-events

                  var alpha = cesium_imports_1.CesiumMath.RADIANS_PER_DEGREE * (e.alpha + alphaOffset);
                  var beta = cesium_imports_1.CesiumMath.RADIANS_PER_DEGREE * e.beta;
                  var gamma = cesium_imports_1.CesiumMath.RADIANS_PER_DEGREE * e.gamma;
                  var alphaQuat = cesium_imports_1.Quaternion.fromAxisAngle(cesium_imports_1.Cartesian3.UNIT_Z, alpha, _this._scratchQuaternion1);
                  var betaQuat = cesium_imports_1.Quaternion.fromAxisAngle(cesium_imports_1.Cartesian3.UNIT_X, beta, _this._scratchQuaternion2);
                  var alphaBetaQuat = cesium_imports_1.Quaternion.multiply(alphaQuat, betaQuat, _this._scratchQuaternion1);
                  var gammaQuat = cesium_imports_1.Quaternion.fromAxisAngle(cesium_imports_1.Cartesian3.UNIT_Y, gamma, _this._scratchQuaternion2);
                  var alphaBetaGammaQuat = cesium_imports_1.Quaternion.multiply(alphaBetaQuat, gammaQuat, alphaBetaQuat); // update orientationEntity

                  if (_this.orientationEntity.position instanceof cesium_imports_1.ConstantPositionProperty == false) {
                    _this.orientationEntity.position = new cesium_imports_1.ConstantPositionProperty(cesium_imports_1.Cartesian3.ZERO, _this.geolocationEntity);
                  }

                  if (_this.orientationEntity.orientation instanceof cesium_imports_1.ConstantProperty == false) {
                    _this.orientationEntity.orientation = new cesium_imports_1.ConstantProperty();
                  }

                  _this.orientationEntity.orientation.setValue(alphaBetaGammaQuat); // make sure the device entity has a defined pose relative to the device orientation entity


                  if (_this.entity.position instanceof cesium_imports_1.ConstantPositionProperty == false) {
                    _this.entity.position = new cesium_imports_1.ConstantPositionProperty(cesium_imports_1.Cartesian3.ZERO, _this.orientationEntity);
                  }

                  if (_this.entity.orientation instanceof cesium_imports_1.ConstantProperty == false) {
                    _this.entity.orientation = new cesium_imports_1.ConstantProperty(cesium_imports_1.Quaternion.IDENTITY);
                  } // TODO: fix heading drift calculation (heading should match webkitCompassHeading)
                  // if (defined(webkitCompassHeading)) {
                  //     const q = alphaBetaGammaQuat//utils.getEntityOrientationInReferenceFrame(this.interfaceEntity, JulianDate.now(), this.locationEntity, this._scratchQuaternion1);
                  //     var heading = -Math.atan2(2*(q.w*q.z + q.x*q.y), 1 - 2*(q.y*q.y + q.z*q.z));
                  //     if (heading < 0) heading += 2*Math.PI;
                  //     const {swing,twist} = swingTwistDecomposition(alphaBetaGammaQuat, Cartesian3.UNIT_Z);
                  //     const twistAngle = 2 * Math.acos(twist.w);
                  //     console.log(twist.w + ' ' + twistAngle * CesiumMath.DEGREES_PER_RADIAN + '\n' + webkitCompassHeading);
                  //     // this._headingDrift = webkitCompassHeading - heading * CesiumMath.DEGREES_PER_RADIAN;
                  // }

                };

                window.addEventListener('deviceorientation', (this || _global)._deviceorientationListener);
              } else if (cesium_imports_1.defined((this || _global)._deviceorientationListener) && !(this || _global).orientationUpdatesEnabled) {
                window.removeEventListener('deviceorientation', (this || _global)._deviceorientationListener);
                (this || _global)._deviceorientationListener = undefined;
              }
            }
          };
          /**
          * Update the pose with latest sensor data
          */


          DeviceService.prototype.update = function () {
            var _this = this || _global;

            if (cesium_imports_1.defined((this || _global)._idleTimeoutId)) clearTimeout((this || _global)._idleTimeoutId);
            (this || _global)._idleTimeoutId = setTimeout(function () {
              _this.onIdle();
            }, 2000);
            this.onUpdate();
          };

          DeviceService = __decorate([aurelia_dependency_injection_1.inject(context_2.ContextService)], DeviceService);
          return DeviceService;
        }();

        exports_1("DeviceService", DeviceService);
      }
    };
  });
  return exports;
}