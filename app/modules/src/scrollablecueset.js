(function( exports ) {
  // Alias $p.code` to something that sounds more like
  // what it does.
  Popcorn.prototype.register = Popcorn.prototype.code;

  var IMAGE_PATH = "/app/image/",
      VIDEO_PATH = "/app/video/",
      JST = exports.JST || {};

  // TODO: This should be moved to a file and dynamically preloaded
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
    var images, videos, captions, current, previous, dims, $container, playChild;

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
    videos = {};
    captions = {};

    dims = {
      width: parseInt( this.$container.css("width"), 10 ),
      height: parseInt( this.$container.css("height"), 10 )
    };

    dims.center = {
      x: dims.width / 2,
      y: dims.height / 2,
    };

    if ( this.cues.length ) {

      this.cues.forEach(function( cue, k ) {
        var image, video, side, last, relative, step, fade, isLocked;

        // Register behaviours to execute at
        // the start and end phase of a popcorn
        // track event.
        //
        //
        isFading = false;
        relative = 0;
        last = 0;
        step = 0.05;
        isFwd = true;

        cue.end = cue.start + 7;
        cue.prompt = cue.end - 4;

        fade = {
          up: {
            start: cue.start,
            end: cue.start + 3
          },
          down: {
            start: cue.end - 3,
            end: cue.end
          }
        };

        isLocked = false;

        this.video.register(
          Abstract.merge({}, cue, {

            onStart: function( track ) {
              $container.append(
                images[ track.clip ]
              );

              console.log( "start", track );

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
              if ( Math.round(current) === cue.start + 3 && !this.paused() &&
                  !this.isOpen && !isLocked ) {
                isLocked = true;
                this.pause();

                playChild({
                  currentTarget: image[0]
                });
              }

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
        this.video.cue( cue.start + 4, function() {
          isLocked = false;
        });

        this.video.cue( cue.start + 2, function() {
          isLocked = false;
        });



        // Alternatate which side the image is
        // displayed on.
        side = k % 2 === 0 ? "left" : "right";

        // Generate an element in a jQuery object for the
        // image icon to display
        image = $("<img>").addClass( side + " icons" ).prop({
          src: IMAGE_PATH + cue.clip + ".png",
          video: cue.clip
        });

        image.attr( "id", "image-" + cue.clip ).css({
          top: (dims.center.y - 125) + "px"
        });

        // Generate an element in a jQuery object for the
        // video that is associated with this image icon
        //
        //
        // TODO: The child video should adjust its size according to the window!!!
        //
        //
        video = $("<video>").attr( "id", "video-" + cue.clip ).html(
          sources( VIDEO_PATH, cue.clip )
        );

        // TODO: Experiment with making the image
        //        dimensions based on the video
        //
        // http://www.duebel.me/web-video-pixel-dimensions/

        // this.$container.append( image );

        // Store references to the newly created image and video
        // jQuert elements in a free-var cache.
        images[ cue.clip ] = image;
        videos[ cue.clip ] = video;
        captions[ cue.clip ] = cue.caption;

      }.bind(this));
    }


    // Place arrow
    this.$arrow = $("<img>").addClass("arrow").attr({
      src: "/app/img/road-arrow.png"
    });



    this.$container.append(
      this.$arrow
    );


    this.$primary.on("click", function() {
      // Remove any residual video elements
      // TODO: Abstract this operation
      this.$container.find("video:not(#" + this.video.media.id + "),#caption").remove();
      this.$primary.animate({ opacity: 1 }, "fast");

      this.unmute();

      previous = null;
    }.bind(this));

    playChild = function( event ) {
      var current, caption, video;

      current = $(event.currentTarget).prop("video");
      caption = captions[ current ];
      video = videos[ current ];
      video.media = Popcorn( video[0] );

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


      // Reset video to play from beginning
      video.get(0).currentTime = 0;

      // Set the child element's position, relative
      // to the dimensions of the primary video
      video.css({
        // top: dims.height / 4 + "px",
        // left: dims.width / 4 + "px",
        width: dims.center.x + "px",
        marginLeft: "-" + (dims.center.x / 2) + "px",
        marginTop: "-" + (dims.center.y / 2) + "px"
      });

      // Append the child video element
      this.$container.append( video );
      this.$container.append( JST.caption );

      // This is somewhat insane and hard to look at.
      $("#caption").css({
        top: video.offset().top + parseInt( video.css("height"), 10 ) + "px",
        left: video.offset().left + "px",
        width: dims.center.x + "px"

      }).find(".text").html( caption );

      // Play the newly placed video element
      // (Dereference the jQuery object to use the
      // video element's native play() method)
      video.get(0).play();

      // When the video has played to the end or is
      // scrolled by a mouse wheel, trigger a click on the
      // primary video surface. [pg 7]
      //
      // This will cause the video to close and the
      // primary video to fade in/restore
      //

      video.add( this.$primary ).one("ended wheel mousewheel", function( event ) {
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
      video.media.on("canplayall", function() {
        var $progress = this.$container.find(".progress-inner"),
            $time = this.$container.find(".time");

        video.media.on("timeupdate", function() {
          $progress.width(
            (this.currentTime() / this.duration()) * 720
          );
          $time.html(
            smpte( this.currentTime() ) + "/" + smpte( this.duration() )
          );
        });
      }.bind(this));

      previous = current;

    // End "playChild"
    }.bind(this);

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
