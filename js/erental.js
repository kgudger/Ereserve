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
	if (cat == "Search") {
		erSearch(searchTerm) ; // redo search 
	} else {
		let htmldata = "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>Extra Day Price</th><th>How Many Available</th></tr>";
		htmldata += writeLines(retData,cat);
		htmldata += "</table>";
		document.getElementById("er_display").innerHTML = htmldata;
	}
}

/**
 * function to display individual items 
 * @param i is line in returned data to display (item)
 * @cat is category or search page
 */
function showPage(i,cat) {
//	alert("item is " + i);
	let htmldata = writeItem(retData,i);
	htmldata += "<br><button class='er_button' onclick='showCat(\"" + 
		cat + "\")'>Return to " + cat + " Page</button>";
	document.getElementById("er_display").innerHTML = htmldata;
}

/**
 * async function to grab data from web, run at load. 
 */
const fetchRecs = async () => {
	fetch('https://satellite.communitytv.org/erental.php?command=get').then(response => response.json())
	  .then(data => {
		retData = data; // global array for data array
		for (let i = 0; i < data.length; i++) {
			let singleObj = {}; 
			singleObj['key'] = i;
			singleObj['title'] = data[i]['title'];
			singleObj['desc']  = data[i]['description'];
			listOfObjects.push(singleObj); // object for search, includes title & description
		}
	  	return data 
	  	})
}

/**
 * function to display category pages.
 * @param data is returned data array
 * @param cat is category to display
 * @return html data for category page.
 * if cat is not Everything, only display that category
 */
function writeLines(data,cat) {
	let htmldata = "";
	for (let i = 0; i < data.length; i++) { // only display category passed
		if ( (cat == "Everything") || (data[i]['category'] == cat) ) {
			htmldata += "<tr>";
			htmldata += "<td class='er_t_i'>" + "<a href='#' onclick='showPage("
                                + i + ",\"" + cat + "\")'>" +
				data[i]['title'] + "</a></td>"; // onclick to show individual pages
			htmldata += "<td class='er_t_i'><img class='er_thumb' src='" + 
				data[i]['image'] + "'></td>";
			let sstr = data[i]['description'].substring(0, 500)
			htmldata += "<td>" + sstr + 
				"<a href='#' onclick='showPage(" + i + ",\"" + cat + "\")'> ...more" + "</a></td>";
				// for description, only show first 500 characters, 
				// include link to individual page for 'more'
			htmldata += "<td class='er_t_i'>$" + data[i]['rate'] + "</td>";
			htmldata += "<td class='er_t_i'>$" + data[i]['day_rate'] + "</td>";
			htmldata += "<td class='er_t_i'>" + data[i]['availability'] + "</td>";
			htmldata += "</tr>";
		}
	}
	return htmldata;
}
// get data array at start up.
fetchRecs();
var retData; // data array global variable
var listOfObjects = []; // defined as an object, for search.
var searchTerm = ""; // global to store searched term

/**
 * function to display page of individual item.
 * @param data is returned data array
 * @param i is reference into data for item.
 * @return htmldata for individual item page
 */
function writeItem(data,i) {
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
			htmldata += "<p>" + "<a href='#' onclick='showPage("
                                + indT + ",'cameras'" + ")'>" +
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
 * function to make search box visible
 * if cat is not Everything, only display that category
 */
function erSClick() {
	document.getElementById("er_sin").style.visibility = "visible";
}

/**
 * function to search object
 * @param value is value to search for
 * uses fuzzysort
 */
function erSearch(value) {
//	alert("Search for " + value);
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
//	var newHtml = "<ul>" ;
		for (var rkey in result2) {
			if (rkey != "total") { // there's one final rkey that's not data
				var rscore = result2[rkey]['score'] ; // get search score
				if ( rscore > -200) { // good result - 200 seems right
					let bkey = result2[rkey]['obj']['key'] ; // index into data array
					let sString = retData[bkey]['title'];
					console.log("Score " + rkey + " = " + rscore + " " + 
						"key is " + result2[rkey]['obj']['key'] + " Title is " + 
						sString);
					darray.push(bkey);
				}
			}
		}
	}
	outSearch(retData,darray);	// display search results page
}

/**
 * function to display search result page.
 * @param data is returned data array
 * @param darr is array of indices into data to display
 */
function outSearch(data,darr) {
	let htmldata  = "<div id=er_searcho><br><h2>Search Results</h2><br></div>";
	if (darr.length > 0) { // if results
		htmldata += "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>Extra Day Price</th><th>How Many Available</th></tr>";
		darr.forEach(function(entry) {
			htmldata += "<tr>";
			htmldata += "<td class='er_t_i'>" + "<a href='#' onclick='showPage("
                                + entry + ",\"Search\"" + ")'>" +
				data[entry]['title'] + "</a></td>"; // onclick to show individual pages
			htmldata += "<td class='er_t_i'><img class='er_thumb' src='" + 
				data[entry]['image'] + "'></td>";
			let sstr = data[entry]['description'].substring(0, 500)
			htmldata += "<td>" + sstr + 
				"<a href='#' onclick='showPage(" + entry + ",\"Search\"" + ")'> ...more" + "</a></td>";
				// for description, only show first 500 characters, 
				// include link to individual page for 'more'
			htmldata += "<td class='er_t_i'>$" + data[entry]['rate'] + "</td>";
			htmldata += "<td class='er_t_i'>$" + data[entry]['day_rate'] + "</td>";
			htmldata += "<td class='er_t_i'>" + data[entry]['availability'] + "</td>";
			htmldata += "</tr>";
		});
		htmldata += "</table>";
	}
	else {
		htmldata+= "<strong>No Results Found</strong>";
	}
	document.getElementById("er_display").innerHTML = htmldata;
}

/**
 * function to find type id from index into data array
 * @param data is returned data array
 * @param j is index into array
 * @return type id for index j
 */
function findTid(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['type_id'] == j) {
			return i;
		}
	}
}

/**
 * function to create a cookie
 * @param name is cookie name
 * @param value is array of type ids "frequently rented with"
 * cookie lasts 30 minutes.
 */
function createCookie(name, value) {
   var date = new Date();
   date.setTime(date.getTime()+(30*60000)); // 30 minutes
   var expires = "; expires="+date.toGMTString();

   document.cookie = encodeURI(name) + "=" + encodeURI(value) + encodeURI(expires +"; path=/");
}

/**
 * function to append (or create) cookie.
 * @param i is actual type id to add to cookie json 
 * cookie stored as json
 * if exists, turn back into array
 * add new type id to end of array
 * and create the new cookie
 */
function cookRes(i) {
	var json_str = getCookie('Reservation');
	var arr =  [];
	if (json_str !== "") {
		var a2 = JSON.parse(json_str);
		a2.forEach(function(entry) {
			arr.push(entry);
		});
	}
	arr.push(i); // i is actual tid
	json_str = JSON.stringify(arr);
	createCookie("Reservation", json_str);
	let htmldata = "<p><strong><font color='red'>Added to Reservation</font></strong></p>";
	document.getElementById("er_display").innerHTML += htmldata;
}

/**
 * function to get existing cookie
 * @param cname is name of cookie to grab
 * @return cookie contents or "" if doesn't exist
 */
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length); // just return cookie value
    }
  }
  return ""; // return empty string if it doesn't exist
}
