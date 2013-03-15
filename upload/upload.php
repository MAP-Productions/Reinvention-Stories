<?php 
error_reporting(0);

$message="";
$filename="";


 define ("MAX_SIZE","5000");

 function getExtension($str) {
         $i = strrpos($str,".");
         if (!$i) { return ""; }
         $l = strlen($str) - $i;
         $ext = substr($str,$i+1,$l);
         return $ext;
 }

 $errors=0;
  
 if($_SERVER["REQUEST_METHOD"] == "POST")
 {
    $image =$_FILES["file"]["name"];
    $uploadedfile = $_FILES['file']['tmp_name'];
     
 
    if ($image) 
    {
    
        $filename = stripslashes($_FILES['file']['name']);
    
        $extension = getExtension($filename);
        $extension = strtolower($extension);
        
        
        if (($extension != "jpg") && ($extension != "jpeg") && ($extension != "png") && ($extension != "gif")) {
        
            $message = "Unknown image extension.";
            $errors = 1;
        }
        else
        {

          $size=filesize($_FILES['file']['tmp_name']);


          if ($size > MAX_SIZE*1024)
          {
              $message = "File is too large.";
            $errors = 1;
          }


          if($extension=="jpg" || $extension=="jpeg" )
          {
            $uploadedfile = $_FILES["file"]["tmp_name"];
            $src = imagecreatefromjpeg($uploadedfile);

          }
          else if($extension == "png") {
            $uploadedfile = $_FILES["file"]["tmp_name"];
            $src = imagecreatefrompng($uploadedfile);

          } else {
            $src = imagecreatefromgif($uploadedfile);
          }

          list($width,$height)=getimagesize($uploadedfile);


          $newwidth=1024;
          $newheight=($height/$width)*$newwidth;
          $tmp=imagecreatetruecolor($newwidth,$newheight);

          imagecopyresampled($tmp,$src,0,0,0,0,$newwidth,$newheight,$width,$height);

          $filePrefix = md5( uniqid( rand(), true ));

          $filename = "images/". $filePrefix . "." . $extension;

          imagejpeg($tmp,$filename,100);



          imagedestroy($src);
          imagedestroy($tmp);

      }}

}

//If no errors registred, print the success message
 if(isset($_POST['Submit']) && !$errors) 
 {
    $message = 'Image Uploaded Successfully';
   
 }

// Uncomment these lines and remove html below to with independent script 

// header('Content-type: application/json');
echo json_encode(array( "url" => "http://" . $_SERVER["SERVER_NAME"] . "/upload/" . $filename, "error" => $error, "message" =>$message  ));

 
?>