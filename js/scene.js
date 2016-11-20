let camera, controls, scene, renderer;
let container = document.getElementById('container');
init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 4;
    camera.position.y = 1;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xfafafa );
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( -1, -1, -1 );
	scene.add( light );
	light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    container.addEventListener('click', mouseClick, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
    let subtitle = document.getElementById('subtitle');
    if(camera.position.z > 0) {
        subtitle.innerHTML = 'Number of total votes cast by state';
    } else {
        subtitle.innerHTML = 'Eligible voters who didn\'t vote';
    }
    render();
}
function render() {
    renderer.render( scene, camera );
}

function mouseClick() {
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / container.clientHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children, true);
    let data = intersects[0].object.userData;
    let stats = document.getElementById('stats');
    if(!data.flip) {
        let percent;
        if(data.democrat_votes > data.republican_votes) {
            percent = parseInt((data.democrat_votes / data.total_votes) * 100);
            stats.innerHTML = "<h2>" + data.state + "</h2>"
            stats.innerHTML += "<p>Total Votes: " + data.total_votes.toLocaleString() + "</p>"
            stats.innerHTML += "<p>Democrat: " + percent + "%</p>"
            stats.innerHTML += "<p>Republican: " + (100 - percent) + "%</p>";
        } else {
            percent = parseInt((data.republican_votes / data.total_votes) * 100);
            stats.innerHTML = "<h2>" + data.state + "</h2>"
            stats.innerHTML += "<p>Total Votes: " + data.total_votes.toLocaleString() + "</p>"
            stats.innerHTML += "<p>Republican: " + percent + "%</p>";
            stats.innerHTML += "<p>Democrat: " + (100 - percent) + "%</p>"
        }
    } else {
        stats.innerHTML = "<h2>" + data.state + "</h2>"
        stats.innerHTML += "<p>Eligible Voters: " + data.eligible_voters.toLocaleString() + "</p>"
        stats.innerHTML += "<p>Total Votes: " + data.total_votes.toLocaleString() + "</p>"
        stats.innerHTML += "<p>Voter Turnout: " + parseInt((data.total_votes / data.eligible_voters) * 100) + "%</p>";
    }
}
