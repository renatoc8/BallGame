
declare var BABYLON: any;

function Camera2D(FreeCamera) {
    FreeCamera.attachControl = function (element, noPreventDefault) {
        var _this = this;
        var previousPosition;
        var engine = this.getEngine();
        if (this._attachedElement) {
            return;
        }
        this._attachedElement = element;
        if (this._onMouseDown === undefined) {
            this._onMouseDown = function (evt) {
                previousPosition = {
                    x: evt.clientX,
                    y: evt.clientY
                };
                if (!noPreventDefault) {
                    evt.preventDefault();
                }
            };
            this._onMouseUp = function (evt) {
                previousPosition = null;
                if (!noPreventDefault) {
                    evt.preventDefault();
                }
            };
            this._onMouseOut = function (evt) {
                previousPosition = null;
                _this._keys = [];
                if (!noPreventDefault) {
                    evt.preventDefault();
                }
            };
            this._onMouseMove = function (evt) {
                if (!previousPosition && !engine.isPointerLock) {
                    return;
                }
                var offsetX;
                var offsetY;
                if (!engine.isPointerLock) {
                    offsetX = evt.clientX - previousPosition.x;
                    offsetY = evt.clientY - previousPosition.y;
                } else {
                    offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
                    offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
                }
                if (offsetY > 0)
                    offsetY = -Math.abs(offsetY);
                else
                    offsetY = Math.abs(offsetY);
                _this.position.y += offsetY / _this.angularSensibility;
                _this.position.x += offsetX / _this.angularSensibility;
                previousPosition = {
                    x: evt.clientX,
                    y: evt.clientY
                };
                if (!noPreventDefault) {
                    evt.preventDefault();
                }
            };
            this._onKeyDown = function (evt) {
                if (_this.keysUp.indexOf(evt.keyCode) !== -1 || _this.keysDown.indexOf(evt.keyCode) !== -1 || _this.keysLeft.indexOf(evt.keyCode) !== -1 || _this.keysRight.indexOf(evt.keyCode) !== -1) {
                    var index = _this._keys.indexOf(evt.keyCode);
                    if (index === -1) {
                        _this._keys.push(evt.keyCode);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
            this._onKeyUp = function (evt) {
                if (_this.keysUp.indexOf(evt.keyCode) !== -1 || _this.keysDown.indexOf(evt.keyCode) !== -1 || _this.keysLeft.indexOf(evt.keyCode) !== -1 || _this.keysRight.indexOf(evt.keyCode) !== -1) {
                    var index = _this._keys.indexOf(evt.keyCode);
                    if (index >= 0) {
                        _this._keys.splice(index, 1);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
            this._onLostFocus = function () {
                _this._keys = [];
            };
            this._reset = function () {
                _this._keys = [];
                previousPosition = null;
                _this.cameraDirection = new BABYLON.Vector3(0, 0, 0);
                _this.cameraRotation = new BABYLON.Vector2(0, 0);
            };
        }
        element.addEventListener("mousedown", this._onMouseDown, false);
        element.addEventListener("mouseup", this._onMouseUp, false);
        element.addEventListener("mouseout", this._onMouseOut, false);
        element.addEventListener("mousemove", this._onMouseMove, false);
        BABYLON.Tools.RegisterTopRootEvents([
            { name: "keydown", handler: this._onKeyDown },
            { name: "keyup", handler: this._onKeyUp },
            { name: "blur", handler: this._onLostFocus }
        ]);
    };
    return FreeCamera;
}

var createScene = function () {
    // Get the canvas element from our HTML below
    var canvas = document.getElementById("renderCanvas");

    // Load the BABYLON 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    BABYLON.SceneLoader.Load(getMediaURL("Assets/Spaceship/"), "spaceship.babylon", engine, function (scene) {

        //attach Camera
        scene.activeCamera = Camera2D(new BABYLON.FreeCamera("camera", new BABYLON.Vector3(600, 200, -7000), scene))
        //camera.attachControl(canvas);

        scene.activeCamera.angularSensibility = 1;

        scene.activeCamera.attachControl(canvas);
        scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () {
            scene.render();
        });

    }, null, null);

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
}

function UrlExists(url: string) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}

function getMediaURL(s: string) {
    if (device.platform.toLowerCase() === "android") {
        if (UrlExists("/android_asset/www/" + s))
            return "/android_asset/www/" + s;
        else
            return s;
    } else
        return s;
}   

module BallGame {
    "use strict";

    export module Application {

        export function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }

        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);

            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        }

        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        }

        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }

    }

    window.onload = function () {
        Application.initialize();
    }
}
