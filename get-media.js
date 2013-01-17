// TODO:
//
//  This script needs to be migrated to a grunt task
//
//
var fs, colors, optimist, request, URL, mediafiles, exts, path, displays;

fs = require("fs");
colors = require("colors");
argv = require("optimist").argv;
request = require("request");
URL = require("url");
exts = [ "mp4", "webm", "ogv" ];
mediafiles = JSON.parse( fs.readFileSync(".mediafiles") );
displays = {
  updating: "green",
  fetching: "green",
  exists: "grey"
};

PATH = "app/video";
tmpl = "https://dl.dropbox.com/u/3531958/reinvention/%%FILE%%";


function download( url ) {
  var file = URL.parse( url ).pathname.split("/").pop();

  request( url ).pipe(
    fs.createWriteStream( [ PATH, file ].join("/") )
  );


  // stream = fs.createWriteStream( [ PATH, file ].join("/") );
  // curl = spawn( "curl", [ url ] );

  // curl.stdout.on( "data", function( data ) {
  //   stream.write( data );
  //   console.log( "Writing...", data.length, " to ", [ PATH, file ].join("/") );
  // });

  // curl.stdout.on( "end", function( data ) {
  //   stream.end();
  //   console.log( (file + " downloaded to " + PATH).green );
  // });

  // curl.on( "exit", function( code ) {
  //   if ( code !== 0 ) {
  //     console.log( ("Failed: " + code).red );
  //   }
  // });
};


// console.log( mediafiles );


mediafiles.forEach(function( media ) {

  exts.forEach(function( ext ) {
    var file;

    file = [ media, ext ].join(".");
    url = tmpl.replace(/%%FILE%%/, file );

    fs.exists( [ path, file ].join("/") , function( exists ) {
      var isRunnable, status;

      isRunnable = false;
      status = exists ? "EXISTS" : "FETCHING";

      if ( !exists ) {
        isRunnable = true;
      }

      if ( argv.update ) {
        isRunnable = true;
        status = "UPDATING";
      }

      console.log( (status + ": " + file)[ displays[ status.toLowerCase() ] ] );

      if ( isRunnable && !argv.dryrun ) {
        download( url );
      }
    });
  });
});
