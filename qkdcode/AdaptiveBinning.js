
class AdaptiveBinning extends SimpleBinning {
	
	handleOutput() {
		
		if(this.length()>=this.n) {
			let frame = this.toArray(this.n);
			for(this.k=1;this.k<this.n;this.k*=2) {
				let fullIndex = -1;
				let nullIndex = -1;
				for(let i=0;i<this.n;i+=this.k) {
					let full = false;
					for(let j=0;j<this.k;j++) {
						if(frame[i+j]) {
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
					break;
				}
			}
		}
		
	}
	
	getName() {
		return "ab";
	}
	
}