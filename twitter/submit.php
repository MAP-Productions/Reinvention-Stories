

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


if(isset($_POST["status"]) && isset($_POST["act"])){
	$text = $_POST["status"];
	$act = $_POST["act"];

	$cleanText = mysql_real_escape_string($text);




	$query ="INSERT into Answers (act,text) VALUES ('".$act."','".$cleanText."')";

	$result=mysql_query($query);




	echo json_encode( array("act"=>$act, "text"=>$text, "question"=>"where do you go?", "created_at"=>"Oct 1"));

}


?>