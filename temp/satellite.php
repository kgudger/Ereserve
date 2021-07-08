<?php
/**
* @file satellite.php
* Purpose: Satellite Redirect.
*
* @author Keith Gudger
* @copyright  (c) 2020, Community Television of Santa Cruz County, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @version    Release: 1.0
* @package    Satellite
* @author	Keith Gudger
*
*/
/**
 * dbstart.php opens the database and gets the user variables
 */
require_once("/var/www/html/satellite/wp-content/plugins/Ereserve/dbstart.php");
require_once("/var/www/html/satellite/wp-content/plugins/Ereserve/includes/redirect.php");

$resId = $_REQUEST['reservation']; // reservation ID to check

$sql = "SELECT status, name, phone, email, 
			date1, time1, date2, time2
		FROM reservations AS res
   		WHERE res.id = ?";
$stmt = $db->prepare($sql);
$stmt->execute(array($resId));
$row  = $stmt->fetch(PDO::FETCH_ASSOC);
$cost = 0; // total cost for 3 days of equipment rental
$rate = 0;

if (!empty($row)) { // reservation exists
	$sql = "SELECT Types.title AS title, Types.rate AS rate,
				Items.iid AS iid
			FROM reservation_detail AS detail,
				Items, Types
			WHERE detail.rid = ?
				AND Items.iid = detail.item_id
				AND Types.tid = Items.tid";
	$stmt = $db->prepare($sql);
	$stmt->execute(array($resId));
	while($row  = $stmt->fetch(PDO::FETCH_ASSOC)) {
		if (!empty($row)) { // reserved item exists
			$cook_val = "?center=1" ;
			if ( isset($_COOKIE['user'] ) ) {
				$cook_val .= "&user=" . $_COOKIE['user'];
			}
			if (isset($_REQUEST['user'])) { // user id is set
				$cook_val .= "&user=" . $_REQUEST['user'];
			}
			$altRedirect = "https://scdigital.satellitedeskworks.com/#/bundle-reservation/" . $resId . "/confirm" . $cook_val ;
			$cost+= $row['rate'];
		}
	}
	$myfile = fopen("/var/www/html/VolCreds/satcost.txt","w") or die("Unable to open file");
	fwrite($myfile, $altRedirect);
//	fwrite($myfile,"\n" . print_r($_COOKIE, true ));
	fwrite($myfile,"\n" . print_r($_REQUEST, true ));
	fwrite($myfile,"\nCost is " . $cost);
	fclose($myfile);
//	echo "Cost is " . $cost;
} else {
	$altRedirect = "https://satellite.communitytv.org" ;
}
header("Location: " . $altRedirect);
?>
