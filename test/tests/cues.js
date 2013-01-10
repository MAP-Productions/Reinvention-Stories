(function() {
  // Alias $p.code` to something that sounds more like
  // what it does.
  Popcorn.prototype.register = Popcorn.prototype.code;

  function sources( path, name ) {
    return [ "mp4", "ogv", "webm" ].reduce(function( initial, val ) {
      initial += "<source src='" + path + name + "." + val + "'></source>";
      return initial;
    }, "");
  }

  $(function() {

    var scrollable, $primary, $container, images, videos, dims;

    scrollable = Popcorn( Scrollable("#video").media, {
      frameAnimation: true
    });

    $primary = $(scrollable.media);
    $primary.media = scrollable;
    $container = $primary.parent();

    images = {};
    videos = {};

    dims = {
      width: $container.width(),
      height: $container.height()
    };


    ACT_DATA.forEach(function( act ) {

      var cues = act.data;

      if ( cues.length ) {
        cues.forEach(function( cue, k ) {
          var image, video, side;

          // Register behaviours to execute at
          // the start and end phase of a popcorn
          // track event.
          scrollable.register(
            Abstract.merge({}, cue, {
              end: cue.start + 4,
              onStart: function( track ) {
                images[ track.image ].fadeIn();
              },
              onEnd: function( track ) {
                images[ track.image ].fadeOut();
              }
            })
          );

          // Alternatate which side the image is
          // displayed on.
          side = k % 2 === 0 ? "left" : "right";

          // Generate an element in a jQuery object for the
          // image icon to display
          image = $("<img>").addClass( side + " icons" ).prop({
            src: "/app/img/icons/road/" + cue.image,
            video: cue.video,
            hidden: true
          });

          // Generate an element in a jQuery object for the
          // video that is associated with this image icon
          video = $("<video>").attr( "id", cue.video ).html(
            sources( "/app/media/", cue.video )
          );

          // TODO: Experiment with making the image
          //        dimensions based on the video
          //
          // http://www.duebel.me/web-video-pixel-dimensions/

          $container.append( image );

          // Store references to the newly created image and video
          // jQuert elements in a free-var cache.
          images[ cue.image ] = image;
          videos[ cue.video ] = video;
        });
      }
    });


    $primary.on("click", function() {
      console.log( "video surface clicked" );
      // Remove any residual video elements
      // TODO: Abstract this operation
      $container.find("video:not(#video)").remove();
      $primary.animate({ opacity: 1 }, "fast");
    });

    $("#reinvention-road").on("click", ".icons", function() {
      var video = videos[ $(this).prop("video") ];

      // Stop the primary main video and fade to 50%
      $primary.media.pause();
      $primary.animate({ opacity: 0.5 }, "fast");

      // Remove any residual video elements
      // TODO: Abstract this operation
      $container.find("video:not(#video)").remove();

      // Append the child video element
      $container.append( video );

      // Set the child element's position, relative
      // to the dimensions of the primary video
      video.css({
        top: dims.height / 4 + "px",
        left: dims.width / 4 + "px"
      });

      // Play the newly placed video element
      // (Dereference the jQuery object to use the
      // video element's native play() method)
      video.get(0).play();
    });


    $primary.media.play();

  });
}(this));
