<?php
/**
* @file pie.php
* Purpose: Pie charts of reserved equipment.
* @author Keith Gudger
* @copyright  (c) 2020, Community Television of Santa Cruz County, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @version    Release: 1.0
* @package    Equipment Reservation
* @author	Keith Gudger
*
*/

require_once("mainpage.php");
/**
 * Child class of MainPage used for user preferrences page.
 *
 * Implements processData and showContent
 */

class erPiePage extends MainPage {

/**
 * Process the data and insert / modify database.
 *
 * @param $uid is user id passed by reference.
 */
   
function processData(&$uid) {

	$sdate = $this->formL->getValue("sDate");
}

/**
 * Display the content of the page.
 *
 * @param $title is page title.
 * @param $uid is user id passed by reference.
 */
function showContent($title, &$uid) {

echo <<<EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
<title>Pie Chart for Equipment Reservations</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
	</head>
	<body>
EOT;
echo $this->formL->start('POST', "/wp-content/plugins/Ereserve/EPie.php", 'name="E Pie"');
echo "<p>Show Reservations Between These 2 Dates.</p>";
$date = date("Y-m-d");
$sDate = $this->formL->getValue("sDate") ;
if ($sDate == "")  $sDate = $date ; // first time form is blank?
echo $this->formL->makeDateInput("sDate",$sDate);

$fdate = date("Y-m-d", strtotime($sDate . " + 2 weeks"));
$sDate2 = $this->formL->getValue("sDate2") ;
if ($sDate2 == "")  $sDate2 = $fdate ; // first time form is blank?
echo $this->formL->makeDateInput("sDate2",$sDate2);

// get rental information from database
$sql = "SELECT Types.title AS name,
			COUNT(*) AS count,
			Types.tid as tid
		FROM reservation_detail AS RD,
			Types, Items, reservations AS Rs
		WHERE Types.tid = Items.tid
			AND RD.item_id = Items.iid
			AND Rs.id = RD.rid
            AND Rs.date2 >= '" . $sDate . "' 
            AND Rs.date2 <= '" . $sDate2 . "' 
		GROUP BY Types.tid";
$stmt = $this->db->query($sql);
$pi_data  = array();
$pi_label = array();
while ($row = $stmt->fetch(PDO::FETCH_ASSOC) ) {
	$pi_data[]  = $row['count'];
	$pi_label[] = $row['name'];
}
echo $this->formL->makeButton($value = "Submit", $name= "Submit");
echo $this->formL->finish();

echo <<<EOT
<div class='er_con_a'>
<h1>CTV Equipment Rental Usage</h1>
<canvas id="pieChart" width="75%"></canvas>
EOT;

echo <<<EOT
<script>
function pi_chart() {
	var ctx = document.getElementById('pieChart');
	var myChart = new Chart(ctx, {
		type: 'pie',
		data: {
			datasets: [{
				data: [
EOT;
foreach ($pi_data as $d) {
	echo $d . "," ;
}
echo <<<EOT
				],
				label: "Equipment Rented",
				backgroundColor: [
EOT;
//"#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
function random_color_part() {
    return str_pad( dechex( mt_rand( 0, 255 ) ), 2, '0', STR_PAD_LEFT);
}

for ($i = 0 ; $i < count($pi_data); $i++) {
//	$val = dechex(($i / count($pi_data)) * 255) ;
	echo '"#' . random_color_part() . random_color_part() . random_color_part() . '",' ;
}

echo <<<EOT
				],
			}],
			labels: [ 
EOT;
foreach ($pi_label as $l) {
	$l = str_replace('"','\"',$l);
	echo '"' . $l . '",' ;
}
echo <<<EOT
			]
		},
	});
}
pi_chart();
</script>
<table><tr><th>Title</th><th>Count</th></tr>
EOT;
for ($i = 0 ; $i < count($pi_data); $i++) {
	echo "<tr>";
	echo "<td>" . $pi_label[$i] . "</td>";
	echo "<td>" . $pi_data[$i]  . "</td>";
	echo "</tr>";
}

echo <<<EOT
</table>
</body>
</html>
EOT;
} // end of showContent
} // end of class
?>
