// Set the require.js configuration for your application.
require.config({

    // Initialize the application with the main application file.
    deps: [ "es6shim", "abstract", "zeegaplayer", "bootstrap", "main" ],

    paths: {
        // JavaScript folders.
        // libs: "../app/js/libs",
        plugins: "../vendor/js/plugins",
        vendor: "../vendor",

        text: "../vendor/js/plugins/text",
        json: "../vendor/js/plugins/json",

        // Libraries.
        jquery: "../vendor/js/libs/jquery",
        lodash: "../vendor/js/libs/lodash",
        backbone: "../vendor/js/libs/backbone",
        bootstrap: "../vendor/bootstrap/js/bootstrap",
        es6shim: "../vendor/js/libs/es6",
        abstract: "../vendor/js/libs/abstract",
        moment: "../vendor/js/libs/moment",
        store: "../vendor/js/libs/store",

        scrollable: "../app/modules/src/mediascrollcontrol",
        scrollablecueset: "../app/modules/src/scrollablecueset",

        // Specialty
        zeegaplayer: "../vendor/zeegaplayer/dist/debug/zeega",

        layoutmanager: "../vendor/js/plugins/backbone.layoutmanager"

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

        zeegaplayer: [ "jquery", "backbone" ],

        bootstrap: [ "jquery" ],

        scrollable: [ "zeegaplayer" ],
        scrollablecueset: [ "scrollable" ],

        // Backbone.LayoutManager depends on Backbone.
        layoutmanager: [ "backbone" ],

        main: [ "layoutmanager" ]
    }
});
