// Set the require.js configuration for your application.
require.config({

    // Initialize the application with the main application file.
    deps: [ "es6shim",  "abstract", "layout", "zeegaplayer", "bootstrap", "main" ],

    paths: {
        // JavaScript folders.
        // libs: "../app/js/libs",
        plugins: "../vendor/js/plugins",
        vendor: "../vendor",

        text: "../vendor/js/plugins/text",
        json: "../vendor/js/plugins/json",
        alias: "../vendor/js/plugins/alias",
        serializeform: "../vendor/js/plugins/serializeForm",

        // Libraries.
        jquery: "../vendor/js/libs/jquery",
        lodash: "../vendor/js/libs/lodash",
        backbone: "../vendor/js/libs/backbone",
        unprefix: "../vendor/js/libs/unprefix",
        bootstrap: "../vendor/bootstrap/js/bootstrap",
        es6shim: "../vendor/js/libs/es6",
        abstract: "../vendor/js/libs/abstract",
        moment: "../vendor/js/libs/moment",
        store: "../vendor/js/libs/store",
        progress: "../vendor/js/libs/progress",
        leaflet: "../vendor/leaflet/leaflet",

        // Specialty
        zeegaplayer: "../vendor/zeegaplayer/dist/debug/zeega",

        layout: "../vendor/js/plugins/backbone.layoutmanager"

    },

    shim: {
        abstract: {
            deps: [ "es6shim" ],
            exports: "Abstract"
        },

        store: {
            deps: [ "es6shim", "abstract" ],
            exports: "Store"
        },

        // Backbone library depends on lodash and jQuery.
        backbone: {
            deps: [ "lodash", "jquery" ],
            exports: "Backbone"
        },

        alias: {
            deps: [ "zeegaplayer" ]
        },

        serializeform: {
            deps: [ "jquery" ]
        },

        layout: [ "backbone" ],

        zeegaplayer: [ "jquery", "backbone" ],

        bootstrap: [ "jquery" ],

        progress: {
            exports: "ProgressCircle"
        },

        leaflet: {
            exports: "L"
        },

        main: [ "layout" ]
    }
});
