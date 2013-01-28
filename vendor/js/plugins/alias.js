// Alias $p.code` to something that sounds more like
// what it does.
Popcorn.prototype.register = Popcorn.prototype.code;


function motion( opts ) {
  var start, id;

  opts.delay = opts.delay || 1000 / 60;
  opts.duration = opts.duration || 400;

  start = Date.now();

  id = setInterval(function() {
    var timePassed, progress, delta;

    timePassed = Date.now() - start;
    progress = timePassed / opts.duration;

    if ( progress > 1 ) {
      progress = 1;
    }

    delta = opts.delta( progress );
    opts.step( delta );

    if ( progress === 1 ) {
      clearInterval( id );
      opts.callback();
    }
  }, opts.delay || 10 );
}


[ "volumeOut", "volumeIn" ].forEach(function( method, volume ) {
  Popcorn.prototype[ method ] = function( duration, callback ) {
    if ( typeof duration === "function" ) {
      callback = duration;
      duration = 400;
    }

    if ( callback ) {
      callback = callback.bind(this);
    }

    motion({
      callback: callback,
      duration: duration,
      delta: function( p ) {
        return p;
      },
      step: function( delta ) {
        this.media.volume = volume * delta;
      }.bind(this)
    });

    return this;
  };
});
