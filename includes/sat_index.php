<?php
/**
* @file sat_index.php
* Purpose: Resolve satellite_ids
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
require_once("../satvars.php");
require_once("../includes/redirect.php");

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
<div>
<h1>CTV / Satellite Cross Check</h1>
<table class='blueTable'>
<tr><th>Satellite ID</th><th>Satellite Title</th><th>CTV Inventory #</th></tr>
EOT;

$id_array = array();	// store satellite data here.
$sql = "SELECT inventory, satellite_id FROM `Items`";
$stmt = $db->query($sql);
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
	$id_array[$row['satellite_id']] = $row['inventory'];
}
//print_r($id_array);
$ch = satellite_startApi($uname,$pword);
if ( is_array($ch) ) { // there was an error
	echo "There was an error: " . $ch;
} else {
	$err = satellite_callApi($ch,'/centers/1/reservation-units', 'GET', '');
	$ndata = json_decode($err['data'],true);
//	print_r($ndata);

    foreach ( $ndata as $sat_data ) {
		if (1 /* !array_key_exists(intval($sat_data['id']),
				$id_array) /*&&
				$sat_data['whoCannotReserve']['nonMember']!='1'*/) {
			$out1 .= '<tr><td>' . $sat_data['id'] . '</td>' 
					.'<td>' . $sat_data['name'] . '</td>' ;
			if ( !array_key_exists(intval($sat_data['id']), $id_array ) ) {
				$out1 .= '<td></td>';
			} else {
				$out1 .= '<td>' . $id_array[intval($sat_data['id'])] . '</td>' ;
			}
			$out1 .= '</tr>' ;
        }
    }
    echo $out1 ;
}
echo "</table>";

echo <<<EOT
</div>
</body>
</html>
EOT;

/**
 * Establishes a connection to the Satellite API for stored user
 * @param $login - user name
 * @param $password - user password
 * @return $ch - array with curl parameters
 */
function satellite_startApi($login,$password) {
	global $apiUrl, $uname, $pword; 
	$fapiUrl = $apiUrl . '/api/v1';
	$login = $uname;
	$password = $pword;

	$out1 = shell_exec("curl -c /var/www/html/VolCreds/cookie.txt -d 'login=$login&password=$password' $fapiUrl");
	if (($json_data = json_decode($out1,true)) && ($json_data["success"])) {
        	return true;
	}
	else return false;
}

/**
 * calls Satellite APIs (after session established in $ch)
 * @param $ch - curl session
 * @param $url - relative API path, e.g. '/products'
 * @param $method - method name: 'GET', 'POST', 'PUT', 'DELETE'
 * @param $data - string data to submit in POST/PUT requests
 * @return array - array with keys: 'err', 'errmsg', 'data'
 */

function satellite_callApi($ch, $url, $method, $data) {
        // Send target query
	global $apiUrl, $uname, $pword; 
	$fapiUrl = $apiUrl . '/api/v1/centers/1/reservation-units';
//        return array('err' => $err, 'errmsg' => $errmsg, 'data' => $content);
	$out2 = shell_exec("curl -b /var/www/html/VolCreds/cookie.txt -G $fapiUrl");
	if (json_decode($out2,true)) {
		$err = "";
		$errmsg = "";
	}
	else {
		$err = "true";
		$errmsg = "Failed to download data";
	}
	return array('err' => $err, 'errmsg' => $errmsg, 'data' => $out2);
}


?>
