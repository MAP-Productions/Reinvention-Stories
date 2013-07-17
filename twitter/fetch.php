

<?php

	require("phpsqlajax_dbinfo.php");
	$connection=mysql_connect (DB_HOST, DB_USER, DB_PASSWORD);
	if (!$connection) {
	  die('Not connected : ' . mysql_error());
	}

	// Set the active MySQL database
	$db_selected = mysql_select_db(DB_NAME, $connection);
	if (!$db_selected) {
	  die ('Can\'t use db : ' . mysql_error());
	}



	$act = $_GET["act"];

	$sth = mysql_query("SELECT * FROM Answers where act = $act");
	$rows = array();
	while($r = mysql_fetch_assoc($sth)) {
	    $rows[] = $r;
	}
	print json_encode($rows);

?>