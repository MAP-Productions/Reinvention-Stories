(function( exports ) {

  var head, script,
  doc = exports.document,
  console = exports.console,
  queue = [];

  if ( !exports._ ) {
    head = doc.head;
    script = doc.createElement("script");
    script.async = true;
    script.src = "http://documentcloud.github.com/underscore/underscore-min.js";

    script.onload = function() {
      queue.forEach(function( test ) {
        console.assert.apply( null, test );
      });
    };

    head.appendChild( script );
  }

  console.assert = function( actual, expected, message ) {

    if ( !exports._ ) {
      queue.push( [].slice.call( arguments ) );
      return;
    }

    var outcome, result;

    if ( arguments.length === 1 ) {
      outcome = actual;
      expected = outcome;
      message = outcome;
    }

    if ( arguments.length === 2 ) {
      outcome = actual;
      message = expected;
    }

    outcome = !outcome ? _.isEqual( actual, expected ) : outcome;
    result = outcome ? "PASS" : "FAIL";

    console.assert.record[ result.toLowerCase() ]++;
    console.assert.record.total++;

    return console.log(
      result + ": ", '"' + message + '"', { actual: actual, expected: expected }
    );
  };

  console.assert.record = {
    pass: 0,
    fail: 0,
    total: 0
  };

  console.assert.results = function() {
    console.log(
      _.keys( console.assert.record ).map(function( key, idx ) {
        return key + ": " + console.assert.record[ key ];
      }).join("; ")
    );
  };

})( this );