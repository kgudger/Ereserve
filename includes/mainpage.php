<?php
/**
 * @file mainpage.php
 * MainPage class for handling most page duties.
 *
 * @author Keith Gudger
 * @copyright  (c) 2014, Keith Gudger, all rights reserved
 * @license    http://opensource.org/licenses/BSD-2-Clause
 * @version    Release: 1.0
 * @package    Volunteer Now!
 *
 * @note CIS-165PH  Final Project
 */

include_once "redirect.php";
include_once "formlib.php";
//include_once "util.php";

/**
 * Parent class used for all form pages.
 *
 * Implements main and checkForm
 * provides template for processData and showContent
 */
class MainPage {
    /*--- private variables ---*/
    protected $formL;	//!< form from library formlib
	protected $sessnp; 	//!<sets as non-profit or individual?
	protected $db;		//!< PDO data base object
	protected $checkArray; //!<check array for checkForm.

    /**
     * Constructor.
     *
     * @param $db is the PDO database object
	 * @param $seesnp is yes = non-profit, no = individual account
	 * @param @checkArray tells checkForm what and how to check form
     */
    function __construct($db = "", $sessnp="no", $checkArray="") {
		$this->db = $db ;
		$this->sessnp = $sessnp;
    	$this->formL = new FormLib("error") ;
		$this->checkArray = $checkArray;
    }

    /**
     * Handles the processing of the whole page.
     *
     * @param $title is the title of the page.
     * @param $normRedirect is the usual redirect.
     * @param $altRedirect is the alternate redirect.
     */
	function main($title = "", &$uid, $normRedirect = "",
					$altRedirect = "") {
	
		if (isset($_POST["Submit"])) {
    	    $this->checkForm();
    	    if (!($this->formL->iserror())) { // data is OK
				$this->processData($uid);
    		    if (!($this->formL->iserror())) { // data is OK
					if ( ($this->sessnp) == "yes" ) { // for non-profit
			            if (!empty($altRedirect)) 
							redirect($altRedirect);
					} else {						// for individual
			            if (!empty($normRedirect)) 
				            redirect($normRedirect);
					}
				}
			}
		}
    	include "header.php";	// same header for every page
    	return $this->showContent($title, $uid);
    	include "footer.php";  // same footer for every page
	}

    /**
     * Form Checking using checkArray.
     *
     */
	function checkForm() {
		if (!empty($this->checkArray)) {
			foreach ($this->checkArray as $checkval) {
				$this->formL->$checkval[0](
								$checkval[1],$checkval[2]);
			}
		}
	}

    /**
     * Processes the db requests (if necessary, overwritten).
     *
	 * @param $uid passed by reference for database
     */
	function processData(&$uid) {
	}

    /**
     * displays the actual page (always overwritten).
     *
	 * @param $title is page title.
	 * @param $uid passed by reference for database
     */
	function showContent($title, &$uid) {
	}
}
?>
