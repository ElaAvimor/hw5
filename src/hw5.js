import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
scene.background = new THREE.Color( 'ForestGreen' );

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Add here the rendering of your goal

// This is a sample box.
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( {color: 0x000000} );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Geometry constants.
const SKELETON_RADIUS = 0.05;
const CROSSBAR_LENGTH = 3.0;
const GOAL_POST_LENGTH = CROSSBAR_LENGTH / 3;
const BACK_SUPPORT_ANGLE = 45;

// Materials
const goalMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
const netMaterial = new THREE.MeshBasicMaterial({color: 0x888888, side: THREE.DoubleSide});

// Rotation matrix about the x,y,z axes.
function rotate(theta, axis) {
	let m = new THREE.Matrix4();
	theta = degrees_to_radians(theta)

	if(axis == 'x'){
		m.set(1, 0, 0, 0,
			0, Math.cos(theta), -Math.sin(theta), 0,
			0, Math.sin(theta), Math.cos(theta), 0,
			0, 0, 0, 1);
	}
	else if(axis == 'y'){
		m.set(Math.cos(theta), 0, Math.sin(theta), 0, 
		0, 1, 0, 0,
		-Math.sin(theta), 0, Math.cos(theta), 0, 
		0, 0, 0, 1);
	}
	else if(axis == 'z'){
		m.set(Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta), Math.cos(theta), 0, 0, 
		0, 0, 1, 0, 
		0, 0, 0, 1);
	}

	return m;
}


// General translation matrix.
function translation(x, y, z) {
    let m = new THREE.Matrix4();
    m.set(1, 0, 0, x, 
		  0, 1, 0, y,
          0, 0, 1, z,
          0, 0, 0, 1);
    return m
}

// Setting up lighting.
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Goal setup
const goal = new THREE.Group();
scene.add(goal);
const skeleton = new THREE.Group();
goal.add(skeleton);
const nets = new THREE.Group();
goal.add(nets);

// Creating the ball.
const ballGeometry = new THREE.SphereGeometry(GOAL_POST_LENGTH / 16, 32, 16);
const ballMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.applyMatrix4(translation(0, -GOAL_POST_LENGTH * 0.5, 0.75));
scene.add(ball);

// Creating the crossbar
const crossbarGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, CROSSBAR_LENGTH, 32);
const crossbar = new THREE.Mesh(crossbarGeometry, goalMaterial);
crossbar.applyMatrix4(rotate(90, 'z'));
skeleton.add(crossbar);

// Adding goal posts.
const goalPostGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, GOAL_POST_LENGTH, 32);
const leftGoalPost = new THREE.Mesh(goalPostGeometry, goalMaterial);
const rightGoalPost = new THREE.Mesh(goalPostGeometry, goalMaterial);

leftGoalPost.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, 0));
rightGoalPost.applyMatrix4(translation(CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, 0));
skeleton.add(leftGoalPost);
skeleton.add(rightGoalPost);

const connectGeometry = new THREE.SphereGeometry(SKELETON_RADIUS, 32, 16);
const connectRight = new THREE.Mesh(connectGeometry, goalMaterial);
const connectLeft = new THREE.Mesh(connectGeometry, goalMaterial);

// Translate the connection Fillers to the end points of the crossbar
connectRight.applyMatrix4(translation(0, CROSSBAR_LENGTH / 2, 0));
connectLeft.applyMatrix4(translation(0, -CROSSBAR_LENGTH / 2, 0));

crossbar.add(connectRight);
crossbar.add(connectLeft);

let zTransSupport = -GOAL_POST_LENGTH / 2 * Math.tan(degrees_to_radians(BACK_SUPPORT_ANGLE));
// Adding the net
const netGeometry = new THREE.PlaneGeometry(CROSSBAR_LEN, POST_LEN / Math.cos(degrees_to_radians(BACK_SUPPORT_ANGLE)));
const backNet = new THREE.Mesh(netGeometry, netMaterial);
backNet.applyMatrix4(rotate(BACK_SUPPORT_ANGLE,'x'));
backNet.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTransSupport));
nets.add(backNet);






// Interactive:
let animate1 = false;
let animate2 = false;
let animate3 = false;
let speed = 0.7
;
function ballAnimate() {
    if (animate1) {
        ball.applyMatrix4(rotateX(2 * speed));
    }

    if (animate2) {
        ball.applyMatrix4(rotateY(2 * speed));
    }

    if (animate3) {
        const scaleMatrix = new THREE.Matrix4().makeScale(0.95, 0.95, 0.95);
        goal.applyMatrix4(scaleMatrix);

        animate3 = false;  // Reset the animation flag.
    }
}


// This defines the initial distance of the camera
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,0,5);
camera.applyMatrix4(cameraTranslate)

renderer.render( scene, camera );

const controls = new OrbitControls( camera, renderer.domElement );

let isOrbitEnabled = true;

const toggleOrbit = (e) => {
	if (e.key == "o"){
		isOrbitEnabled = !isOrbitEnabled;
	}
}

document.addEventListener('keydown',toggleOrbit)

//controls.update() must be called after any manual changes to the camera's transform
controls.update();

function animate() {

	requestAnimationFrame( animate );

	controls.enabled = isOrbitEnabled;
	controls.update();

	renderer.render( scene, camera );

}
animate()