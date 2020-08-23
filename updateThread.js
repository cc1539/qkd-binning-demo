
onmessage = (e)=>{
	console.log(e.job);
	JSON.parse(e.job)();
};
