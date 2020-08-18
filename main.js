
function setup() {
	createCanvas(840,640);
	let canvas = document.getElementById("defaultCanvas0");
	document.getElementById("canvas-holder").appendChild(canvas);
}

function draw() {
	background(0);
	fill(255);
	textAlign(LEFT,TOP);
	text("we out here",4,4);
}
