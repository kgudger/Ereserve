<?php
/**
* @file results.php
* Purpose: Satellite API.
*
* @copyright  (c) 2016, Community Television of Santa Cruz County, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @author Keith Gudger
* @version 1.0 08/18/16
*
*/

require_once "/var/www/html/satellite/wp-content/plugins/Ereserve/dbstart.php";
  header('Content-type: text/html');
  header('Access-Control-Allow-Origin: *');

//echo $_SERVER['REQUEST_URI'];

$url_elements = explode('/', $_SERVER['REQUEST_URI']);

$request = $url_elements[1] ;
$bundle  = explode(".",$url_elements[2]);
$bundle  = $bundle[0];
$file = './urir.txt';
file_put_contents($file, $_SERVER['REQUEST_URI'] . "\n" . $bundle);

$sql = "SELECT status
	FROM reservations
	WHERE id = ?"; // is bundle in reservation table?
$stmt = $db->prepare($sql);
$stmt->execute(array($bundle));
$row = $stmt->fetch(PDO::FETCH_ASSOC);  // gets reservation status
if ( $request != "reservation-results" ) {
	$response = array("success" => false,'error'=>'Bad request.\r\n');
	$response = json_encode($response);
	http_response_code(400);
} else if (empty($row)) { 
	$response = array("success" => false,
		'error'=>'Reservation failed.\r\nWorkstation unit is not available.\r\n');
	$response = json_encode($response);
	http_response_code(400);
} else   {
	try {
		$sql = "UPDATE reservations
			SET status = 2
        		WHERE id = ?";
		$stmt = $db->prepare($sql);
		$stmt->execute(array($bundle));

		$sql = "SELECT item_id 
				FROM reservation_detail
				WHERE rid = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute(array($bundle)); // reads from reservation detail
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$item_id = $row['item_id'];
			$sql = "UPDATE Items
				SET status = 2
				WHERE iid = $item_id";
			$res = $db->prepare($sql);
			$res->execute(array()); // updates item
		}
		$sql = "UPDATE reservation_detail
				SET status = 2
				WHERE rid = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute(array($bundle)); // updates reservation detail status
		
		$send_data = array("success" => true, // your bundle ID
			"error" => "");
	} catch(PDOException $e) {
	        $send_data = array("success" => false,'error'=>$e);
	}

	$response = json_encode($send_data);
}
echo $response;
$file = './response.txt';
file_put_contents($file, print_r($url_elements));
file_put_contents($file, $response);
?>
