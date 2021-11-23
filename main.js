var tcsApp = angular.module("tcspm", ["ngRoute"]);

tcsApp.controller("mainController", function($scope, $location, $rootScope, $timeout) {
	$scope.open = false;
	$scope.partProperty = {
		"objIdentifier" : "",
		"hoursRepairLimit" : 0,
		"tripServereFactor" : 0,
		"fastStartMult" : 0,
		"fuelType" : "-",
		"combustionType" : "-",
		"emergencyStartMult" : 0,
		"temparature" : 0,
		"injectionPct" : 0
	};

	
	/*
	$( window ).load(function() {
			$scope.load3DModel();
		});*/
	
	
	$scope.load3DModel = function() {
		
		var container = document.getElementById('glFullscreen');

		var scene = new THREE.Scene();
		scene.background = new THREE.Color(0xffffff);
		
		var raycaster;
		raycaster = new THREE.Raycaster();
		
		var radius = 40, theta = 0;		
		var INTERSECTED;
		var projector, mouse = new THREE.Vector3();
		var targetList = [];
		
		// initialize camera
		var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
		camera.position.y = 30;
		camera.position.z = -100;
		camera.fov = camera.fov*0.6;
		camera.updateProjectionMatrix();

		// initialize renderer
		var renderer = new THREE.WebGLRenderer({
			antialias : true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);
		

		// initialize controls
		var orbit = new THREE.OrbitControls(camera, renderer.domElement);
		// to disable zoom
		orbit.enableZoom = true;
		// to disable rotation
		orbit.enableRotate = true;
		// to disable pan
		orbit.enablePan = false;

		initializeLighting(scene);

		//initialize debug axes
		var debugAxisMesh = new THREE.Object3D();
		debugAxisMesh.visible = false;
		scene.add(debugAxisMesh);
		debugAxis(debugAxisMesh, 15);

		// load object model
		var modelURL = 'obj/Exploded_View.obj';

		var model;
		var wireframeModel;
		getObjModel(modelURL, function(obj) {
			console.log("loading object geometry into scene");
			model = obj;
			//obj.rotation.y=270;
			scene.add(obj);
		});

		// setup render loop
		var rotationIsOn = false;
		var render = function() {
			requestAnimationFrame(render);
			var time = Date.now() * 0.001;
			renderer.render(scene, camera);
		};

		// add resize listener
		window.addEventListener('resize', function() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}, false);
		
/*		document.addEventListener( 'mousedown', function() {
			event.preventDefault();
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}, false );*/
		/*projector = new THREE.Projector();*/
		document.addEventListener( 'mouseup', function() 
		{
			// the following line would stop any other event handler from firing
			// (such as the mouse's TrackballControls)
			event.preventDefault();
			
			// update the mouse variable
			var canvasPosition = renderer.domElement.getBoundingClientRect();
			mouse.x = ( (event.clientX- canvasPosition.left) / window.innerWidth ) * 2 - 1;
			mouse.y = - ( (event.clientY- canvasPosition.top) / window.innerHeight ) * 2 + 1;
			//mouse.z = 100;
			// find intersections

			// create a Ray with origin at the mouse position
			//   and direction into the scene (camera direction)
			var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			//projector.unprojectVector( vector, camera );
			//vector.unproject()
			var ray = new THREE.Raycaster(/* camera.position, vector.sub( camera.position ).normalize() */);
			ray.setFromCamera( mouse, camera ); 
			// create an array containing all objects in the scene with which the ray intersects
			var intersects = ray.intersectObjects( targetList ,true);
			var combusterflag = false;
			var originalHex;
			for ( var i = 0; i < intersects.length; i++ ) {
				if(intersects[ i ].object.material.length > 0){
					intersects[ i ].object.material = intersects[ i ].object.material[0];
					if ( INTERSECTED != intersects[ 0 ].object ) {
						angular.forEach($scope.partProperties, function(value, key){
							if(intersects[ 0 ].object.name === value.objIdentifier) {
								$scope.partProperty = value;
							}
						});
						$scope.$apply();
						$('#partDetails').modal();
						
						if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						INTERSECTED.material.emissive.setHex( 0xff0000 );
					}
				}else{
					if ( INTERSECTED != intersects[ 0 ].object ) {
						
						angular.forEach($scope.partProperties, function(value, key){
							if(intersects[ 0 ].object.name === value.objIdentifier) {
								$scope.partProperty = value;
							}
						});
						$scope.$apply();
						$('#partDetails').modal();
						
						if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						INTERSECTED.material.emissive.setHex( 0xff0000 );
					}
				}
			}
			/*// if there is one (or more) intersections
			if ( intersects.length > 0 ) {
				if ( INTERSECTED != intersects[ 0 ].object ) {
					if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
					INTERSECTED = intersects[ 0 ].object;
					INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
					INTERSECTED.material.emissive.setHex( 0xff0000 );
				}
			} else {
				if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
				INTERSECTED = null;
			}*/

		}, false );

		// call render to start
		render();

		function initializeLighting(scene) {
			var ambientLight = new THREE.AmbientLight(0x000000);
			scene.add(ambientLight);

			var lights = [];
			lights[0] = new THREE.PointLight(0x888888, 1, 0);
			lights[1] = new THREE.PointLight(0x888888, 1, 0);
			lights[2] = new THREE.PointLight(0x888888, 1, 0);

			lights[0].position.set(0, 200, 0);
			lights[1].position.set(100, 200, 100);
			lights[2].position.set(-100, -200, -100);

			scene.add(lights[0]);
			scene.add(lights[1]);
			scene.add(lights[2]);
		}

		function getObjModel(url, callbackFunction) {
			var manager = new THREE.LoadingManager();
			manager.onProgress = function(item, loaded, total) {
				console.log(item, loaded, total);
			};
			var onProgress = function(xhr) {
				if (xhr.lengthComputable) {
					var percentComplete = xhr.loaded / xhr.total * 100;
					console.log(Math.round(percentComplete, 2) + '% downloaded');
				}
			};
			var onError = function(xhr) {
			};

			// load texture
			var texture = new THREE.Texture();
			var loader = new THREE.ImageLoader(manager);
			loader.load('obj/Exploded_View/Finishes.Laminate.CarbonFiber.jpg', function(image) {
				texture.image = image;
				texture.needsUpdate = true;
			});

			// load model
			// var returnObject;
			var loader = new THREE.OBJLoader(manager);
			loader.load(url, function(object) {
				console.log(object);
				object.traverse(function(child) {
					if ( child instanceof THREE.Mesh) {
						child.rotation.z = Math.PI / 2;
						child.position.z = -35;
						child.position.x = 10;

						child.geometry.mergeVertices;
						child.geometry.computeVertexNormals();
						child.geometry.computeFaceNormals();
						targetList.push(child);
						$scope.chikd = child;
					}
				});
				
				
				var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($scope.child, 0, 4));

			$('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#container1');
				
				
				/*
				var txtFile = "./test.txt";
							   var file = new File(txtFile,"write");
							   var str = JSON.stringify(json);
															 log("opening file...");
							   file.open(); 
							   log("writing file..");
							   file.writeline(str);
							   file.close();*/
				

				callbackFunction(object);
			}, onProgress, onError);
		}

		function debugAxis(mesh, axisLength) {
			//Shorten the vertex function
			function v(x, y, z) {
				return new THREE.Vector3(x, y, z);
			}

			//Create axis (point1, point2, colour)
			function createAxis(p1, p2, color) {
				var line,
				    lineGeometry = new THREE.Geometry(),
				    lineMat = new THREE.LineBasicMaterial({
					color : color,
					linewidth : 2
				});
				lineGeometry.vertices.push(p1, p2);
				line = new THREE.Line(lineGeometry, lineMat);
				mesh.add(line);
			}

			createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
			createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
			createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
		}

	};

	$scope.OpenCloseMenu = function() {
		if ($scope.open == false) {
			$scope.open = true;
		} else if ($scope.open == true) {
			$scope.open = false;
		}

		angular.element("#wrapper").toggleClass("toggled");

		if ($scope.open == false) {
			$scope.open = true;
		} else if ($scope.open == true) {
			$scope.open = false;
		}
	};
	
	
	$scope.partProperties = [{

		"objIdentifier" : "Object.1",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 1.29,
		"fastStartMult" : 3,
		"fuelType" : "NG",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 2,
		"temparature" : 60,
		"injectionPct" : 2,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {

		"objIdentifier" : "Object.2",
		"hoursRepairLimit" : 24000,
		"tripServereFactor" : 1.89,
		"fastStartMult" : 2,
		"fuelType" : "NG",
		"combustionType" : "DLN",
		"emergencyStartMult" : 2,
		"temparature" : 55,
		"injectionPct" : 2,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.3",
		"hoursRepairLimit" : 24000,
		"tripServereFactor" : 1.89,
		"fastStartMult" : 2,
		"fuelType" : "DO",
		"combustionType" : "DLN",
		"emergencyStartMult" : 2,
		"temparature" : 55,
		"injectionPct" : 3,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.4",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 1.29,
		"fastStartMult" : 3,
		"fuelType" : "RG",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 2,
		"temparature" : 35,
		"injectionPct" : 3,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.5",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 1.89,
		"fastStartMult" : 3,
		"fuelType" : "DO",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 2,
		"temparature" : 35,
		"injectionPct" : 20,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0
	}, {
		"objIdentifier" : "Object.6",
		"hoursRepairLimit" : 24000,
		"tripServereFactor" : 1.89,
		"fastStartMult" : 2,
		"fuelType" : "RG",
		"combustionType" : "DLN",
		"emergencyStartMult" : 3,
		"temparature" : 55,
		"injectionPct" : 15,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.7",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 1.29,
		"fastStartMult" : 3,
		"fuelType" : "NG",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 1.5,
		"temparature" : 35,
		"injectionPct" : 20,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.8",
		"hoursRepairLimit" : 24000,
		"tripServereFactor" : 2.55,
		"fastStartMult" : 2,
		"fuelType" : "HOC",
		"combustionType" : "DLN",
		"emergencyStartMult" : 1.5,
		"temparature" : 60,
		"injectionPct" : 15,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.9",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 1.29,
		"fastStartMult" : 3,
		"fuelType" : "RG",
		"combustionType" : "DLN",
		"emergencyStartMult" : 1.5,
		"temparature" : 60,
		"injectionPct" : 20,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.10",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 1.29,
		"fastStartMult" : 3,
		"fuelType" : "DO",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 2,
		"temparature" : 55,
		"injectionPct" : 15,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.11",
		"hoursRepairLimit" : 24000,
		"tripServereFactor" : 2.55,
		"fastStartMult" : 2,
		"fuelType" : "NG",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 1.5,
		"temparature" : 55,
		"injectionPct" : 8,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.12",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 2.43,
		"fastStartMult" : 3,
		"fuelType" : "DO",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 2,
		"temparature" : 60,
		"injectionPct" : 8,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.13",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 2.43,
		"fastStartMult" : 3,
		"fuelType" : "HOC",
		"combustionType" : "DLN",
		"emergencyStartMult" : 3,
		"temparature" : 60,
		"injectionPct" : 20,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.14",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 2.55,
		"fastStartMult" : 3,
		"fuelType" : "NG",
		"combustionType" : "DLN",
		"emergencyStartMult" : 3,
		"temparature" : 55,
		"injectionPct" : 8,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.15",
		"hoursRepairLimit" : 24000,
		"tripServereFactor" : 2.55,
		"fastStartMult" : 2,
		"fuelType" : "NG",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 1.5,
		"temparature" : 40,
		"injectionPct" : 10,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.16",
		"hoursRepairLimit" : 16000,
		"tripServereFactor" : 1.40,
		"fastStartMult" : 2.5,
		"fuelType" : "DO",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 3,
		"temparature" : 40,
		"injectionPct" : 20,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.17",
		"hoursRepairLimit" : 16000,
		"tripServereFactor" : 1.40,
		"fastStartMult" : 2.5,
		"fuelType" : "RG",
		"combustionType" : "DLN",
		"emergencyStartMult" : 1.5,
		"temparature" : 49,
		"injectionPct" : 10,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}, {
		"objIdentifier" : "Object.18",
		"hoursRepairLimit" : 12000,
		"tripServereFactor" : 2.43,
		"fastStartMult" : 3,
		"fuelType" : "NG",
		"combustionType" : "DLN 2.6e",
		"emergencyStartMult" : 1.5,
		"temparature" : 49,
		"injectionPct" : 10,
		"hoursRepairLimitC" : 0,
		"tripServereFactorC" : 0,
		"fastStartMultC" : 0,
		"emergencyStartMultC" : 0,
		"temparatureC" : 0,
		"injectionPctC" : 0

	}]; 


});