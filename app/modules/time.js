define([], function() {
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


    return {
        smpte: smpte
    };
});
