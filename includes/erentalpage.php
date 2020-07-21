<?php
/**
* @file dbappoutpage.php
* Purpose: Sort and Output Data Base
* Extends MainPage Class
*
* @author Keith Gudger
* @copyright  (c) 2020, Keith Gudger, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @version    Release: 0.7
* @package    SOS
*
* @note Has processData and showContent, 
* main and checkForm in MainPage class not overwritten.
* 
*/

require_once("mainpage.php");
//include_once "/var/www/html/includes/util.php";

/**
 * Child class of MainPage used for user preferrences page.
 *
 * Implements processData and showContent
 */

class erentalPage extends MainPage {

/**
 * Process the data and insert / modify database.
 *
 * @param $uid is user id passed by reference.
 */
function processData(&$uid) {
/*
  $uid = array($this->formL->getValue("cat"),
				$this->formL->getValue("startd"),
				$this->formL->getValue("endd"));

  if ( isset($this->formL->getValue("getFile")[0]) && 
			$this->formL->getValue("getFile")[0] == "yes" ) {
	  $this->sessnp = "yes";
  }*/
    // Process the verified data here.
}

/**
 * Display the content of the page.
 *
 * @param $title is page title.
 * @param $uid is user id passed by reference.
 */
function showContent($title, &$uid) {

// Put HTML after the closing PHP tag
  $retpage = "";

	$retpage .= <<<EOT
<div id='er_main'>
EOT;
	$retpage .= "<div id='er_shop' class='er_srch'><a href='#' onclick='showCart()'>View Your Cart
				<img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/cart.png'></a></div>";
	$retpage .= "<div id='er_srch' class='er_srch'><input type='text' placeholder='Search Text' onkeydown='erSearch(this.value)' id='er_sin' class='er_sin'>
				<img src='https://satellite.communitytv.org/wp-content/uploads/2020/07/icons8-search-50.png' onclick='erSClick()'></div>";

	$retpage .= <<<EOT
<div id='er_menu'>
EOT;
  $cats = array(); 
  $result = array();
  $sql = "SELECT * FROM Categories";
  $retpage .= "<ul class='topnav'>";
  if (!is_null($this->db) ) { // added to allow wordpress to edit page with shortcode
	$result = $this->db->query($sql);
	  $n = 0;
	  while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
	    $cats[$row["name"]] = $row["image"];
	    $retpage .= "<li><a href='#' onclick='showCat(\"" . $row["name"] . "\")'>" . $row["name"] . "</a></li>";
  	  }  
  } 
  $retpage .= "<li><a href='#' onclick='showCat(\"Everything\")'>Everything</a></li>";
//  $retpage .= "<li><a href='#' onclick='showCart()'>Shopping Cart</a></li>";
  $retpage .= <<<EOT
</ul></div>
<div id='er_display'>
< Home <- You Are Here<br>
<br><h3>Instructions</h3>Browse our equipment by category by clicking below 
or on the banner above. Select equipment to add to your cart then check out 
with "View Your Cart". You can search for items using the Search box above. Thanks.
EOT;
  foreach ($cats as $key => $img) {
	  $retpage .= "<div class='er_block'><br><br><a href='#' onclick='showCat(\"" . $key . "\")'><h2>" . $key . "</h2>";
	  $retpage .= "<img class='er_image' src='" . $img . "'></a></div>";
  }
  $retpage .= "</div></div>";
  return $retpage;
}

/**
 * Display the tables unsorted
 *
 */
function cameraTable() {

  $retpage = '<table class="er_table"><tr><th>Title</th><th>Image</th></th><th>Description</th><th>3 Day Price</th>';
  $retpage .= '<th>Extra Day Price</th><th>How Many Available</th></tr>';
  $sql = "SELECT tid,title,description,image,rate FROM Types 
			WHERE active = 1
			ORDER BY title ASC";
  $result = $this->db->query($sql);
  while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    $title = $row["title"];
    $desc  = $row["description"];
    $img   = $row["image"];
    $rate  = $row["rate"];
    $tid   = $row["tid"];  // tid for next query.

	$sql = "SELECT COUNT(*) FROM Items
				WHERE tid = $tid
				AND status =0
				AND active = 1";
    $res2 = $this->db->query($sql);
    $row2 = $res2->fetch(PDO::FETCH_ASSOC);
    $avail = $row2["COUNT(*)"];
	$retpage .= "<tr><td>" . $title . "</td>";
	$retpage .= "<td><img class='er_thumb' src='" . $img . "'></td>";
	$retpage .= "<td>" . $desc . "</td>";
	$retpage .= "<td>$" . $rate . "</td>";
	$retpage .= "<td>$" . round($rate/3*0.7,2) . "</td>";
	$retpage .= "<td>" . $avail . "</td></tr>";
	}
  $retpage .= "</table><br>";
  return $retpage;
}

function write_csv($title,$data) {
	$myfile = fopen("output.csv","w") or die("Unable to open file");
	$sep = array("sep=;");
	fputcsv($myfile,$sep);
    fputcsv($myfile, $title,";",'"');
    foreach ($data as $fields) {
       fputcsv($myfile,$fields,";",'"');
    }
    fclose($myfile);
}
function ssHead () {
//    $head = array('Timestamp','First Name*','Last Name*','What was the date of the event?*','What time did the event start?','What time did the event end?','City/County where the event was held?*','Cleanup Site*','Estimated Cleanup Area (in square miles)?*','Number of Adults*','Number of Youth*','Pounds of Trash Collected*','Pounds of Recycling Collected*','Cigarette Butts','Plastic Pieces (larger than 5mm)','Plastic Food Wrappers','Polystyrene Pieces (Styrofoam)','Paper Pieces','Bags (shopping variety)','Balloons','Bottles','Bottle Caps/Rings','Cups, Lids, Plates, Utensils','Polystyrene Cups, Plates, Bowls ','Polystyrene Food "To-Go" Containers','Fishing Line','Straws/Stirrers','Toys','Bottles','Pieces/Chunks','Cardboard ','Food Containers/Cups/Plates/Bowls','Newspapers/Magazines','Beer Cans','Bottle Caps','Can Pulls/Tabs','Fishing Hooks/Lures','Nails','Soda Cans','Band-Aids  ','Batteries','Condoms','Diapers','Disposable Lighters','Feminine Hygiene','Syringes/Needles','Other Items (Please list items below)','General Comments about the Cleanup:');
    $head = array('Timestamp','Date of Cleanup Event/Fecha','Cleanup Site/Sitio de limpieza','FIRST Name (Site captain name/Nombre de coordinador)','LAST Name (Site captain name/Nombre de coordinador)','Total Cleanup Duration (hrs)','Cleanup Start Time','Cleanup End Time','Type of Cleanup','County where the event was held?','Adult Volunteers','Youth Volunteers','Pounds of Trash','Pounds of Recycling','Cigarette Butts/Colillas de Cigarrillo','Plastic Pieces/Pedazos de Plástico (>5mm)','Plastic Food Wrappers/Envoltorios de Comida','Polystyrene Pieces (i.e. foam)/Pedazos de Poliestireno (i.e. unicel)','Plastic To-Go Items/Envases de Comida “Para levar”/Plástico','Paper Pieces/Pedazos de Paper','shopping bags (plastic)/bolsas de comestibles (de plástico)','balloons/globos,bottles (plastic)/botellas (de plástico)','bottle caps and rings (plastic)/taparroscas y tapas de botellas (de plástico)','polystyrene foodware (foam)/vasos y platos de poliestireno (unicel)','straws and stirrers/popotes y mezcladores','toys & beach accessories (plastic)/juguetes y accesorios de playa (de plástico)','bottles (glass)/botellas de vidrio','pieces and chunks (glass)/pedazos y trozos de vidrio','cardboard/cartulinas','food containers (paper): cups, plates, bowls/envases de comida (de papel): vasos, platos','beer cans/latas de cerveza','soda cans/latas de refresco','bottle caps (metal)/corcholatas (de metal)','band-aids/curitas,batteries/baterías,personal hygiene/artículos de higiene personal','disposable lighters/encendedores','syringes, needles/jeringuilla','smoking, tobacco, vape items (NOT butts)/ artículos de fumar (tabaco, no colillas de cigarrillo)','wood pallets, pieces, and processed wood/paletas de madera, piezas trozos de madera','fishing gear (lures, nets, etc.)/avíos de pesca','clothes, cloth/ropa, paño','other, large/otros objetos grandes','other, small/otros objetos pequeños','Supplies lost/broken/used up?,Challenges or general feedback?','Issues with the location (e.g., parking, bathrooms, trash/recycling bins)?','Awe-inspiring moments, cute stories, heartwarming experiences?');
    return $head;
}
}
?>
