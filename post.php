	<?php
		$post_data = file_get_contents("php://input");
		$fields = json_decode($post_data,true);	
		
		$url = '/zeegaapi/items';
		
		//open connection
		$ch = curl_init();
		
		//set the url, number of POST vars, POST data
		curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_POSTFIELDS, http_build_query($fields));
		
		//execute post
		$result = curl_exec($ch);
		echo "yp";
		print_r($result);	
		//close connection
		curl_close($ch);
		
	?>
