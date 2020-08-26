

/************** GRAPHICS **************/


function plot(data,x,y,w,h) {
	beginShape();
	for(let i=0;i<data.length;i++) {
		let u = x+i/(data.length-1)*w;
		let v = y-h*(Number.isNaN(data[i])?0:data[i]);
		vertex(u,v);
	}
	endShape();
}

// draw a grid with tickers and numbers
function grid(x, y, w, h,
		tileW, tileH,
		unitX, unitY) {
	
	stroke(64);
	for(let i=x;i<=x+w+1;i+=tileW) { line(i,y,i,y+h); }
	for(let i=y+h;i>=y-1;i-=tileH) { line(x,i,x+w,i); }
	
	stroke(255);
	fill(255);
	line(x,y,x,y+h);
	line(x,y+h,x+w,y+h);
	
	textAlign(CENTER,TOP);
	for(let i=0,u;(u=(x+i*tileW))<=(x+w+1);i++) {
		line(u,y+h,u,y+h+2);
		text(i==0?"0":(i*unitX).toFixed(2),u+1,y+h+2);
	}
	textAlign(RIGHT,CENTER);
	for(let i=0,v;(v=(y+h-i*tileH))>=y-1;i++) {
		line(x,v,x-2,v);
		text(i==0?"0":(i*unitY).toFixed(2),x-4,v-2);
	}
	
}

function labels(x, y, w, h, main, axisX, axisY) {
	fill(255);
	textAlign(CENTER,BOTTOM);
	push();
	translate(x,y+h/2);
	rotate(-HALF_PI);
	text(axisY,0,-40);
	pop();
	textAlign(CENTER,TOP);
	text(axisX,x+w/2,y+h+20);
	textAlign(CENTER,BOTTOM);
	text(main,x+w/2,y-8);
}


/************** MORE MATH **************/


function log2(n) {
	let m;
	for(m=0;n>1;m++) {
		n >>= 1;
	}
	return m;
}

function log2floor(n) { // largest integer m such that 2^m <= n, return 2^m
	for(let m=1;;m*=2) {
		if(m>=n) {
			if(m>n) {
				m /= 2;
			}
			return m;
		}
	}
}

function log2ceil(n) { // smallest integer m such that 2^m >= n, return 2^m
	for(let m=1;;m*=2) {
		if(m>=n) {
			return m;
		}
	}
}

function fact(n) { // factorial
	return 0; // todo
}

function perm(n) { // permutations
	return 0; // todo
}

function comb(n) { // combinations
	return 0; // todo
}

function entropy(p, base) {
	if(base==null) {
		p = [p,1-p];
		base = 2;
	}
	let sum = 0;
	for(let i=0;i<p.length;i++) {
		sum += p[i]==0?0:(p[i]*Math.log(p[i]));
	}
	return -sum/Math.log(base);
}


/************** MAIN / USER INTERFACE **************/

let frameSize = 8;
let deadTime = 0;

let graphSamples = 640;

let binTypes = [
	SimpleBinning.prototype,
	AdaptiveBinning.prototype,
	AdaptiveAggregatedBinning.prototype,
	AdaptiveFraming.prototype,
];

let bins = [];
let rateGraphs = [];
let randGraphs = [];

let defaultPalette;

let labelText = Array(binTypes.length);

let graphScaleX = 1;
let graphScaleY = 1;

let notif = "";
let notifTimer = 0;

let graphUpdateInterval = null;

let graphControlPanel;
let controlTemplate;

let xAxisMode = 0;
let yAxisMode = 0;

async function updateGraphs() {
	
	if(graphUpdateInterval!=null) {
		clearInterval(graphUpdateInterval);
	}
	
	await !keyIsPressed;

	for(let i=0;i<bins.length;i++) {
		for(let j=0;j<bins[0].length;j++) {
			
			let p = j/(bins[0].length-1);
			
			for(let k=0;k<32;k++) {
				bins[i][j].write(Math.random()<p);
			}
			
			// empty the output
			while(bins[i][j].getOutput().ready()) {
				bins[i][j].getOutput().read();
			}
			
			let h = yAxisMode==1?1:entropy(p);
			rateGraphs[i][j] = h==0?0:(bins[i][j].getRawKeyRate()/h);
			randGraphs[i][j] = bins[i][j].getAnalysis().getRandomness();
		}
	}
	
	graphUpdateInterval = setInterval(updateGraphs,10);
}

function reset() {
	for(let i=0;i<bins.length;i++) {
	for(let j=0;j<bins[0].length;j++) {
		bins[i][j].clear();
	}
	}
}

function notify(text) {
	notif = text;
	notifTimer = 512;
}

function rgba2hex(value) {
	return  ("0"+(value.levels[0].toString(16))).slice(-2)+
			("0"+(value.levels[1].toString(16))).slice(-2)+
			("0"+(value.levels[2].toString(16))).slice(-2);
}

function getGraphControlIndex(obj) {
	return Array.from(graphControlPanel.children).indexOf(obj);
}

function getColorPicker(index) {
	return graphControlPanel.children[index].querySelector("#graph-color");
}

function getAvailablePaletteColor() {
	for(let i=0;i<defaultPalette.length;i++) {
		let taken = false;
		let color = "#"+rgba2hex(defaultPalette[i]);
		for(let j=0;j<graphControlPanel.children.length-1;j++) {
			if(getColorPicker(j).value==color) {
				taken = true;
				break;
			}
		}
		if(!taken) {
			return color;
		}
	}
	return "#"+rgba2hex(color(255));
}

function addGraph(typeIndex,index) {
	
	if(index==null) {
		index = bins.length;
	}
	
	let newBins = Array(graphSamples).fill(0).map(y=>new binTypes[typeIndex].constructor());
	newBins.filter(y=>{
		y.deadTime = deadTime;
		y.setFrameSize(frameSize);
		y.setBinSize(1);
	});
	bins.splice(index,0,newBins);
	rateGraphs.splice(index,0,[]);
	randGraphs.splice(index,0,[]);
	
	let entry = controlTemplate.content.cloneNode(true);
	
	 // scheme drop-down menu
	let schemeSelect = entry.querySelector("select");
	schemeSelect.selectedIndex = typeIndex;
	schemeSelect.onchange = function() {
		index = getGraphControlIndex(entry);
		let color = getColorPicker(index).value;
		deleteGraph(index);
		addGraph(schemeSelect.selectedIndex,index);
		getColorPicker(index).value = color;
	};
	
	 // x-out button
	let removeButton = entry.querySelector(".remove");
	removeButton.onclick = function() {
		index = getGraphControlIndex(entry);
		console.log(index);
		deleteGraph(index);
	};
	
	graphControlPanel.insertBefore(entry,graphControlPanel.children[index]);
	entry = graphControlPanel.children[index];
	
	getColorPicker(index).value = getAvailablePaletteColor();
}

function deleteGraph(index) {
	if(index<0) {
		console.log("hey");
		return; // glitch?
	}
	bins.splice(index,1);
	rateGraphs.splice(index,1);
	randGraphs.splice(index,1);
	graphControlPanel.removeChild(graphControlPanel.children[index]);
}

function setFrameSize(n) {
	frameSize = n;
	for(let i=0;i<bins.length;i++) {
	for(let j=0;j<bins[i].length;j++) {
		bins[i][j].clear();
		bins[i][j].setFrameSize(n);
	}
	}
}

function setup() {
	
	createCanvas(840,640);
	
	let canvas = document.getElementById("defaultCanvas0");
	document.getElementById("canvas-holder").appendChild(canvas);
	
	graphControlPanel = document.getElementById("graph-control-panel");
	controlTemplate = document.getElementById("graph-control-template");
	
	textFont("Source Code Pro");
	
	defaultPalette = [
		color(0,0,255),
		color(255,0,0),
		color(255,255,0),
		color(255,0,255),
		color(0,255,0),
		color(0,255,255),
		color(255,128,0),
		color(0,255,128),
		color(128,255,0),
		color(128,0,255),
		color(0,128,255),
		color(255,0,128)
	];
	
	for(let i=0;i<binTypes.length;i++) {
		addGraph(i);
	}
	
	updateGraphs();
	
	for(let i=0;i<labelText.length;i++) {
		labelText[i] = bins[i][0].getName();
	}
	
	document.querySelector("#graph-control-panel > .add-control").onclick = function() {
		if(bins.length<4) {
			addGraph(0);
		}
	};
	
	document.querySelector('select[name="y-axis"]').onchange = function() {
		yAxisMode = this.selectedIndex;
	};
	
	document.querySelector('select[name="frame-size"]').onchange = function() {
		let newFrameSize = 1<<(this.selectedIndex+3);
		bins.filter(x=>x.filter(y=>y.setFrameSize(newFrameSize)));
		reset();
		frameSize = newFrameSize;
	};
	
	document.querySelector('select[name="down-time"]').onchange = function() {
		deadTime = parseInt(this.options[this.selectedIndex].innerHTML);
		bins.filter(x=>x.filter(y=>y.deadTime=deadTime));
		reset();
	};
	
}

function keyTyped() {
	switch(key) {
		case 'r': {
			reset();
			notify("Data reset");
		} break;
		case 'n': {
			
		} break;
	}
}

function draw() {
	
	background(0);
	
	if(keyIsPressed) {
		switch(key) {
			case 's': {
				notify("Scaling mode");
				if(mouseIsPressed) {
					if(mouseButton==LEFT) {
						graphScaleY *= exp(-(mouseY-pmouseY)*.01);
					} else if(mouseButton==RIGHT) {
						graphScaleY = 1;
					}
				}
			} break;
		}
	}
	
	if(notifTimer>0) {
		fill(min(255,notifTimer));
		notifTimer -= 4;
		textAlign(LEFT,TOP);
		text(notif,6,6);
	}
	
	let border = 100;
	
	let x = border;
	let y = border;
	let w = width-border*2;
	let h = height-border*2;
	grid(x,y,w,h,w*.1*graphScaleX,h*.1*graphScaleY,.1,.1);
	labels(x,y,w,h,"n = "+frameSize+", downtime = "+deadTime,"Probability (p)",
		yAxisMode==2?"Randomness (H(X)h(p))":
		yAxisMode==1?"Raw Key Rate (r)":
		"Photon Utilization (r/h(p))");
	for(let i=0;i<rateGraphs.length;i++) {
		noFill();
		stroke(getColorPicker(i).value);
		plot(yAxisMode==2?randGraphs[i]:rateGraphs[i],
				border+1,h+border-1,w*graphScaleX-2,h*graphScaleY-2);
	}
	
	//document.title = "QKD Binning Demo | FPS: "+frameRate().toFixed(1);
}
