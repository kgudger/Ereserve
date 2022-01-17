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
 
var bignumber = 9999; // a big number for ids in page;


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
		htmldata += "<table class='er_table'><tr><th>TypeID</th><th>Category</th><th>Title</th><th>Description</th><th>Contents</th><th>Image</th><th>3/1 Day Rate</th><th>1 Day?</th><th>Rented With</th><th>Update</th></tr>";
		htmldata += writeLinesE(retData,cat);
		htmldata += "<tr>";
		htmldata += "<td></td>" + // blank for tid
					"<td>" + addSelectE(bignumber,0) + "</td>" + // select with nothing selected?
					"<td><input type='text' id='title" + bignumber + "' name='title" + bignumber + "' value=''></td>" +
					"<td><textarea id='desc"           + bignumber + "' name='desc"  + bignumber + "' rows='10' cols='30'></textarea></td>" +
					"<td><textarea id='cont"           + bignumber + "' name='cont"  + bignumber + "' rows='5' cols='30'></textarea></td>" +
					"<td><input type='text' id='image" + bignumber + "' name='image" + bignumber + "' value=''></td>" +
					"<td><input type='text' id='rate"  + bignumber + "' name='rate"  + bignumber + "' value=''></td>" +
					"<td><input type='checkbox' id='1day"  + bignumber + "' name='1day"  + bignumber + "' value='1day'></td>" +
					"<td><input type='text' id='frw"   + bignumber + "' name='frw "  + bignumber + "' value=''></td>" ;
		htmldata += "<td><a href='#' onclick='modType(" + 
					bignumber + ")'>" + "Update" + "</a></td>";
		htmldata += "</tr>";
		htmldata += "</table>";
		document.getElementById("er_display").innerHTML = htmldata;
	}
}

/**
 * function to display individual items 
 * @param i is line in returned data to display (item)
 * @cat is category or search page
 */
function showPageE(i) {
//	alert("item is " + i);
	let htmldata  = "<table class='er_table'><tr><th>ItemID</th><th>Type</th><th>Inventory</th><th>SatelliteID</th><th>status</th><th>Active</th><th>Update</th></tr>";
	let data = itemData; // list of all items
	for (let j = 0; j < data.length; j++) { // only display type passed
		if ( data[j]['tid'] == i ) { // is it the right type?
			htmldata += writeItemE(j);
		}
	}
	htmldata += "<tr>";
	htmldata += "<td></td>" + // blank item id, will be assigned on insert
				"<td>" + addSelectT(bignumber,0) + "</td>" +
				"<td><input type='text' id='inventory"    + bignumber + "' name='inventory"    + bignumber + "' value=''></td>" +
				"<td><input type='text' id='satellite_id" + bignumber + "' name='satellite_id" + bignumber + "' value=''></td>" +
				"<td>" + addStatSel(bignumber,0) + "</td>" +
				"<td>" + addActiveSel(bignumber,1) + "</td>" ;
	htmldata += "<td><a href='#' onclick='modItem(" + 
				bignumber + ")'>" + "Update" + "</a></td>";
	htmldata += "</tr>";
	htmldata += "</table>";
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
			htmldata += lineTypes(data,i);
		}
	}
	return htmldata;
}

/**
 * function to display category lines.
 * @param data is returned data array
 * @param i is index to display
 * @return html data for category line.
 */
function lineTypes(data,i) {
	let htmldata = "" ;
	htmldata += "<tr>";
	htmldata += "<td id='tid" + data[i]['type_id'] + "'><a href='#' onclick='showPageE(" + data[i]['type_id'] + ")'>" + data[i]['type_id']  + "</a></td>" +
					"<td>" + addSelectE(data[i]['type_id'],data[i]['category']) + "</td>" +
					"<td><input type='text' id='title" + data[i]['type_id'] + "' name='title" + data[i]['type_id'] +"' value='" + data[i]['title'] + "'></td>" +
					"<td><textarea id='desc" + data[i]['type_id'] + "' name='desc" + data[i]['type_id'] +"' rows='10' cols='30'>" + data[i]['description'] + "</textarea></td>" +
					"<td><textarea id='cont" + data[i]['type_id'] + "' name='cont" + data[i]['type_id'] +"' rows='5' cols='30'>" + data[i]['contents'] + "</textarea></td>" +
					"<td><input type='text' id='image" + data[i]['type_id'] + "' name='image" + data[i]['type_id'] +"' value='" + data[i]['image'] + "'></td>" +
					"<td><input type='text' id='rate" + data[i]['type_id'] + "' name='rate" + data[i]['type_id'] + "' value='" + data[i]['rate'] + "'></td>" +
					"<td><input type='checkbox' id='1day" + data[i]['type_id'] + "' name='1day" + data[i]['type_id'] + "' value=1day" ; 
	if (data[i]['1day'] && data[i]['1day'] == 1)
		htmldata += " checked";
	htmldata += "></td>" +
					"<td><input type='text' id='frw"  + data[i]['type_id'] + "' name='frw"  + data[i]['type_id'] + "' value='" ;
	data[i]['reserve_with_array'].forEach(function(entry) {
		htmldata+= entry + "," ;
	});
	htmldata += "'></td>" ;
	htmldata += "<td><a href='#' onclick='modType(" + 
				data[i]['type_id'] + ")'>" + "Update" + "</a></td>";
	htmldata += "</tr>";
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
function writeItemE(i) {
	let data = itemData;
	let htmldata = "";
	htmldata += "<tr>";
	htmldata += "<td id='tid'>" + data[i]['iid'] + "</td>" +
					"<td>" + addSelectT(data[i]['iid'],data[i]['tid']) + "</td>" +
					"<td><input type='text' id='inventory" + data[i]['iid'] + "' name='inventory" + data[i]['iid'] +"' value='" + data[i]['inventory'] + "'></td>" +
					"<td><input type='text' id='satellite_id" + data[i]['iid'] + "' name='satellite_id" + data[i]['iid'] +"' value='" + data[i]['satellite_id'] + "'></td>" +
					"<td>" + addStatSel(data[i]['iid'],data[i]['status']) + "</td>" +
					"<td>" + addActiveSel(data[i]['iid'],data[i]['active']) + "</td>" ;
	htmldata += "<td><a href='#' onclick='modItem(" + 
				data[i]['iid'] + ")'>" + "Update" + "</a></td>";
	htmldata += "</tr>";
	return htmldata;
}

/**
 * function to search object
 * @param value is value to search for
 * uses fuzzysort
 */
function erSearchE(value) {
    if(event.key === 'Enter') {
		let darray = realSearch(value);
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

		htmldata += "<table class='er_table'><tr><th>TypeID</th><th>Category</th><th>Title</th><th>Description</th><th>Image</th><th>3 Day Rate</th><th>Rented With</th><th>Update</th></tr>";
		darr.forEach(function(entry) {
			htmldata += lineTypes(data,entry);
		});
		htmldata += "</table>";
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
	let htmldata = writeItemE(i);
	htmldata += "<br><button class='er_button' onclick='showCatE(\"" + 
		cat + "\")'>Return to " + cat + " Page</button>";
	document.getElementById("er_display").innerHTML = htmldata;
}

/**
 * function to create category select
 * @param number is added to id and name to create unique select
 * @param selected is item selected
 * @return select 
 */
function addSelectE(number,selected) {
	let htmldata = "";
	htmldata += "<select name='er_selt" + number + "' id='er_selt" + number + "'>";
	catData.forEach(function(cat) {
		if ( cat['active'] == 1) {
			htmldata += "<option value='" + cat['cid'] + "'"
			if ( selected == cat['name'] ) {
				htmldata+= " selected" ;
			}
			htmldata += ">" + cat['name'] + "</option>";
		}
	});

	htmldata += "</select>";
	return htmldata;
}

/**
 * function to create type select
 * @param number is added to id and name to create unique select
 * @param selected is item selected
 * @return select 
 */
function addSelectT(number,selected) {
	let htmldata = "";
	htmldata += "<select name='er_selt" + number + "' id='er_selt" + number + "'>";
	retData.forEach(function(type) {
		if ( type['active'] == 1) {
			htmldata += "<option value='" + type['type_id'] + "'"
			if ( selected == type['type_id'] ) {
				htmldata+= " selected" ;
			}
			htmldata += ">" + type['title'] + "</option>";
		}
	});

	htmldata += "</select>";
	return htmldata;
}

/**
 * function to create status select
 * @param number is added to id and name to create unique select
 * @param selected is item selected
 * @return select 
 */
function addStatSel(number,selected) {
	let htmldata = "";
	htmldata += "<select name='er_stats" + number + "' id='er_stats" + number + "'>";
	statusData.forEach(function(type) {
		htmldata += "<option value='" + type['sid'] + "'"
		if ( selected == type['sid'] ) {
			htmldata+= " selected" ;
		}
		htmldata += ">" + type['status'] + "</option>";
	});
	htmldata += "</select>";
	return htmldata;
}

/**
 * function to create active select
 * @param number is added to id and name to create unique select
 * @param selected is item selected
 * @return select 
 */
function addActiveSel(number,selected) {
	let htmldata = "";
	htmldata += "<select name='er_act" + number + "' id='er_act" + number + "'>";
	htmldata += "<option value='0'"
	if ( selected == 0 ) {
			htmldata+= " selected" ;
	}
	htmldata += ">" + 0 + "</option>";
	htmldata += "<option value='1'"
	if ( selected == 1 ) {
			htmldata+= " selected" ;
	}
	htmldata += ">" + 1 + "</option>";

	htmldata += "</select>";
	return htmldata;
}

/**
 * function to upload changed Items
 * @param it is item id
 */
async function modItem(i) {
	let id  = "er_selt" + i;
	let sel = document.getElementById(id);
	let type = sel.options[sel.selectedIndex].value; // type
	let inventory = document.getElementById('inventory'+i).value ;
	let satellite_id = document.getElementById('satellite_id'+i).value ;
	sel = document.getElementById('er_stats'+i) ;
	let status = sel.options[sel.selectedIndex].value ; // status
	sel = document.getElementById('er_act'+i) ;
	let active = sel.options[sel.selectedIndex].value ; // active
	if (confirm(i + ", " + type + ", " + inventory + ", " + satellite_id + ", " + status + ", " + active )) {
		var itemary = {};
		itemary['id'] = (i == bignumber) ? "" : i ; // item id, null for update
		itemary['tid'] = type;
		itemary['inventory'] = inventory;
		itemary['satellite_id'] = satellite_id;
		itemary['status'] = status;
		itemary['active'] = active;
		let json_str = (JSON.stringify(itemary)); // encodeURI not work
		let url = 'https://satellite.communitytv.org/erental.php?command=upItem';
		let response = await postData(json_str,url);
		if (response['status'] == "OK") {
			// get data array again
			fetchRecs();
			let iid = findItem(itemData,i) ; // get type id
			showPageE(iid) ;
		} else {
			alert("Update Item Failed " + toString(response['error']));
		}
	} else {
  // Do nothing!
		alert("Update Item Cancelled");
	}
}

/**
 * function to upload changed Types
 * @param it is item id
 */
async function modType(i) {
	let id  = "er_selt" + i;
	let sel = document.getElementById(id);
	let cat = sel.options[sel.selectedIndex].value; // category
	let title = document.getElementById('title'+i).value ;
	let desc = document.getElementById('desc'+i).value ;
	let cont = document.getElementById('cont'+i).value ;
	let image = document.getElementById('image'+i).value ;
	let rate = document.getElementById('rate'+i).value ;
	let oneday = document.getElementById('1day'+i).checked ;
	let frw = document.getElementById('frw'+i).value ;
	if (confirm(i + ", " + cat + ", " + title + ", " + desc + ", " + image + ", " + rate + ", " + oneday + "," + frw)) {
		var itemary = {};
		itemary['id'] = (i == bignumber) ? "" : i ; // type id, null for update
		itemary['cat'] = cat;
		itemary['title'] = title;
		itemary['desc'] = desc;
		itemary['image'] = image;
		itemary['rate']   = rate;
		itemary['1day']   = oneday;
		itemary['frw'] = frw;
		itemary['cont'] = cont;
		let json_str = (JSON.stringify(itemary)); // encodeURI not work
		let url = 'https://satellite.communitytv.org/erental.php?command=upType';
		let response = await postData(json_str,url);
		if (response['status'] == "OK") {
			// get data array again
			fetchRecs();
			let cattext = findCat(catData,cat) ; // get category text
			showCatE(cattext) ;
		} else {
			alert("Update Type Failed " + toString(response['error']));
		}
	} else {
  // Do nothing!
		alert("Update Type Cancelled");
	}
}

/**
 * function to find index from tid in data array
 * @param data is returned data array
 * @param index is index into array
 * @return id j
 */
function findIndex(data,index) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['type_id'] == index) {
			return i;
		}
	}
}

/**
 * function to find category from catData
 * @param data is returned catData array
 * @param j is cid
 * @return Category for cid j
 */
function findCat(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['cid'] == j) { // 0 based index
			return data[i]['name'];
		}
	}
}

/**
 * function to find item from itemData
 * @param data is returned itemData array
 * @param j is iid
 * @return Item tid for iid j
 */
function findItem(data,j) {
	for (let i = 0; i < data.length; i++) { // search entire array until found
		if (data[i]['iid'] == j) { // 0 based index
			return data[i]['tid'];
		}
	}
}
