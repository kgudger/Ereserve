<?php
/**
* @file contract.php
* Purpose: Reservation Contract
* @author Keith Gudger
* @copyright  (c) 2020, Community Television of Santa Cruz County, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @version    Release: 1.0
* @package    Equipment Reservation
* @author	Keith Gudger
*
*/
/**
 * dbstart.php opens the database and gets the user variables
 */
require_once("../dbstart.php");
require_once("../includes/redirect.php");

$resId = $_REQUEST['reservation']; // reservation ID to build contract for.

echo <<<EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
<style>
table.blueTable {
  border: 1px solid #1C6EA4;
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}
table.blueTable td, table.blueTable th {
  border: 1px solid #AAAAAA;
  padding: 3px 2px;
}
table.blueTable tbody td {
  font-size: 13px;
}
table.blueTable tr:nth-child(even) {
  background: #EEEEEE;
}
table.blueTable thead {
  background: #1C6EA4;
  background: -moz-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
  background: -webkit-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
  background: linear-gradient(to bottom, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
  border-bottom: 2px solid #444444;
}
table.blueTable thead th {
  font-size: 15px;
  font-weight: bold;
  color: #FFFFFF;
  border-left: 2px solid #D0E4F5;
}
table.blueTable thead th:first-child {
  border-left: none;
}</style>
	</head>
	<body>
EOT;
// get rental information from database
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

echo <<<EOT
<div class='er_con_a'><img src="https://satellite.communitytv.org/wp-content/uploads/2016/10/Satellite-CTV-logo-246x140.jpg">;
<h1>CTV Equipment Rental Contract</h1>
EOT;
if (!empty($row)) { // reservation exists
	echo "<div class='er_con_b'>";
	$startdate = $row['date1'];
	$starttime = $row['time1'];
	echo "Reservation starts: " . $row['date1'] . " - " . $starttime . "<br>";
	$enddate = $row['date2'];
	$endtime = $row['time2'];
	echo "Return By: " . $row['date2'] . " - " . $endtime . "</br>";
	echo "Name:  " . $row['name'] . "</br>";
	echo "Phone: " . $row['phone'] . "</br>";
	echo "Email: " . $row['email'] . "</br></div><br>";
}

$start_date = new DateTime($startdate);
$end_date = new DateTime($enddate);
$daysrented = $end_date->diff($start_date)->format("%a");
// create an iterateable period of date (P1D equates to 1 day)
$period = new DatePeriod($start_date, new DateInterval('P1D'), $end_date);
foreach($period as $dt) {
    $curr = $dt->format('D');

    // substract if Saturday or Sunday
    if ($curr == 'Sat' || $curr == 'Sun') {
        $daysrented--;
    }
}

if ($daysrented <= 0) $daysrented = 1; // minimum of 1 day!
$overdays = $daysrented - 3 ; // positive if more than 3 days
if ($overdays > 0) {
	$factor = 1 + 0.7/3 * $overdays ; // day rate * 0.7
} else {
	$factor = 1 ; // minimum charge
}

echo <<<EOT
<table class='blueTable'>
<tr><th>Item</th><th>Inventory Tag</th><th>3 day Cost</th><th>Days Rented</th><th>Extended Cost</th></tr>
EOT;

$sql = "SELECT Types.title AS title, Types.rate AS rate,
		Items.inventory AS inventory
		FROM reservation_detail AS detail,
			Items, Types
   		WHERE detail.rid = ?
			AND Items.iid = detail.item_id
			AND Types.tid = Items.tid
			AND detail.status != 0";
$stmt = $db->prepare($sql);
$stmt->execute(array($resId));
while($row  = $stmt->fetch(PDO::FETCH_ASSOC)) {
	$title = $row['title'];
	$rate  = $row['rate'];
	$inven = $row['inventory'];
	$icost = $rate * $factor ;
	echo "<tr><td>" . $title . "</td><td>" . $inven . "</td><td>$" . $rate . "</td><td>" . 
		$daysrented . "</td><td>$" . number_format(($icost),2) . 
		"</td></tr>";
	$cost+= $icost;
}

$totalcost = number_format($cost,2);
echo "<tr><td><strong>Total cost</strong></td><td></td><td></td><td></td><td>$" . 
		$totalcost . "</td></tr></table>";

echo <<<EOT
<p><strong>I acknowledge that I have received the equipment listed above and have found it to be in good working condition.</strong></p>
<p>Employee Signature (for CTV business only) ____________________________________________<br>
(All other users sign below)</p>
<p>I acknowledge that I am solely responsible for the use of this equipment and I agree to promptly pay 
Community Television of Santa Cruz County (CTV) for the full replacement value or repair of any equipment 
that is damaged, lost, or stolen, while checked out to me. 
I agree to have CTV contact me to make payment arrangements in this event. I understand that all 
equipment is due back in 24 hours, the next business day, or at the end date posted above. 
I also understand that fines are assessed for all equipment returned beyond the time it is due. 
<strong>I also understand that fines will be assessed until missing parts are returned or arrangements 
are made with staff and payment for lost items is received.</strong> 
The fines are billed at the standard daily rental rate until the equipment is completely returned. 
Producers will not be permitted to utilize any further equipment until these fines are paid. 
If equipment is not returned within 24 hours of stated return time, a theft report will be filed with 
the police. I agree to indemnify and hold harmless CTV from any damages or claims resulting from my 
possession, use, or malfunction of the equipment.
</p><p>User Signature ____________________________________________ Current Phone Number ____________</p>
<p>Staff Signature _____________________________________________</p>
<p><strong>If all equipment is returned in working condition, sign below.</strong> 
If equipment is missing, damaged or needs further inspection, fill out Missing/Damaged Equipment Form 
and make item unavailable.</p>
<p>User Signature _________________________________________________________</p>
<p>Staff Signature _______________________________________________________</p>
<p>325 Soquel Ave. Santa Cruz CA 95062 831-425-8848</p>
</body>
</html>
EOT;
?>
