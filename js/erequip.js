/*
 * Please see the included README.md file for license terms and conditions.
 */
/** @file erequip.js
 *	Purpose:  contains all of the javascript for adding equipment
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
function showCatE(cat) {
//	alert("Category is " + cat);
	if (cat == "Search") {
		erSClick();
		erSearchE(searchTerm) ; // redo search 
	} else {
		let htmldata  = "<div id=er_cato><br><h2>" + cat + "</h2><br></div>";
		htmldata += "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>Edit<img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/asterisk.png'></th></tr>";
		htmldata += writeLinesE(retData,cat);
		htmldata += "</table>";
		document.getElementById("er_display").innerHTML = htmldata;
	}
}

/**
 * function to display individual items 
 * @param i is line in returned data to display (item)
 * @cat is category or search page
 */
function showPageE(i,cat) {
//	alert("item is " + i);
	let htmldata = writeItemE(retData,i,cat);
	htmldata += "<br><button class='er_button' onclick='showCatE(\"" + 
		cat + "\")'>Return to " + cat + " Page</button>";
	document.getElementById("er_display").innerHTML = htmldata;
}


/**
 * function to display category pages.
 * @param data is returned data array
 * @param cat is category to display
 * @return html data for category page.
 * if cat is not Everything, only display that category
 */
function writeLinesE(data,cat) {
	let htmldata = "";
	for (let i = 0; i < data.length; i++) { // only display category passed
		if ( (cat == "Everything") || (data[i]['category'] == cat) ) {
			htmldata += "<tr>";
			htmldata += "<td class='er_t_i'>" + "<a href='#' onclick='showPageE("
                                + i + ",\"" + cat + "\")'>" +
				data[i]['title'] + "</a></td>"; // onclick to show individual pages
			htmldata += "<td class='er_t_i'><img class='er_thumb' src='" + 
				data[i]['image'] + "'></td>";
			let sstr = data[i]['description'].substring(0, 500)
			htmldata += "<td>" + sstr + 
				"<a href='#' onclick='showPageE(" + i + ",\"" + cat + "\")'> ...more" + "</a></td>";
				// for description, only show first 500 characters, 
				// include link to individual page for 'more'
			htmldata += "<td class='er_t_i'><a href='#' onclick='editCatE(" + 
							data[i]['type_id'] + ")'>(edit)</a></td>";
			htmldata += "</tr>";
		}
	}
	return htmldata;
}

/**
 * function to display page of individual item.
 * @param data is returned data array
 * @param i is reference into data for item.
 * @param cat is category
 * @return htmldata for individual item page
 * @return
 */
function writeItemE(data,i,cat) {
	let htmldata = "";
	htmldata += "<br><h2>" + data[i]['title'] + "</h2>" ;
	htmldata += "<img src='" + data[i]['image'] + "'>" ;	
	htmldata += "<p>" + data[i]['description'] + "</p><br>" ;
	htmldata += "<p><strong>3 Day Price:</strong> $" + 
		data[i]['rate'] + "</p>" ;
	htmldata += "<p><strong>Extra Day Price:</strong> $" + 
		data[i]['day_rate'] + "</p>" ;
	htmldata += "<p><strong>Number Available:</strong> " + 
		data[i]['availability'] + "</p>" ;
	if ( data[i]['reserve_with_array'].length > 0) { //frequently rented array, if it exists
		htmldata += "<p><strong>Frequently Rented With:</strong></p>";
		data[i]['reserve_with_array'].forEach(function(entry) {
			let indT = findTid(data,entry);	// find frequently rented item
			htmldata += "<p>" + "<a href='#' onclick='showPageE("
                                + indT + ",\"" + cat + "\")'>" +
								data[indT]['title'] + "</a></p>";
		});
		htmldata += "<br>";
	}
	htmldata += "<button class='er_button' onclick='cookRes(" + 
		data[i]['type_id'] + ")'>Add to Reservation</button>";
	// onclick adds to cookie 
	return htmldata;
}

/**
 * function to search object
 * @param value is value to search for
 * uses fuzzysort
 */
function erSearchE(value) {
//	alert("Search for " + value);
    if(event.key === 'Enter') {
		searchTerm = value ; // save searched value to return to search
		const options2 = {
		limit: 10, // don't return more results than you need!
		threshold: -10000, // don't return bad results

		keys: ['title', // fields to search, title & description
				'desc']
		}
		const result2 = fuzzysort.go(value,listOfObjects,options2);
	
		let darray = [] ; // empty array for result indices
		if ( result2['total'] != 0 ) { // number of returned results
			for (var rkey in result2) {
				if (rkey != "total") { // there's one final rkey that's not data
					var rscore = result2[rkey]['score'] ; // get search score
					if ( rscore > -200) { // good result - 200 seems right
						let bkey = result2[rkey]['obj']['key'] ; // index into data array
						let sString = retData[bkey]['title'];
						console.log("Score " + rkey + " = " + rscore + " " + 
							"key is " + result2[rkey]['obj']['key'] + " Title is " + 
							sString);
						let htmldata  = "<div id=er_searcho><br><h2>Search Results</h2><br></div>";
						darray.push(bkey);
					}
				}
			}
		}
		outSearchE(retData,darray);	// display search results page
	}
}

/**
 * function to display search result page.
 * @param data is returned data array
 * @param darr is array of indices into data to display
 */
function outSearchE(data,darr) {
	let htmldata  = "<div id=er_searcho><br><h2>Search Results</h2><br></div>";
	if (darr.length > 0) { // if results
		htmldata += "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>Extra Day Price</th><th>How Many Available</th><th>Add<img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/asterisk.png'></th></tr>";
		darr.forEach(function(entry) {
			htmldata += "<tr>";
			htmldata += "<td class='er_t_i'>" + "<a href='#' onclick='showPageE("
                                + entry + ",\"Search\"" + ")'>" +
				data[entry]['title'] + "</a></td>"; // onclick to show individual pages
			htmldata += "<td class='er_t_i'><img class='er_thumb' src='" + 
				data[entry]['image'] + "'></td>";
			let sstr = data[entry]['description'].substring(0, 500)
			htmldata += "<td>" + sstr + 
				"<a href='#' onclick='showPageE(" + entry + ",\"Search\"" + ")'> ...more" + "</a></td>";
				// for description, only show first 500 characters, 
				// include link to individual page for 'more'
			htmldata += "<td class='er_t_i'>$" + data[entry]['rate'] + "</td>";
			htmldata += "<td class='er_t_i'>$" + data[entry]['day_rate'] + "</td>";
			htmldata += "<td class='er_t_i'>" + data[entry]['availability'] + "</td>";
			htmldata += "<td class='er_t_i'><a href='#' onclick='cookRes(" + 
							data[entry]['type_id'] + ")'><img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/plus.png'></td>";
			htmldata += "</tr>";
		});
		htmldata += "</table>";
		htmldata += "<h4>* Add item to reservation.</h4>";
	}
	else {
		htmldata+= "<strong>No Results Found</strong>";
	}
	document.getElementById("er_display").innerHTML = htmldata;
}

/**
 * function to display individual items 
 * @param i is line in returned data to display (item)
 * @cat is category or search page
 */
function editCatE(i,cat) {
	alert("item is " + i);
	let htmldata = writeItemE(retData,i,cat);
	htmldata += "<br><button class='er_button' onclick='showCatE(\"" + 
		cat + "\")'>Return to " + cat + " Page</button>";
	document.getElementById("er_display").innerHTML = htmldata;
}

