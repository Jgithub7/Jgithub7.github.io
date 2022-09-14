var exports = {},
    _dewExec = false;

var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;

export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  System.register(['aurelia-dependency-injection', './session', './utils'], function (exports_1, context_1) {
    "use strict";

    var __moduleName = context_1 && context_1.id;

    var __decorate = (this || _global) && (this || _global).__decorate || function (decorators, target, key, desc) {
      var c = arguments.length,
          r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
          d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    var aurelia_dependency_injection_1, session_1, utils_1;
    var FocusService;
    return {
      setters: [function (aurelia_dependency_injection_1_1) {
        aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
      }, function (session_1_1) {
        session_1 = session_1_1;
      }, function (utils_1_1) {
        utils_1 = utils_1_1;
      }],
      execute: function () {
        /**
         * Manages focus state
         */
        FocusService = function () {
          function FocusService(sessionService) {
            var _this = this || _global;

            (this || _global).sessionService = sessionService;
            /**
             * An event that is raised when this session has gained focus
             */

            (this || _global).focusEvent = new utils_1.Event();
            /**
             * An event that is raised when this session has lost focus
             */

            (this || _global).blurEvent = new utils_1.Event();
            (this || _global)._hasFocus = false;
            (this || _global)._sessionFocusEvent = new utils_1.Event();

            sessionService.manager.on['ar.focus.state'] = function (message) {
              _this._setFocus(message.state);
            };

            if (sessionService.isRealityManager) {
              sessionService.manager.connectEvent.addEventListener(function () {
                setTimeout(function () {
                  if (!_this._session) _this.setSession(_this.sessionService.manager);
                });
              });
            }
          }

          Object.defineProperty(FocusService.prototype, "hasFocus", {
            /**
             * True if this session has focus
             */
            get: function () {
              return (this || _global)._hasFocus;
            },
            enumerable: true,
            configurable: true
          });
          Object.defineProperty(FocusService.prototype, "sessionFocusEvent", {
            /**
             * Manager-only. An event that is raised when a managed session has acquired focus.
             */
            get: function () {
              (this || _global).sessionService.ensureIsRealityManager();

              return (this || _global)._sessionFocusEvent;
            },
            enumerable: true,
            configurable: true
          });
          /**
           * Manager-only. The managed session which currently has focus.
           */

          FocusService.prototype.getSession = function () {
            (this || _global).sessionService.ensureIsRealityManager();

            return (this || _global)._session;
          };
          /**
           *  Manager-only. Grant focus to a managed session.
           */


          FocusService.prototype.setSession = function (session) {
            (this || _global).sessionService.ensureIsRealityManager();

            if (session && !session.isConnected) throw new Error('Only a connected session can be granted focus');
            var previousFocussedSession = (this || _global)._session;

            if (previousFocussedSession !== session) {
              if (previousFocussedSession) previousFocussedSession.send('ar.focus.state', {
                state: false
              });
              if (session) session.send('ar.focus.state', {
                state: true
              });
              (this || _global)._session = session;

              (this || _global).sessionFocusEvent.raiseEvent({
                previous: previousFocussedSession,
                current: session
              });
            }
          };

          FocusService.prototype.whenSessionHasFocus = function (session) {
            var _this = this || _global;

            (this || _global).sessionService.ensureIsRealityManager();

            return new Promise(function (resolve) {
              var remove = _this.sessionFocusEvent.addEventListener(function (_a) {
                var current = _a.current;

                if (current === session) {
                  remove();
                  resolve();
                }
              });
            });
          };

          FocusService.prototype._setFocus = function (state) {
            if ((this || _global)._hasFocus !== state) {
              (this || _global)._hasFocus = state;

              if (state) {
                (this || _global).focusEvent.raiseEvent(undefined);
              } else {
                (this || _global).blurEvent.raiseEvent(undefined);
              }
            }
          };

          FocusService = __decorate([aurelia_dependency_injection_1.inject(session_1.SessionService)], FocusService);
          return FocusService;
        }();

        exports_1("FocusService", FocusService);
      }
    };
  });
  return exports;
}