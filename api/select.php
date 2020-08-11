<?php
/**
* @file select.php
* Purpose: Satellite API.
*
* @copyright  (c) 2020, Community Television of Santa Cruz County, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @author Keith Gudger
* @version 2.0 08/09/20
*
*/

require_once "/var/www/html/satellite/wp-content/plugins/Ereserve/dbstart.php";
  header('Content-type: text/html');
  header('Access-Control-Allow-Origin: *');

//echo $_SERVER['REQUEST_URI'];
$file = './uri.txt';
file_put_contents($file, $_SERVER['REQUEST_URI']);

$url_elements = explode('/', $_SERVER['REQUEST_URI']);

//var_dump( $url_elements);

$request = $url_elements[1] ;
$bundle  = $url_elements[2] ;
//echo "<br>request is " . $request . "<br>";
//echo "bundle  is " . $bundle  . "<br>";

//print_r $request_parts;
if ( $request != "selection-bundles" ) {
	$response = array('error'=>'Bad request.\r\n');
	$response = json_encode($response);
	http_response_code(400);
	echo $response;
	return;
}

$sql = "SELECT date1, date2
		FROM reservations
		WHERE id = ?";
$stmt = $db->prepare($sql);
$stmt->execute(array($bundle));
$row = $stmt->fetch(PDO::FETCH_ASSOC);  // gets dates
if (empty($row)) { 
	$response = array('error'=>'Reservation failed.\r\nWorkstation unit is not available.\r\n');
	$response = json_encode($response);
	http_response_code(400);
	echo $response;
	return;
} else
{

	$start_date = ($row['date1']);
	$end_date = ($row['date2']);
	$tz = new DateTimeZone('UTC'); // format in db
	$start_date = new DateTime($start_date, $tz);
	$end_date = new DateTime($end_date, $tz);
	$tz = new DateTimeZone('America/Los_Angeles');
	$start_date->setTimeZone($tz);
	$end_date->setTimeZone($tz);
//	$t1 = new DateTime($start_date->format('Y-m-d'));
//	$t2 = new DateTime($end_date->format('Y-m-d'));
//	$interval = date_diff($t1, $t2); // days between
	$interval = date_diff(DateTime::createFromFormat('Y-m-d', $start_date->format('Y-m-d')),
						DateTime::createFromFormat('Y-m-d', $end_date->format('Y-m-d')	) );
	// changed to make sure we get all of the days 11/1/17
	$int_inc = $interval->format('%d'); // numeric days
	$cost = 0; // total cost for 3 days of equipment rental
	$rate = 0;
	if ($int_inc == 0) $int_inc = 1;
	if ($int_inc <= "1") {
		$days = "1 day reservation";
	} else {
		$days = $int_inc . " days reservation";
	}
	
	$overdays = $int_inc - 3 ; // positive if more than 3 days
	if ($overdays > 0) {
		$factor = 1 + $overdays * 0.7 / 3 ; // day rate * 0.7
	} else {
		$factor = 1 ; // minimum charge
	}
	
	$rtdata = array();
	$send_data = array("bundleRef" => $bundle, // your bundle ID
						"reservationNote"=>  $days,
						"emailConfirmation" => true);

	$sql = "SELECT item_id AS iid
		FROM `reservation_detail`
		WHERE (rid = ?)";
	$stmt = $db->prepare($sql);
	$stmt->execute(array($bundle));

	while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
		$rownid = $row['iid'];
//		echo "<br> Row Nids are " . $rownid ;

//	  echo "Row Nid is " . $rownid . "<br>";
      if ( ( $rownid != null ) && ( $rownid != 0 ) ) { // equipment found
		$sql = "SELECT Types.rate AS rate,
					Items.satellite_id AS 'sid' 
				FROM Items, Types
   				WHERE Items.iid = '$rownid'
					AND Types.tid = Items.tid";
		$result2 = $db->query($sql);
		$row2 = $result2->fetch(PDO::FETCH_ASSOC);
		$sat_id = $row2['sid'];
		$member_cost = number_format($factor*$row2['rate'],2);

		$ru_data = array("reservationUnitId" => $sat_id,
						"reservationQuantity" => 1.0,
						"price" => $member_cost);
						// above is changed, now is per equip item.
						
		$rp_data = array(); // array of above reservation days within response
	
		$stdate = new DATETIME($start_date->format('l F j Y g:i:s A'),$tz);  // should be DateTime
		for ( $i = 1; (($i <= $int_inc)); $i++ ) { // all inclusive
			if ( $i == 0 ) {
				$ndate = $stdate->format('Y-m-d\TH:i:sP'); // From 2017-10-10T12:30:00-04:00 to: 2017-10-12T14:30:00-04:00
				$edate = $stdate->format('Y-m-d\T24:00:00P');
			} else if ( $i == $int_inc ) {
				$stdate->modify("+1 day");
				$ndate = $stdate->format('Y-m-d\T00:00:00P');
				$edate = $stdate->format('Y-m-d\TH:i:sP');
			} else {
				$stdate->modify("+1 day");
				$ndate = $stdate->format('Y-m-d\T00:00:00P');
				$edate = $stdate->format('Y-m-d\T24:00:00P');
			}
						
			$ri_data = array("from" => $ndate, "to" => $edate);
			array_push ($rp_data, $ri_data);
			// rp_data is now: { from: "2014-10-22T16:30:00-07:00", to: "2014-10-23T00:00:00-07:00" },

		}
	    if ( !empty($rp_data) ) {
			$ru_data["reservationPeriods"]=$rp_data;
	    }
	    
	    array_push($rtdata,$ru_data);
	    
	  } else {
		  	$send_data = array('error'=>'Reservation failed - equipment not available.\r\n');
		  	break;
	  }
	}
	if ( !empty($rtdata) ) {
		$send_data["reservations"]=$rtdata;
	}
	$response = json_encode($send_data);
}
echo $response;
$file = './resp.txt';
file_put_contents($file, $response);
 
?>

