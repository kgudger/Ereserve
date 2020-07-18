<?php
/*
Plugin Name: EReserve
Plugin URI:  http://www.github.com/kgudger/
Description: Equipment Reservation system
Version:     0.7
Author:      Keith Gudger
Author URI:  http://www.github.com/kgudger
License:     GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

defined( 'ABSPATH' ) or die( 'Ah ah ah, you didn\'t say the magic word' );

function add_my_plugin_stylesheet() {
	wp_register_style('erental', '/wp-content/plugins/Ereserve/css/erental.css');
	wp_enqueue_style('erental');
	wp_register_script('erental_script','/wp-content/plugins/Ereserve/js/erental.js');
	wp_enqueue_script('erental_script');
	wp_register_script('ereserv_script','/wp-content/plugins/Ereserve/js/ereserv.js');
	wp_enqueue_script('ereserv_script');
	wp_register_script('fuzzysort','/wp-content/plugins/Ereserve/js/fuzzysort.js');
	wp_enqueue_script('fuzzysort');
	wp_register_script('erequip','/wp-content/plugins/Ereserve/js/erequip.js');
	wp_enqueue_script('erequip');
}
add_action( 'wp_print_styles', 'add_my_plugin_stylesheet' );

add_shortcode('e_reserve', 'e_reserve_page');
function e_reserve_page($atts=[], $content=null,$tag='') {
/**
 * dbstart.php opens the database and gets the user variables
 */
require_once("dbstart.php");
include_once("includes/erentalpage.php");
include_once("includes/eradminpage.php");
include_once("includes/erequippage.php");
$a = shortcode_atts( array(
	'action' => "",
), $atts );
if ( strtolower($a['action']) == 'admin' ) { // administration page
	$checkArray = array();
/// a new instance of the derived class (from MainPage)
	$eradmin = new eradminpage($db,$sessvar,$checkArray) ;
/// and ... start it up!  
	return $eradmin->main("Equipment Administration", $uid, "", "dfile.php");
} else if ( strtolower($a['action']) == 'thanks' ) { // thank you page
	// get rid of cookies
	setcookie("Reservation", "", time() - 3600);
	$checkArray = array();
/// a new instance of the derived class (from MainPage)
	$erental = new erentalpage($db,$sessvar,$checkArray) ;
/// and ... start it up!  
	return $erental->main("Equipment Rental", $uid, "", "dfile.php");
/**
 * There are 2 choices for redirection dependent on the sessvar
 * above which one gets taken.
 * For this page, altredirect to download. */
} else if ( strtolower($a['action']) == 'equip' ) { // thank you page
	$checkArray = array();
/// a new instance of the derived class (from MainPage)
	$erequip = new erequipPage($db,$sessvar,$checkArray) ;
/// and ... start it up!  
	return $erequip->main("Equipment Administration", $uid, "", "dfile.php");
} else
{
/**
 * The checkArray defines what checkForm does so you don't
 * have to overwrite it in the derived class. */

	$checkArray = array();
/// a new instance of the derived class (from MainPage)
	$erental = new erentalpage($db,$sessvar,$checkArray) ;
/// and ... start it up!  
	return $erental->main("Equipment Rental", $uid, "", "dfile.php");
/**
 * There are 2 choices for redirection dependent on the sessvar
 * above which one gets taken.
 * For this page, altredirect to download. */
}
} // end of function


