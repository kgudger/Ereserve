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
		$output = array(); // output json
		$sql = "SELECT tid,title,description,Types.image AS image,
				rate, Cat.name AS name
				FROM Types, Categories AS Cat
                       		WHERE Types.active = 1
                        	AND Cat.cid = Types.cid
                        	ORDER BY title ASC";
		$result = $this->db->query($sql);
		while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
			$tout   = array(); // array to stuff into json
			$tout[] = mb_convert_encoding($row["title"],"UTF-8");
			$tout[] = strval($row["image"]);
			$tdesc  = mb_convert_encoding($row["description"],"UTF-8");
			$tout[] = strip_tags($tdesc);
			$rate   = strval(number_format($row["rate"], 2));
			$tout[] = strval($rate);
			$tid   = $row["tid"];  // tid for next query.

			$sql = "SELECT COUNT(*) FROM Items
				WHERE tid = $tid
				AND status =0
				AND active = 1";
			$res2 = $this->db->query($sql);
			$row2 = $res2->fetch(PDO::FETCH_ASSOC);
			$avail = $row2["COUNT(*)"];
			$tout[] = strval(number_format(($rate/3*0.7),2)) ;
			$tout[] = strval($avail);
			$tout[] = $row["name"];
			$output[]= ($tout);
		}
		echo json_encode($output);
	}
}
