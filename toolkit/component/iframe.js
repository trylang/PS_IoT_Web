/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  return function(data) {
    var element = data.element;
    var url = element.$attr("parameters/url");
    var style = element.$attr("style");
    style = style ? style : {};
    var wrapFrame = $("<div class='embed-responsive embed-responsive-16by9'></div>");
    var target = $("<iframe class='embed-responsive-item'></iframe>");
    target.css(style);
    if (localStorage.getItem("AISINFO")) {
      var params = JSON.parse(localStorage.getItem("AISINFO"))
      var inputurl = "&kw="+params.mmsi;
      target.attr("src",url+inputurl);
    } else {
      target.attr("src",url);
    }
    wrapFrame.append(target);
    window.top = {};
    wrapFrame.css("width", "100%");
    wrapFrame.css("height", "calc( 100vh - 100px)");
    element.render = function(params) {
      var inputurl = "&kw="+params.mmsi;
      localStorage.setItem("AISINFO", JSON.stringify(params));
      target.attr("src",url+inputurl);
    };
    return target;
  }
});
