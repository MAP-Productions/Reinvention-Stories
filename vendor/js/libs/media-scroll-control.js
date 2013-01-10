(function( exports ) {

  function scale( value, fromLow, fromHigh, toLow, toHigh ) {
    return ( value - fromLow ) * ( toHigh - toLow ) /
            ( fromHigh - fromLow ) + toLow;
  };

  function delta( e ) {
    var delta, abs;

    // "wheel" events appear to inverse the delta
    if ( e.type === "wheel" ) {
      delta = e.deltaY;
      abs = Math.abs( e.deltaY );

      if ( e.deltaY < 0 ) {
        delta += abs * 2;
      } else {
        delta -= abs * 2;
      }
      return delta;
    }

    return e.wheelDeltaY;
  }

  function Scrollable( selector ) {
    if ( !(this instanceof Scrollable) ) {
      return new Scrollable( selector );
    }
    // Initialize |last| at -1
    this.last = -1;

    // |media| accepts either a provided element
    // or string selector.
    this.media = selector.nodeType ?
      selector : document.querySelector( selector );

    // If |media| is not found or is an invalid
    // DOM node, then thrhow-nothing we can do with this.
    if ( !this.media || this.media.nodeType !== 1 ) {
      throw new Error( "Cannot find node matching " + selector );
    }

    // "wheel" is the new Gecko event
    [ "wheel", "mousewheel" ].forEach(function( type ) {
      this.media.addEventListener( type, this.handler.bind( this ), false );
    }, this);
  }

  // |handler| is |this| bound to the Scrollable instance, not the
  // node dispatching the event.
  Scrollable.prototype.handler = function( event ) {
    var media, scaled;

    media = this.media;
    scaled = Math.round(
      scale( delta( event ), -120, 120, -10, 10 )
    );

    // Defaulting to |scaled| - 1 intentionally causes the following
    // condition to evaluate false;
    this.last = this.last === -1 ? scaled - 1 : this.last;


    // If |scaled| hasn't changed, then there is no reason to
    // update the media's playbackRate or currentTime
    if ( scaled === this.last ) {
      return;
    }

    // If the scaled value is greater then 0, we're going
    // forward. playbackRate is bumped
    if ( scaled > 0 ) {
      if ( media.paused ) {
        media.play();
      }
      media.playbackRate += 0.33;

      /*

      TODO: Improve the following algorithm for a better
      scrolling experience.

      // Currently, |scaled| is > 0...
      if ( scaled > this.last ) {
        // If |scaled| is also > |this.last| reading,
        // continue increasing the playbackRate.
        media.playbackRate += 0.33;
      } else {
        // If |scaled| is < |this.last| reading,
        // decrease the playbackRate.
        media.playbackRate -= 0.33;

        if ( media.playbackRate < 0 ) {
          media.playbackRate = 0;
        }
      }
      */
    }

    // 0 is the center value. If the mousewheel is at 0
    // then we set playbackRate to 0 and pause the media
    // this will allow users to click on "elements"
    // presented on the video surface.
    if ( scaled === 0 ) {
      media.playbackRate = 0;
      media.pause();
    }

    // If the scaled value is less then 0, we're going
    // backward. playbackRate is non-functional in reverse,
    // so we fake it with currentTime. If the media is playing,
    // pause it to avoid the stutter effect.
    if ( scaled < 0 ) {
      if ( !media.paused ) {
        media.pause();
      }
      media.currentTime -= 0.10;
    }

    this.last = scaled;
  };

  exports.Scrollable = Scrollable;

}( this ))


$(function() {
  var scrollable, node;

  try {
    new Scrollable("#blah");
  } catch ( e ) {
    console.assert(
      e.message, "Cannot find node matching #blah", "Unmatched selector will throw"
    );
  }

  scrollable = new Scrollable("#video");

  console.assert(
    scrollable.media, document.querySelector("#video"), "Finds correct media by selector"
  );

  console.assert(
    scrollable.last, -1, "Begins with a last value of -1"
  );

  node = document.querySelector("#video");
  scrollable = new Scrollable( node );

  console.assert(
    scrollable.media, document.querySelector("#video"), "Finds correct media by element"
  );

  console.assert(
    scrollable.last, -1, "Begins with a last value of -1"
  );

});
