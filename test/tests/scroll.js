$(function() {
  var scrollable, node;

  try {
    new Scrollable("#blah");
  } catch ( e ) {
    console.assert(
      e.message, "Cannot find node matching #blah", "Unmatched selector will throw"
    );
  }

  scrollable = new Scrollable("#video");

  console.assert(
    scrollable.media, document.querySelector("#video"), "Finds correct media by selector"
  );

  console.assert(
    scrollable.last, -1, "Begins with a last value of -1"
  );

  node = document.querySelector("#video");
  scrollable = new Scrollable( node );

  console.assert(
    scrollable.media, document.querySelector("#video"), "Finds correct media by element"
  );

  console.assert(
    scrollable.last, -1, "Begins with a last value of -1"
  );
});
