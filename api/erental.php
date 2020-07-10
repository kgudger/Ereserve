<?php
require_once 'erlib.php';
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
$db = new DB();

if ( is_array($_REQUEST) && count($_REQUEST) ) {
  $command = $_REQUEST['command'];
  if($command == "get") {
	echo $db->getData();
  }
  else
    echo "command was not recognized";
}
?>

