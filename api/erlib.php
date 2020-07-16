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
				rate, Cat.name AS name
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
			$rate   = strval(number_format($row["rate"], 2));
			$tout['rate'] = strval($rate);
			$tid   = $row["tid"];  // tid for next query.

			$sql = "SELECT COUNT(*) FROM Items
				WHERE tid = $tid
				AND status =0
				AND active = 1";
			$res2 = $this->db->query($sql);
			$row2 = $res2->fetch(PDO::FETCH_ASSOC);
			$avail = $row2["COUNT(*)"];
			$tout['day_rate'] = strval(number_format(($rate/3*0.7),2)) ;
			$tout['availability'] = strval($avail);
			$tout['category'] = $row["name"];
			$tout['type_id'] = $tid;
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
		echo json_encode($output2);
	}
	
	function postReserve($json) {
		$result = array(); // result of operation
		$itema  = array(); // array of items of type 'ritems'
		
		$ritems = $json['ritems']; // array of types to reserve
		foreach( $ritems as $type ) {
			$sql = "SELECT `iid` FROM `Items` 
					WHERE `tid` = ? AND `active`=1 AND `status` = 0 
					LIMIT 1";
			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($type));
			$row  = $stmt->fetch(PDO::FETCH_ASSOC);
			if (empty($row)) { // no item available! Stop!
				$result['status'] = "Error";
				$reserror = array("Not Available" => $type);
				$result['error'] = $reserror; // put array into result
				echo json_encode($result);
				return;
			}
			$itema[$type] = $row['iid']; // array linking type to item to reserve
		} // if we're still going, found all items
		$wname  = $json['wname']; // whole name
		$phone  = $json['phone'];
		$email  = $json['email'];
		$startdate = $json['startdate'];
		$enddate   = $json['enddate'];
		$starttime = $json['starttime'];
		$endtime   = $json['endtime'];
		$sql = "INSERT INTO `reservations` 
			(`name`, `phone`, `email`, `date1`, `date2`, `time1`, `time2`, `status`)
			VALUES(?, ?, ?, ?, ?, ?, ?, '1') "; // status 1 is in process
		$stmt = $this->db->prepare($sql);
		$stmt->execute(array($wname,$phone,$email,$startdate,$enddate,
							 $starttime,$endtime));
		$lastId = $this->db->lastInsertId();

		foreach ( $ritems as $value ) { // put reserved items into detail table
			$sql = "INSERT INTO `reservation_detail`
						(`rid`, `item_id`, `status`)
						VALUES($lastId, ? , 1)"; // status 1 is in process
			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($itema[$value]));
		}
		// now update each item to the "In Process" status
		foreach ($itema as $key => $value) {
			$sql = "UPDATE `Items` 
					SET `status` = 1
					WHERE `iid` = ?";
			$stmt = $this->db->prepare($sql);
			$stmt->execute(array($value));
		}
		// return OK status now
		$result['status'] = "OK";
		$result['reservation'] = $lastId;
		echo json_encode($result);
	}

}
