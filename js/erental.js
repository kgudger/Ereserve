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
		erSClick();
		erSearch(searchTerm) ; // redo search 
	} else {
/*		for (let i = 0; i < breadBox.length; i++) {
			breadBox.pop();
		}*/
		breadBox.push({"cat":cat});
		let htmldata = printBread();
		htmldata += "<div id=er_cato><br><h2>" + cat + "</h2><br></div>";
		htmldata += "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>1 Day Price</th><th>Extra Day Price</th><th>How Many Available</th><th>Add<img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/asterisk.png'></th></tr>";
		htmldata += writeLines(retData,cat);
		htmldata += "</table>";
		htmldata += "<h4>* Add item to reservation.</h4>";
//		htmldata += "<h4>'1' One day price.</h4>";
		document.getElementById("er_display").innerHTML = htmldata;
	}
	window.history.pushState(cat, cat, "/equipment-reservations/?" + cat );
}

/**
 * function to display individual items 
 * @param i is line in returned data to display (item)
 * @cat is category or search page
 */
function showPage(i,cat) {
//	alert("item is " + i);
	breadBox.push({"item":retData[i]['title']});
	let htmldata = printBread();
	htmldata += "<br>";
	htmldata += writeItem(retData,i,cat);
	let breadspot = breadBox.length - 2;
	htmldata += "<br><button class='er_button' onclick='sliceBread(" + 
		breadspot + ")'>Return to " + cat + " Page</button>";
	document.getElementById("er_display").innerHTML = htmldata;
	window.history.pushState(cat, cat + "-" + i, "/equipment-reservations/?" + cat + "-" + i);
}

/**
 * async function to grab data from web, run at load. 
 */
const fetchRecs = async () => {
	fetch('https://satellite.communitytv.org/erental.php?command=get').then(response => response.json())
	  .then(data => {
		retData = data['types']; // global array for data array
		for (let i = 0; i < retData.length; i++) {
			let singleObj = {}; 
			singleObj['key'] = i;
			singleObj['title'] = retData[i]['title'];
			singleObj['desc']  = retData[i]['description'];
			listOfObjects.push(singleObj); // object for search, includes title & description
		}
		catData    = data['cats']; 
		statusData = data['status'];
		itemData   = data['items'];
		
		if ( (queryString != "") && (queryString != "#") ) { // there's a link
			let ret = queryString.replace('?',''); // takes out leading '?'
			ret = ret.replace('#',''); // takes out trailing '#'
			ret = decodeURI(ret);
			let res = ret.split("&"); // splits into center and user
			for (const elem of res) {
				let nres = elem.split("=");
				if (nres[0] == "user") { // store user number in cookie
					document.cookie = elem; // user=xx
					user_no = nres[1]; // store in global variable
				}
			}
			let ores = ret.split("-"); // splits into cat and i
			if (!(ores[0].includes("user") || ores[0].includes("center"))) { // link
				if (ores[1] != null) 
					showPage(ores[1],ores[0])
				else
					showCat(ores[0]);
			}
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
			if ( (data[i]['1day'] != null) && (data[i]['1day'] == 1) )
				htmldata += "<td class='er_t_i'>-</td><td class='er_t_i'>$" + data[i]['rate'] + "</td>";
			else
				htmldata += "<td class='er_t_i'>$" + data[i]['rate'] + "</td><td class='er_t_i'>-</td>";
			htmldata += "<td class='er_t_i'>$" + data[i]['day_rate'] + "</td>";
			htmldata += "<td class='er_t_i'>" + data[i]['availability'] + "</td>";
			htmldata += "<td class='er_t_i'><a href='#' onclick='cookRes(" + 
							data[i]['type_id'] + ")'><img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/plus.png'></td>";
			htmldata += "</tr>";
		}
	}
	return htmldata;
}
const queryString = window.location.search;
console.log(queryString);
var retData =[]; // data array global variable
var listOfObjects = []; // defined as an object, for search.
var searchTerm = ""; // global to store searched term
var statusData = []; // global array of returned status options
var catData = []; 	 // global array of returned categories 
var itemData = []; 	 // global array of returned items 
var selectNumber = 0; // how many selects added to reservation form
					// remember to reset this on successful reservation
var breadBox = [{"home":"Home"}]; // array to act as stack for breadcrumbs
var user_no = 0 ; // user number from Satellite site.
// get data array at start up.
fetchRecs();

/**
 * function to display page of individual item.
 * @param data is returned data array
 * @param i is reference into data for item.
 * @param cat is category
 * @return htmldata for individual item page
 * @return
 */
function writeItem(data,i,cat) {
	let htmldata = "";
	htmldata += "<br><h2>" + data[i]['title'] + "</h2>" ;
	htmldata += "<img src='" + data[i]['image'] + "'>" ;	
	htmldata += "<p>" + data[i]['description'] + "</p><br>" ;
	if ( ( data[i]['1day'] != null ) && ( data[i]['1day'] == 1 ) ) 
		htmldata += "<p><strong>1 Day Price:</strong> $" 
	else
		htmldata += "<p><strong>3 Day Price:</strong> $" 
	htmldata += data[i]['rate'] + "</p>" ;
	htmldata += "<p><strong>Extra Day Price:</strong> $" + 
		data[i]['day_rate'] + "</p>" ;
	htmldata += "<p><strong>Number Available:</strong> " + 
		data[i]['availability'] + "</p>" ;
	if ( data[i]['reserve_with_array'].length > 0) { //frequently rented array, if it exists
		htmldata += "<p><strong>Frequently Rented With:</strong></p>";
		data[i]['reserve_with_array'].forEach(function(entry) {
			let indT = findTid(data,entry);	// find frequently rented item
			htmldata += "<p>" + "<a href='#' onclick='showPage("
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
 * function to make search box visible
 * if cat is not Everything, only display that category
 */
function erSClick() {
	let sval = document.getElementById("er_sin");
	let ev = new KeyboardEvent('keydown', {altKey:false,
  bubbles: true,
  cancelBubble: false, 
  cancelable: true,
  charCode: 0,
  code: "Enter",
  composed: true,
  ctrlKey: false,
  currentTarget: null,
  defaultPrevented: true,
  detail: 0,
  eventPhase: 0,
  isComposing: false,
  isTrusted: true,
  key: "Enter",
  keyCode: 13,
  location: 0,
  metaKey: false,
  repeat: false,
  returnValue: false,
  shiftKey: false,
  type: "keydown",
  which: 13});

	sval.dispatchEvent(ev);
}

/**
 * function to set up to search object
 * @param value is value to search for
 * uses fuzzysort
 */
function erSearch(value) {
//	alert("Search for " + value);
    if(event.key === 'Enter') {
		let darray = realSearch(value);
		outSearch(retData,darray);	// display search results page
	}
}

/**
 * function to search object
 * @param value is value to search for
 * @return darray is array of results
 * uses fuzzysort
 */
function realSearch(value) {
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
					darray.push(bkey);
				}
			}
		}
	}
	return darray;
}

/**
 * function to display search result page.
 * @param data is returned data array
 * @param darr is array of indices into data to display
 */
function outSearch(data,darr) {
	breadBox.push({"search":searchTerm});
	let htmldata = printBread();
	htmldata += "<div id=er_searcho><br><h2>Search Results</h2><br></div>";
	if (darr.length > 0) { // if results
		htmldata += "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>Extra Day Price</th><th>How Many Available</th><th>Add<img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/asterisk.png'></th></tr>";
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
			htmldata += "<td class='er_t_i'><a href='#' onclick='cookRes(" + 
							data[entry]['type_id'] + ")'><img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/plus.png'></td>";
			htmldata += "</tr>";
		});
		htmldata += "</table>";
		htmldata += "<h4>* Add item to reservation.</h4>";
	}
	else {
		htmldata+= "<strong>No Results Found</strong>";
		// add store to file here
		let json_str = (JSON.stringify(searchTerm)); 
		let url = 'https://satellite.communitytv.org/erental.php?command=search';
		let response = postData(json_str,url);
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
 * function to find title from tid in data array
 * @param data is returned data array
 * @param j is tid
 * @return title for tid j
 */
function findTitle(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['type_id'] == j) {
			return data[i]['title'];
		}
	}
}

/**
 * function to find index from title in data array
 * @param data is returned data array
 * @param title is title
 * @return id j
 */
function findIndex(data,title) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['title'] == title) {
			return i;
		}
	}
}

/**
 * function to get availability from tid in data array
 * @param data is returned data array
 * @param j is tid
 * @return availability j
 */
function getAvail(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['type_id'] == j) {
			return data[i]['availability'];
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
 * @param cart tells the routing to leave the html alone so the cart doesn't et messed up
 * cookie stored as json
 * if exists, turn back into array
 * add new type id to end of array
 * and create the new cookie
 */
function cookRes(i,cart) {
	if (cart === undefined) {
        	cart = false;
	} // cart means not to update the html because it messes with the cart.

	var json_str = getCookie('Reservation');
	var arr =  [];
	if (json_str !== "") {
		var a2 = JSON.parse(json_str);
		a2.forEach(function(entry) {
			arr.push(entry);
		});
	}
	if ( i > 0 ) { // it's a real item
		let avail = getAvail(retData,i); // get availability of new item
		if (avail > 0) {
			arr.push(i); // i is actual tid
		}
		json_str = JSON.stringify(arr);
		createCookie("Reservation", json_str);
		let stitle = findTitle(retData,i);
		if (avail > 0) {
			if ( cart == false ) {
				let htmldata = "<p><strong><font color='red'>" + findTitle(retData,i) + " added to reservation</font></strong></p>";
				let oldhtml = document.getElementById("er_display").innerHTML ;
				let newhtml = oldhtml + htmldata;
				document.getElementById("er_display").innerHTML = newhtml ;
				alert("Added  " + stitle + " to your reservation.");
			}
		} else {
			alert(stitle + " NOT available.");
		}
	}
}

/**
 * function to get cookie.
 * @param cname is cookie name 
 * cookie stored as json
 * if exists, split on ';'
 * @return cookie or empty string
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

/**
 * function to return html for breadcrumbs at top of page
 * @return breadcrumbs html
 */
function printBread() {
	let htmldata = "<h4>Click the breadcrumb below to go back, not the back button.</h4>";
	let i = 0;
	for ( ; i < breadBox.length - 1; i++) {
		for (const property in breadBox[i]) {
			console.log(property + " : " +breadBox[i][property]);
			htmldata += " < <a href='#' onclick='sliceBread(\"" + i + "\")'>" ;
			if (property == "search") {
				htmldata += "Search(" + breadBox[i][property] + ")"
			} else {
				htmldata += breadBox[i][property];
			}
			htmldata += "</a>";
		}
	}
	for (const property in breadBox[i]) {
		console.log(property + " : " +breadBox[i][property]);
		htmldata += " < " ;
		if (property == "search") {
			htmldata += "Search(" + breadBox[i][property] + ")"
		} else {
			htmldata += breadBox[i][property];
		}
		htmldata += " <- You Are Here";
	}
	return htmldata;
}

/**
 * function to call appropriate display function from breadcrumb
 * @param i is entry in breadBox stack to jump to
 */
function sliceBread(i) {
	let j = breadBox.length;
	while ( j-- > (parseInt(i) + 1) ) {
			breadBox.pop();
	}
	let key   = Object.keys(breadBox[i])[0];
	let value = Object.values(breadBox[i])[0];
	breadBox.pop(); // remove the one we want, as we're adding it back in.
	switch(key) {
		case "cat":
			showCat(value); 
			break;
		case "item":
			let index = findIndex(retData,value)
			showPage(index,breadBox[0]['cat']);
			break;
		case "search":
			searchTerm = value;
			showCat("Search") ;
			break;
		case "shop":
			showCart();
			break;
		case "home":
			window.history.pushState("equip", "equipment reservations", "/equipment-reservations/");
			window.location.reload(true); 
			break;
		default:
			break;
	};
}
