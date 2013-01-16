// TODO:
//
//  This script needs to be migrated to a grunt task
//
//
var fs, colors, optimist, exec, exts;

fs = require("fs");
colors = require("colors");
argv = require("optimist").argv;
exec = require("child_process").exec;
exts = [ "mp4", "webm", "ogv" ];
path = "app/video";
tmpl = [
  "cd %%PATH%%",
  "wget https://dl.dropbox.com/u/3531958/reinvention/%%FILE%%"
].join(" && ").replace(/%%PATH%%/, path );


function runcmd( cmd ) {

  argv.v && console.log( "Running: ", cmd );

  exec( cmd, function( error, stdout, stderr ) {
    console.log( ("stdout: " + stdout).green );
    console.log( ("stderr: " + stderr).yellow );

    if ( error !== null ) {
      console.log( ("exec error: " + error).red );
    }
  });
}


[
  "Intro", "RestStop1", "RoadMovie_Act1", "Road_Act1",
  "SV_A1_BlessingoftheBikes2", "SV_A1_FestivalMontage", "SV_A1_GayMensChorus",
  "SV_A1_MuralProject", "SV_A1_WordlCup"

].forEach(function( media ) {

  exts.forEach(function( ext ) {
    var file, cmd;

    file = [ media, ext ].join(".");
    cmd = tmpl.replace(/%%FILE%%/, file );

    fs.exists( [ path, file ].join("/") , function( exists ) {
      var status = exists ? "EXISTS" : "FETCHING";

      if ( !exists || argv.update ) {
        // console.log( "Running: ", cmd );
        runcmd( cmd );
      }

      console.log( status, file );
    });
  });
});
