/*
 * Please see the included README.md file for license terms and conditions.
 */
/** @file erental.js
 *	Purpose:  contains all of the javascript for the plugin
 *
 * @author Keith Gudger
 * @copyright  (c) 2020, Keith Gudger, all rights reserved
 * @license    http://opensource.org/licenses/BSD-2-Clause
 * @version    Release: 0.8
 * @package    ERental
 *
 */

/**
 * function to sort and display Categories
 * @param cat is category to display
 */

function showCat(cat) {
//	alert("Category is " + cat);
	let htmldata = "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>Extra Day Price</th><th>How Many Available</th></tr>";
	htmldata += writeLines(retData,cat);
	htmldata += "</table>";
	document.getElementById("er_display").innerHTML = htmldata;
}

/**
 * function to display individual items 
 * @param i is line in returned data to display
 */

function showPage(i) {
//	alert("item is " + i);
	let htmldata = writeItem(retData,i);
	document.getElementById("er_display").innerHTML = htmldata;
}

const fetchRecs = async () => {
	fetch('https://satellite.communitytv.org/erental.php?command=get').then(response => response.json())
	  .then(data => {
		retData = data;
		for (let i = 0; i < data.length; i++) {
			let singleObj = {};
			singleObj['key'] = i;
			singleObj['title'] = data[i][0];
			singleObj['desc']  = data[i][2];
			listOfObjects.push(singleObj);
		}
	  	return data 
	  	})
}


function writeLines(data,cat) {
	let htmldata = "";
	for (let i = 0; i < data.length; i++) {
		if ( (cat == "Everything") || (data[i][6] == cat) ) {
			htmldata += "<tr>";
			htmldata += "<td class='er_t_i'>" + "<a href='#' onclick='showPage("
                                + i + ")'>" +
				data[i][0] + "</a></td>";
			htmldata += "<td class='er_t_i'><img class='er_thumb' src='" + 
				data[i][1] + "'></td>";
			let sstr = data[i][2].substring(0, 500)
			htmldata += "<td>" + sstr + 
				"<a href='#' onclick='showPage(" + i + ")'> ...more" + "</a></td>";
			htmldata += "<td class='er_t_i'>$" + data[i][3] + "</td>";
			htmldata += "<td class='er_t_i'>$" + data[i][4] + "</td>";
			htmldata += "<td class='er_t_i'>" + data[i][5] + "</td>";
			htmldata += "</tr>";
		}
	}
	return htmldata;
}

fetchRecs();
var retData;
var listOfObjects = []; // defined as an object

function writeItem(data,i) {
	let htmldata = "";
	htmldata += "<br><h2>" + data[i][0] + "</h2>" ;
	htmldata += "<img src='" + data[i][1] + "'>" ;	
	htmldata += "<p>" + data[i][2] + "</p><br>" ;
	htmldata += "<p><strong>3 Day Price:</strong> $" + 
		data[i][3] + "</p>" ;
	htmldata += "<p><strong>Extra Day Price:</strong> $" + 
		data[i][4] + "</p>" ;
	htmldata += "<p><strong>Number Available:</strong> " + 
		data[i][5] + "</p>" ;
	htmldata += "<p><strong>Frequently Rented With:</strong></p>";
	htmldata += "<button>Add to Reservation</button>";

	return htmldata;
}

function erSClick() {
	document.getElementById("er_sin").style.visibility = "visible";
}

function erSearch(value) {
//	alert("Search for " + value);
	const options2 = {
	  limit: 10, // don't return more results than you need!
	  threshold: -10000, // don't return bad results

	  keys: ['title',
			'desc']
	}
	const result2 = fuzzysort.go(value,listOfObjects,options2);
	
	if ( result2['total'] != 0 ) {
//	var newHtml = "<ul>" ;
		let darray = [] ; // empty array for result indices
		for (var rkey in result2) {
			if (rkey != "total") { // there's one final rkey that's not data
				var rscore = result2[rkey]['score'] ;
				if ( rscore > -200) { // good result
					let bkey = result2[rkey]['obj']['key'] ;
					let sString = retData[bkey][0];
					console.log("Score " + rkey + " = " + rscore + " " + 
						"key is " + result2[rkey]['obj']['key'] + " Title is " + 
						sString);
					darray.push(bkey);
				}
			}
		}
		outSearch(retData,darray);			
	}
}

function outSearch(data,darr) {
	let htmldata = "<div id=er_searcho><br><h2>Search Results</h2><br>";
	htmldata += "<ul>";
	darr.forEach(function(entry) {
		htmldata+= "<li><a href='#' onclick='showPage(" + entry + ")'>" + 
			data[entry][0] + "</a></li>";
	});
	htmldata += "</ul></div>" ;
	document.getElementById("er_display").innerHTML = htmldata;
}
