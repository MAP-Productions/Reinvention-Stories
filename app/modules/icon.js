define([], function() {

    var presets;

    // Icon serves a broker of various Leaflet classes
    //
    // http://leafletjs.com/reference.html#icon
    //
    // [
    //      Marker, Circle, Icon, DivIcon
    // ]
    //
    //
    // This pattern will allows us to keep a structured object
    // of "presets" for use with any number of nearly identical
    // Leaflet APIs and provide a single interface for our own
    // program purposes. It also reduces the required upkeep
    // throughout the code base.


    // Icon
    //
    // @param config Object
    //
    // Required:
    //
    //      config.use, the string name of a stored "marker" configuration
    //
    //      config.latlng, an array of points that indicate a latitude and longitude
    //      (in that order)
    //
    // Optional:
    //
    //      config.radius, radius of a circle icon
    //
    //      ...
    //
    //
    function Icon( config ) {
        var preset, constructor, child;

        preset = Icon.Presets[ config.use ];

        if ( !preset ) {
            throw Error( config.use + " is not a valid Icon.Preset." );
        }

        // Using a valid Icon.Preset, derive the correct Leaflet marker constructor.
        constructor = L[ preset.construct ];

        // Define a "child" constructor that wraps the call to
        // the Leaflet constructor...
        child = function() {
            constructor.apply( this, preset.args( config ) );
        };

        // And inherits the prototype of the Leaflet constructor.
        child.prototype = Object.create( constructor.prototype );
        child.prototype.constructor = child;

        // Return a new instance of our temporary child contructor.
        return new child();
    }

    // Expose Presets as a static property of the Icons
    // constructor. This allows Icon.Presets to be modified
    // and extended inline.
    Icon.Presets = {

        //
        // new Icon({ latlng: latlng, use: "magenta" })
        //

        // begin temporary for testing

        stories: {
            construct: "CircleMarker",
            args: function( opts ) {
                return [
                    opts.latlng,
                    {
                        radius: opts.radius || 10,
                        color: "#5c7b80",
                        fillColor: "#5c7b80",
                        fillOpacity: 0.7,
                        opacity: 0.7
                    }
                ];
            }
        }
    };

    return Icon;
});
