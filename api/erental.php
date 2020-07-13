<?php
require_once 'erlib.php';
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
$db = new DB();

if ( is_array($_REQUEST) && count($_REQUEST) ) {
  $command = $_REQUEST['command'];
  if($command == "get") {
	echo $db->getData();
  } else if ($command == "reserve") {
	$data = json_decode(file_get_contents('php://input'), true);
	echo $db->postReserve($data);
  }
  else
    echo "command was not recognized";
}
?>

