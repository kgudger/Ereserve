/*
 * Please see the included README.md file for license terms and conditions.
 */
/** @file ereserv.js
 *	Purpose:  contains javascript for the plugin reservation page
 *
 * @author Keith Gudger
 * @copyright  (c) 2020, Keith Gudger, all rights reserved
 * @license    http://opensource.org/licenses/BSD-2-Clause
 * @version    Release: 0.8
 * @package    ERental
 *
 */

/**
 * function to display shopping cart 
 */
function showCart() {
	breadBox.push({"cart":"Cart"});
	let htmldata = printBread();
	htmldata += "<br><h2>Shopping Cart</h2>";
	htmldata += "<h3>Items To Reserve</h3>";
	htmldata += "<p>Please select (or remove) items you want to reserve below. Please fill in all fields. Click 'Complete Reservation' when finished. You will be redirected to our Satellite site to pay for the reservation. Thank you.</p>";
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
	htmldata += "<option value='0'>(Select item)</option>";
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
	htmldata += "<a href='#' onclick='remSelect(" + selectNumber + ")'> (remove item)</a>";
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
	if (confirm('You are being redirected to the Satellite payment page\nwhere you  will need to log in or create an account.\nIf you cancel, your reservation will not be completed.')) {
  // Save it!
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
	let url = 'https://satellite.communitytv.org/erental.php?command=reserve';
	let response = await postData(json_str,url);
	if (response['status'] == "OK") {
		let resId = response['reservation'] ;
		window.location.href = "https://satellite.communitytv.org/wp-content/plugins/Ereserve/temp/satellite.php?reservation="+resId;
	} else {
		alert("Reservation Failed " + toString(response['error']));
	}
	} else {
  // Do nothing!
		alert("Reservation Cancelled");
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

async function postData(data,url) {
  // Default options are marked with *
  const response = await fetch(url, {
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
