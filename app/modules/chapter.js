define([
    "app",
    "modules/act",
    "modules/story",
    "modules/time",
], function( App, Act, Story, time ) {


    var Chapter;

    Chapter = App.module();

    // Chapter Lists displays are effectively static UI
    // and do no incur the same cost as a complete model + view
    Chapter.Model = Backbone.Model.extend({});


    Chapter.List = Backbone.View.extend({

        template: "chapter/list",

        tagName: "ul",

        data: function() {
            return {
                model: this.model
            };
        },

        initialize: function( story ) {
            this.model = new Chapter.Model(story);

            // console.log( this.model );
        },

        afterRender: function() {
            this.$el.addClass("acts-chapters");
            this.model.get("target").append(this.$el);
        }
    });

    // Must called as:
    //
    //  Chapter.List.create.bind(this)
    //
    // From a story view
    //

    function getChapters( project ) {
        return project.frames.map(function( frame ) {
            console.log( frame );
            return {
                id: frame.id,
                title: frame.layers[0].attr.title,
                cue_out: frame.layers[0].attr.cue_out,
                smpte: time.smpte(frame.layers[0].attr.cue_out)
            };
        });
    }

    Chapter.List.create = function() {
        var chapters, duration;

        chapters = getChapters( this.zeega.getProjectData() );
        duration = chapters.reduce(function( val, chap ) {
            return val + chap.cue_out;
        }, 0);



        new Chapter.List({
            target: this.$el.find(".controls-bar"),
            act: this.model.get("act"),
            chapters: chapters,
            duration: time.smpte( duration )
        }).render();
    };

    return Chapter;
});
