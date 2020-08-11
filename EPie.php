<?php
/*
Description: Equipment Reservation system
Version:     0.7
Author:      Keith Gudger
Author URI:  http://www.github.com/kgudger
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

/**
 * dbstart.php opens the database and gets the user variables
 */
require_once("dbstart.php");
include_once("includes/pie.php");

$checkArray = array();
$eradmin = new erPiePage($db,$sessvar,$checkArray) ;
$eradmin->main("Equipment Pie Chart", $uid,"");

?>
