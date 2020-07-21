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
		htmldata += "<table class='er_table'><tr><th>TypeID</th><th>Category</th><th>Title</th><th>Description</th><th>Image</th><th>3 Day Rate</th><th>Rented With</th><th>Update</th></tr>";
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
function showPageE(i) {
//	alert("item is " + i);
	let htmldata  = "<table class='er_table'><tr><th>ItemID</th><th>Type</th><th>Inventory</th><th>SatelliteID</th><th>status</th><th>Active</th><th>Update</th></tr>";
	let data = itemData; // list of all items
	for (let j = 0; j < data.length; j++) { // only display type passed
		if ( data[j]['tid'] == i ) { // is it the right type?
			htmldata += writeItemE(j);
		}
	}
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
					"<td><input type='text' id='image" + data[i]['type_id'] + "' name='image" + data[i]['type_id'] +"' value='" + data[i]['image'] + "'></td>" +
					"<td><input type='text' id='rate" + data[i]['type_id'] + "' name='rate" + data[i]['type_id'] + "' value='" + data[i]['rate'] + "'></td>" +
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
					"<td><input type='text' id='status" + data[i]['iid'] + "' name='status" + data[i]['iid'] + "' value='" + data[i]['status'] + "'></td>" +
					"<td><input type='text' id='active"  + data[i]['iid'] + "' name='active"  + data[i]['iid'] + "' value='" + data[i]['active'] + "'></td>" ;
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
	htmldata += "<select name='er_sel" + number + "' id='er_sel" + number + "'>";
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
 * function to upload changed Items
 * @param it is item id
 */
async function modType(i) {
	let id  = "er_selt" + i;
	let sel = document.getElementById(id);
	let type = sel.options[sel.selectedIndex].value; // type
	let inventory = document.getElementById('inventory'+i).value ;
	let satellite_id = document.getElementById('satellite_id'+i).value ;
	let status = document.getElementById('status'+i).value ;
	let active = document.getElementById('active'+i).value ;
	alert(i + ", " + type + ", " + inventory + ", " + satellite_id + ", " + status + ", " + active );
	var itemary = {};
	itemary['id'] = i;
	itemary['tid'] = type;
	itemary['inventory'] = inventory;
	itemary['satellite_id'] = satellite_id;
	itemary['status'] = status;
	itemary['active'] = active;
	let json_str = (JSON.stringify(itemary)); // encodeURI not work
	let url = 'https://satellite.communitytv.org/erental.php?command=upItem';
//	let response = await postData(json_str,url);
}

/**
 * function to upload changed Items
 * @param it is item id
 */
async function modItem(i) {
	let id  = "tid" + i;
	let sel = document.getElementById(id);
	let cat = sel.options[sel.selectedIndex].value; // category
	let title = document.getElementById('title'+i).value ;
	let desc = document.getElementById('desc'+i).value ;
	let image = document.getElementById('image'+i).value ;
	let rate = document.getElementById('rate'+i).value ;
	let frw = document.getElementById('frw'+i).value ;
	alert(i + ", " + cat + ", " + title + ", " + desc + ", " + image + ", " + rate + ", " + frw);
	var itemary = {};
	itemary['id'] = i;
	itemary['cat'] = cat;
	itemary['title'] = title;
	itemary['desc'] = desc;
	itemary['image'] = image;
	itemary['rate']   = rate;
	itemary['frw'] = frw;
	let json_str = (JSON.stringify(itemary)); // encodeURI not work
	let url = 'https://satellite.communitytv.org/erental.php?command=upItem';
	let response = await postData(json_str,url);
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
