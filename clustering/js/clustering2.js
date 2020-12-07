var flaskAppURL = 'http://127.0.0.1:5000/'

function load_data() {
	var km = document.getElementById("km");
	var hc = document.getElementById("hc");
	var nc = document.getElementById("nc");
	km_so.style.display = "none";
	hc_so.style.display = "none";
	nc_so.style.display = "none";
    $.ajax({
       url: flaskAppURL,
       type: 'GET',
       success: function (response) {
           console.log(response);
       },
       error: function (error) {
           console.log(error);
       }
    });

}


function submit_km() {
	console.log("kmeans submitted");
	var k = $('input[name="k"]').val();
	var pca = $('input[name="pca"]:checked').val();
	var variance = $('input[name="variance"]').val();
	var perplexity = $('input[name="perplexity"]').val();

	params = [];

	if (k == "") {
		k = 5
		$('input[name="k"]').val(5);
	}

	if (pca == undefined) {
		pca = 0
		$("input[name='pca'][value='0']").prop("checked",true);
	}

	if (variance == "") {
		variance = 0.95
		$('input[name="variance"]').val(0.95);
	}

	if (perplexity == "") {
		perplexity = 30
		$('input[name="perplexity"]').val(30);
	}

	params.push(k);
	params.push(pca);
	params.push(variance);
	params.push(perplexity);

	element = document.getElementById("km");
	getData(element, params);
}


function submit_hc() {
	console.log("hierarchical submitted");
	var num = $('input[name="num"]').val();
	var linkage = $('input[name="linkage"]:checked').val();

	params=[];

	if (num == "") {
		num = 3
		$('input[name="num"]').val(3);
	}

	if (linkage == undefined) {
		linkage = "ward"
		$("input[name='linkage'][value='ward']").prop("checked",true);
	}

	params.push(num);
	params.push(linkage);

	element = document.getElementById("hc");
	getData(element, params);
}


function submit_nc() {
	console.log("no cluster submitted");
	var maxmin = $('input[name="maxmin"]:checked').val();

	params = [];

	if (maxmin == undefined) {
		maxmin = "max"
		$("input[name='maxmin'][value='max']").prop("checked",true);
	}

	params.push(maxmin);

	element = document.getElementById("nc");
	getData(element, params);
}


function selectedTechnique(elmnt,clr) {
	var km = document.getElementById("km");
	var hc = document.getElementById("hc");
	var nc = document.getElementById("nc");
	var km_so = document.getElementById("km_so");
	var hc_so = document.getElementById("hc_so");
	var nc_so = document.getElementById("nc_so");
	km_so.style.display = "none";
	hc_so.style.display = "none";
	nc_so.style.display = "none";
	km.style.color = 'black';
	hc.style.color = 'black';
	nc.style.color = 'black';
	elmnt.style.color = clr;
	
	if (elmnt.id == "km")
		km_so.style.display = "block";

	if (elmnt.id == "hc")

		hc_so.style.display = "block";

	if (elmnt.id == "nc")
		nc_so.style.display = "block";
}


function getData(elmnt, params) {
	var url = ""
	var K = 5

	if (elmnt.id == "km") {
		K= params[0];
		var pca = params[1];
		var variance = params[2];
		var perplexity = params[3];
		var params_url = "kmeans?K="+K+"&pca="+pca+"&variance="+variance+"&perplexity="+perplexity;
		var url = flaskAppURL + params_url;
	}

	else if (elmnt.id == "hc") {
		K = params[0];
		var linkage = params[1];
		var params_url = "hierarchical?num="+K+"&linkage="+linkage;
		var url = flaskAppURL + params_url
	}

	else {
		console.log("hello");
		var maxmin = params[0];
		var params_url = "none?type="+maxmin;
		var url = flaskAppURL + params_url;
	}

	$.ajax({
       url: url,
       type: 'GET',
       success: function (data) {
           var response = JSON.parse(data);
           console.log(response);
           viz = document.getElementById("viz");
           viz.innerHTML = "Response in console"
       },
       error: function (error) {
           console.log(error);
       }
    });
}
