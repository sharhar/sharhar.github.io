(function($) {

  /**
   * Copyright 2012, Digital Fusion
   * Licensed under the MIT license.
   * http://teamdf.com/jquery-plugins/license/
   *
   * @author Sam Sehnert
   * @desc A small plugin that checks whether elements are within
   *     the user visible viewport of a web browser.
   *     only accounts for vertical position, not horizontal.
   */

  $.fn.visible = function(partial) {
    
      var $t            = $(this),
          $w            = $(window),
          viewTop       = $w.scrollTop(),
          viewBottom    = viewTop + $w.height(),
          _top          = $t.offset().top,
          _bottom       = _top + $t.height(),
          compareTop    = partial === true ? _bottom : _top,
          compareBottom = partial === true ? _top : _bottom;
    
    return ((compareBottom <= viewBottom) && (compareTop >= viewTop));

  };
    
})(jQuery);

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

$(".module").each(function() {
  var ele = $(this);
  ele.addClass("invisible");
  if (ele.visible(true)) {
     ele.addClass("already-visible"); 
     ele.addClass("visible");
  } 
});

alt = true

$(window).scroll(function(event) {
  $(".module").each(function() {
    var ele = $(this);
    if (ele.visible(true) && !ele.hasClass("visible")) {
      ele.addClass("come-in-"+alt); 
      ele.addClass("visible");
      alt = !alt
    } 
  });
  
});