var exports = {},
    _dewExec = false;

var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;

export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  System.register(['aurelia-dependency-injection', './cesium/cesium-imports', './common', './focus', './session', './utils'], function (exports_1, context_1) {
    "use strict";

    var __moduleName = context_1 && context_1.id;

    var __decorate = (this || _global) && (this || _global).__decorate || function (decorators, target, key, desc) {
      var c = arguments.length,
          r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
          d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    var aurelia_dependency_injection_1, cesium_imports_1, common_1, focus_1, session_1, utils_1;
    var RealityLoader, RealityZoomState, RealityService;
    return {
      setters: [function (aurelia_dependency_injection_1_1) {
        aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
      }, function (cesium_imports_1_1) {
        cesium_imports_1 = cesium_imports_1_1;
      }, function (common_1_1) {
        common_1 = common_1_1;
      }, function (focus_1_1) {
        focus_1 = focus_1_1;
      }, function (session_1_1) {
        session_1 = session_1_1;
      }, function (utils_1_1) {
        utils_1 = utils_1_1;
      }],
      execute: function () {
        /**
         * Abstract class for a reality setup handler
         */
        RealityLoader = function () {
          function RealityLoader() {}

          return RealityLoader;
        }();

        exports_1("RealityLoader", RealityLoader);

        (function (RealityZoomState) {
          RealityZoomState[RealityZoomState["OTHER"] = 0] = "OTHER";
          RealityZoomState[RealityZoomState["START"] = 1] = "START";
          RealityZoomState[RealityZoomState["CHANGE"] = 2] = "CHANGE";
          RealityZoomState[RealityZoomState["END"] = 3] = "END";
        })(RealityZoomState || (RealityZoomState = {}));

        exports_1("RealityZoomState", RealityZoomState);
        /**
        * A service which manages the reality view.
        * For an app developer, the RealityService instance can be used to
        * set preferences which can affect how the manager selects a reality view.
        */

        RealityService = function () {
          function RealityService(sessionService, focusService) {
            var _this = this || _global;

            (this || _global).sessionService = sessionService;
            (this || _global).focusService = focusService;
            /**
             * A collection of known reality views from which the reality service can select.
             */

            (this || _global).realities = new Array();
            /**
             * An event that is raised when a reality control port is opened.
             */

            (this || _global).connectEvent = new utils_1.Event();
            /**
             * Manager-only. An event that is raised when the current reality is changed.
             */

            (this || _global)._changeEvent = new utils_1.Event();
            /**
             * Manager-only. An event that is raised when the current reality emits the next frame state.
             * This event contains pose updates for the entities that are managed by
             * the current reality.
             */

            (this || _global)._frameEvent = new utils_1.Event();
            /**
             * Manager-only. A map from a managed session to the desired reality
             */

            (this || _global).desiredRealityMap = new WeakMap();
            /**
             * Manager-only. A map from a desired reality to the session which requested it
             */

            (this || _global).desiredRealityMapInverse = new WeakMap();
            /**
             * Manager-only. An event that is raised when a session changes it's desired reality.
             */

            (this || _global).sessionDesiredRealityChangeEvent = new utils_1.Event(); // RealitySetupHandlers

            (this || _global)._loaders = [];
            (this || _global)._defaultFov = Math.PI / 2;
            (this || _global)._scratchFrustum = new cesium_imports_1.PerspectiveFrustum();
            (this || _global)._scratchArray = new Array();
            (this || _global)._loadID = -1;

            if (sessionService.isRealityManager) {
              sessionService.manager.connectEvent.addEventListener(function () {
                setTimeout(function () {
                  if (_this._loadID === -1) _this._setNextReality(_this.onSelectReality());
                });
              });
            }

            sessionService.connectEvent.addEventListener(function (session) {
              if (session.info.role !== common_1.Role.REALITY_VIEW) {
                session.on['ar.reality.desired'] = function (message) {
                  var reality = message.reality;

                  var previous = _this.desiredRealityMap.get(session);

                  console.log('Session set desired reality: ' + JSON.stringify(reality));

                  if (reality) {
                    if (reality['type']) {
                      var type = reality['type'];
                      reality.uri = reality.uri || 'reality:' + type;
                      if (type === 'hosted') reality.uri = reality['url'];
                      if (!reality.title && reality['name']) reality.title = reality['name'];
                    }

                    if (_this.isSupported(reality)) {
                      _this.desiredRealityMap.set(session, reality);

                      _this.desiredRealityMapInverse.set(reality, session);
                    } else {
                      session.sendError({
                        message: 'Reality of type "' + reality.uri + '" is not available on this platform'
                      });
                      return;
                    }
                  } else {
                    _this.desiredRealityMap.delete(session);
                  }

                  _this._setNextReality(_this.onSelectReality());

                  _this.sessionDesiredRealityChangeEvent.raiseEvent({
                    session: session,
                    previous: previous,
                    current: reality
                  });
                };
              }
            });

            sessionService.manager.on['ar.reality.connect'] = function (_a) {
              var id = _a.id;

              var realityControlSession = _this.sessionService.createSessionPort();

              var messageChannel = _this.sessionService.createSynchronousMessageChannel();

              var ROUTE_MESSAGE_KEY = 'ar.reality.message.route.' + id;
              var SEND_MESSAGE_KEY = 'ar.reality.message.send.' + id;
              var CLOSE_SESSION_KEY = 'ar.reality.close.' + id;

              messageChannel.port1.onmessage = function (msg) {
                _this.sessionService.manager.send(ROUTE_MESSAGE_KEY, msg.data);
              };

              _this.sessionService.manager.on[SEND_MESSAGE_KEY] = function (message) {
                messageChannel.port1.postMessage(message);
              };

              _this.sessionService.manager.on[CLOSE_SESSION_KEY] = function () {
                realityControlSession.close();
              };

              realityControlSession.connectEvent.addEventListener(function () {
                _this.connectEvent.raiseEvent(realityControlSession);
              });

              _this.sessionService.manager.closeEvent.addEventListener(function () {
                realityControlSession.close();
                delete _this.sessionService.manager.on[SEND_MESSAGE_KEY];
                delete _this.sessionService.manager.on[CLOSE_SESSION_KEY];
              });

              realityControlSession.open(messageChannel.port2, _this.sessionService.configuration);
            };

            sessionService.manager.on['ar.reality.zoom'] = function (data) {
              _this.zoom(data);
            };
          }

          Object.defineProperty(RealityService.prototype, "changeEvent", {
            get: function () {
              (this || _global).sessionService.ensureIsRealityManager();

              return (this || _global)._changeEvent;
            },
            enumerable: true,
            configurable: true
          });
          Object.defineProperty(RealityService.prototype, "frameEvent", {
            get: function () {
              (this || _global).sessionService.ensureIsRealityManager();

              return (this || _global)._frameEvent;
            },
            enumerable: true,
            configurable: true
          });
          /**
           * Set the default reality.
           */

          RealityService.prototype.setDefault = function (reality) {
            (this || _global)._default = reality;
          };
          /**
           * Manager-only. Register a reality loader
           */


          RealityService.prototype.registerLoader = function (handler) {
            (this || _global).sessionService.ensureIsRealityManager();

            (this || _global)._loaders.push(handler);
          };
          /**
           * Manager-only. Get the current reality view.
           * @deprecated. Use app.context.getCurrentReality()
           */


          RealityService.prototype.getCurrent = function () {
            (this || _global).sessionService.ensureIsRealityManager();

            return (this || _global)._current;
          };
          /**
          * Manager-only. Check if a type of reality is supported.
          * @param type reality type
          * @return true if a handler exists and false otherwise
          */


          RealityService.prototype.isSupported = function (reality) {
            (this || _global).sessionService.ensureIsRealityManager();

            return !!this._getLoader(reality);
          };
          /**
           * Reality-only. Publish the next frame state.
           */


          RealityService.prototype.publishFrame = function (state) {
            (this || _global).sessionService.ensureIsRealityView();

            if ((this || _global).sessionService.manager.isConnected) {
              (this || _global).sessionService.manager.send('ar.reality.frameState', state);
            }
          };
          /**
           * Set the desired reality.
           */


          RealityService.prototype.setDesired = function (reality) {
            (this || _global).sessionService.ensureNotRealityView();

            (this || _global)._desired = reality;

            if ((this || _global).sessionService.isRealityManager) {
              this._setNextReality(reality, true);
            } else {
              (this || _global).sessionService.manager.send('ar.reality.desired', {
                reality: reality
              });
            }
          };
          /**
           * Get the desired reality
           */


          RealityService.prototype.getDesired = function () {
            return (this || _global)._desired;
          };
          /**
           * Set the optional reference frames for this app
           */


          RealityService.prototype.setOptionalReferenceFrames = function (referenceFrames) {};
          /**
           * Set the optional reference frames for this app
           */


          RealityService.prototype.setRequiredReferenceFrames = function (referenceFrames) {};
          /**
           * Set a desired fov in radians.
           */


          RealityService.prototype.setDesiredFov = function (fov) {
            (this || _global)._desiredFov = fov;
            this.zoom({
              fov: fov || (this || _global)._defaultFov,
              zoom: 1,
              state: RealityZoomState.OTHER
            });
          };
          /**
           * Get the desired fov in radians
           */


          RealityService.prototype.getDesiredFov = function () {
            return (this || _global)._desiredFov;
          };
          /**
           * Set the default fov in radians, and adjust the desired fov to match the
           * previous desired / default ratio.
           */


          RealityService.prototype.setDefaultFov = function (fov) {
            if (cesium_imports_1.defined((this || _global)._desiredFov)) {
              var ratio = (this || _global)._desiredFov / (this || _global)._defaultFov;
              this.setDesiredFov(fov * ratio);
            }

            (this || _global)._defaultFov = fov;
          };
          /**
           * Get the default fov in radians
           */


          RealityService.prototype.getDefaultFov = function () {
            return (this || _global)._defaultFov;
          };
          /**
           * Returns a maximum viewport
           */


          RealityService.prototype.getMaximumViewport = function () {
            if (typeof document !== 'undefined' && document.documentElement) {
              return {
                x: 0,
                y: 0,
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
              };
            }

            throw new Error("Not implemeneted for the current platform");
          };
          /**
          * Manager-only. Selects the best reality based on the realites
          * requested by all managed sessions. Can be overriden for customized selection.
          *
          * @returns The reality chosen for this context. May be undefined if no
          * realities have been requested.
          */


          RealityService.prototype.onSelectReality = function () {
            (this || _global).sessionService.ensureIsRealityManager();

            var selectedReality = (this || _global).desiredRealityMap.get((this || _global).sessionService.manager);

            if (!selectedReality) {
              var focusSession = (this || _global).focusService.getSession();

              if (focusSession && focusSession.isConnected) {
                selectedReality = (this || _global).desiredRealityMap.get(focusSession);
              }
            }

            if (!selectedReality) {
              // TODO: sort and select based on some kind of ranking system
              for (var _i = 0, _a = (this || _global).sessionService.managedSessions; _i < _a.length; _i++) {
                var session = _a[_i];
                if (!session.isConnected) continue;

                var desiredReality = (this || _global).desiredRealityMap.get(session);

                if (desiredReality && this.isSupported(desiredReality)) {
                  selectedReality = desiredReality;
                  break;
                }
              }
            }

            return selectedReality;
          };

          RealityService.prototype.onGenerateViewFromEyeParameters = function (eye) {
            var fov = eye.fov || (this || _global)._desiredFov || (this || _global)._defaultFov;
            var viewport = eye.viewport || this.getMaximumViewport();
            var aspectRatio = eye.aspect || viewport.width / viewport.height;
            (this || _global)._scratchFrustum.fov = fov;
            (this || _global)._scratchFrustum.aspectRatio = aspectRatio;
            (this || _global)._scratchFrustum.near = 0.01;
            (this || _global)._scratchFrustum.far = 10000000;
            return {
              viewport: viewport,
              pose: eye.pose,
              subviews: [{
                type: common_1.SubviewType.SINGULAR,
                frustum: {
                  fov: fov,
                  aspectRatio: aspectRatio
                },
                // TODO: remove this later  
                projectionMatrix: cesium_imports_1.Matrix4.toArray((this || _global)._scratchFrustum.projectionMatrix, (this || _global)._scratchArray)
              }]
            };
          };

          RealityService.prototype.zoom = function (data) {
            data.naturalFov = data.naturalFov || (this || _global)._defaultFov;

            if ((this || _global)._realitySession && (this || _global)._realitySession.info['reality.handlesZoom']) {
              (this || _global)._realitySession.send('ar.reality.zoom', data);
            } else {
              var fov = (this || _global)._desiredFov = this.onZoom(data);

              if ((this || _global).sessionService.isRealityView) {
                (this || _global).sessionService.manager.send('ar.reality.desiredFov', {
                  fov: fov
                });
              }
            }
          };

          RealityService.prototype.onZoom = function (data) {
            var newFov = 2 * Math.atan(Math.tan(data.fov * 0.5) / data.zoom);
            newFov = Math.max(10 * cesium_imports_1.CesiumMath.RADIANS_PER_DEGREE, Math.min(newFov, 160 * cesium_imports_1.CesiumMath.RADIANS_PER_DEGREE));

            if (data.state === RealityZoomState.END && Math.abs(newFov - data.naturalFov) < 0.05
            /* +-6deg */
            ) {
              newFov = data.naturalFov;
            }

            return newFov;
          };

          RealityService.prototype._setNextReality = function (reality, force) {
            var _this = this || _global;

            if (force === void 0) {
              force = false;
            }

            if ((this || _global)._current && reality && (this || _global)._current === reality && !force) return;
            if ((this || _global)._current && !reality && (this || _global)._realitySession) return;

            if (!(this || _global)._current && !cesium_imports_1.defined(reality)) {
              reality = (this || _global)._default;
            }

            if (cesium_imports_1.defined(reality)) {
              if (!this.isSupported(reality)) {
                (this || _global).sessionService.errorEvent.raiseEvent(new Error('Reality of type "' + reality.uri + '" is not available on this platform'));

                return;
              }

              var loadID_1 = ++(this || _global)._loadID;

              this._executeRealityLoader(reality, function (realitySession) {
                if (realitySession.isConnected) throw new Error('Expected an unconnected session');

                if (loadID_1 !== _this._loadID) {
                  realitySession.close();
                  return;
                }

                var previousRealitySession = _this._realitySession;
                _this._realitySession = realitySession;

                _this._setCurrent(reality);

                realitySession.on['ar.reality.frameState'] = function (serializedState) {
                  var state = serializedState;

                  if (!cesium_imports_1.defined(serializedState.view)) {
                    if (!cesium_imports_1.defined(serializedState.eye)) throw new Error("Unable to construct view configuration: missing eye parameters");
                    state.view = _this.onGenerateViewFromEyeParameters(serializedState.eye);
                    state.eye = undefined;
                    state.entities = serializedState.entities || {};
                  }

                  state.reality = _this.getCurrent();

                  _this.frameEvent.raiseEvent(state);
                };

                realitySession.on['ar.reality.desiredFov'] = function (state) {
                  _this._desiredFov = state.fov;
                };

                realitySession.closeEvent.addEventListener(function () {
                  console.log('Reality session closed: ' + JSON.stringify(reality)); // select a new reality if the current reality has closed without 
                  // another reality having been requested

                  if (_this._loadID === loadID_1) {
                    _this._realitySession = undefined;
                    _this._current = undefined;

                    _this._setNextReality(_this.onSelectReality());
                  }
                });
                realitySession.connectEvent.addEventListener(function () {
                  if (realitySession.info.role !== common_1.Role.REALITY_VIEW) {
                    realitySession.sendError({
                      message: "Expected a reality session"
                    });
                    realitySession.close();
                    throw new Error('The application "' + realitySession.uri + '" does not support being loaded as a reality');
                  }

                  if (previousRealitySession) {
                    previousRealitySession.close();
                  }

                  if (realitySession.info['reality.supportsControlPort']) {
                    var ownerSession_1 = _this.desiredRealityMapInverse.get(reality) || _this.sessionService.manager;

                    var id = cesium_imports_1.createGuid();
                    var ROUTE_MESSAGE_KEY = 'ar.reality.message.route.' + id;
                    var SEND_MESSAGE_KEY_1 = 'ar.reality.message.send.' + id;
                    var CLOSE_SESSION_KEY_1 = 'ar.reality.close.' + id;

                    realitySession.on[ROUTE_MESSAGE_KEY] = function (message) {
                      ownerSession_1.send(SEND_MESSAGE_KEY_1, message);
                    };

                    ownerSession_1.on[ROUTE_MESSAGE_KEY] = function (message) {
                      realitySession.send(SEND_MESSAGE_KEY_1, message);
                    };

                    realitySession.send('ar.reality.connect', {
                      id: id
                    });
                    ownerSession_1.send('ar.reality.connect', {
                      id: id
                    });
                    realitySession.closeEvent.addEventListener(function () {
                      ownerSession_1.send(CLOSE_SESSION_KEY_1);
                    });
                    ownerSession_1.closeEvent.addEventListener(function () {
                      realitySession.send(CLOSE_SESSION_KEY_1);
                      realitySession.close();
                    });
                  }
                });
              });
            }
          };

          RealityService.prototype._getLoader = function (reality) {
            var found;

            for (var _i = 0, _a = (this || _global)._loaders; _i < _a.length; _i++) {
              var loader = _a[_i];

              if (loader.type === common_1.RealityView.getType(reality)) {
                found = loader;
                break;
              }
            }

            return found;
          };

          RealityService.prototype._setCurrent = function (reality) {
            if ((this || _global)._current === undefined || (this || _global)._current !== reality) {
              var previous = (this || _global)._current;
              (this || _global)._current = reality;

              (this || _global).changeEvent.raiseEvent({
                previous: previous,
                current: reality
              });

              console.log('Reality changed to: ' + JSON.stringify(reality));
            }
          };

          RealityService.prototype._executeRealityLoader = function (reality, callback) {
            (this || _global).sessionService.ensureIsRealityManager();

            var loader = this._getLoader(reality);

            if (!loader) throw new Error('Unable to setup unsupported reality type: ' + reality.uri);
            loader.load(reality, callback);
          };

          RealityService = __decorate([aurelia_dependency_injection_1.inject(session_1.SessionService, focus_1.FocusService)], RealityService);
          return RealityService;
        }();

        exports_1("RealityService", RealityService);
      }
    };
  });
  return exports;
}