(function( exports ) {

  var priv = new WeakMap();

  function Store( namespace ) {
    priv.set( this, {
      namespace: namespace,
      memory: JSON.parse(localStorage.getItem( namespace )) || {}
    });
    this.save();
  }

  Store.prototype.clear = function() {
    localStorage.removeItem( priv.get(this).namespace );
    return this;
  };

  Store.prototype.save = function() {
    localStorage.setItem(
      priv.get( this ).namespace, JSON.stringify( priv.get( this ).memory )
    );
    return this;
  };

  Store.prototype.set = function( key, val ) {
    var stored = priv.get( this );

    if ( typeof key === "object" ) {
      Abstract.assign( stored.memory, key );
    } else {
      stored.memory[ key ] = val;
    }

    priv.set( this, stored );

    return this.save();
  };

  Store.prototype.get = function( key ) {
    var stored = priv.get( this );

    return key === undefined ?
      stored.memory : stored.memory[ key ];
  };


  exports.Store = Store;

  if ( typeof define === "function" &&
      define.amd && define.amd.Store ) {
    define( "store", [], function () { return Store; } );
  }

}( this ));
