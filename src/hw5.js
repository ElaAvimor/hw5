import {OrbitControls} from './OrbitControls.js'
import * as THREE from 'three';
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

// Attribute for turning all wireFrames on and off
let isWireFrameEnabled = false;

// Geometry constants.
const SKELETON_RADIUS = 0.05;
const CROSSBAR_LENGTH = 3.0;
const GOAL_POST_LENGTH = CROSSBAR_LENGTH / 3;
const POSTS_ANGLE = 35;

// Materials
const goalMaterial = new THREE.MeshPhongMaterial({color: "white", wireframe: isWireFrameEnabled});
const netMaterial = new THREE.MeshBasicMaterial({color: 0x888888, side: THREE.DoubleSide, wireframe: isWireFrameEnabled});
const ballMaterial = new THREE.MeshPhongMaterial({color: 0x000000, wireframe: isWireFrameEnabled});


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

// Setting up lighting for the MeshPhongMaterial
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Structure setup
const goal = new THREE.Group();
scene.add(goal);
const skeleton = new THREE.Group();
goal.add(skeleton);
const nets = new THREE.Group();
goal.add(nets);


/* Goal - Skeleton elements:*/
// Crossbar
const crossbarGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, CROSSBAR_LENGTH, 32);

const crossbar = new THREE.Mesh(crossbarGeometry, goalMaterial);
crossbar.applyMatrix4(rotate(90, 'z'));
skeleton.add(crossbar);

// Goal posts
const goalPostGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, GOAL_POST_LENGTH, 32);

const leftGoalPost = new THREE.Mesh(goalPostGeometry, goalMaterial);
leftGoalPost.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, 0));
skeleton.add(leftGoalPost);

const rightGoalPost = new THREE.Mesh(goalPostGeometry, goalMaterial);
rightGoalPost.applyMatrix4(translation(CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, 0));
skeleton.add(rightGoalPost);

// Back supports
let zSupport = -GOAL_POST_LENGTH / 2 * Math.tan(degrees_to_radians(POSTS_ANGLE));
const BackSupportGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, GOAL_POST_LENGTH / Math.cos(degrees_to_radians(POSTS_ANGLE)), 32);

const rightBackSupport = new THREE.Mesh(BackSupportGeometry, goalMaterial);
rightBackSupport.applyMatrix4(rotate(POSTS_ANGLE, 'x'));
rightBackSupport.applyMatrix4(translation(CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, zSupport));
skeleton.add(rightBackSupport);

const leftBackSupport = new THREE.Mesh(BackSupportGeometry, goalMaterial);
leftBackSupport.applyMatrix4(rotate(POSTS_ANGLE, 'x'));
leftBackSupport.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, zSupport));
skeleton.add(leftBackSupport);

// Handles the post and support intersections
const postSupportIntersection = new THREE.SphereGeometry(SKELETON_RADIUS, 32, 16);

const rightIntersection = new THREE.Mesh(postSupportIntersection, goalMaterial);
rightIntersection.applyMatrix4(translation(0, CROSSBAR_LENGTH / 2, 0));
crossbar.add(rightIntersection);

const leftIntersection = new THREE.Mesh(postSupportIntersection, goalMaterial);
leftIntersection.applyMatrix4(translation(0, -CROSSBAR_LENGTH / 2, 0));
crossbar.add(leftIntersection);



/* Goal - Nets elements (rectangular and triangular) */
const netGeometry = new THREE.PlaneGeometry(CROSSBAR_LENGTH, GOAL_POST_LENGTH / Math.cos(degrees_to_radians(POSTS_ANGLE)));

const backNet = new THREE.Mesh(netGeometry, netMaterial);
backNet.applyMatrix4(rotate(POSTS_ANGLE,'x'));
backNet.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zSupport));
nets.add(backNet);

// Building the triangle shape for the side nets
const triangleShape = new THREE.Shape();
let zTorus= -GOAL_POST_LENGTH / Math.tan(degrees_to_radians(POSTS_ANGLE)) / 2;
triangleShape.moveTo(0, 0); 
triangleShape.lineTo(0, -GOAL_POST_LENGTH); 
triangleShape.lineTo(zTorus, -GOAL_POST_LENGTH); 
triangleShape.lineTo(0, 0); 

const triangleGeometry = new THREE.ShapeGeometry(triangleShape);

const rightNet = new THREE.Mesh(triangleGeometry, netMaterial);
rightNet.applyMatrix4(rotate(-90, 'y'));
rightNet.applyMatrix4(translation(CROSSBAR_LENGTH / 2, 0, 0));
nets.add(rightNet);

const leftNet = new THREE.Mesh(triangleGeometry, netMaterial);
leftNet.applyMatrix4(rotate(-90, 'y'));
leftNet.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, 0, 0));
nets.add(leftNet);

// Adding the toruses
const torusGeometry = new THREE.TorusGeometry(SKELETON_RADIUS * 1.25, SKELETON_RADIUS * 0.75, 32, 100);

const frontRightTorus = new THREE.Mesh(torusGeometry, goalMaterial);
frontRightTorus.applyMatrix4(rotate(90, 'x'));
frontRightTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, 0));
rightGoalPost.add(frontRightTorus);

const frontLeftTorus = new THREE.Mesh(torusGeometry, goalMaterial);
frontLeftTorus.applyMatrix4(rotate(90, 'x'));
frontLeftTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, 0));
leftGoalPost.add(frontLeftTorus);

const backLeftTorus = new THREE.Mesh(torusGeometry, goalMaterial);
backLeftTorus.applyMatrix4(rotate(90, 'x'));
backLeftTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTorus));
leftGoalPost.add(backLeftTorus);

const backRightTorus = new THREE.Mesh(torusGeometry, goalMaterial);
backRightTorus.applyMatrix4(rotate(90, 'x'));
backRightTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTorus));
rightGoalPost.add(backRightTorus);

// Ball
const ballGeometry = new THREE.SphereGeometry(GOAL_POST_LENGTH / 16, 32, 16);
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.applyMatrix4(translation(0, -GOAL_POST_LENGTH * 0.25, 0.75));
scene.add(ball);


//Bonus: 2 red flags on both sides of the goal:
// Flag Constants
const FLAG_POST_HEIGHT = GOAL_POST_LENGTH * 1.2;  // Make the flag post taller than the goal post.
const FLAG_POST_RADIUS = SKELETON_RADIUS;  // Same radius as the skeleton of the goal.
const FLAG_WIDTH = CROSSBAR_LENGTH / 4;
const FLAG_HEIGHT = GOAL_POST_LENGTH / 2;

// Flag Materials
const flagPostMaterial = new THREE.MeshPhongMaterial({ color: 'black', wireframe: isWireFrameEnabled, side: THREE.DoubleSide});
const flagMaterial = new THREE.MeshPhongMaterial({ color: 'red', wireframe: isWireFrameEnabled, side: THREE.DoubleSide });

// Flag Post Geometry
const flagPostGeometry = new THREE.CylinderGeometry(FLAG_POST_RADIUS, FLAG_POST_RADIUS, FLAG_POST_HEIGHT, 32);

// Flag Geometry
const flagShape = new THREE.Shape();
flagShape.moveTo(0, 0);
flagShape.lineTo(FLAG_WIDTH, 0);
flagShape.lineTo(FLAG_WIDTH / 2, FLAG_HEIGHT);
flagShape.lineTo(0, 0);
const flagGeometry = new THREE.ShapeGeometry(flagShape);

// Creating flags
function createFlag(xPosition) {
    const flagPost = new THREE.Mesh(flagPostGeometry, flagPostMaterial);
    // Set the bottom of the flag post to align with the bottom of the goal post
    flagPost.position.set(xPosition, -GOAL_POST_LENGTH / 2, 0);

    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    // Position the triangle at the top of the post
    flag.position.set(xPosition, GOAL_POST_LENGTH / 3.5 - FLAG_POST_HEIGHT + FLAG_HEIGHT / 2, 0);
    flag.rotation.z = Math.PI / 2;  // Rotate to position perpendicular

    // Orient the flag based on the side to point away from the goal
    if (xPosition < 0) {
        flag.rotation.y = Math.PI * 2;  // For the left flag, rotate to ensure it points outward to the left
    } else {
        flag.rotation.y =  - Math.PI;  // For the right flag, rotate to ensure it points outward to the right
    }
    // Add to the scene
    skeleton.add(flagPost);
    skeleton.add(flag);
}
// Add flags to both sides of the goal, slightly outside the crossbar ends
const flagOffset = FLAG_WIDTH / 2 + FLAG_POST_RADIUS;  // Calculate the flag offset from the goal ends
createFlag(-CROSSBAR_LENGTH / 2 - flagOffset);  // Left flag
createFlag(CROSSBAR_LENGTH / 2 + flagOffset);  // Right flag



// Interactivity:
let rotateBallY = false;
let rotateBallZ = false;
let shrinkGoal = false;
let speedFactor = 1;

//event listener
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case '1':
            rotateBallY = !rotateBallY;
            break;
        case '2':
            rotateBallZ = !rotateBallZ;
            break;
        case '3':
            shrinkGoal = !shrinkGoal;
            break;
        case '+':
            speedFactor *= 1.1;
            break;
        case '-':
            speedFactor /= 1.1;
            break;
	}
});


function ballAnimation() {
    if (rotateBallY) {
        ball.applyMatrix4(rotate(2 * speedFactor, 'y'));
    }

    if (rotateBallZ) {
        ball.applyMatrix4(rotate(2 * speedFactor, 'z'));
    }

    if (shrinkGoal) {
        const scaleMatrix = new THREE.Matrix4().makeScale(0.95, 0.95, 0.95);
        goal.applyMatrix4(scaleMatrix);

        shrinkGoal = false;  // Reset the animation flag.
    }
}


// This defines the initial distance of the camera
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,0,5);
camera.applyMatrix4(cameraTranslate)

renderer.render( scene, camera );

const controls = new OrbitControls( camera, renderer.domElement );

let isOrbitEnabled = true;
isWireFrameEnabled = false;

const toggleOrbit = (e) => {
	if (e.key == "o"){
		isOrbitEnabled = !isOrbitEnabled;
	}
}

const toggleWireFrame = (e) => {
    if (e.key == "w") {
        isWireFrameEnabled = !isWireFrameEnabled;
        goalMaterial.wireframe = isWireFrameEnabled;
        netMaterial.wireframe = isWireFrameEnabled;
        ballMaterial.wireframe = isWireFrameEnabled;
    }
}

document.addEventListener('keydown',toggleOrbit);
document.addEventListener('keydown', toggleWireFrame);


//controls.update() must be called after any manual changes to the camera's transform
controls.update();

function animate() {

	requestAnimationFrame( animate );

	controls.enabled = isOrbitEnabled;
	controls.update();

    ballAnimation();

	renderer.render( scene, camera );

}
animate()