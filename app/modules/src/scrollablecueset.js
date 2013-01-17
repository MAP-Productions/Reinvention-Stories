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

  function ScrollableCueset( options ) {
    var images, videos, captions, current, previous, dims, $container;

    Abstract.put.call( this, options );

    // Use the provided selector to find
    // the given video element that will serve
    // as the primary for this ScrollableCueset
    this.node = document.querySelector( this.selector );
    this.original = this.node.cloneNode();
    // this.node.innerHTML = sources( VIDEO_PATH, this.video );

    this.scrollable = Popcorn( Scrollable( this.node ).media, {
      frameAnimation: true
    });

    this.$primary = $(this.scrollable.media);
    this.$primary.media = this.scrollable;
    this.$container = $container = this.$primary.parent();

    images = {};
    videos = {};
    captions = {};

    dims = {
      width: this.$container.width(),
      height: this.$container.height()
    };

    if ( this.cues.length ) {

      this.cues.forEach(function( cue, k ) {
        var image, video, side, last, relative, step, op, isFwd;

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


        this.scrollable.register(
          Abstract.merge({}, cue, {
            end: cue.start + 7,
            onStart: function( track ) {
              $container.append(
                images[ track.clip ].css({
                  zIndex: "999 !important"
                })
              );
            },

            onFrame: function( track ) {
              var current, image, opacity;

              current = +this.currentTime().toFixed(2);
              image = images[ track.clip ];
              opacity = image.css("opacity");
              isFwd = current >= last && isFwd ? true : false;

              if ( current > last ) {
                isFwd = true;
              } else if ( current === last ) {
                isFwd = isFwd;
              } else {
                isFwd = false;
              }

              // TODO: Refactor and DRY out.
              if ( isFwd ) {
                if ( opacity < 1 && current > track.start ) {
                  op = "+";
                }
                if ( opacity > 0 && current > track.end - 3 ) {
                  op = "-";
                }
              } else {
                if ( opacity < 1 && current < track.end ) {
                  op = "+";
                }
                if ( opacity > 0 && current < track.start + 3 ) {
                  op = "-";
                }
              }

              image.css({
                //
                // op=step
                // eg.
                //
                // +=0.05
                // -=0.05
                //
                opacity: [ op, step ].join("=")
              });

              // console.log( isFwd ? "FORWARD" : "BACKWARD", op, image.css("opacity") );

              last = current;
            },

            onEnd: function( track ) {
              images[ track.clip ].detach();
              images[ track.clip ].css({
                opacity: 0,
                zIndex: "995 !important"
              });
            }
          })
        );

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
          top: (dims.height / 2 - 125) + "px"
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

    this.$primary.on("click", function() {
      // Remove any residual video elements
      // TODO: Abstract this operation
      this.$container.find("video:not(#video-" + this.id + "),#caption").remove();
      this.$primary.animate({ opacity: 1 }, "fast");

      previous = null;
    }.bind(this));

    $("#reinvention-road").on("click", ".icons", function( event ) {
      var current, caption, video;

      current = $(event.currentTarget).prop("video");
      caption = captions[ current ];
      video = videos[ current ];
      video.media = Popcorn( video[0] );


      if ( previous === current ) {
        return;
      }

      // Stop the primary main video and fade to 50%
      this.$primary.media.pause();
      this.$primary.animate({ opacity: 0.5 }, "fast");

      // Remove any residual video elements
      // TODO: Abstract this operation
      this.$container.find("video:not(#video-" + this.id + "),#caption").remove();


      // Reset video to play from beginning
      video.get(0).currentTime = 0;

      // Set the child element's position, relative
      // to the dimensions of the primary video
      video.css({
        top: dims.height / 4 + "px",
        left: dims.width / 4 + "px"
      });

      // Append the child video element
      this.$container.append( video );
      this.$container.append( JST.caption );

      // This is somewhat insane and hard to look at.
      $("#caption").css({

        top: ( parseInt( video.css("top"), 10 ) + video.height() + 2 ) + "px",
        left: video.css("left")

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
      video.add( this.$primary ).one("ended wheel mousewheel", function() {
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
    }.bind(this));


    // this.$primary.media.play();
  }


  ScrollableCueset.prototype.reset = function() {
    this.node.parentNode.appendChild( this.original );
  };


  exports.ScrollableCueset = ScrollableCueset;

  if ( typeof define === "function" &&
      define.amd && define.amd.ScrollableCueset ) {
    define( "scrollablecueset", [], function () { return ScrollableCueset; } );
  }

}( this ));
