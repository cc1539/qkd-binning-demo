
class SimpleBinning extends BitStream {
	
	constructor() {
		super();
		
		this.n = 0; // frame size
		this.k = 0; // bin size
		
		this.deadTime = 0;
		this.deadTimers = []; // to simulate multiple detectors
		
		this.bitsIn = 0;
		this.bitsOut = 0;
		
		this.output = new BitStream();
		this.analysis = new RandomAnalysis();
	}
	
	getOutput() {
		return this.output;
	}
	
	getAnalysis() {
		return this.analysis;
	}
	
	setFrameSize(n) {
		this.n = n;
		this.getAnalysis().setLetterSize(log2(n));
	}
	
	setBinSize(k) {
		this.k = k;
	}
	
	getRawKeyRate() {
		return this.bitsOut/this.bitsIn;
	}
	
	setDeadTimerCount(n) {
		this.deadTimers = Array(n).fill(0);
	}
	
	setDeadTime(e) {
		this.deadTime = e;
	}
	
	write(bit) {
		
		this.bitsIn++;
		
		// select a detector
		let deadTimerIndex = this.deadTimers.length==1?0:Math.floor(Math.random()*this.deadTimers.length);
		if(this.deadTimers[deadTimerIndex]>0) {
			bit = false;
		}
		for(let i=0;i<this.deadTimers.length;i++) {
			if(this.deadTimers[i]>0) {
				this.deadTimers[i]--;
			}
		}
		if(this.deadTimers[deadTimerIndex]==0 && bit) {
			this.deadTimers[deadTimerIndex] = this.deadTime;
		}
		
		super.write(bit);
		
		this.handleOutput();
	}
	
	handleOutput() {
		
		if(this.length()>=this.n) {
			let frameBits = this.toArray(this.n);
			let fullIndex = -1;
			let nullIndex = -1;
			for(let i=0;i<this.n;i+=this.k) {
				let full = false;
				for(let j=0;j<this.k;j++) {
					if(frameBits[i+j]) {
						full = true;
					}
				}
				let index = i/this.k;
				if(full) {
					fullIndex = fullIndex==-1?index:-2;
				} else {
					nullIndex = nullIndex==-1?index:-2;
				}
			}
			if(fullIndex>=0 || nullIndex>=0) {
				let index = fullIndex>=0?fullIndex:nullIndex;
				for(let i=this.n/this.k;i>1;i>>>=1) {
					let outBit = (index&1)!=0;
					this.output.write(outBit);
					this.analysis.write(outBit);
					this.bitsOut++;
					index >>>= 1;
				}
			}
		}
		
	}
	
	clear() {
		super.clear();
		this.analysis.clear();
		this.output.clear();
		this.bitsIn = 0;
		this.bitsOut = 0;
		this.deadTimer = 0;
		this.deadTimers.fill(0);
	}
	
	getName() {
		return "sb";
	}
	
}