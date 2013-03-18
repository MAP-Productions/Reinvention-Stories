(function( exports ) {
  var IMAGE_PATH = "/app/img/",
      VIDEO_PATH = "/app/video/",
      JST = exports.JST || {};

  // TODO: This should be moved to a file and dynamically preloaded
  JST.close = "<a id='close' class='close-modal'>close</a>";

  JST.caption = "<div id='caption'><div class='progress-outer'><div class='progress-inner'></div></div><div class='text'></div><div class='time'></div></div>";

  function pad( value, width, padding ) {
    var str, len, diff;
    str = value + "";
    len = str.length;
    diff = width - len;

    if ( diff === 0 ) {
      return "";
    }

    return Array.apply(null, new Array(diff)).map(function() {
      return padding;
    }).join("");
  }

  function lpad( value, width, padding ) {
      //console.log(value);
    return pad( value, width, padding ) + (value + "");
  }
  function smpte( value ) {
    return [
      lpad( Math.floor( value / 60 ), 2, 0 ),
      lpad( Math.floor( value ) % 60, 2, 0 )
    ].join(":");
  }

  function sources( path, name ) {
    return [ "mp4", "ogv", "webm" ].reduce(function( initial, val ) {
      initial += "<source src='" + path + name + "." + val + "'></source>";
      return initial;
    }, "");
  }

  function scale( x, fromLow, fromHigh, toLow, toHigh ) {
    return ( x - fromLow ) * ( toHigh - toLow ) /
            ( fromHigh - fromLow ) + toLow;
  }


  function ScrollableCueset( options ) {
    var images, childVideosInfo, captions, current, previous, dims, $container, playChild, closeChild;

    Abstract.put.call( this, options );

    this.isOpen = false;
    this.pop = {};

    this.$container = $container =  $("#reinvention-road[data-view='" + options.id + "']");

    // Use the provided selector to find
    // the given video element that will serve
    // as the primary for this ScrollableCueset
    this.video = Popcorn(
      Scrollable( this.$container[0], this.video ).media, {
      frameAnimation: true
    });

    if ( this.audio ) {
      this.audio = Popcorn( document.getElementById(this.audio) );

      // Silence the primary video, since there an explicit audio track
      // has been provided.
      this.video.muted(true);
      this.video.volume(0);
    }

    this.$primary = $(this.video.media);

    images = {};
    childVideosInfo = {};
    captions = {};

    dims = {
      width: this.$container.width(),
      height: this.$container.height()
    };

    dims.center = {
      x: dims.width / 2,
      y: dims.height / 2
    };

    if ( this.cues.length ) {

      this.cues.forEach(function( cue, k ) {
        var image, video, side, last, fade, width, position;

        // isLocked

        // Register behaviours to execute at
        // the start and end phase of a popcorn
        // track event.
        //
        //
        last = 0;
        isFwd = true;

        cue.end = cue.start + 7;
        cue.prompt = cue.end - 4;

        fade = {
          up: {
            start: cue.start,
            end: cue.start + 2
          },
          down: {
            start: cue.end - 2,
            end: cue.end
          }
        };

        // isLocked = false;

        this.video.register(
          Abstract.merge({}, cue, {

            onStart: function( track ) {
              $container.append(
                images[ track.clip ]
              );

              // console.log( "start", track );

              // Smooth out the playbackRate
              this.playbackRate(1);
            },

            onFrame: function( track ) {
              var current, image, opacity;

              current = +this.currentTime().toFixed(2);
              image = images[ track.clip ];

              if ( current === last ) {
                return;
              }

              opacity = scale( current, fade.up.start, fade.up.end, 0, 1 );

              if ( current >= fade.down.start ) {
                opacity = scale( current, fade.down.start, fade.down.end, 1, 0 );
              }

              if ( opacity >= 1 ) {
                opacity = 1;
              }

              image.css({
                opacity: opacity
              });

              // WARNING:
              //
              // This is a bad user experience.
              // if ( Math.round(current) === cue.start + 3 && !this.paused() &&
              //     !this.isOpen && !isLocked ) {
              //   isLocked = true;
              //   this.pause();

              //   playChild({
              //     currentTarget: image[0]
              //   });
              // }

              last = current;
            },

            onEnd: function( track ) {
              images[ track.clip ].detach();
              // images[ track.clip ].css({
              //   // opacity: 0,
              //   zIndex: "995 !important"
              // });
            }
          })
        );

        // Set a generic cue to always unlock the child video
        // at an explicit point in the playback, relative to the
        // time the child is expected to be opened.
        // this.video.cue( cue.start + 4, function() {
        //   isLocked = false;
        // });

        // this.video.cue( cue.start + 2, function() {
        //   isLocked = false;
        // });



        // Alternatate which side the image is
        // displayed on.
        side = k % 2 === 0 ? "left" : "right";
        width = dims.width / 5;

        // Generate an element in a jQuery object for the
        // image icon to display
        image = $("<img>").addClass( side + " icons" ).prop({
          src: IMAGE_PATH + cue.clip + ".png",
          video: cue.clip
        });

        image.attr( "id", "image-" + cue.clip ).css({
          top: (dims.center.y - 100) + "px",
          width: width + "px"
        });


        position = (dims.center.x / 2) + width;

        // Set the "left" or "right" position in pixels to keep the
        // bubbles snug against the child video that will eventually
        // be placed in the center.
        image.css( side, (dims.center.x - position) + "px" );

        // Generate an element in a jQuery object for the
        // video that is associated with this image icon
        //
        //
        // TODO: The child video should adjust its size according to the window!!!
        //
        //
        //video = $("<video>").attr( "id", "video-" + cue.clip ).html(
        //  sources( VIDEO_PATH, cue.clip )
        //);

        // Generate an object with everything we need to create the video element
        // We can't creae a jQuery element just yet as we don't want the browser
        // downloading all the videos just yet!
        video = {
          id: "video-" + cue.clip,
          innerHtml: sources( VIDEO_PATH, cue.clip )
        };

        // TODO: Experiment with making the image
        //        dimensions based on the video
        //
        // http://www.duebel.me/web-video-pixel-dimensions/

        // this.$container.append( image );

        // Store references to the newly created image and video
        // jQuert elements in a free-var cache.
        images[ cue.clip ] = image;
        childVideosInfo[ cue.clip ] = video;
        captions[ cue.clip ] = cue.caption;

      }.bind(this));
    }


    // Place arrow
    // TODO: This shouldn't be here, but it works for now :(
    this.$arrow = $("<div>").addClass("arrow-instruction").html(
      "<img src='/app/img/road-arrow.png' class='arrow'>" +
      "<p>" + this.text + "</p>"
    );

    this.$container.append(
      this.$arrow
    );

    playChild = function( event ) {
      var current, caption, $childVideo;

      current = $(event.currentTarget).prop("video");
      caption = captions[ current ];
      videoInfo = childVideosInfo[ current ];
      // create a jquery object for the video from the videoInfo object
      $childVideo = $("<video>").attr( "id", videoInfo.id ).html(videoInfo.innerHtml);
      $childVideo.media = Popcorn( $childVideo[0] );

      this.mute();

      if ( previous === current ) {
        return;
      }

      this.isOpen = true;

      // Stop the primary main video and fade to 50%
      this.video.pause();
      this.$primary.animate({ opacity: 0.5 }, "fast");

      // Remove any residual video elements
      // TODO: Abstract this operation
      this.$container.find("video:not(#" + this.video.media.id + "),#caption").remove();

      // Append the child video element
      this.$container.append( JST.close );
      this.$container.append( $childVideo );
      this.$container.append( JST.caption );

      // Reset video to play from beginning
      // $childVideo.get(0).currentTime = 0;

      // Set the child element's position, relative
      // to the dimensions of the primary video
      $childVideo.css({
        // top: dims.height / 4 + "px",
        // left: dims.width / 4 + "px",
        width: dims.center.x + "px",
        marginLeft: "-" + (dims.center.x / 2) + "px",
        marginTop: "-" + (dims.center.y / 2) + "px"
      });

      // Adds "per-child" video "close" button.
      $("#close").css({

        top: $childVideo.offset().top + "px",
        right: ($childVideo.offset().left - 22) + "px"

      }).one("click", closeChild );

      // Set the caption box position
      // This is somewhat insane and hard to look at.
      $("#caption").css({

        top: ( $childVideo.offset().top + $childVideo.height() + 30 ) + "px",
        left: $childVideo.offset().left + "px",
        width: dims.center.x + "px"

      }).find(".text").html( caption );

      // Play the newly placed video element
      // (Dereference the jQuery object to use the
      // video element's native play() method)
      $childVideo.get(0).play();

      console.log( "Playing Source: ", $childVideo.get(0).currentSrc );

      // When the video has played to the end or is
      // scrolled by a mouse wheel, trigger a click on the
      // primary video surface. [pg 7]
      //
      // This will cause the video to close and the
      // primary video to fade in/restore
      //

      $childVideo.add( this.$primary ).one("ended wheel mousewheel", function( event ) {
        this.isOpen = false;
        this.$primary.triggerHandler("click");
      }.bind(this));


      // Draw the progress, caption and time nodes
      //
      // TODO: This needs to be redesigned for dynamic creation
      // and insertion.
      //
      // Intially based on:
      // http://jsfiddle.net/rwaldron/DY9jG/
      //
      $childVideo.media.on("canplayall", function() {
        var $progress = this.$container.find(".progress-inner"),
            $time = this.$container.find(".time");

        $childVideo.media.on("timeupdate", function() {
          $progress.width(
            (this.currentTime() / this.duration()) * dims.center.x
          );
          $time.html(
            smpte( this.currentTime() ) + "/" + smpte( this.duration() )
          );
        });
      }.bind(this));

      previous = current;

    // End "playChild"
    }.bind(this);


    closeChild = function() {
      // Remove any residual video elements
      // TODO: Abstract this operation
      this.$container.find("video:not(#" + this.video.media.id + "),#caption,#close").remove();
      this.$primary.animate({ opacity: 1 }, "fast");

      this.unmute();

      previous = null;
      var scs = this;
      _.delay( function(){
          if( scs.video.paused ){
            scs.video.playbackRate( 0.25 );
            scs.video.play();
          }
      }, 1000 );
    }.bind(this);


    this.$primary.on("click", closeChild );

    // When the Primary video is "scrolled", hide the text from the on-surface
    // scrolling prompt. #40
    this.$primary.on("wheel mousewheel", function() {
      this.$arrow.fadeOut(800);
    }.bind(this));

    this.$container.on("click", ".icons", playChild );
  }

  ScrollableCueset.prototype.mute = function() {
    if ( this.audio ) {
      if ( !this.audio.muted() ) {
        this.audio.mute();
      }
    } else {
      if ( !this.video.muted() ) {
        this.video.mute();
      }
    }
  };

  ScrollableCueset.prototype.unmute = function() {
    if ( this.audio ) {
      if ( this.audio.muted() ) {
        this.audio.unmute();
      }
    } else {
      if ( this.video.muted() ) {
        this.video.unmute();
      }
    }
  };

  exports.ScrollableCueset = ScrollableCueset;

  if ( typeof define === "function" &&
      define.amd && define.amd.ScrollableCueset ) {
    define( "scrollablecueset", [], function () { return ScrollableCueset; } );
  }

}( this ));
