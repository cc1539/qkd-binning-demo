
class AdaptiveFraming extends SimpleBinning {
	
	constructor() {
		super();
		this.publicChannel = new BitStream();
		this.bitQueue = 0;
	}
	
	getPublicChannel() {
		return this.publicChannel;
	}
	
	handleOutput() {
		
		if(this.length()>=this.n) {
			let frame = this.toArray(this.n);
			let l = 0;
			for(let i=0;i<frame.length;i++) {
				if(frame[i]) {
					l++;
				}
			}
			if(l>this.n/2) {
				l = this.n-l;
			}
			if(l>0) {
				let m = this.n/l;
				let k = this.n%l;
				this.bitQueue += this.k*Math.log(m+1);
				this.bitQueue += (l-this.k)*Math.log(m);
				while(this.bitQueue>=1) {
					let outBit = Math.random()>.5;
					this.output.write(outBit);
					this.analysis.write(outBit);
					this.bitsOut++;
					this.bitQueue--;
				}
				//publicChannel.write(index);
			}
		}
		
	}
	
	getName() {
		return "af";
	}
	
}