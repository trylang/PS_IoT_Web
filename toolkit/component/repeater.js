/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  return function(data) {
    var global = data.global;
    var traverseRow = data.traverseRow;
    var traverseColumn = data.traverseColumn;
    var element = data.element;
    var timeout = data.timeout;
    var previewMode = data.previewMode;
    var col = element.$attr("parameters/col");
    var wrap = $("<div></div>").addClass("repeater");
    var child = element.children[0];
    var prevElem = {};
    var getOption = element.$attr("advance/getListTable");
    var expression;
    $$.runExpression(element.$attr("advance/expression"), function(funRes) {
      if(funRes.code == "0") {
        var fnResult = funRes.data;
        if(typeof fnResult == 'function') {
          expression = fnResult(data, system);
        } else {
          expression = fnResult;
        }
        expression = expression ? expression : {};
      } else {
        expression = {};
        console.log(funRes.message);
        //throw new Error(funRes.message);
      }
    });
    var initFn = expression.$attr("on/init");
    child.col = 12 / col;
    var render = function(data){
      var children = [];
      var cloneChild = function(dt){
        var clone = child.$clone();
        clone.traveseByChild(function(el){
          Object.defineProperty(el, "$repeatData", {value : dt ,enumerable : false});
        });
        return clone;
      };
      for(var i in data){
        children.push(cloneChild(data[i]));
      };
      prevElem.children = children;
      prevElem.traverse(function(){});
      traverseColumn(wrap, prevElem.children, previewMode, function(elem){
        var expression;
        $$.runExpression(elem.$attr("advance/expression"), function(funRes) {
          if(funRes.code == "0") {
            var fnResult = funRes.data;
            if(typeof fnResult == 'function') {
              expression = fnResult(data);
            } else {
              expression = fnResult;
            }
            expression = expression ? expression : {};
          } else {
            throw new Error(funRes.message);
          }
        });
        var repeatFn = expression.$attr("on/repeat");
        if(repeatFn){
          repeatFn({
            target : elem,
            data : elem.$repeatData
          })
        }
      });
    };
    element.render = render;
    var start = function(){
      if(getOption == "newdevice"){
        element.getLatestDevices(function(devices){
          element.render(devices);
        });
      } else if(getOption == "workorder"){
        element.getTicketsByStatus(function(workorder){
          element.render(workorder);
        });
      } else if (getOption == "energyType") {
        element.energyTypeList(function(energyType) {
          element.render(energyType);
        });
      } else if (getOption == "allprojects") {
        element.getCurrentProjects(function(projects) {
          element.render(projects);
        });
      } else if(getOption == "alert"){
        element.getAlerts(function(workorder){
          element.render(workorder);
        });
      } else if(getOption == "currentDirectiveByDevice"){
        element.currentDirective(function(directives){
          element.render(directives);
        });
      } else if(getOption == "currentAlertByDevice"){
        element.getCurrentAlert(function(alerts){
          element.render(alerts);
        });
      } else if(getOption == "currentAlertByProject"){
        element.getCurrentAlertByProject(function(alerts){
          element.render(alerts);
        });
      }
    };
    if(previewMode){
      if(typeof initFn == "function") {
        try{
          initFn({
            target: element,
            global : global
          })
        } catch(e){
          console.log(e);
        }
      } else {
        start();
      }
    } else {
      traverseColumn(wrap, element.children, previewMode);
    }
    return wrap;
  }
});
