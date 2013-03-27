define([
    "app"
], function( App ) {
    
    var Tumblr;

    Tumblr = App.module();

    Tumblr.Model = Backbone.Model.extend({
        // override sync as Tumblr uses JSONP
        sync: function(method, model, options) {
            var params = _.extend({
                type: 'GET',
                dataType: 'jsonp',
                url: this.url(),
                processData: false
            }, options);

            return $.ajax(params);
        },

        // we're only interested in the latest post
        parse: function(response) {
            return response.posts[0];
        },

        url: function() {
            return "http://blog.reinventionstories.org/api/read/json?num=1";
        }
    });

    Tumblr.View = Backbone.LayoutView.extend({
        template: "tumblr",
        className: "tumblr-news",
        initialize: function() {
            this.model = new Tumblr.Model();

            this.model.fetch();

            this.model.on("change", this.render, this);
        },
        serialize: function() {
            var months, dateObj = new Date( this.model.get("date") );

            months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

            if ( this.model.has("regular-title") ) {
                return {
                    title: this.model.get("regular-title"),
                    url: this.model.get("url-with-slug"),
                    date: months[ dateObj.getMonth() ] + " " + dateObj.getDate() + ", " + dateObj.getFullYear()
                };
            } else {
                return {
                    title: "",
                    url: "",
                    date: ""
                };
            }
        }
    });

    return Tumblr;
});