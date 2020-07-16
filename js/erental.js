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
		let htmldata  = "<div id=er_cato><br><h2>" + cat + "</h2><br></div>";
		htmldata += "<table class='er_table'><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th><th>Extra Day Price</th><th>How Many Available</th><th>Add<img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/asterisk.png'></th></tr>";
		htmldata += writeLines(retData,cat);
		htmldata += "</table>";
		htmldata += "<h4>* Add item to reservation.</h4>";
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
	let htmldata = writeItem(retData,i,cat);
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
			htmldata += "<td class='er_t_i'><a href='#' onclick='cookRes(" + 
							data[i]['type_id'] + ")'><img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/plus.png'></td>";
			htmldata += "</tr>";
		}
	}
	return htmldata;
}
// get data array at start up.
fetchRecs();
var retData =[]; // data array global variable
var listOfObjects = []; // defined as an object, for search.
var searchTerm = ""; // global to store searched term
var statusData = []; // global array of returned status options
var catData = []; 	 // global array of returned categories 
var selectNumber = 0; // how many selects added to reservation form
					// remember to reset this on successful reservation

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
 * function to search object
 * @param value is value to search for
 * uses fuzzysort
 */
function erSearch(value) {
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
		outSearch(retData,darray);	// display search results page
	}
}

/**
 * function to display search result page.
 * @param data is returned data array
 * @param darr is array of indices into data to display
 */
function outSearch(data,darr) {
	let htmldata  = "<div id=er_searcho><br><h2>Search Results</h2><br></div>";
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
	$stitle = findTitle(retData,i);
	alert("Added  " + $stitle + " to your reservation.");
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

/**
 * function to display shopping cart 
 */
function showCart() {
	let htmldata = "<br><h2>Shopping Cart</h2>";
	htmldata += "<h3>Items To Reserve</h3>";
	htmldata += "<div id=er_select></div>";
	htmldata += "<button class='er_button' onclick='addAnotherItem(\"\")'>Add Another Item</button><br><br>";
	htmldata += "<label for='wname'><input type='text' id='wname' name='wname' required> Your Name</label><br>";
	htmldata += "<label for='phone'><input type='tel' id='phone' name='phone' required placeholder='123-456-7890' pattern='[0-9]{3}-[0-9]{2}-[0-9]{3}'> Your phone number</label><br>";
	htmldata += "<label for='email'><input type='email' id='email' name='email' required> Your email</label><br>";
	htmldata += "<br><p>Equipment can only be picked up and returned Monday through Friday from 9:00 AM to 5:00 PM.<br>";
	htmldata += "This date MUST be <strong>Monday through Friday.</strong><br>";
	htmldata += "The times MUST be between <strong>9:00 AM and 5:00 PM.</strong></p>";
    htmldata += "<table class='er_data_tab'>";
	htmldata += "<tr><td><label for='startdate'><input type='date' id='startdate' name='startdate' required> Reservation Start Date</label></td>";
	htmldata += "<td><label for 'starttime'><input type='time' id='starttime' name='starttime' min='09:00' max='17:00' required> Start Time</label></td></tr>";
	htmldata += "<tr><td><label for='enddate'><input type='date' id='enddate' name='enddate' required>Reservation End Date</label></td>";
	htmldata += "<td><label for 'endtime'><input type='time' id='endtime' name='endtime' min='09:00' max='17:00' required> Stop Time</label></td></tr>";
	htmldata += "</table><br>";
	htmldata += "<button class='er_button' onclick='completeReservation()'>Complete Reservation</button>";
	document.getElementById("er_display").innerHTML = htmldata;
	selectNumber = 0; // reset to 0 when creating the form.
	addCookieItems();
}

/**
 * function to create reservation drop down list
 * @param selected is item selected
 * @return options with group labels
 */
function createOptions(selected) {
	let htmldata = "";
	catData.forEach(function(cat) {
		if ( cat['active'] == 1) {
			htmldata += "<optgroup label='" + cat['name'] + "'>"
			retData.forEach(function(entry) {
				if ((cat['name'] == entry['category']) && (entry['availability'] > 0)) {
					htmldata += "<option value='" + entry['type_id'] + "'"
					if ( selected == entry['type_id'] ) {
						htmldata+= " selected" ;
					}
					htmldata += ">" + entry['title'] + "</option>";
				}
			});
			htmldata += "</optgroup>";
		}
	});
	return htmldata;
}

/**
 * function to create reservation select
 * @param number is added to id and name to create unique select
 * @param selected is item selected
 * @return select 
 */
function addSelect(number,selected) {
	let htmldata = "";
	htmldata += "<select name='er_item" + number + "' id='er_item" + number + "'>";
	htmldata += "<option value='0'>(Select)</option>";
	htmldata += createOptions(selected);
	htmldata += "</select>";
	return htmldata;
}

/**
 * function to add another item to reservation form
 * increments selectNumber
 * @param selected is item selected
 */

function addAnotherItem(selected) {
	if (selected == "") selected = 0; // for simple add Item
	let htmldata = "<div>" ;
	htmldata += addSelect(selectNumber,selected) ;
	htmldata += "<a href='#' onclick='remSelect(" + selectNumber + ")'> (remove)</a>";
	htmldata += "<br><br></div>";
	document.getElementById("er_select").innerHTML += htmldata;
	selectNumber++; 
}

/**
 * function to remove selected item
 * @param number is id of select
 * @param selected is item selected to unselect
 */
function remSelect(number) {
	let id = "er_item" + number ;
	let elements = document.getElementById(id).options;
    for(let i = 0; i < elements.length; i++){
      elements[i].selected = false;
    }
}

/**
 * function to add cookie items to reservation form
 * increments selectNumber
 * adds an empty one if no cookies
 */
function addCookieItems() {
	var json_str = getCookie('Reservation');
	if (json_str !== "") {
		var a2 = JSON.parse(json_str);
		a2.forEach(function(entry) {
			addAnotherItem(entry) ; // select the one from the cookie? 
		});
	} else {
		addAnotherItem(""); // adds empty select if no cookies
	}
}	

/**
 * function to add another item to reservation form
 * increments selectNumber
 * @param selected is item selected
 */
async function completeReservation() {
	let rarr = []; // empty reservation tid array
	for (let i = 0; i < selectNumber; i++ ) {
		let id  = "er_item" + i;
		let sel = document.getElementById(id);
		let val = sel.options[sel.selectedIndex].value;
		if (val >0) { // there's an item selected
			rarr.push(val); // create array of reserved items tids
		}	
	}
	if (rarr.length == 0) {
		alert("No Items In Your Cart, Please Select At Least One Item.");
		return;
	}
	var wname = "";
	var phone = "";
	var email = "";
	var startdate = "";
	var enddate = "";
	var starttime = "";
	var endtime = "";
	if ( (wname = checkInput("wname", "Name")) == "" ) {
		return;
	}
	if ( (phone = checkInput("phone", "Phone")) == "" ) {
		return;
	}
	if ( (email = checkInput("email", "Email")) == "" ) {
		return;
	}
	if ( (startdate = checkDate("startdate")) == "" ) {
		return;
	}
	if ( (enddate   = checkDate("enddate")) == "" ) {
		return;
	}
	if ( (starttime = checkTime("starttime")) == "" ) {
		return;
	}
	if ( (endtime   = checkTime("endtime")) == "" ) {
		return;
	}
//	alert("Reservation Success!");
	var resary = {};
	resary['ritems'] = rarr;
	resary['wname'] = wname;
	resary['phone'] = phone;
	resary['email'] = email;
	resary['startdate'] = startdate;
	resary['enddate']   = enddate;
	resary['starttime'] = starttime;
	resary['endtime']   = endtime;
	let json_str = (JSON.stringify(resary)); // encodeURI not work
	let response = await postData(json_str);
	if (response['status'] == "OK") {
		let resId = response['reservation'] ;
		window.location.href = "https://satellite.communitytv.org/wp-content/plugins/Ereserve/temp/satellite.php?reservation="+resId;
	} else {
		alert("Reservation Failed " + toString(response['error']));
	}
}

/**
 * function to check if input is entered
 * @param val is id of element
 * @param name is name of input field
 */
function checkInput(val, name) {
	let wname = document.getElementById(val).value;
	if (wname == "" ) {
		alert("Please Enter Your " + name);
		return "";
	}
	return wname;
}

/**
 * function to check if date is in the past
 * @param time to check
 */
function checkDate(timename) {
	let time = document.getElementById(timename).value;
	let now = new Date();
	if (time < now) {  // selected date is in the past
		alert("Both Dates must be in the future");
		return "";
	}
	return time;
}

/**
 * function to check if time is in the correct range.
 * @param time to check
 */
function checkTime(timename) {
	let time = document.getElementById(timename).value;
	if (time < "09:00") {  // selected time too early
		alert("All times must be after 9:00 AM.");
		return "";
	} else if ( time > "17:00") { // selected time too late
		alert("All times must be before 5:00 PM.");
		return "";
	}
	return time;
}

async function postData(data) {
  // Default options are marked with *
  const response = await fetch('https://satellite.communitytv.org/erental.php?command=reserve', {
    method: 'POST', // 
//    mode: 'cors', // no-cors, *cors, same-origin
//    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
//    redirect: 'follow', // manual, *follow, error
//    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: (data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
