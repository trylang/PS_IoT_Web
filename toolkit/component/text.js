/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  return function(data) {
    var serviceCenterService = data.serviceCenterService;
    var element = data.element;
    var global = data.global;
    var previewMode = data.previewMode;
    var text = $("<div></div>");
    if(element.$attr("data/text")){
      element.$attr("data/series", element.$attr("data/text"));
      delete element.data.text;
    }
    if(element.style) {
      text.css(element.style);
    }
    /**
     if(element.data.applied) {
      text.text(element.data.series.value);
    } else {
      text.text(element.data.$attr("series/0/data/0"));
    }*/
    var setSeries = function(target, data) {
      target.series = data;
    };
    element.setText = function(value){
      text.text(value);
    };
    var renderItem = function(data){
      if(typeof data.$attr("series") == "object"){
        var item = data.$attr("series/0/data/0") ? data.$attr("series/0/data/0") : {};
        if(item.value){
          text.text(item.value);
        } else {
          text.text("-");
        };
      } else {
        var item = data;
        if(item.series){
          text.text(item.series);
        } else {
          text.text("-");
        };
      };
    };
    var setParameters = function(target, parameters, data){
      var runExpression = function(expression, data){
        var rs;
        $$.runExpression(expression, function(funRes){
          if(funRes.code == "0"){
            var fnResult = funRes.data;
            if(typeof fnResult == 'function'){
              rs = fnResult(data);
            } else {
              rs = fnResult;
            }
          } else if(funRes.code == "1001"){
            rs = expression;
          } else {
            throw new Error(funRes.message);
          }
        });
        if(typeof rs == 'function'){
          return rs(data);
        } else if(rs == null) {
          return [];
        } else {
          return rs;
        }
      };
      var dtype = element.data.applied ? "bind" : "manual";
      setSeries(target, runExpression(element.data.series[dtype], data));
    };
    var run = function(){
      var getCiKpi_back = function(ci, kpi){
        var baseOption = {
          title : {},
          series : [{}]
        };
        var expression;
        $$.runExpression(element.$attr("advance/expression"), function(funRes){
          if(funRes.code == 0){
            expression = funRes.data;
            expression = expression ? expression : {};
          } else {
            expression = {};
          }
        });
        var addEvents = function(event, handler){
          var callback = function(event){
            handler({
              target : element,
              jquery : event,
              global : global,
              tools : data
            })
          };
          if(previewMode && event == "click"){
            text.css("cursor","pointer");
          }
          if(previewMode){
            text.on(event, callback);
          }
        };
        for(var i in expression.on){
          addEvents(i, expression.on[i]);
        };
        var initFn = expression.$attr("on/init");
        var repeatFn = expression.$attr("on/repeat");
        if(typeof initFn == "function"){
          try{
            initFn({
              target : element
            })
          } catch(e){
            console.log(e);
          }
        } else if(typeof repeatFn == "function"){

        } else {
          if(element.data.applied) {
            serviceCenterService.units.getAll().then(function(data){
              units = data;
              var category;
              $$.runExpression(element.$attr("advance/category"), function(funRes){
                if(funRes.code == 0 || funRes.code == 1001){
                  category = funRes.data;
                  category = category ? category : "time";
                  console.log("category---->", category);
                }
              });
              var condition;
              $$.runExpression(element.$attr("advance/condition"), function(funRes){
                if(funRes.code == 0){
                  condition = funRes.data;
                  condition = condition ? condition : {};
                }
              });
              var method = element.$attr("advance/getfunction") ? element.$attr("advance/getfunction") : 'kpiDataService.getValueList';
              var type = element.$attr("advance/paramtype") ? element.$attr("advance/paramtype") : "kpi";
              serviceCenterService.getValueListBytime(ci, kpi, undefined, undefined, undefined, category, type, method, condition).then(getValueList, failure);
            });
          } else {
            run({})
          };
        }
        function getValueList(data) {
          run(data);
        };
        function failure(data) {
          run(data);
        };
        function run(data) {
          var baseOption = {
            title : {},
            series : [{}]
          };
          setParameters(baseOption, element.parameters, data);
          renderItem(baseOption);
        };
      };
      element.getCiKpi(getCiKpi_back);
    }
    if(typeof element.data.defer == 'function') {
      element.data.defer(function(){
        run();
      });
    } else {
      run();
    }
    return text;
  }
});
