import "./style.css";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

document.querySelectorAll(".circleButton").forEach((element) => {
	const btnText = element.querySelector(".circleText");
	const text = btnText.textContent;
	const degStep = parseInt(element.dataset.degRange) / text.length;
	btnText.innerHTML = "";
	text
		.split("")
		.forEach((letter, i) => (btnText.innerHTML += `<span  class="circleLetter">${letter}</span>`));

	Array.from(btnText.children).forEach((el, i) => {
		el.style.left = btnText.offsetWidth / 2 - el.getBoundingClientRect().width / 2 + "px";
		el.style.top = btnText.offsetHeight / 2 + "px";
		el.style.transform = `translateY(-100%) rotate(${degStep * i}deg)`;
		el.style.transitionDelay = (0.2 / text.length) * i + "s";
	});
});

function clamp(val, min, max) {
	return Math.min(Math.max(val, min), max);
}

const mainSlider = document.getElementById("main").querySelectorAll(".mainSlider");
const slidersProgress = document.getElementById("slidersProgress");
const sliderProgressList = [];

for (let i = 0; i < mainSlider.length; i++) {
	const sliderProgress = document.createElement("div");
	sliderProgress.classList.add("sliderProgress");
	const sliderProgressValue = document.createElement("div");
	sliderProgressValue.classList.add("sliderProgressValue");

	sliderProgress.appendChild(sliderProgressValue);
	slidersProgress.appendChild(sliderProgress);
	sliderProgressList.push(sliderProgressValue);
}

const sliderHeight = mainSlider.item(0).clientHeight;
const totalSliderHeight = sliderHeight * mainSlider.length;
let sliderState = 0;

document.getElementById("main").addEventListener("wheel", ({ deltaY }) => {
	sliderState = clamp(sliderState + deltaY * 0.3, 0, totalSliderHeight + sliderHeight / 4);
	updateSlider();
});

function interpolateColor(color1, color2, factor) {
	if (color1.length < 4) {
		color1.push(1);
	}
	if (color2.length < 4) {
		color2.push(1);
	}

	if (arguments.length < 3) {
		factor = 0.5;
	}
	const result = color1.slice();
	for (let i = 0; i < result.length; i++) {
		result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
	}
	return result;
}

function arrToRGBA(colorArray = []) {
	return `rgba(${colorArray.join(",")}${colorArray.length < 4 ? ",1" : ""})`;
}

function getColor(strColor) {
	if (strColor[0] == "#") {
		const aRgbHex = str.substring(1).match(/.{1,2}/g);
		const aRgb = [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16), 1];
		return aRgb;
	}

	if (strColor.substring(0, 2) == "--") {
		return getColor(getComputedStyle(document.documentElement).getPropertyValue(strColor));
	}

	const hslOrRgb = strColor.substring(0, 3);

	if (hslOrRgb == "rgb") {
		let startSubstring = 4;
		if (strColor[3] == "a") {
			startSubstring = 5;
		}
		return strColor
			.substring(startSubstring, strColor.length - 1)
			.split(",")
			.map((strNum, i) => (i < 4 ? parseInt(strNum) : parseFloat(strNum)));
	}

	if (hslOrRgb) {
		let hsl = strColor
			.substring(4, strColor.length - 1)
			.split(",")
			.map((strNum) => parseInt(strNum));
		hsl[1] /= 100;
		hsl[2] /= 100;
		const k = (n) => (n + hsl[0] / 30) % 12;
		const a = hsl[1] * Math.min(hsl[2], 1 - hsl[2]);
		const f = (n) => hsl[2] - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		return [255 * f(0), 255 * f(8), 255 * f(4), 1];
	}
}

const nav = document.querySelector("nav");

function updateSlider() {
	let sliderIndex = clamp(Math.floor(sliderState / sliderHeight), 0, mainSlider.length - 1);

	const bgcolordst = getColor(
		sliderIndex > 0
			? window
					.getComputedStyle(mainSlider.item(sliderIndex - 1))
					.getPropertyValue("background-color")
			: nav.dataset.basebgColor
	);

	let localSliderState = clamp(sliderState - sliderIndex * sliderHeight, 0, sliderHeight);
	try {
		sliderProgressList[sliderIndex + 1].animate([{ bottom: 100 + "%" }], {
			duration: 300,
			fill: "forwards",
		});
	} catch (error) {}

	try {
		sliderProgressList[sliderIndex - 1].animate([{ bottom: 0 + "%" }], {
			duration: 300,
			fill: "forwards",
		});
	} catch (error) {}

	try {
		sliderProgressList[sliderIndex].animate(
			[{ bottom: 100 - (localSliderState / sliderHeight) * 100 * 1.5 + "%" }],
			{ duration: 300, fill: "forwards" }
		);
	} catch (error) {}
	if (localSliderState > sliderHeight * 0.75) {
		localSliderState = sliderHeight;
	}

	if (localSliderState < sliderHeight * 0.75) {
		localSliderState = 0;
	}

	const scalar = 1 - localSliderState / sliderHeight;

	const bg = arrToRGBA(
		interpolateColor(
			getColor(
				window.getComputedStyle(mainSlider.item(sliderIndex)).getPropertyValue("background-color")
			),
			bgcolordst,
			scalar
		)
	);

	const colordst = getColor(
		sliderIndex > 0
			? window.getComputedStyle(mainSlider.item(sliderIndex - 1)).getPropertyValue("color")
			: nav.dataset.basefgColor
	);

	const color = arrToRGBA(
		interpolateColor(
			getColor(window.getComputedStyle(mainSlider.item(sliderIndex)).getPropertyValue("color")),
			colordst,
			scalar
		)
	);

	document.documentElement.style.setProperty("--black", bg);
	document.documentElement.style.setProperty("--white", color);

	mainSlider.item(sliderIndex).animate(
		[
			{
				transform: `translateY(${scalar * 100}%)`,
			},
		],
		{
			duration: 300,
			fill: "forwards",
		}
	);
}

let width = document.body.offsetWidth;
let height = document.body.offsetHeight;

const objLoader = new OBJLoader();

objLoader.load("./public/discolobus.obj", (obj) => {
	const model = obj.children[0];
	model.applyMatrix4(new THREE.Matrix4(1).makeScale(0.004, 0.004, 0.004));
	model.geometry.center();
	console.log(model.material);
	model.material.specular.r = 1;
	model.material.specular.g = 1;
	model.material.specular.b = 1;
	model.material.shininess = 100;
	scene.add(obj);
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 2000);

camera.position.z = 5;

const blueLight = new THREE.PointLight(0x0000ff, 1, 50);
blueLight.position.set(4, 4, 0);

const redLight = new THREE.PointLight(0xff0000, 1, 50);
redLight.position.set(-4, -4, 0);

scene.add(blueLight);
scene.add(redLight);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.domElement.setAttribute("id", "canvasbg");
renderer.setSize(width, height);
renderer.setAnimationLoop(animation);
document.body.prepend(renderer.domElement);

let lasttime = 0;

const spinningBrain = document.getElementById("spinningBrain");

const spinningbrainScene = new THREE.Scene();
const spinningBrainCam = new THREE.PerspectiveCamera(
	70,
	spinningBrain.clientWidth / spinningBrain.clientHeight,
	0.01,
	2000
);

const spinningBrainLight = new THREE.PointLight(0xffffff, 1, 50);
spinningBrainLight.position.x = 20;
spinningBrainLight.position.y = 20;
spinningBrainLight.position.z = 15;
spinningBrainLight.intensity = 2;
// spinningbrainScene.add(spinningBrainCam);
spinningbrainScene.add(spinningBrainLight);

const spinningbrainrenderer = new THREE.WebGLRenderer({
	canvas: spinningBrain,
	alpha: true,
});
spinningbrainrenderer.setPixelRatio(2);

let spinningbrainmodel = null;

objLoader.load("./public/brain.obj", (obj) => {
	const model = obj.children[0];
	// model.applyMatrix4(new THREE.Matrix4(1).makeScale(0.004, 0.004, 0.004));
	model.geometry.center();
	console.log(model.material);
	model.material.specular.r = 1;
	model.material.specular.g = 1;
	model.material.specular.b = 1;
	model.material.shininess = 100;
	// model.rotateX(0.1)

	spinningbrainmodel = model;
	// model.scale *= 1;
	spinningbrainScene.add(obj);
});

spinningBrainCam.position.z = 30;

function animation(time) {
	const delta = time - lasttime;
	lasttime = time;
	const orbit = new THREE.Matrix4().makeRotationAxis(
		new THREE.Vector3(0, 1, 1),
		(delta / 1000) * 0.5
	);

	redLight.position.applyMatrix4(orbit);
	blueLight.position.applyMatrix4(orbit);
	try {
		spinningbrainmodel.rotateY((delta / 1000) * 3);
	} catch (error) {}
	spinningbrainrenderer.render(spinningbrainScene, spinningBrainCam);

	renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	spinningBrainCam.aspect = spinningBrain.clientWidth / spinningBrain.clientHeight;
	spinningBrainCam.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
});
