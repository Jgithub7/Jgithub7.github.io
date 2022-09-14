var exports = {},
    _dewExec = false;

var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;

export function dew() {
  if (_dewExec) return exports;
  _dewExec = true;
  System.register(['aurelia-dependency-injection', '../common', '../session', '../reality', '../vuforia'], function (exports_1, context_1) {
    "use strict";

    var __moduleName = context_1 && context_1.id;

    var __extends = (this || _global) && (this || _global).__extends || function (d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];

      function __() {
        (this || _global).constructor = d;
      }

      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    var __decorate = (this || _global) && (this || _global).__decorate || function (decorators, target, key, desc) {
      var c = arguments.length,
          r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
          d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    var aurelia_dependency_injection_1, common_1, session_1, reality_1, vuforia_1;
    var LiveVideoRealityLoader;
    return {
      setters: [function (aurelia_dependency_injection_1_1) {
        aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
      }, function (common_1_1) {
        common_1 = common_1_1;
      }, function (session_1_1) {
        session_1 = session_1_1;
      }, function (reality_1_1) {
        reality_1 = reality_1_1;
      }, function (vuforia_1_1) {
        vuforia_1 = vuforia_1_1;
      }],
      execute: function () {
        LiveVideoRealityLoader = function (_super) {
          __extends(LiveVideoRealityLoader, _super);

          function LiveVideoRealityLoader(sessionService, vuforiaDelegate) {
            _super.call(this || _global);

            (this || _global).sessionService = sessionService;
            (this || _global).vuforiaDelegate = vuforiaDelegate;
            (this || _global).type = 'live-video';
          }

          LiveVideoRealityLoader.prototype.load = function (reality, callback) {
            var _this = this || _global;

            var realitySession = (this || _global).sessionService.addManagedSessionPort(reality.uri);

            var remoteRealitySession = (this || _global).sessionService.createSessionPort();

            remoteRealitySession.on['ar.context.update'] = function () {};

            remoteRealitySession.connectEvent.addEventListener(function () {
              var remove = _this.vuforiaDelegate.stateUpdateEvent.addEventListener(function (frameState) {
                remoteRealitySession.send('ar.reality.frameState', frameState);
              });

              _this.vuforiaDelegate.videoEnabled = true;
              _this.vuforiaDelegate.trackingEnabled = true;
              remoteRealitySession.closeEvent.addEventListener(function () {
                remove();
                _this.vuforiaDelegate.videoEnabled = false;
                _this.vuforiaDelegate.trackingEnabled = false;
              });
            });
            callback(realitySession); // Only connect after the caller is able to attach connectEvent handlers

            var messageChannel = (this || _global).sessionService.createSynchronousMessageChannel();

            realitySession.open(messageChannel.port1, (this || _global).sessionService.configuration);
            remoteRealitySession.open(messageChannel.port2, {
              role: common_1.Role.REALITY_VIEW
            });
          };

          LiveVideoRealityLoader = __decorate([aurelia_dependency_injection_1.inject(session_1.SessionService, vuforia_1.VuforiaServiceDelegate)], LiveVideoRealityLoader);
          return LiveVideoRealityLoader;
        }(reality_1.RealityLoader);

        exports_1("LiveVideoRealityLoader", LiveVideoRealityLoader);
      }
    };
  });
  return exports;
}