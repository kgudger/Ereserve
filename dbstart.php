<?php
/**
* @file dbstart.php
* Purpose: Connect to the database for each form page.
*
* @author Keith Gudger
* @version 1.1 05/11/14
*
* @note CIS-165PH  Final Project
*/
//ob_start();
require_once("dbconvars.php");
include_once("includes/util.php");

/// Open the connection
try {
	$db = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpwd);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
	echo "Unable to connect: " . $e->getMessage() ."<p>";
	die();
}

//if (!session_id()) session_start();
$sessvar = (empty($_SESSION['np']))   ? "" : $_SESSION['np'];
$user    = (empty($_SESSION['user'])) ? "" : $_SESSION['user'];

?>
