<?php
/**
* @file erequippage.php
* Purpose: Add and modify equipment database
* Extends MainPage Class
*
* @author Keith Gudger
* @copyright  (c) 2020, Keith Gudger, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @version    Release: 0.7
* @package    EReservve
*
* @note Has showContent, 
* main and checkForm in MainPage class not overwritten.
* 
*/

require_once("mainpage.php");

/**
 * Child class of MainPage used for user preferrences page.
 *
 * Implements showContent
 */

class erequipPage extends MainPage {

/**
 * Display the content of the page.
 *
 * @param $title is page title.
 * @param $uid is user id passed by reference.
 */
function showContent($title, &$uid) {

  $retpage = "";

	$retpage .= <<<EOT
<div id='er_main'>
EOT;
	$retpage .= "<div id='er_srch' class='er_srch'><input type='text' placeholder='Search Text' onkeydown='erSearchE(this.value)' id='er_sin' class='er_sin'></div>";

	$retpage .= "<div id='er_menu'>";

  $cats = array(); 
  $result = array();
  $sql = "SELECT * FROM Categories";
  $retpage .= "<ul class='topnav'>";
  if (!is_null($this->db) ) { // added to allow wordpress to edit page with shortcode
	$result = $this->db->query($sql);
	  $n = 0;
	  while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
	    $cats[$row["name"]] = $row["image"];
	    $retpage .= "<li><a href='#' onclick='showCatE(\"" . $row["name"] . "\")'>" . $row["name"] . "</a></li>";
  	  }  
  } 
  $retpage .= "</ul></div>"; // er_menu
  $retpage .= "<div id='er_display'>";  
  $retpage .= "</div>"; // er_display
  $retpage .= "</div>"; // er_main
  return $retpage;
}

}
?>
