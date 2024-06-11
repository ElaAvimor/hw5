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

let zSupport = -GOAL_POST_LENGTH / 2 * Math.tan(degrees_to_radians(BACK_SUPPORT_ANGLE));
// Adding the nets
const netGeometry = new THREE.PlaneGeometry(CROSSBAR_LENGTH, GOAL_POST_LENGTH / Math.cos(degrees_to_radians(BACK_SUPPORT_ANGLE)));
const backNet = new THREE.Mesh(netGeometry, netMaterial);
const rightNet = new THREE.Mesh(triangleGeometry, netMaterial);
const leftNet = new THREE.Mesh(triangleGeometry, netMaterial);
backNet.applyMatrix4(rotate(BACK_SUPPORT_ANGLE,'x'));
backNet.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zSupport));
rightNet.applyMatrix4(rotate(-90, 'y'))
leftNet.applyMatrix4(rotate(-90, 'y'))
rightNet.applyMatrix4(translation(CROSSBAR_LENGTH / 2, 0, 0));
leftNet.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, 0, 0));
nets.add(rightNet);
nets.add(leftNet);
nets.add(backNet);

//adding the toruses
let zTorus= -GOAL_POST_LENGTH / Math.tan(degrees_to_radians(BACK_SUPPORT_ANGLE)) / 2;
const torusGeometry = new THREE.TorusGeometry(SKELETON_RADIUS * 1.25, SKELETON_RADIUS * 0.75, 32, 100);
const frontRightTorus = new THREE.Mesh(torusGeometry, goalMaterial);
const frontLeftTorus = new THREE.Mesh(torusGeometry, goalMaterial);
const backLeftTorus = new THREE.Mesh(torusGeometry, goalMaterial);
const backRightTorus = new THREE.Mesh(torusGeometry, goalMaterial);
frontRightTorus.applyMatrix4(rotate(90), 'x');
frontRightTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, 0));
frontLeftTorus.applyMatrix4(rotate(90), 'x');
frontLeftTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, 0));
backRightTorus.applyMatrix4(rotateX(90));
backRightTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTorus));
backLeftTorus.applyMatrix4(rotateX(90));
backLeftTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTorus));







//event listener

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case '1':
            animate1 = !animate1;
            break;
        case '2':
            animate2 = !animate2;
            break;
        case '3':
            animate3 = !animate3;
            break;
        case 'ArrowUp':
            speedFactor *= 1.1;
            break;
        case 'ArrowDown':
            speedFactor /= 1.1;
            break;
	}
});
// Interactive:
let animate1 = false;
let animate2 = false;
let animate3 = false;
let speed = 0.7
;
function ballAnimate() {
    if (animate1) {
        ball.applyMatrix4(rotate(2 * speed, 'x'));
    }

    if (animate2) {
        ball.applyMatrix4(rotate(2 * speed, 'y'));
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