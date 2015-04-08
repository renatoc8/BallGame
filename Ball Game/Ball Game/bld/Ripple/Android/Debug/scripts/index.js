// The babylon engine
var engine;
// The current scene
var scene;
// The HTML canvas
var canvas;

// to go quicker
var v3 = BABYLON.Vector3;

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
                if (offsetY < 0)
                    offsetY = -Math.abs(offsetY);
                else
                    offsetY = Math.abs(offsetY);

                if (offsetX > 0)
                    offsetX = -Math.abs(offsetX);
                else
                    offsetX = Math.abs(offsetX);

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

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}

function getMediaURL(s) {
    if (!blnRipple && device.platform.toLowerCase() === "android") {
        if (UrlExists("/android_asset/www/" + s))
            return "/android_asset/www/" + s;
        else
            return s;
    } else
        return s;
}

var blnRipple = (window.location.href.indexOf('localhost') != -1);

var BallGame;
(function (BallGame) {
    "use strict";

    (function (Application) {
        function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);

            createScene();

            // The render function
            engine.runRenderLoop(function () {
                scene.render();
            });
        }
        Application.initialize = initialize;

        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        }

        function createScene() {
            // Get the canvas element from our HTML below
            canvas = document.getElementById("renderCanvas");

            // Load the BABYLON 3D engine
            engine = new BABYLON.Engine(canvas, true);

            scene = new BABYLON.Scene(engine);
            scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());

            /** SKYBOX **/
            BABYLON.Engine.ShadersRepository = "shaders/";
            var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, scene);
            var shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
            shader.setFloat("offset", 0);
            shader.setFloat("exponent", 0.6);
            shader.setColor3("topColor", BABYLON.Color3.FromInts(0, 119, 255));
            shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240, 240, 255));
            shader.backFaceCulling = false;
            skybox.material = shader;


            /** CAMERA **/
            var camera = Camera2D(new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -600), scene));
            camera.attachControl(canvas);
            camera.maxZ = 5000;
            camera.lowerRadiusLimit = 120;
            camera.upperRadiusLimit = 430;
            camera.lowerBetaLimit = 0.75;
            camera.upperBetaLimit = 1.58;

            //camera.attachControl(canvas);
            camera.angularSensibility = 2;

            /** SUN LIGHT **/
            new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

            /** GROUND **/
            var mat = new BABYLON.StandardMaterial("ground", scene);
            var t = new BABYLON.Texture("images/ground3.jpg", scene);
            t.uScale = t.vScale = 10;
            mat.diffuseTexture = t;
            mat.specularColor = BABYLON.Color3.Black();
            var g = BABYLON.Mesh.CreateBox("ground", 400, scene);
            g.position.y = -20;
            g.scaling.y = 0.01;
            g.material = mat;
            g.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move: false });

            // Get a random number between two limits
            var randomNumber = function (min, max) {
                if (min == max) {
                    return (min);
                }
                var random = Math.random();
                return ((random * (max - min)) + min);
            };

            // Initial height
            var y = 50;

            // all our objects
            var objects = [];

            // max number of objects
            var max = 150;

            // Creates arandom position above the ground
            var getPosition = function (y) {
                return new v3(randomNumber(-200, 200), y, randomNumber(-200, 200));
            };

            // Creates
            for (var index = 0; index < max; index++) {

                // SPHERES
                var s = BABYLON.Mesh.CreateSphere("s", 30, randomNumber(20, 30), scene);
                s.position = getPosition(y);
                s.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, move: true, mass: 1, friction: 0.5, restitution: 0.5 });
                var shaderSphere = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
                shaderSphere.setFloat("offset", 10);
                shaderSphere.setFloat("exponent", 1.0);
                shaderSphere.setColor3("topColor", BABYLON.Color3.FromInts(129, 121, 153));
                shaderSphere.setColor3("bottomColor", BABYLON.Color3.FromInts(161, 152, 191));
                // s.material = shaderSphere;

                // BOXES
                var d = BABYLON.Mesh.CreateBox("s", randomNumber(10, 20), scene);
                d.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move: true, mass: 1, friction: 0.5, restitution: 0.1 });
                var boxMaterial = new BABYLON.StandardMaterial("boxmat", scene);
                boxMaterial.diffuseColor = BABYLON.Color3.FromInts(75, 71, 89);
                boxMaterial.specularColor = BABYLON.Color3.Black();
                d.material = shaderSphere;
                s.material = boxMaterial;
                d.position = getPosition(y);

                d.rotation.x = randomNumber(-Math.PI / 2, Math.PI / 2);
                d.rotation.y = randomNumber(-Math.PI / 2, Math.PI / 2);
                d.rotation.z = randomNumber(-Math.PI / 2, Math.PI / 2);
                d.updatePhysicsBodyPosition();
                //d.updateBodyPosition();

                // SAVE OBJECT
                objects.push(s, d);

                // INCREMENT HEIGHT
                y += 10;
            }

            scene.registerBeforeRender(function () {
                objects.forEach(function (obj) {
                    // If object falls
                    if (obj.position.y < -100) {
                        obj.position = getPosition(200);
                        obj.updatePhysicsBodyPosition();
                    }
                });
            });


            //var objShip = BABYLON.SceneLoader.Load(getMediaURL("Assets/Spaceship/"), "spaceship.babylon", engine, function (scene) {
            //    //attach Camera
            //    scene.activeCamera = Camera2D(new BABYLON.FreeCamera("camera", new BABYLON.Vector3(600, 200, -7000), scene));

            //    //camera.attachControl(canvas);
            //    scene.activeCamera.angularSensibility = 0.2;

            //    scene.activeCamera.attachControl(canvas);
            //    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
            //    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            //    scene.collisionsEnabled = true;

            //    scene.activeCamera.checkCollisions = true;
            //    scene.activeCamera.applyGravity = true;
            //    scene.activeCamera.speed = 1.0;

            //    //Set the ellipsoid around the camera (e.g. your player's size)
            //    scene.activeCamera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

            //    //var ground = BABYLON.Mesh.CreatePlane("ground", 60.0, scene);
            //    //ground.material = new BABYLON.StandardMaterial("groundMat", scene);
            //    //ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
            //    //ground.material.backFaceCulling = false;
            //    //ground.position = new BABYLON.Vector3(0, 0, 0);
            //    //ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
            //    //ground.checkCollisions = true;
            //    // Register a render loop to repeatedly render the scene
            //    engine.runRenderLoop(function () {
            //        scene.render();
            //    });
            //}, null, null);

            // Watch for browser/canvas resize events
            window.addEventListener("resize", function () {
                engine.resize();
            });
        };

        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        }

        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }
    })(BallGame.Application || (BallGame.Application = {}));
    var Application = BallGame.Application;

    window.onload = function () {
        Application.initialize();
    };
})(BallGame || (BallGame = {}));
//# sourceMappingURL=index.js.map
