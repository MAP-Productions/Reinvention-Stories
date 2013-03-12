define([

    "json!data/acts.json",
    "json!data/stories.json",
    "json!data/roads.json",
    "json!data/reststops.json",
    "json!data/userstory.json"

], function( acts, stories, roads, reststops ) {
    var priv, map, args;

    priv = new WeakMap();
    map = {};
    args = [].slice.call( arguments );

    [ "acts", "stories", "roads", "reststops", "userstory" ].forEach(function( key, i ) {
        map[ key ] = args[i];
    });

    function From( key ) {
        priv.set( this, map[ key ] );
    }

    From.prototype.byIndex = function( index ) {

        data = priv.get( this );
        return data[ index ];
    };

    From.prototype.byId = function( id ) {
        var data, k = -1;

        data = priv.get( this );

        while ( ++k < data.length ) {
            if ( data[ k ].id === id ) {
                return data[ k ];
            }
        }
        return null;
    };

    return {
        get: function( type ) {
            return map[ type ];
        },
        from: function( plural ) {
            return new From( plural );
        }
    };
});
