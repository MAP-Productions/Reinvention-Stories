<?php
    header("Access-Control-Allow-Origin: *");
    require_once("twitteroauth/twitteroauth.php");
    require_once("config.php");
     
    /* Create a TwitterOauth object with consumer/user tokens. */
    $connection = new TwitterOAuth( CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET );
    
    $post_data = file_get_contents("php://input");
    $fields = json_decode( $post_data, true ); 


    if( isset( $fields["in_reply_to_status_id"])) {

        $id = $fields["in_reply_to_status_id"];

    } else if( isset( $_GET["in_reply_to_status_id"])) {

        $id = $_GET["in_reply_to_status_id"];

    } else if( isset( $_POST["in_reply_to_status_id"])) {

        $id = $_POST["in_reply_to_status_id"];

    } else{

        $id = 293807845525311488;

    }

    if( isset($fields["status"]) ){

        $status = $fields["status"];

    } else if( isset($_GET["status"]) ){

        $status = $_GET["status"];

    } else if( isset($_POST["status"]) ){

        $status = $_POST["status"];

    }
     else {

        $status = "";

    }

    $response = $connection->post("statuses/update", array("status" => $status, "in_reply_to_status_id" => $id, "truncated" => true ));
    
    echo json_encode( $response );
    
?>
