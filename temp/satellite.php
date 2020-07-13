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

echo <<<EOT
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
	</head>
	<body>
EOT;

echo <<<EOT
<h1>CTV Reservation Validation Page</h1>
EOT;

echo <<<EOT
	</body>
</html>
EOT;
?>
