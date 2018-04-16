/**
 * Created by leonlin on 16/11/3.
 */
define([], function () {
  return function (data) {
    var myChart;
    var events = {};
    var element = data.element;
    var global = data.global;
    var target = $("<div></div>");
    if (element.style) {
      target.css(element.style);
    };
    if(element.getTheme){
      var theme = element.getTheme(themeStr);
    } else {

    }
    var themeStr = element.$attr("parameters/theme");

    var expression;
    $$.runExpression(element.$attr("advance/expression"), function (funRes) {
      if (funRes.code == 0) {
        expression = funRes.data;
        expression = expression ? expression : {};
      } else {
        expression = {};
      }
    });
    var initFn = expression.$attr("on/init");
    var clickFn = expression.$attr("on/click");
    // echart渲染

    element.resize = function () {
      myChart.resize();
    };
    var requireBack = function (echarts, themeObj) {
      myChart = echarts.init($(target)[0], theme);
      element.render = function (option) {
        myChart.setOption(option);
        myChart.on("click", function (event) {
          if (clickFn) {
            clickFn({
              target: element,
              global: global,
              ui: event
            })
          }
        });
      };
      // 增加渐变的方法
      element.linearGradient = function (a,b,c,d,e) {
        return new echarts.graphic.LinearGradient(a,b,c,d,e)
      };
      element.registerMap = function (type, mapJson) {
        echarts.registerMap(type, mapJson)
      };
      if (initFn) {
        try {
          initFn({
            target: element,
            global: global,
            echarts: echarts
          })
        } catch (e) {
          console.log(e);
        }
      }
    }
    if (theme == 'default') {
      require(['echarts'], requireBack);
    } else {
      require(['echarts', theme], requireBack);
    };
    return target;
  }
  return target;
})
