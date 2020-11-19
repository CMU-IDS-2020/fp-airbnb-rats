const width = 800;
const height = 800;
const extraWidth = 800;
function setup(){
	let can = createCanvas(width + extraWidth, height);
	background(255, 0, 0);
	fill("black");
	rect(0, 0, width, height);
	//noLoop();
	//console.log("draw background");
}

function draw(){
	console.log(minX, minY, maxX, maxY);
	let Xrange = maxX - minX;
	let Yrange = maxY - minY;
	for(let i = 0; i < data.length; i++){
		let datapoint = data[i];
		let coords = datapoint["PMC"];
		
		let x = (coords[0] - minX ) * (width / Xrange);
		let y = (coords[1] - minY ) * (height / Yrange);
		fill("white");

		circle(x, y, 10);
	}

	let test_datapoint = data[0];
	let a_spectrum = test_datapoint["A_1"];
	let b_spectrum = test_datapoint["B_1"];
	a_spectrum.map((element) => float(element));
	let min_a = Math.min(...a_spectrum);
	let max_a = Math.max(...a_spectrum);
	let a_range = max_a - min_a;
	for(let i = 0; i < a_spectrum.length - 1; i+= 2){
		let a_datapoint_y1 = height - (a_spectrum[i] - min_a)/ a_range * height;
		let a_datapoint_y2 = height - (a_spectrum[i + 1] - min_a)/a_range * height;
		line(width + i * (extraWidth / a_spectrum.length), a_datapoint_y1, width + (i + 1) * (extraWidth / a_spectrum.length), a_datapoint_y2);
	}

	noLoop();
}

// function drawCoordinates(data){

// }