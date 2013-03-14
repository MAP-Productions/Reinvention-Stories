<?php
    header("Access-Control-Allow-Origin: *");
    require_once("twitteroauth/twitteroauth.php");
    require_once("config.php");
     

    
    $post_data = file_get_contents("php://input");
    $fields = json_decode( $post_data, true ); 


    
    if( isset( $fields["act"])) {

        $act = $fields["act"];

    } else if( isset( $_GET["act"])) {

        $act = $_GET["act"];

    } else if( isset( $_POST["act"])) {

        $act = $_POST["act"];

    } else{

        $act = 1;

    }

    /* Create a TwitterOauth object with consumer/user tokens. */

    if( $act == 1 ){
        $connection = new TwitterOAuth( CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET );
    } else if ( $act == 2 ){
        $connection = new TwitterOAuth( CONSUMER_KEY_2, CONSUMER_SECRET_2, ACCESS_TOKEN_2, ACCESS_TOKEN_SECRET_2 );
    } else {
        $connection = new TwitterOAuth( CONSUMER_KEY_3, CONSUMER_SECRET_3, ACCESS_TOKEN_3, ACCESS_TOKEN_SECRET_3 );
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

    $response = $connection->post("statuses/update", array("status" => $status, "truncated" => true ));
    
    echo json_encode( $response );
    
?>
