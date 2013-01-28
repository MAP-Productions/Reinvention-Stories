define([
    // Libraries.
    "jquery",
    "lodash",
    "backbone",
    "layout",
    "alias",
    "scrollable",
    "scrollablecueset",
    "serializeform"
],

function( $, _, Backbone, Layout ) {
    var App, JST;

    // Provide a global location to place configuration settings and module
    // creation.
    window.App = App = {
        // The root path to run the Application.
        root: "/",

        // Initialize "View" state tracking, used to
        // prevent resetting the currently displayed view
        current: {
            type: "",
            path: "",
            id: 0,
            act: 0
        },
        global: {
            zeega: {}
        },
        views: {}
    };

    // Localize or create a new JavaScript Template object.
    // ...Preload some templates that we can avoid requesting:
    JST = window.JST = window.JST || {};

    // Configure LayoutManager with Backbone Boilerplate defaults.
    Backbone.Layout.configure({
        // Allow LayoutManager to augment Backbone.View.prototype.
        manage: true,

        prefix: "app/templates/",

        fetch: function( path ) {
            // Put fetch into `async-mode`.
            var done = this.async();

            // Concatenate the file extension.
            path = path + ".html";

            // If cached, use the compiled template.
            if ( JST[ path ] ) {
                return JST[ path ];
            }

            // Seek out the template asynchronously.
            $.get( App.root + path, function( contents ) {
                done( JST[ path ] = _.template( contents ) );
            });
        }
    });

    function extract( obj, prop ) {
        // console.log( "extract", prop, "from", obj );
        return obj.model && obj.$el ?
            obj.model.get( prop ) : obj.get( prop );
    }

    // Mix Backbone.Events, modules, and layout management into the App object.
    return Abstract.merge( App, {

        isCurrent: function( id, type ) {
            var self = (this === App) ? this : App;

            // If the |id| is an object, assume we've recieved
            // either a |view| object or a |model| object.
            if ( typeof id === "object" ) {
                type = extract( id, "type" );
                id = extract( id, "id" );
            }
            // console.log( "Test isCurrent", [id, type], [App.current.id, App.current.type] );
            return self.current.id === id && self.current.type === type;
        },

        // Create a custom object with a nested Views object.
        module: function( props ) {
            return Abstract.merge({
                Views: {}
            }, props || {} );
        },

        // Helper for using layouts.
        useLayout: function( name, options ) {
            // Enable variable arity by allowing the first argument to be the options
            // object and omitting the name argument.
            if ( _.isObject(name) ) {
              options = name;
            }

            // Ensure options is an object.
            options = options || {};

            // If a name property was specified use that as the template.
            if ( _.isString(name) ) {
              options.template = name;
            }
            // Cache the refererence.
            return this.layout = new Backbone.Layout(
                Abstract.merge({ el: "#main" }, options )
            );
        }
    }, Backbone.Events );
});
