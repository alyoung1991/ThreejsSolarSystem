    var renderer;
    var scene;
    var camera;
    var projector;
    var cameraControls;
    var spotLight;
    var cloudMesh;
    var sun;
    var clock = new THREE.Clock();
    var mercGroundPlane, earthGroundPlane, venusGroundPlane, marsGroundPlane, jupiterGroundPlane, saturnGroundPlane, uranusGroundPlane, neptuneGroundPlane, plutoGroundPlane;

	Physijs.scripts.worker = 'libs/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
	
	function init()
	{
		scene = new Physijs.Scene();
		scene.setGravity(new THREE.Vector3( 0, 0, -30 ));
        
		setupCamera();
		setupRenderer();
		
        // base image texture for mesh
        var lavaTexture = new THREE.ImageUtils.loadTexture( 'images/sun1.jpg');
        lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping; 
        // multiplier for distortion speed 		
        var baseSpeed = 0.02;
        // number of times to repeat texture in each direction
        var repeatS = repeatT = 4.0;

        // texture used to generate "randomness", distort all other textures
        var noiseTexture = new THREE.ImageUtils.loadTexture( 'images/cloud.png' );
        noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
        // magnitude of noise effect
        var noiseScale = 0.5;

        // texture to additively blend with base image texture
        var blendTexture = new THREE.ImageUtils.loadTexture( 'images/sun1.jpg' );
        blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping; 
        // multiplier for distortion speed 
        var blendSpeed = 0.01;
        // adjust lightness/darkness of blended texture
        var blendOffset = 0.25;

        // texture to determine normal displacement
        var bumpTexture = noiseTexture;
        bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
        // multiplier for distortion speed 		
        var bumpSpeed   = 0.1;
        // magnitude of normal displacement
        var bumpScale   = 13.0;

        // use "this." to create global object
        this.customUniforms = {
            baseTexture: 	{ type: "t", value: lavaTexture },
            baseSpeed:		{ type: "f", value: baseSpeed },
            repeatS:		{ type: "f", value: repeatS },
            repeatT:		{ type: "f", value: repeatT },
            noiseTexture:	{ type: "t", value: noiseTexture },
            noiseScale:		{ type: "f", value: noiseScale },
            blendTexture:	{ type: "t", value: blendTexture },
            blendSpeed: 	{ type: "f", value: blendSpeed },
            blendOffset: 	{ type: "f", value: blendOffset },
            bumpTexture:	{ type: "t", value: bumpTexture },
            bumpSpeed: 		{ type: "f", value: bumpSpeed },
            bumpScale: 		{ type: "f", value: bumpScale },
            alpha: 			{ type: "f", value: 1.0 },
            time: 			{ type: "f", value: 1.0 }
        };

        // create custom material from the shader code
        var customMaterial = new THREE.ShaderMaterial( 
        {
            uniforms: customUniforms,
            vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        }   );

        var sunGeometry = new THREE.SphereGeometry( 55, 64, 64 );
        var sun = new THREE.Mesh(	sunGeometry, customMaterial );
        
        scene.add( sun );
        
		createOrbitPlane();
		
        addSpotLight();
        loadSounds();
        music.play();
		
		createPlanets();
	
        cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
        cameraControls.target.set( 0, 0, 0);
		cameraControls.maxDistance = 500;
		cameraControls.minDistance = 10;
		cameraControls.update();

		// Output to the stream
		document.body.appendChild( renderer.domElement );
        
		// Call render
		render();
	}
	
	function render()
	{   
        rotatePlanets();
        
		scene.simulate();
        
		// Request animation frame
		requestAnimationFrame( render );
        
		// Call render()
		renderer.render( scene, camera );
        
	}
	
	<!-- 5. Ground plane -->
	function createOrbitPlane()
	{	    
		var planeMaterial = new Physijs.createMaterial(new THREE.MeshBasicMaterial({color: 'white'}), .4, .8 );
        var planeGeometry = new THREE.SphereGeometry(1);
        
        mercGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        mercGroundPlane.rotation.x += .8;
        
        venusGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        venusGroundPlane.rotation.x += .8;
        
        earthGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        earthGroundPlane.rotation.x += .8;
        
        marsGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        marsGroundPlane.rotation.x += .8;
        
        jupiterGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        jupiterGroundPlane.rotation.x += .8;
        
        saturnGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        saturnGroundPlane.rotation.x += .8;
        
        uranusGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        uranusGroundPlane.rotation.x += .8;
        
        neptuneGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        neptuneGroundPlane.rotation.x += .8;
        
        plutoGroundPlane = new THREE.Mesh( planeGeometry, planeMaterial);
        plutoGroundPlane.rotation.x += .8;
        
        let galaxyGeometry = new THREE.SphereGeometry(500, 32, 32);
        let galaxyMaterial = new THREE.MeshBasicMaterial(
            {
                map: THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
                side: THREE.BackSide
            });
        let galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        
		scene.add(mercGroundPlane);
        scene.add(venusGroundPlane);
        scene.add(earthGroundPlane);
        scene.add(marsGroundPlane);
        scene.add(jupiterGroundPlane);
        scene.add(saturnGroundPlane);
        scene.add(uranusGroundPlane);
        scene.add(neptuneGroundPlane);
        scene.add(plutoGroundPlane);
        scene.add(galaxy);
    }
	

	<!-- 14. Create target -->
	var targetlist;
	function createPlanets()
	{
        createOrbits();
        
        var spriteMaterial = new THREE.SpriteMaterial( 
        { 
            map: new THREE.ImageUtils.loadTexture( 'images/glow.png' ), 
            useScreenCoordinates: false,
            color: 0xFFFDC8, 
            transparent: false, 
            blending: THREE.AdditiveBlending
        });
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(170, 170, 1.0);
        mercGroundPlane.add( sprite );
        
        var mercuryTexture = THREE.ImageUtils.loadTexture('images/mercurymap.jpg');
        var mercuryGeometry = new THREE.SphereGeometry( .5, 32, 32 );
		var mercuryMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: mercuryTexture}), .95, .95 );
		mercury = new Physijs.SphereMesh( mercuryGeometry, mercuryMaterial , 1);
        mercury.position.x = 0;
		mercury.position.y = 0;
		mercury.position.z = 80;
		mercury.name = "MercuryBall";
		
		mercGroundPlane.add( mercury );
        
        var venusTexture = THREE.ImageUtils.loadTexture('images/venusmap.jpg');
        var venusGeometry = new THREE.SphereGeometry( 1, 32, 32 );
		var venusMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: venusTexture}), .95, .95 );
		venus = new Physijs.SphereMesh( venusGeometry, venusMaterial , 1);
        venus.position.x = 0;
		venus.position.y = 0;
		venus.position.z = 90;
		venus.name = "VenusBall";
		
		venusGroundPlane.add( venus );
        
        var earthTexture = THREE.ImageUtils.loadTexture('images/earthterrain.jpg');
        
        var earthGeometry = new THREE.SphereGeometry( 1.5, 32, 32 );
		var earthMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: earthTexture}), .95, .95 );
		earth = new Physijs.SphereMesh( earthGeometry, earthMaterial , 1);
        earth.position.x = 0;
		earth.position.y = 0;
		earth.position.z = 100;
		earth.name = "EarthBall";
		
		earthGroundPlane.add( earth );
        
        var moonTexture = THREE.ImageUtils.loadTexture('images/moonmap1k.jpg');
        
        var moonGeometry = new THREE.SphereGeometry( .3, 32, 32 );
		var moonMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: moonTexture}), .95, .95 );
		moon = new Physijs.SphereMesh( moonGeometry, moonMaterial , 1);
        moon.position.x = 4;
		
		earth.add( moon );
        
        var canvasCloud = THREE.ImageUtils.loadTexture('images/clouds.jpg');
        var cloudGeometry   = new THREE.SphereGeometry(1.55, 32, 32);
        var cloudMaterial  = new THREE.MeshPhongMaterial(
            {
                map         : canvasCloud,
                side        : THREE.DoubleSide,
                opacity     : 0.25,
                transparent : true,
                depthWrite  : false,
            });
        cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        earth.add(cloudMesh);
        
        
        var marsTexture = THREE.ImageUtils.loadTexture('images/marsmap1k.jpg');
		var marsGeometry = new THREE.SphereGeometry( .75, 32, 32 );
		var marsMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: marsTexture}), .95, .95 );
		mars = new Physijs.SphereMesh( marsGeometry, marsMaterial , 1);
        mars.position.x = 0;
		mars.position.y = 0;
		mars.position.z = 110;
		mars.name = "MarsBall";
		
		marsGroundPlane.add( mars );
        
        
        
        var jupiterTexture = THREE.ImageUtils.loadTexture('images/jupitermap.jpg');
        var jupiterGeometry = new THREE.SphereGeometry( 14, 32, 32 );
		var jupiterMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: jupiterTexture}), .95, .95 );
		jupiter = new Physijs.SphereMesh( jupiterGeometry, jupiterMaterial , 1);
        jupiter.position.x = 0;
		jupiter.position.y = 0;
		jupiter.position.z = 150;
		jupiter.name = "JupiterBall";
		
		jupiterGroundPlane.add( jupiter );
        
        
        
        var saturnTexture = THREE.ImageUtils.loadTexture('images/saturnmap.jpg');
        var saturnGeometry = new THREE.SphereGeometry( 8.5, 32, 32 );
		var saturnMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: saturnTexture,side: THREE.DoubleSide}), .95, .95 );
		saturn = new Physijs.SphereMesh( saturnGeometry, saturnMaterial , 1);
        saturn.position.x = 0;
		saturn.position.y = 0;
		saturn.position.z = 200;
		saturn.name = "SaturnBall";
		
        var saturnRingTexture = THREE.ImageUtils.loadTexture('images/saturnringcolor.jpg');
        var saturnRingGeometry = new THREE.RingGeometry(10, 17, 32, 1);
        var saturnRingMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial(
                    {
                    map:saturnRingTexture, 
                    opacity: 0.55, 
                    transparent : true
                    }), .95, .95 );
        saturnRing = new Physijs.SphereMesh (saturnRingGeometry, saturnRingMaterial, 0);
        saturnRing.position.x = 0;
        saturnRing.position.z = 0;
        saturnRing.rotation.x = 220 * Math.PI / 180;
        
		saturnGroundPlane.add( saturn );
        saturn.add( saturnRing );
        
        
        var uranusTexture = THREE.ImageUtils.loadTexture('images/uranusmap.jpg');
        var uranusGeometry = new THREE.SphereGeometry( 5, 32, 32 );
		var uranusMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: uranusTexture}), .95, .95 );
		uranus = new Physijs.SphereMesh( uranusGeometry, uranusMaterial , 1);
        uranus.position.x = 0;
		uranus.position.y = 0;
		uranus.position.z = 240;
		uranus.name = "UranusBall";
		
		uranusGroundPlane.add( uranus );
        
        
        var neptuneTexture = THREE.ImageUtils.loadTexture('images/neptunemap.jpg');
        var neptuneGeometry = new THREE.SphereGeometry( 5, 32, 32 );
		var neptuneMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: neptuneTexture}), .95, .95 );
		neptune = new Physijs.SphereMesh( neptuneGeometry, neptuneMaterial , 1);
        neptune.position.x = 0;
		neptune.position.y = 0;
		neptune.position.z = 280;
		neptune.name = "NeptuneBall";
		
		neptuneGroundPlane.add( neptune );
        
        var plutoTexture = THREE.ImageUtils.loadTexture('images/plutomap1k.jpg');
        var plutoGeometry = new THREE.SphereGeometry( 1, 32, 32 );
		var plutoMaterial = new Physijs.createMaterial( new THREE.MeshLambertMaterial({map: plutoTexture}), .95, .95 );
		pluto = new Physijs.SphereMesh( plutoGeometry, plutoMaterial , 1);
        pluto.position.x = 0;
		pluto.position.y = 0;
		pluto.position.z = 300;
		pluto.name = "PlutoBall";
		
		plutoGroundPlane.add( pluto );
        
	}

    function createOrbits()
    {      
		var OrbitMaterial = new THREE.MeshBasicMaterial({color:'grey'});
        
        var mercOrbitGeo = new THREE.RingGeometry( 79.8, 80.1, 75, 75 );
		mercOrbit = new THREE.Mesh( mercOrbitGeo, OrbitMaterial );
        mercOrbit.rotation.x = -45 * Math.PI / 180;
		        
        
        var venusOrbitGeo = new THREE.RingGeometry( 89.8, 90.1, 75, 75 );
		venusOrbit = new THREE.Mesh( venusOrbitGeo, OrbitMaterial );
        venusOrbit.rotation.x = -45 * Math.PI / 180;
        
        
        var earthOrbitGeo = new THREE.RingGeometry( 99.8, 100.1, 75, 75 );
		earthOrbit = new THREE.Mesh( earthOrbitGeo, OrbitMaterial );
        earthOrbit.rotation.x = -45 * Math.PI / 180;
		
        
        var marsOrbitGeo = new THREE.RingGeometry( 109.8, 110.1, 75, 75 );
		marsOrbit = new THREE.Mesh( marsOrbitGeo, OrbitMaterial );
        marsOrbit.rotation.x = -45 * Math.PI / 180;
		
        
        var jupOrbitGeo = new THREE.RingGeometry( 149.8, 150.1, 75, 75 );
		jupOrbit = new THREE.Mesh( jupOrbitGeo, OrbitMaterial);
        jupOrbit.rotation.x = -45 * Math.PI / 180;
		        
        
        var saturnOrbitGeo = new THREE.RingGeometry( 199.8, 200.1, 75, 75 );
		saturnOrbit = new THREE.Mesh( saturnOrbitGeo, OrbitMaterial );
        saturnOrbit.rotation.x = -45 * Math.PI / 180;
        
        
        var uranusOrbitGeo = new THREE.RingGeometry( 239.8, 240.1, 75, 75 );
		uranusOrbit = new THREE.Mesh( uranusOrbitGeo, OrbitMaterial );
        uranusOrbit.rotation.x = -45 * Math.PI / 180;
		
        
        var nepOrbitGeo = new THREE.RingGeometry( 279.8, 280.1, 75, 75 );
		nepOrbit = new THREE.Mesh( nepOrbitGeo, OrbitMaterial );
        nepOrbit.rotation.x = -45 * Math.PI / 180;
        
        
        var plutoOrbitGeo = new THREE.RingGeometry( 299.8, 300.1, 75, 75 );
		plutoOrbit = new THREE.Mesh( plutoOrbitGeo, OrbitMaterial );
        plutoOrbit.rotation.x = -45 * Math.PI / 180;

        
        scene.add( mercOrbit );
        scene.add( venusOrbit );
		scene.add( earthOrbit );
		scene.add( marsOrbit );
        scene.add( jupOrbit );
		scene.add( saturnOrbit );
		scene.add( uranusOrbit );
		scene.add( nepOrbit );
		scene.add( plutoOrbit );
        
    }

    function update()
    {
        var delta = clock.getDelta();
        customUniforms.time.value += delta;
    }

    function animate() 
    {
        requestAnimationFrame( animate );	
        update();
    }
	
	function setupCamera()
	{
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.x = -50;
		camera.position.y = -150;
		camera.position.z = 230;
        
		camera.lookAt( scene.position );
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		//						color     alpha
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
	}

	function addSpotLight()
	{
        spotLight = new THREE.SpotLight( 0xffffff);
        spotLight.position.set( 0, 200, 0 );
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 100;
        spotLight.castShadow = true;
		spotLight.intensity = 1.3;
        mercGroundPlane.add(spotLight);
        
        sunLight =  new THREE.SpotLight( 0xffffff);
        sunLight.position.set( 0, -50, 0 );
        sunLight.shadow.camera.near = 10;
        sunLight.shadow.camera.far = 100;
        sunLight.castShadow = true;
		sunLight.intensity = 1;
        mercGroundPlane.add(sunLight);
	}
	
    function rotatePlanets()
    {   
        mercGroundPlane.rotation.y += .004;
        venusGroundPlane.rotation.y += .003;
        earthGroundPlane.rotation.y += .002;
        marsGroundPlane.rotation.y += .0015;
        jupiterGroundPlane.rotation.y += .0012;
        saturnGroundPlane.rotation.y += .001;
        uranusGroundPlane.rotation.y += .0008;
        neptuneGroundPlane.rotation.y += .0006;
        plutoGroundPlane.rotation.y += .0004;
        cloudMesh.rotation.y += .0005;
        cloudMesh.rotation.x += .00025;
        mercury.rotation.x += .004;
        venus.rotation.y -= .006;
        earth.rotation.y += .005;
        mars.rotation.z += .004;
        jupiter.rotation.y -= .005;
        uranus.rotation.y += .004;
        neptune.rotation.y += .006;
    }

    function onDocumentMouseMove( event ) {

        event.preventDefault();

        if ( isMouseDown ) {

            theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 )
                    + onMouseDownTheta;
            phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 )
                  + onMouseDownPhi;

            phi = Math.min( 180, Math.max( 0, phi ) );

            camera.position.x = radious * Math.sin( theta * Math.PI / 360 )
                                * Math.cos( phi * Math.PI / 360 );
            camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
            camera.position.z = radious * Math.cos( theta * Math.PI / 360 )
                                * Math.cos( phi * Math.PI / 360 );
            camera.updateMatrix();

        }

        mouse3D = projector.unprojectVector(
            new THREE.Vector3(
                ( event.clientX / renderer.domElement.width ) * 2 - 1,
                - ( event.clientY / renderer.domElement.height ) * 2 + 1,
                0.5
            ),
            camera
        );
        ray.direction = mouse3D.subSelf( camera.position ).normalize();

        interact();
        render();

    }

    var music;
    function loadSounds()
    {
        music = new Audio("sounds/space.mp3");
        music.volume = .10;
    }

	window.onload = init;
    animate();

