
class AdaptiveBinning extends SimpleBinning {
	
	handleOutput() {
		
		if(length()>=n) {
			boolean[] frame = toArray(n);
			for(k=1;k<n;k*=2) {
				int fullIndex = -1;
				int nullIndex = -1;
				for(int i=0;i<n;i+=k) {
					boolean full = false;
					for(int j=0;j<k;j++) {
						if(frame[i+j]) {
							full = true;
						}
					}
					int index = i/k;
					if(full) {
						fullIndex = fullIndex==-1?index:-2;
					} else {
						nullIndex = nullIndex==-1?index:-2;
					}
				}
				if(fullIndex>0 || nullIndex>0) {
					int index = fullIndex>0?fullIndex:nullIndex;
					for(int i=n/k;i>1;i>>>=1) {
						boolean outBit = (index&1)!=0;
						output.write(outBit);
						analysis.write(outBit);
						bitsOut++;
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