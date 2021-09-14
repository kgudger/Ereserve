<?php

class DB
{
    private $db;
	function __construct()
	{
    		$db = $this->connect();
    		$debug = true;
	}

	function connect()
	{
	    if ($this->db == 0)
	    {
	        require_once("/var/www/html/satellite/wp-content/plugins/Ereserve/dbconvars.php");
		try {
	        /* Establish database connection */
	        	$this->db = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpwd);
			$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$this->db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES'utf8'");
		} catch (Exception $e) {
			echo "Unable to connect: " . $e->getMessage() ."<p>";
			die();
		}
	    }
	    return $this->db ;
	}

	function getData()
	{
		$output = array(); // item output
		$output2 = array(); // output json
		$sql = "SELECT tid,title,description,Types.image AS image,
				rate, Cat.name AS name, Types.active AS active,
				contents
				FROM Types, Categories AS Cat
                       		WHERE Types.active = 1
                        	AND Cat.cid = Types.cid
                        	ORDER BY title ASC";
		$result = $this->db->query($sql);
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			$tout   = array(); // array to stuff into json
			$tout['title'] = mb_convert_encoding($row["title"],"UTF-8");
			$tout['image'] = strval($row["image"]);
			$tdesc  = mb_convert_encoding($row["description"],"UTF-8");
			$tout['description'] = strip_tags($tdesc);
			$tcont  = mb_convert_encoding($row["contents"],"UTF-8");
			$tout['contents'] = strip_tags($tcont);
			$rate   = strval(number_format($row["rate"], 2));
			$tout['rate'] = strval($rate);
			$tid   = $row["tid"];  // tid for next query.

			$sql = "SELECT COUNT(*) FROM Items
				WHERE tid = $tid
				AND status <3
				AND active = 1"; // changed to <3, maybe a problem?
			$res2 = $this->db->query($sql);
			$row2 = $res2->fetch(PDO::FETCH_ASSOC);
			$avail = $row2["COUNT(*)"];
			$tout['day_rate'] = strval(number_format(($rate/3*0.7),2)) ;
			$tout['availability'] = strval($avail);
			$tout['category'] = $row["name"];
			$tout['type_id'] = $tid;
			$tout['active']  = strval($row['active']);
			$sql = "SELECT fr_tid 
						FROM `frequently_rented_with` 
						WHERE tid = $tid";
			$res3 = $this->db->query($sql);
			$fr_out = array();
			while ($row3 = $res3->fetch(PDO::FETCH_ASSOC)) {
				$fr_out[] = $row3['fr_tid'];
			}
			$tout['reserve_with_array'] = $fr_out;
			$output[]= ($tout);
		}
		$output2['types'] = $output;
		
		$output3 = array();
		$sql = "SELECT * FROM Categories";
		$result = $this->db->query($sql);
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			$tout   = array(); // array to stuff into json
			$tout['cid'] =    $row["cid"];
			$tout['name'] =   $row["name"];
			$tout['active'] = $row["active"];
			$tout['image'] =  $row["image"];
			$output3[] = $tout;
		}
		$output2['cats'] = $output3;

		$output4 = array();
		$sql = "SELECT * FROM Status";
		$result = $this->db->query($sql);
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			$tout   = array(); // array to stuff into json
			$tout['sid'] =    $row["sid"];
			$tout['status'] = $row["status"];
			$output4[] = $tout;
		}
		$output2['status'] = $output4;

		$output5 = array();
		$sql = "SELECT * FROM Items";
		$result = $this->db->query($sql);
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			$tout   = array(); // array to stuff into json
			$tout['iid'] =    $row["iid"];
			$tout['tid'] =    $row["tid"];
			$tout['inventory'] =    $row["inventory"];
			$tout['satellite_id'] =    $row["satellite_id"];
			$tout['status'] = $row["status"];
			$tout['active'] = $row["active"];
			$output5[] = $tout;
		}
		$output2['items'] = $output5;

		echo json_encode($output2);
	}
	
	function postReserve($json) {
		$result = array(); // result of operation
		$itema  = array(); // array of items of type 'ritems'
		
		$ritems = $json['ritems']; // array of types to reserve
		$aitems = array_count_values($ritems); // item => count of item
		$startdate = $json['startdate'];
		$enddate   = $json['enddate'];

		foreach( $aitems as $type => $icount ) {
			$sql = "SELECT `iid` FROM `Items` 
					WHERE `tid` = ? AND `active`=1 AND `status` = 0
					AND iid NOT IN
						(SELECT item_id FROM `reservation_detail`, `reservations`, `Items`
      							WHERE Items.tid = ?
							AND Items.iid = reservation_detail.item_id
							AND reservation_detail.status > 0
							AND (date1 <= ? AND date2 >= ?)
							AND reservation_detail.rid = reservations.id)";

			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($type,$type,$enddate,$startdate));
			$row  = $stmt->fetch(PDO::FETCH_ASSOC);
			if (empty($row)) { // no item available! Stop!
				$result['status'] = "Error";
				$reserror = "Not Available: " . $type;
				$result['error'] = $reserror; // put array into result
				echo json_encode($result);
				return;
			}
			$rcount = 1 ; // already fetched 1, now count the rest
			while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
				$rcount++ ;
			}
			if ($rcount < $icount) { // there are less available than requested
				$result['status'] = "Error";
				$reserror = "Not Available: " . "Only $rcount of total $icount";
				$result['error'] = $reserror; // put array into result
				echo json_encode($result);
				return;
			}
		} // if we're still going, found all items
		$wname  = $json['wname']; // whole name
		$phone  = $json['phone'];
		$email  = $json['email'];
		$starttime = $json['starttime'];
		$endtime   = $json['endtime'];
		$sql = "INSERT INTO `reservations` 
			(`name`, `phone`, `email`, `date1`, `date2`, `time1`, `time2`, `status`)
			VALUES(?, ?, ?, ?, ?, ?, ?, '1') "; // status 1 is in process
		$stmt = $this->db->prepare($sql);
		$stmt->execute(array($wname,$phone,$email,$startdate,$enddate,
							 $starttime,$endtime));
		$lastId = $this->db->lastInsertId();

		foreach ( $ritems as $type ) { // put reserved items into detail table
			$sql = "SELECT `iid` FROM `Items` 
					WHERE `tid` = ? AND `active`= 1 AND `status` = 0
					AND iid NOT IN
						(SELECT item_id FROM `reservation_detail`, `reservations`, `Items`
      							WHERE Items.tid = ?
							AND Items.iid = reservation_detail.item_id
							AND reservation_detail.status > 0
							AND (date1 <= ? AND date2 >= ?)
							AND reservation_detail.rid = reservations.id)
					LIMIT 1";
			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($type,$type,$enddate,$startdate)); // found item to reserve
			$row  = $stmt->fetch(PDO::FETCH_ASSOC);
			$value = $row['iid'];
			
			$sql = "INSERT INTO `reservation_detail`
						(`rid`, `item_id`, `status`)
						VALUES($lastId, ? , 1)"; // status 1 is in process
			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($value));
			
		// now update each item to the "In Process" status
/*			$sql = "UPDATE `Items` 
					SET `status` = 1
					WHERE `iid` = ?";
			$stmta = $this->db->prepare($sql);
			$stmta->execute(array($value)); */ // removed for now
		}
		// return OK status now
		$result['status'] = "OK";
		$result['reservation'] = $lastId;
		echo json_encode($result);
	}
// postType
	function postType($json) {
		$result = array(); // result of operation
		$frw    = array(); // array of items of type 'ritems'
		
		$typeid  = $json['id']; // tid
		$cid     = $json['cat']; // category #
		$title   = $json['title']; // title
		$descrip = $json['desc']; // description
		$image   = $json['image']; // image url
		$rate    = $json['rate']; // rate
		$cont    = $json['cont']; // contents
		$frw     = explode("," , $json['frw']); // frequently rented with string -> array

		if ( empty($typeid) ) { // get last tid, increment
			$sql = "SELECT MAX(tid) AS max FROM Types";
			$stmt = $this->db->query($sql);
			$tid  = $stmt->fetch();
			$typeid = $tid['max'] + 1 ; // increment
		}
		$sql = "INSERT INTO `Types` 
				VALUES(  ? , ? , ? , ? , ? , 1, ? , ?)
				ON DUPLICATE KEY UPDATE
				`cid` = ? , `title` = ?, `description` = ?,
				`image` = ? , `rate` = ? , `contents` = ?";

		$stmt = $this->db->prepare($sql);
		$stmt->execute(array($typeid,$cid,$title,$descrip,$image,$rate,$cont,
							  $cid,$title,$descrip,$image,$rate,$cont));		
		if ( !(empty($frw)) ) { // first delete all old ones
			$sql = "DELETE FROM `frequently_rented_with` WHERE `tid` = ?" ;
			$stmt = $this->db->prepare($sql);
			$resp = $stmt->execute(array($typeid)); // delete all
			foreach ($frw as $value) {
				if ( !empty($value) ) {
					$sql = "INSERT INTO `frequently_rented_with`
							(`tid`, `fr_tid`)
							VALUES ( ? , ? )" ;
					$stmt = $this->db->prepare($sql);
					$resp = $stmt->execute(array($typeid,$value)); // add 1 at a time
				}
			}	
		}
		
		$result['status'] = "OK";
		echo json_encode($result);
	}
// postItem
	function postItem($json) {
		$result = array(); // result of operation
		
		$itemid = $json['id']; // iid
		$tid    = $json['tid']; // type_id
		$invent = $json['inventory']; // inventory #
		$sateid = $json['satellite_id']; // description
		$status = $json['status']; // status
		$active = $json['active']; // active
		
		if ( empty($itemid) ) { // get last iid, increment
			$sql = "SELECT MAX(iid) AS max FROM Items";
			$stmt = $this->db->query($sql);
			$iid  = $stmt->fetch();
			$itemid = $iid['max'] + 1 ; // increment
		}
		$sql = "INSERT INTO `Items` 
				VALUES(  ? , ? , ? , ? , ? , ? )
				ON DUPLICATE KEY UPDATE
				`tid` = ? , `inventory` = ?, `satellite_id` = ?,
				`status` = ? , `active` = ?";

		$stmt = $this->db->prepare($sql);
		$stmt->execute(array($itemid,$tid,$invent,$sateid,$status,$active,
							  $tid,$invent,$sateid,$status,$active));
		
		$result['status'] = "OK";
		echo json_encode($result);
	}
}
