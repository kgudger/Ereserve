<?php
/**
* @file results.php
* Purpose: Satellite API.
*
* @copyright  (c) 2020, Community Television of Santa Cruz County, all rights reserved
* @license    http://opensource.org/licenses/BSD-2-Clause
* @author Keith Gudger
* @version 2.0 07/18/20
*
*/

require_once "../dbstart.php";
require_once "../includes/redirect.php";
  header('Content-type: text/html');
  header('Access-Control-Allow-Origin: *');

//$db = new DB();

if ( is_array($_REQUEST) && count($_REQUEST) ) {
  $command = $_REQUEST['command'];
  if($command == "finishReservation") {
//	$bundle = json_decode(file_get_contents('php://input'), true);
	$bundle = $_REQUEST['bundle'];
  } else {
	$response = array("success" => false,'error'=>'Bad request.\r\n');
	$response = json_encode($response);
	http_response_code(400);
  }
}

$sql = "SELECT status
	FROM reservations
	WHERE id = ?"; // is bundle in reservation table?
$stmt = $db->prepare($sql);
$stmt->execute(array($bundle));
$row = $stmt->fetch(PDO::FETCH_ASSOC);  // gets reservation status
if (empty($row)) { // if not, fail
	$response = array("success" => false,
		'error'=>'Reservation ' . $bundle . ' failed.\r\nWorkstation unit is not available.\r\n');
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
?>

