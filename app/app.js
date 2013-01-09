define([
    // Libraries.
    "jquery",
    "lodash",
    "backbone",
    "layoutmanager"
],

function( $, _, Backbone ) {
    var App, JST;

    // Provide a global location to place configuration settings and module
    // creation.
    App = {
        // The root path to run the Application.
        root: "/"
    };

    // Localize or create a new JavaScript Template object.
    // ...Preload some templates that we can avoid requesting:
    JST = window.JST = window.JST || {
        // Map Surfaces are actually just blank——there are only two
        // in the app and they are part of the primary UI and therefore
        // can be bootstrapped directly into main.html
        surface: ""
    };

    // Create global "namespace"
    window.Reinvention = {
        data: {
            acts: null,
            roads: null
        },
        Acts: null,
        Roads: null,
        Profiles: null
    };

    // Configure LayoutManager with Backbone Boilerplate defaults.
    Backbone.LayoutManager.configure({
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

    // Mix Backbone.Events, modules, and layout management into the App object.
    return _.extend( App, {
        // Create a custom object with a nested Views object.
        module: function( props ) {
            return _.extend({
                Views: {}
            }, props );
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
                _.extend({ el: "#main" }, options )
            );
        }
    }, Backbone.Events );
});
