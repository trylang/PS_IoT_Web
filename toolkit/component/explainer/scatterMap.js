/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  return function(data, tools, callback) {
    var series = [{
      name : "highlight",
      data : []
    },{
      name : "level0",
      data : []
    },{
      name : "level1",
      data : [],
      searchable : true
    }];
    var getLegend = function(){
      return [];
    };
    var getSeries = function(){
      return series;
    };
    var loop = function(item){
      var obj = {};
      obj.label = item.label;
      obj.name = item.values.standardAddress;
      obj.value = [item.values.longitude, item.values.latitude]
      if (item.modelId == 300 || item.modelId == 301) {
        if (item.modelId == 301) {
          obj.id = item.id;
        }
        series[1].data.push(obj);
      } else if(item.modelId == 302){
        obj.id = item.id;
        series[2].data.push(obj);
      };
    };
    for (var i in data) {
      loop(data[i]);
    }
    callback({
      getLegend : getLegend,
      getSeries : getSeries,
      data : {
        series : getSeries()
      }
    });
  }
});
