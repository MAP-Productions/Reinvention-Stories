define([
    "app",
    "modules/videopos"
], function( App, VideoPos ) {

    var Contribute;

    Contribute = App.module();


    Contribute.View = Backbone.LayoutView.extend({
        template: "contribute/contribute",

        className: "contribute-view",

        afterRender: function() {
            var $bg = this.$(".contribute-bg");

            VideoPos.positionVideo( $bg );
            
            App.DOM.$window.on( "resize", function() {
                VideoPos.positionVideo( $bg );
            });
        }
    });

    return Contribute;
});
