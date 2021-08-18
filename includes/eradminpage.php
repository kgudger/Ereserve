<?php
/**
* @file eradminpage.php
* Purpose: Administer Items in Database
* Extends MainPage Class
*
* @author Keith Gudger
* @copyright  (c) 2020, Keith Gudger, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @version    Release: 0.75
* @package    SOS
*
* @note Has processData and showContent, 
* main and checkForm in MainPage class not overwritten.
* 
*/

require_once("mainpage.php");
/**
 * Child class of MainPage used for user preferrences page.
 *
 * Implements processData and showContent
 */

class eradminPage extends MainPage {

/**
 * Process the data and insert / modify database.
 *
 * @param $uid is user id passed by reference.
 */
   
function processData(&$uid) {
    // Process the verified data here.
//    $stickyDate = $this->formL->getValue("sDate");
	$sql = "SELECT id, status
				FROM `reservations`";
	$result = $this->db->query($sql);
	$fp = fopen('data.txt', 'w');//opens file in write mode  
	fwrite($fp, "Writing\n");  
	$results = print_r($_REQUEST, true);
//	fwrite($fp, $results . "\n");
	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		$stat = $this->formL->getValue("stat" . $row['id']);
		$date1 = $this->formL->getValue("Date1" . $row['id']);
		$date2 = $this->formL->getValue("Date2" . $row['id']);
//		fwrite($fp, '$stat is ' . (($stat == "") ? "Empty" : $stat) . "\n");  
		if ($stat != "") { // form element exists
			fwrite($fp, 'id is ' . $row['id'] . "\n");  
			$rid = $row['id'] ;
			$rstat = $row['status'];
			$sql = "UPDATE reservations
						SET status = ? , date1 = ?, date2 = ? 
						WHERE id =   ? ";
			$res = $this->db->prepare($sql);
			$res->execute(array($stat,$date1,$date2,$rid)); // updates reservation table status

			$sql = "SELECT item_id 
					FROM reservation_detail
					WHERE rid = ?";
			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($rid)); // reads from reservation detail
			while ($row2 = $stmt->fetch(PDO::FETCH_ASSOC)) {
				$item_id = $row2['item_id'];
				$invitem  = $this->formL->getValue("inv"  . $row['id'] . "-" . $item_id);
//				$statitem = $this->formL->getValue("stat" . $row['id'] . "-" . $item_id);
				fwrite($fp, "item_id=$item_id invitem=$invitem statitem=$stat" . "\n");
				if ($invitem == $item_id) { // the same inventory item - hasn't changed
/*					$sql = "UPDATE Items
						SET status = ?
						WHERE iid = ?" ;
					$res = $this->db->prepare($sql);
$res->execute(array($statitem,$item_id)); // updates item 
 */					$sql = "UPDATE reservation_detail
							SET status = ?
							WHERE rid = ? 
							AND item_id = ?";
					$res = $this->db->prepare($sql);
					$res->execute(array($stat,$rid,$item_id)); // updates reservation detail status
					fwrite($fp, "updating $item_id  to status $stat" . "\n");
				} else {
/*					$sql = "UPDATE Items
						SET status = 0
						WHERE iid = ?";
					$res = $this->db->prepare($sql);
					$res->execute(array($item_id)); // updates item to available
					
					$sql = "UPDATE Items
						SET status = ?
						WHERE iid = $invitem"; // update new items status
					$res = $this->db->prepare($sql);
					$res->execute(array($statitem)); // updates item
					fwrite($fp, "updating $invitem  to status $statitem" . "\n");
*/					$sql = "UPDATE reservation_detail
							SET status = ?, item_id = ?
							WHERE rid = ? 
							AND item_id = ?";
					$res = $this->db->prepare($sql);
					$res->execute(array($stat,$invitem,$rid,$item_id)); // updates reservation detail status
					$item_id = $invitem ; // new item id
				}
			}
//			fwrite($fp, 'id is' . $row['id'] . "status is " . $stat);  
		}
	}
	fclose($fp);  
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

//	echo $this->formL->reportErrors();
	$retpage .= "<a href='https://satellite.communitytv.org/wp-content/plugins/Ereserve/EPie.php'>" ;
	$retpage .= "<button>Pie Charts!</button></a><br><br>";
	$retpage .= $this->formL->start('POST', "/equipment-reservation-administration", 'name="E Admin"');
	$retpage .= "<h4>All active reservations and all reservations ending after below date.</h4>";
	$date = date("Y-m-d");
	$retpage .= $this->formL->makeDateInput("sDate",$date);
	$sDate = $this->formL->getValue("sDate") ;
	if ($sDate == "")  $sDate = $date ; // first time form is blank?
//	$retpage .= "<p>Date is " . $sDate . "</p>";
	$sql = "SELECT * FROM Status";
	if (!is_null($this->db) ) { // added to allow wordpress to edit page with shortcode
		$result = $this->db->query($sql);
		$statarray = array();
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			$statarray[$row['status']] = $row['sid'];
		}
	
		$sql = "SELECT id, status, name, date1, date2 
				FROM `reservations`";
		$result = $this->db->query($sql);
		$retpage .= "<table><tr><th>Name</th><th>Start</th><th>Stop</th><th>Status</th><th>Gear</th><th>Contract</th></tr>";
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			if ( ($row['status'] > 0) || ($row['date2'] >= $sDate) ) {
				$retpage .= "<tr><td>" . $row['name'] . "</td><td>" . $this->formL->makeDateInput("Date1" . $row['id'],$value=$row['date1']) . "</td>" ;
				$retpage .= "<td>" . $this->formL->makeDateInput("Date2" . $row['id'],$value=$row['date2']) . "</td>";
				$retpage .= "<td>" . $this->formL->makeSelect("stat" . $row['id'], $statarray, $row['status']) . "</td>";
//				$retpage .= "<td><table><tr><th>Name</th><th>Inventory</th><th>Status</th></tr>" ;
				$retpage .= "<td><table><tr><th>Name</th><th>Inventory</th></tr>" ;
				$sql = "SELECT Items.status AS status,
							Types.title AS name,
							Items.inventory as inventory,
							Items.iid AS iid,
							Items.tid AS tid
						FROM reservation_detail AS RD,
							Types, Items
						WHERE Types.tid = Items.tid
							AND RD.item_id = Items.iid
							AND RD.rid = " . $row['id'];
				$res2 = $this->db->query($sql);
				while ($row2 = $res2->fetch(PDO::FETCH_ASSOC)) {
					$invarray = array();
					$sql = "SELECT Items.inventory AS inv,
							Items.iid AS iid
							FROM Items
							WHERE status = 0 AND active = 1
							AND Items.tid = " .$row2['tid'] .
							" AND Items.iid NOT IN
							(SELECT item_id FROM `reservation_detail`
								WHERE status > 1)";
					$res3 = $this->db->query($sql);
					while ($row3 = $res3-> fetch(PDO::FETCH_ASSOC)) {
						$invarray[$row3['inv']] =  $row3['iid'];
					}
					$invarray[$row2['inventory']] = $row2['iid'];
					$retpage .= "<tr><td>" . $row2['name'] . "</td><td>" . 
						$this->formL->makeSelect("inv"  . $row['id'] . "-" . $row2['iid'], $invarray, $row2['iid']) .
/*						 "</td><td>" .
$this->formL->makeSelect("stat" . $row['id'] . "-" . $row2['iid'], $statarray, $row2['status']) . */
//						array_search($row2['status'], $statarray) . 
						"</td></tr>";
				}
				$retpage .= "</table></td>";
				$retpage .= "<td><a href='https://satellite.communitytv.org/wp-content/plugins/Ereserve/includes/contract.php?reservation=". $row['id'] . "'><img src='https://satellite.communitytv.org/wp-content/plugins/Ereserve/img/plus.png'></a></td></tr>" ;
			} // only display these dates
		}
		$retpage .= "</table>";  
		$retpage .= $this->formL->makeButton($value = "Submit", $name= "Submit");
		$retpage .= $this->formL->finish();
	}
  return $retpage;
}

}
?>
