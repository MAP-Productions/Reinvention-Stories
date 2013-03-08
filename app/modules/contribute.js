define([
    "app"
], function( App ) {

    var Contribute;

    Contribute = App.module();


    Contribute.View = Backbone.LayoutView.extend({
        template: "contribute/contribute"
    });


    return Contribute;
});
