const FILE_URL = "../data/PS__D145T0654747682_000RFS_N001000066000045300000__J01.CSV";
let data = [];
let minX = null;
let minY = null;
let maxX = null;
let maxY = null;

window.addEventListener("load",() => {readTextFile(FILE_URL)}, false);
let debugLoadingText = document.getElementById("debug");

function readTextFile(file)
{
	console.log("reading" + file);
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
            	console.log("sending to csv");
                var allText = rawFile.responseText;
                data = CSVToArray(allText);
                //drawCoordinates(data);
            }
        }
    }
    rawFile.send(null);
}

function CSVToArray( strData ){
	let data = [];
    var lines = strData.split('\n');
    let key = "";
    let keys = ["SCLK_A", "PMC", "A_1", "B_1"];
    console.log("found " + lines.length + " lines");
    let idx = 0;
    for(var line = 0; line < lines.length; line++){
	    let l = lines[line];
	    if(l === ""){
	    	continue;
	    }
	    let row = l.split(",");

	    if(keys.includes(row[0])){
	    	key = row[0];
	    	idx = 0;
	   	} else {
	   		let datapoint = {
				"SCLK_A": [],
				"PMC": [],
				"A_1": [],
				"B_1": []
			}

		    if(key === "PMC"){
		    	let x = parseFloat(row[1]);
		    	let y = parseFloat(row[2]);

		    	if(minX == null || x < minX){
		    		minX = x;
		    	}
		    	if(maxX == null || x > maxX){
		    		maxX = x;
		    	}
		    	if(minY == null || y < minY){
		    		minY = y;
		    	}
		    	if(maxY == null || y > maxY){
		    		maxY = y;
		    	}
		    	row = [x, y];
	   		} 
	   		
	   		datapoint[key] = row;

	   		if(data.length <= idx){
	   			data.push(datapoint);
	   		} else {
	   			data[idx][key] = row;
	   		}
	   		idx++;
	   	}
    }
    return data;
}
