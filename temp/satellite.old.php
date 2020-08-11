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
require_once("../dbstart.php");
require_once("../includes/redirect.php");

$resId = $_REQUEST['reservation']; // reservation ID to check

echo <<<EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
    <script>
        async function finishReservation(input) {
//			alert("Finish Reservation Here");
			let json_str = (JSON.stringify(input));
			let response = await postData(json_str,input);
//			alert(response);
			window.location.href = "https://satellite.communitytv.org/thank-you-for-your-reservation/";

		}
		async function postData(data,input) {
			const response = await fetch('https://satellite.communitytv.org/wp-content/plugins/Ereserve/api/response.php?command=finishReservation&bundle=' + input , {
			method: 'POST', // 
			headers: {
				'Content-Type': 'application/json'
			},
			body: (data) // body data type must match "Content-Type" header
			});
			return response.json(); // parses JSON response into native JavaScript objects
		}
    </script>
	</head>
	<body>
EOT;

echo <<<EOT
<h1>CTV Reservation Validation Page</h1>
<h3>Use During Evaluation Only</h3>
<h3>Replaced by Satellite Page at Release</h3>
<h1>Reservation Information</h1>
EOT;
//echo "<p>Reservation ID is " . $resId . "</p>";
$sql = "SELECT status, name, phone, email, 
			date1, time1, date2, time2
		FROM reservations AS res
   		WHERE res.id = ?";
$stmt = $db->prepare($sql);
$stmt->execute(array($resId));
$row  = $stmt->fetch(PDO::FETCH_ASSOC);
$startdate = "";
$enddate = "";
$cost = 0; // total cost for 3 days of equipment rental
$rate = 0;

if (!empty($row)) { // reservation exists
	echo "For " . $row['name'] . "</br>";
	echo "Phone is " . $row['phone'] . "</br>";
	echo "Email is " . $row['email'] . "</br>";
	$startdate = $row['date1'];
	echo "Start Day is " . $row['date1'] . "</br>";
	$starttime = $row['time1'];
	echo "Start Time is " . $row['time1'] . "</br>";
	$enddate = $row['date2'];
	echo "End Date is " . $row['date2'] . "</br>";
	$endtime = $row['time2'];
	echo "End Time is " . $row['time2'] . "</br>";
}

echo "<h4>You have reserved the following items</h4>";
$sql = "SELECT Types.title AS title, Types.rate AS rate
		FROM reservation_detail AS detail,
			Items, Types
   		WHERE detail.rid = ?
			AND Items.iid = detail.item_id
			AND Types.tid = Items.tid";
$stmt = $db->prepare($sql);
$stmt->execute(array($resId));
while($row  = $stmt->fetch(PDO::FETCH_ASSOC)) {
	$title = $row['title'];
	$rate  = $row['rate'];
	echo "<p>Item: " . $title . " reserved at $" . $rate . " per day - additional days $" . number_format(($rate/3*0.7),2) . "</p>";
	$cost+= $rate;
}

$start_date = new DateTime($startdate);
$end_date = new DateTime($enddate);
//$interval = date_diff(DateTime::createFromFormat('Y-m-d', $start_date->format('Y-m-d')),
//						DateTime::createFromFormat('Y-m-d', $end_date->format('Y-m-d')	) );
$daysrented = $end_date->diff($start_date)->format("%a");
//$s_interval = $interval->format('d');
if ($daysrented == 0) $daysrented = 1;
if ($daysrented <= 3) {
	echo "<p>Days rented is the minimum</p>";
} else {
	echo "<p>Days rented is " . $daysrented. "</p>";
}
$overdays = $daysrented - 3 ; // positive if more than 3 days
if ($overdays > 0) {
	$factor = 1 + 0.7/3 ; // day rate * 0.7
} else {
	$factor = 1 ; // minimum charge
}
$totalcost = number_format($cost * $factor,2);
echo "<p> Total cost is $" . $totalcost . "</p>";
echo "<button onclick='finishReservation($resId)'>Accept and Complete Reservation</button>";

echo <<<EOT
	</body>
</html>
EOT;
?>
