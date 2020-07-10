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
	wp_register_script('fuzzysort','/wp-content/plugins/Ereserve/js/fuzzysort.js');
	wp_enqueue_script('fuzzysort');
}
add_action( 'wp_print_styles', 'add_my_plugin_stylesheet' );

add_shortcode('e_reserve', 'e_reserve_page');
function e_reserve_page() {
/**
 * dbstart.php opens the database and gets the user variables
 */
require_once("dbstart.php");

include_once("includes/erentalpage.php");

/**
 * The checkArray defines what checkForm does so you don't
 * have to overwrite it in the derived class. */

$checkArray = array();
/// a new instance of the derived class (from MainPage)
$dbsort = new erentalpage($db,$sessvar,$checkArray) ;
/// and ... start it up!  
return $dbsort->main("Equipement Rental", $uid, "", "dfile.php");
/**
 * There are 2 choices for redirection dependent on the sessvar
 * above which one gets taken.
 * For this page, altredirect to download. */
}


