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

// variable to hold cookie data for this page
var cookieItems =[]; // global variable for cookie items for this page

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
	htmldata += "<tr><td><label for='startdate'><input type='date' id='startdate' name='startdate' required onchange='calcPrice()'> Reservation Start Date</label></td>";
	htmldata += "<td><label for 'starttime'><input type='time' id='starttime' name='starttime' min='09:00' max='17:00' required> Start Time</label></td></tr>";
	htmldata += "<tr><td><label for='enddate'><input type='date' id='enddate' name='enddate' required onchange='calcPrice()'>Reservation End Date</label></td>";
	htmldata += "<td><label for 'endtime'><input type='time' id='endtime' name='endtime' min='09:00' max='17:00' required> Stop Time</label></td></tr>";
	htmldata += "</table><br>";
	htmldata += "<p id='total_cost'></p>";
	htmldata += "<button class='er_button' onclick='completeReservation()'>Complete Reservation</button>";
	document.getElementById("er_display").innerHTML = htmldata;
	selectNumber = 0; // reset to 0 when creating the form.
	addCookieItems();
	calcPrice() ; // add in total price
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
	htmldata += "<select name='er_item" + number + "' id='er_item" + number + "' onchange='changeItem(" + number + ")'>";
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
 * function to change selected item
 * @param number is id of select
 */
function changeItem(number) {
	if ( number < cookieItems.length )
		remCookieItem(cookieItems[number]); // remove items from cookie
	let id = "er_item" + number ;
	let e = document.getElementById(id);
	let selItem = e.options[e.selectedIndex].value;
	cookRes(parseInt(selItem),true);
	calcPrice() ; // also puts new item in cookie items array
}

/**
 * function to remove selected item
 * @param number is id of select
 * @param selected is item selected to unselect
 */
function remSelect(number) {
	let id = "er_item" + number ;
	let elements = document.getElementById(id).options;
	var e = document.getElementById(id);
	let selItem = e.options[e.selectedIndex].value;
	remCookieItem(selItem); // removes item from cookie string
    for(let i = 0; i < elements.length; i++){
      elements[i].selected = false;
    }
    calcPrice();
}

/**
 * function to remove a cookie item from reservation form
 * increments selectNumber
 * adds an empty one if no cookies
 */
function remCookieItem(selItem) {
	var json_str = getCookie('Reservation');
	if (json_str !== "") {
		var a2 = JSON.parse(json_str);
		const index = a2.indexOf(parseInt(selItem));
		if (index > -1) {
			a2.splice(index, 1);
			json_str = JSON.stringify(a2);
			createCookie("Reservation", json_str);
		}
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
 * function to complete registration
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
	if (confirm("When you click 'OK' you will be redirected to the Satellite payment page where you will need to log in or create an account.\nIf you click cancel, your reservation will not be completed.")) {
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
		if (user_no > 0)  // user number set by referal
			resId += "&user=" + user_no;
		window.location.href = "https://sccurrents.org/VolCreds/satellitenew.php?reservation="+resId;
	} else {
		let err_str = response['error'];
		console.log(err_str);
		alert("Reservation Failed " + err_str);
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

/**
 * function to post data to the server.
 * @param data - json packet to send
 * @param url  - url to send to, including command
 */
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

/**
 * function to calculate price
 */
function calcPrice() {

	let totalcost = 0;  // total cost
	let startDate = document.getElementById('startdate').value;
	let endDate = document.getElementById('enddate').value;
    // normalize both start and end to beginning of the day
	startDate = new Date(startDate) ;
	endDate   = new Date(endDate) ;
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    startDate.setDate(startDate.getDate() + 1);
    var days = 0; // total days
    var day;
    var day1;
    // loop through each day, checking
    while (startDate <= endDate) { // 1 or more days
        day = startDate.getDay();
//        if (day >= 0 && day <= 4) { // fix for date is one day in the past
            ++days;
//        }
        startDate.setDate(startDate.getDate() + 1);
    }

	days = days || 0 ;
	if (days == 0)
		day1 = 1;
	else
		day1 = days; // number of real days for 1 day rentals

	if (days <= 3) days = 3; // minimum days
	let factor = 1 + ((( days - 3 )/3) * 0.7) ; //
	let factor1 = 1 + ((day1-1)*0.7) ; // extra day rate for 1day
	
	cookieItems = []; // clears cookie items array
	
	for (let i = 0; i < selectNumber; i++ ) {
		let id  = "er_item" + i;
		let sel = document.getElementById(id);
		let val = sel.options[sel.selectedIndex].value;
		if (val >0) { // there's an item selected
			let dayO = findDRate(retData,val); // 1 day rate? or null
			if ( (dayO != null) && (dayO == 1) )
				totalcost += factor1 * findRate(retData,val); // per day cost
			else
				totalcost += factor * findRate(retData,val); // add in cost
			cookieItems[i] = val ; // adds item to cookie array
		}	
	}
	let priceSpot = document.getElementById('total_cost');
	priceSpot.innerHTML = "Total Cost is: $" + totalcost.toFixed(2); ;
	
}

/**
 * function to find rate from tid in data array
 * @param data is returned data array
 * @param j is tid
 * @return rate for tid j
 */
function findRate(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['type_id'] == j) {
			return data[i]['rate'];
		}
	}
}

/**
 * function to find if it's a 1 day rental from tid in data array
 * @param data is returned data array
 * @param j is tid
 * @return 1day valye for tid j
 */
function findDRate(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['type_id'] == j) {
			return data[i]['1day'];
		}
	}
}
