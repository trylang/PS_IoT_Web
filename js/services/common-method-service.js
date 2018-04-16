/**
 * Created by leonlin on 16/11/3.
 */
define(['../services/services.js','bootstrap-dialog', 'toolkit/date-handler'], function (services,BootstrapDialog, dateHandler) {
  'use strict';
  var WIN = window || {};
  services.factory('commonMethodService', ['$timeout', '$rootScope', '$q', '$routeParams', 'Info', 'customMethodService', 'projectUIService', 'serviceCenterService', 'dictionaryService', 'energyConsumeUIService', 'ticketTaskService', 'resourceUIService', 'viewFlexService', 'userLoginUIService', '$route', '$window', 'growl', 'kpiDataService', 'SwSocket', 'alertService', 'userDomainService', 'thridPartyApiService', 'freeboardBaseService', 'configUIService', 'serviceProxy', 'FileUploader',
    function (timeout, rootScope, q, routeParam, Info, customMethodService, projectUIService, serviceCenterService, dictionaryService, energyConsumeUIService, ticketTaskService, resourceUIService, viewFlexService, userLoginUIService, route, window, growl, kpiDataService, SwSocket, alertService, userDomainService, thridPartyApiService, freeboardBaseService, configUIService, serviceProxy, FileUploader) {
      //WIN.$cache = WIN.$cache || {};
      var clickFnDic = {}; //按钮的返回集合
      var traverseRow;
      var rootTarget;
      var events = {};
      var JSONparse = function(str){
        var json;
        if(typeof str == "object"){
          return str;
        } else {
          try {
            json = JSON.parse(str);
          } catch(e){
            json = null;
          } finally {
            return json;
          }
        };
      };
      var themeCompare = {
        default : "default",
        Cyborg : "dark",
        Slate : "dark",
        Solar : "macarons"
      }
      var cmethod = function (data) {
        if(data){
          this.$clone(data);
        };
      };
      cmethod.kpiDic = {};
      cmethod.resourceDic = {};
      /**
       * //  2D视图：柱状图（barOption）、折线图（polylineOption）、饼图（pieOption）
       *     3D视图：散点图（scatter3DOption）、柱状图（bar3DOption）、折线图（line3DOption）
       * @returns {option}
       */
      var createSystemPopup = function(object, config, data, depth){
        var cur = this;
        cur.setValue("$POPUPDATA", data);
        config = config || {};
        var renderTo = $("body");
        var showcloseBtn = config.closeBtn;
        var bgOpacity = config.bgOpacity;
        if(bgOpacity == undefined){
          bgOpacity = .1;
        }
        var themeObj = JSONparse(rootTarget.setting) || {
            theme : "default"
          };
        var theme = themeObj.theme || "default";
        var submitFn = config.$attr("on/submit");
        var cancelFn = config.$attr("on/cancel");
        var cur = this;
        var modelDia = $('<div id="bootstrap-dialog" class="modal bootstrap-dialog type-primary fade size-normal in" style="display : block;" popup_layer="popup_layer">\
        <div class="modal-dialog">\
          <div class="modal-content">\
          <div class="modal-header bg-f2 padding-bottom-20">\
          <div class="bootstrap-dialog-header">\
          <a role="button" class="close">×</a>\
        <h4 class="modal-title info-box-number"></h4>\
          </div>\
          </div>\
          <div class="modal-body no-pad-top">\
          </div>\
          </div>\
          </div>\
          </div>');
        var contentDom = modelDia.find(".modal-dialog");
        contentDom.addClass(theme);
        contentDom.css("height", "auto");
        modelDia.addClass("block");
        contentDom.css("min-height", "0");
        var content = modelDia.find("div.modal-dialog");
        var title = modelDia.find("h4");
        title.text(config.title || "标题文字");
        var outter = modelDia.find(".modal-body");
        var bg = $("<div></div>");
        var wrap = $("<div></div>");
        var closeBtn = modelDia.find("a.close");
        var span = $("<div></div>");
        modelDia.css("z-index", (depth + 1) || 10000);
        if(config.width != undefined){
          content.css("width", config.width);
        };
        var row = $("<div></div>");
        row.addClass("row");
        row.append(wrap);
        outter.append(row);
        outter.attr("id", "pp");
        wrap.css("position", "relative");
        wrap.addClass("col-md-12");
        wrap.attr("id", "popup");
        wrap.css("width", "100%");
        wrap.css("padding-top", "10px");
        var destroy = function(){
          content.animate({
            "margin-top" : 0
          }, 300, function(){
            modelDia.remove();
          });
          modelDia.animate({
            opacity : 0
          }, 100);
        }
        closeBtn.on("click", function(event){
          if(cancelFn){
            cancelFn();
          }
          destroy();
        });
        var instance = freeboardBaseService(wrap);
        instance.setMode(true);
        if(object.groups){
          object.layout = object.groups[0].layout;
          delete object.groups;
        }
        object.layout = object.layout.$remapByChild(function (element) {
          var rs = new cmethod(element);
          rs.submit = function(obj){
            if(submitFn){
              submitFn(obj);
            }
            destroy();
          };
          rs.cancel = function(){
            if(cancelFn){
              cancelFn();
            }
            destroy();
          };
          return rs;
        });
        instance.renderLayout(object);
        modelDia.addClass("block");
        modelDia.attr("id", "free-board");
        modelDia.css("opacity", 0);
        modelDia.css("position", "absolute");
        modelDia.animate({
          opacity : 1
        }, 100);
        content.css("margin-top", 0);
        content.animate({
          "margin-top" : 20
        }, 300);
        var popupLayer = $("[popup_layer]")
        if(popupLayer.size() > 0){
          popupLayer.after(modelDia)
        } else {
          renderTo.prepend(modelDia);
        };
      };
      var createPopup = function(object, config, data, depth){
        var cur = this;
        cur.setValue("$POPUPDATA", data);
        config = config || {};
        var renderTo = config.renderTo || $("body");
        var showcloseBtn = config.closeBtn;
        var bgOpacity = config.bgOpacity;
        if(bgOpacity == undefined){
          bgOpacity = .1;
        }
        var submitFn = config.$attr("on/submit");
        var cancelFn = config.$attr("on/cancel");
        var cur = this;
        var outter = $("<div></div>");
        outter.attr("popup_layer", "popup_layer");
        var bg = $("<div></div>");
        var wrap = $("<div></div>");
        var closeBtn = $("<button></button>");
        var span = $("<div></div>");
        bg.attr("id", "popup_background");
        bg.css("position", "fixed");
        bg.css("width", "100vw");
        bg.css("height", "100vh");
        bg.css("background-color", "rgba(0,0,0," + bgOpacity + ")");
        bg.css("top", 0);
        bg.css("left", 0);
        bg.css("z-index", depth || 9999);
        outter.css("z-index", (depth + 1) || 10000);
        if(renderTo == "self"){
          renderTo = cur.getSelfDom();
        }
        if(config.top != undefined){
          outter.css("top", config.top);
        }
        if(config.left != undefined){
          outter.css("left", config.left);
        }
        if(config.right != undefined){
          outter.css("right", config.right);
        }
        if(config.bottom != undefined){
          outter.css("bottom", config.bottom);
        }
        closeBtn.css("position", "absolute");
        closeBtn.css("right", 5);
        closeBtn.css("top", 5);
        closeBtn.css("z-index", 10);
        closeBtn.addClass("btn-sm btn-default");
        span.addClass("glyphicon glyphicon-remove");
        closeBtn.append(span);
        if(showcloseBtn != false){
          outter.append(closeBtn);
        }
        outter.append(wrap);
        outter.attr("id", "pp");
        wrap.css("position", "relative");
        wrap.addClass("col-md-12");
        wrap.attr("id", "popup");
        outter.css("position", "absolute");
        outter.css("width", (config.width || "400px"));
        wrap.css("width", "100%");
        wrap.css("padding", "10px");
        wrap.css("background-color", "#fff");
        wrap.css("box-shadow", "1px 1px 10px 1px rgba(0,0,0,.1)");
        var remove = function(){
          outter.animate({opacity : 0}, 200);
          outter.remove();
          bg.remove();
        }
        closeBtn.on("click", function(event){
          if(cancelFn){
            cancelFn();
          }

        });
        bg.on("click", function(event){
          if(cancelFn){
            cancelFn();
          }
          outter.remove();
          bg.remove();
        });
        var instance = freeboardBaseService(wrap);
        instance.setMode(true);
        object.layout = object.layout.$remapByChild(function (element) {
          var rs = new cmethod(element);
          rs.submit = function(obj){
            if(submitFn){
              submitFn(obj);
            }
            outter.remove();
            bg.remove();
          };
          rs.cancel = function(){
            if(cancelFn){
              cancelFn();
            }
            outter.remove();
            bg.remove();
          };
          return rs;
        });
        instance.renderLayout(object);
        renderTo.prepend(outter);
        outter.addClass("block");
        outter.css("opacity", 0);
        outter.animate({
          opacity : 1
        }, 100);
        bg.css("opacity", 0);
        bg.animate({
          opacity : 1
        }, 200);
        $("body").append(bg);
      };
      var createOverlay = function(object, config, data, depth){
        var cur = this;
        cur.setValue("$POPUPDATA", data);
        config = config || {};
        var renderTo = config.renderTo || "self";
        var bgOpacity = config.bgOpacity;
        var submitFn = config.$attr("on/submit");
        var cancelFn = config.$attr("on/cancel");
        var cur = this;
        var outter = $("<div></div>");
        var bg = $("<div></div>");
        var wrap = $("<div></div>");
        var closeBtn = $("<button></button>");
        var span = $("<div></div>");
        outter.css("z-index", (depth + 1) || 50);
        if(renderTo == "self"){
          renderTo = cur.getSelfDom();
        }
        if(config.top != undefined){
          outter.css("top", config.top);
        }
        if(config.left != undefined){
          outter.css("left", config.left);
        }
        if(config.right != undefined){
          outter.css("right", config.right);
        }
        if(config.bottom != undefined){
          outter.css("bottom", config.bottom);
        };
        outter.append(wrap);
        wrap.css("position", "relative");
        wrap.addClass("col-md-12");
        wrap.attr("id", "popup");
        outter.css("position", "absolute");
        outter.css("width", (config.width || "400px"));
        wrap.css("width", "100%");
        bg.append(outter);
        var instance = freeboardBaseService(wrap);
        instance.setMode(true);
        object.layout = object.layout.$remapByChild(function (element) {
          var rs = new cmethod(element);
          rs.submit = function(obj){
            if(submitFn){
              submitFn(obj);
            }
            outter.remove();
            bg.remove();
          };
          rs.cancel = function(){
            if(cancelFn){
              cancelFn();
            }
            outter.remove();
            bg.remove();
          };
          return rs;
        });
        instance.renderLayout(object);
        outter.addClass("block")
        renderTo.prepend(outter);
      };
      var toString = function(obj){
        if(typeof obj == "function"){
          return obj.toString();
        } else if(typeof obj == null){
          return "null";
        } else if(typeof obj == "object"){
          return JSON.stringify(obj, null, 2);
        } else if(typeof obj == "string"){
          return obj;
        } else if(typeof obj == "number"){
          return obj + "";
        } else if(typeof obj == undefined){
          return "undefined";
        } else {
          return "无效字符"
        }
      };
      cmethod.prototype.getRootScope = function(attr){
        if(attr){
          return rootScope.$$childHead[attr];
        } else {
          return rootScope.$$childHead;
        };
      };
      cmethod.prototype.topDateString = function(diff, format){
        var cur = this;
        var regexp = [{
          exp : /d+/g,
          divide : 24 * 3600 * 1000
        },{
          exp : /h+/g,
          divide : 3600 * 1000
        },{
          exp : /n+/g,
          divide : 60 * 1000
        },{
          exp : /s+/g,
          divide : 60
        }];
        var inx = 0
        var repeat = function(inx, rest){
          if(regexp[inx]) {
            var fd = regexp[inx].exp.exec(format);
            if (fd) {
              var num = Math.floor(rest / regexp[inx].divide);
              rest = rest % regexp[inx].divide;
              format = format.replace(regexp[inx].exp, num + "");
            }
            repeat(inx+1, rest);
          };
        }
        repeat(inx, diff);
        return format;
      };
      cmethod.prototype.getAttrsByModelId = function(modelId, callback){
        resourceUIService.getAttrsByModelId(modelId, function(data){
          if(data.code == 0){
            callback(data.data);
          }
        })
      }
      cmethod.prototype.getDataItemsByModelId = function(modelId, callback){
        resourceUIService.getDataItemsByModelId(modelId, function(data){
          if(data.code == 0){
            callback(data.data);
          }
        })
      }
      cmethod.prototype.dateHandler = function(dateString){
        var dh = dateHandler.init(dateString);
        return dh;
      };
      cmethod.prototype.off = function(eventName, callback){
        var str = eventName.split(".")[0];
        var cls = eventName.split(".")[1];
        if(cls){
          delete events[str][cls];
        } else {
          delete events[str];
        };
      };
      cmethod.prototype.on = function(eventName, callback){
        var str = eventName.split(".")[0];
        var cls = eventName.split(".")[1];
        if(!events[str]){
          events[str] = {};
        };
        cls = cls || "$GENERAL";
        if(!events[str][cls]){
          events[str][cls] = [];
        }
        events[str][cls].push(callback);
      };
      cmethod.prototype.trigger = function(eventName, data){
        var str = eventName.split(".")[0];
        var cls = eventName.split(".")[1];
        if(events[str]){
          if(cls){
            for(var i in events.$attr(str + "/" + cls)){
              events.$attr(str + "/" + cls)[i](data);
            };
          } else {
            for(var i in events[str]){
              for(var j in events[str][i]){
                events[str][i][j](data);
              };
            }
          }
        };
      };
      cmethod.prototype.init = function(dom, global, config) {
        var render = config.render;
        var cur = this;
        if(typeof render !== "function"){
          throw new Error("render function is needed!!");
        };
        var expression, style, parameters, initFn;
        $$.runExpression(cur.$attr("advance/expression"), function(funRes) {
          if(funRes.code == "0") {
            var fnResult = funRes.data;
            expression = fnResult ? fnResult : {};
          } else {
            expression = {};
            console.log(funRes.message);
            //throw new Error(funRes.message);
          }
        });
        initFn = expression.$attr("on/init");
        style = cur.$attr("style");
        parameters = cur.$attr("parameters");
        if(style){
          $(dom).css(style);
        }
        cur.render = function(data){
          dom.append(render(data, expression, style, parameters));
        };
        if(initFn){
          try{
            initFn({
              target : cur,
              global : global
            })
          } catch(e) {
            cur.growl(e.message);
          }
        } else {
          dom.append(render({}, expression, style, parameters));
        };
      };
      cmethod.prototype.getAlertValueList = function(callback){
        var param = ['alert',{
          category: 'ci',
          isRealTimeData: true,
          timePeriod: 0,
          kpiCodes: ["alert_code_count"]
        }];
        this.postService("kpiDataFlexService","getKpiHierarchyValueList",param,function(returnData){
          if(returnData.code == 0){
            callback(returnData);
          };
        })
      };
      cmethod.prototype.setSelfDom = function(dom){
        this.selfDom = dom;
        Object.defineProperty(this, "selfDom", {
          enumerable : false
        })
      };
      cmethod.prototype.getTheme = function(themeStr){
        if(rootTarget){
          var themeObj = JSONparse(rootTarget.setting) || {
              theme : "default"
            };
          themeStr = themeStr || "default";
          themeStr = themeStr == "auto" ? themeCompare[themeObj.theme || "default"] : themeStr;
          return themeStr;
        } else {
          return "default";
        }
      };
      cmethod.prototype.getPath = function(path){
        var find = rootTarget.groups.find(function(elem){
          return path == elem.path;
        }) || {};
        return find;
      };
      cmethod.prototype.addView = function(param, callback){
        viewFlexService.addView(param, function(event){
          if(event.code == 0){
            if(typeof callback == "function"){
              callback({
                code : 0,
                msg : param.viewTitle + "添加成功",
                data : event.data
              });
            };
          } else {
            if(typeof callback == "function"){
              callback({
                code: event.code,
                msg: param.viewTitle + "添加失败," + event.message
              });
            };
          }
        })
      };
      cmethod.prototype.updateView = function(param, callback){
        viewFlexService.updateView(param, function(event){
          if(event.code == 0){
            if(typeof callback == "function"){
              callback({
                code : 0,
                msg : param.viewTitle + "添加成功",
                data : event.data
              });
            };
          } else {
            if(typeof callback == "function"){
              callback({
                code: event.code,
                msg: param.viewTitle + "添加失败," + event.message
              });
            };
          }
        })
      }
      cmethod.prototype.getSelfDom = function(){
        return this.selfDom;
      };
      cmethod.$cache = cmethod.$cache || {};
      cmethod.prototype.getKpiDic = function(){
        return cmethod.kpiDic;
      }
      cmethod.prototype.getResourceDic = function(){
        return cmethod.resourceDic;
      }
      cmethod.prototype.getTimesByDay = function(num){
        return num * 24 * 3600 * 100;
      };
      cmethod.prototype.getEditorStatus = function(str, callback){
        var cur = this;
        cur.getConfigsByGroupName(str, function(configs){
          if(configs.length > 0){
            callback(JSON.parse(configs[0].value));
          } else {
            callback(null);
          }
        })
      };
      cmethod.prototype.getCurrentUser = function(callback){
        userLoginUIService.getCurrentUser = function(data){
          if(data.code){
            callback(data.data);
          }
        }
      }
      cmethod.prototype.saveEditorStatus = function(str, val){
        var cur = this;
        var saveConfig = function(config){
          var param = {
            label : "设计器缓存",
            value : JSON.stringify(val),
            groupName : str
          };
          if(config){
            param.id = config.id
          }
          cur.saveConfig(param, function(event){
          })
        };
        var start = function(){
          cur.getConfigsByGroupName(str, function(configs){
            if(configs.length == 0){
              saveConfig()
            } else {
              saveConfig(configs[0]);
            }
          })
        };
        cur.getAllConfigGroups(function(configGroups){
          var some = configGroups.some(function(elem){
            return elem.name == str;
          });
          if(!some){
            console.log(configGroups);
            throw new Error("设计器缓存重复添加")
            cur.saveConfigGroup({
              label : "设计器缓存",
              name : str
            }, function(event){
              start();
            })
          } else {
            start();
          }
        })
      };
      cmethod.prototype.splitData = function(valueList){
        var times = valueList.map(function(elem){
          return new Date(elem.arisingTime).getTime();
        });
        var timeSplit = times.reduce(function(a, b){
          if(a.indexOf(b) == -1){
            a.push(b);
          }
          return a;
        },[]);
        var structure = valueList.reduce(function(a, b){
          var attr = b.nodeId + ":" + b.kpiCode;
          if(!a[attr]){
            a[attr] = [];
          } else {
            a[attr].push({
              time : new Date(b.arisingTime).getTime(),
              value : b.value
            })
          }
          return a;
        },{});
        var inputEmpty = function(arr){
          var rs = [];
          for(var i in timeSplit){
            var find = arr.find(function(elem){
              return elem.time == times[i];
            })
            if(find){
              rs.push(find);
            } else {
              rs.push({
                value : '-',
                time : timeSplit[i]
              })
            }
          }
          return rs;
        };
        for(var i in structure){
          structure[i] = inputEmpty(structure[i]);
        };
        structure.times = timeSplit;
        return structure;
      };
      cmethod.prototype.createMsgBox = function(config){
        var cur = this;
        var path = "../../localdb/echartTemplate/msgbox.json";
        var run = function(data){
          createSystemPopup.call(cur, data, {
            width : config.width || "600px",
            title : config.title,
            on : config.on
          },{
            text : config.message
          }, 100002);
        };
        Info.get(path, function (template) {
          window[path] = template;
          run(window[path]);
        });
      };
      cmethod.prototype.setConsoleText = function(str){
        var cur = this;
        cur.setValue("$CONSOLELOG", "");
      };
      cmethod.prototype.console = function(obj, commontery){
        var cur = this;
        var path = "../../localdb/echartTemplate/console.json";
        var oldConsole = cur.getValue("$CONSOLELOG") || "";
        var createUnderscore = function(num){
          var rs = "";
          for(var i=0; i<num; i++){
            rs += "-"
          };
          return rs;
        };
        cur.setValue("$CONSOLELOG",  oldConsole + "//" + createUnderscore(40) + (commontery || "") + createUnderscore(40) + "\n" + "console.log = " + toString(obj) + "\n//" + createUnderscore(100) + "\n");
        var run = function(data){
          if(route.current.$$route.controller == "freeStyleCtrl"){
            createPopup.call(cur, data, {
              width : "100vw",
              bottom : 0
            },cur.getValue("$CONSOLELOG"), 100002);
          };
        };
        Info.get(path, function (template) {
          window[path] = template;
          run(window[path]);
        });
      };

      cmethod.prototype.createSystemPopupByJsonName = function(jsonName, config, dt){
        var cur = this;
        var path = "../../localdb/echartTemplate/" + jsonName + ".json";
        var run = function(data){
          createSystemPopup.call(cur, data, {
            width : config.width || "600px",
            title : config.title,
            on : config.on
          },dt, 100002);
        };
        if(!window[path]){
          Info.get(path, function (template) {
            window[path] = template;
            run(window[path]);
          });
        } else {
          run(window[path]);
        }
      }
      cmethod.prototype.console = function(obj, commontery){
        var cur = this;
        var path = "../../localdb/echartTemplate/console.json";
        var oldConsole = cur.getValue("$CONSOLELOG") || "";
        var createUnderscore = function(num){
          var rs = "";
          for(var i=0; i<num; i++){
            rs += "-"
          };
          return rs;
        };
        cur.setValue("$CONSOLELOG",  oldConsole + "//" + createUnderscore(40) + (commontery || "") + createUnderscore(40) + "\n" + "console.log = " + toString(obj) + "\n//" + createUnderscore(100) + "\n");
        var run = function(data){
          if(route.current.$$route.controller == "freeStyleCtrl"){
            createPopup.call(cur, data, {
              width : "100vw",
              bottom : 0
            },cur.getValue("$CONSOLELOG"), 100002);
          };
        };
        Info.get(path, function (template) {
          window[path] = template;
          run(window[path]);
        });
      };
      cmethod.prototype.Info = function(path, callback){
        Info.get(path, function(template) {
          callback(template)
        });
      }
      cmethod.prototype.closePopup = function(){

      }
      cmethod.prototype.getTimesByMonth = function(num){
        return num * 30 * 24 * 3600 * 100;
      };
      cmethod.prototype.setRootTarget = function(rt){
        rootTarget = rt;
      };
      cmethod.prototype.getRootTarget = function(){
        return rootTarget;
      };
      cmethod.prototype.getKpiValueList = function(ci, kpi, time, callback, extension){
        var param = {
          nodeIds : ci,
          kpiCodes : kpi,
          timePeriod : time|| 7 * 24 * 3600 * 1000
        };
        if(0==time){
          param.timePeriod=0
        }
        param = param.$extension(extension);
        kpiDataService.getKpiValList(param, function(event){
          if(event.code == 0){
            callback(event.data);
          } else {
            callback([]);
          }
        })
      };
      cmethod.prototype.getKpiValueCi = function (ci, kpi, callback, extension) {
        serviceCenterService.getValues(ci, kpi, extension).then(function (data) {
          callback(data);
        })
      };
      cmethod.prototype.createPopupBypath = function(path, config, data){
        var cur = this;
        var targetRoot = cur.getRootTarget();
        var find = targetRoot.groups.find(function(elem){
          return elem.path == path;
        });
        if (route.current.$$route.controller != "freeBoardCtrl") {
          if(find){
            var type = config.theme || "default";
            if(type == "default"){
              createPopup.call(cur, find, config, data);
            } else if(type == "system"){
              createSystemPopup.call(cur, find, config, data);
            } else {
              createPopup.call(cur, find, config, data);
            };
          };
        };
      };
      cmethod.prototype.createOverlayBypath = function(path, config, data){
        var cur = this;
        var targetRoot = cur.getRootTarget();
        var find = targetRoot.groups.find(function(elem){
          return elem.path == path;
        });
        if (route.current.$$route.controller != "freeBoardCtrl") {
          if(find){
            createOverlay.call(cur, find, config, data);
          };
        };
      };
      cmethod.prototype.getPopupData = function(){
        return this.getValue("$POPUPDATA");
      };
      cmethod.prototype.createPopupByViewId = function (id, config) {
        var cur = this;
        cur.getViewById(id, function(view){
          var json = $$.getViewContent(view);
          if(json){
            createPopup.call(cur, json, config, data);
          }
        });
      };
      cmethod.prototype.getDataHandlers = function (ci, kpi, callback, extension) {
        return [{
          id : 0,
          label : "不裁剪数据",
          text : "function init(event){\n    var global = event.global;\n    var resources = event.resourceId;\n    var kpis = event.kpiId;\n    var timePeriod = event.timePeriod;\n    var data = event.data;\n    global.fire(\"renderList\", data);\n}"
        },{
          id : 1,
          label : "适合线图的数据",
          text : "function init(source){\n  var formatter=function(elem){\n    return elem.value;\n   }\n  return source.ci.getSeries(formatter);\n}"
        },{
          id : 2,
          label : "适合饼图的数据",
          text : "function init(source){\n  var formatter=function(elem){\n    return elem.value;\n   }\n  return source.ci.getSeries(formatter);\n}"
        },{
          id : 3,
          label : "适合柱图的数据",
          text : "function init(source){\n  var formatter=function(elem){\n    return elem.value;\n   }\n  return source.ci.getSeries(formatter);\n}"
        },{
          id : 4,
          label : "适合柱图的数据",
          text : "function init(source){\n  var formatter=function(elem){\n    return elem.value;\n   }\n  return source.ci.getSeries(formatter);\n}"
        }];
      };
      cmethod.prototype.barOption = function () {
        return {
          title: {
            text: 'ECharts 入门示例'
          },
          tooltip: {},
          legend: {
            data: ['销量']
          },
          xAxis: {
            data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
          },
          yAxis: {},
          series: [{
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }]
        };
      };
      cmethod.prototype.polylineOption = function () {
        return {
          title: {
            text: '一天用电量分布',
            subtext: '纯属虚构'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          toolbox: {
            show: true,
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45']
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: '{value} W'
            },
            axisPointer: {
              snap: true
            }
          },
          visualMap: {
            show: false,
            dimension: 0,
            pieces: [{
              lte: 6,
              color: 'green'
            }, {
              gt: 6,
              lte: 8,
              color: 'red'
            }, {
              gt: 8,
              lte: 14,
              color: 'green'
            }, {
              gt: 14,
              lte: 17,
              color: 'red'
            }, {
              gt: 17,
              color: 'green'
            }]
          },
          series: [
            {
              name: '用电量',
              type: 'line',
              smooth: true,
              data: [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
              markArea: {
                data: [[{
                  name: '早高峰',
                  xAxis: '07:30'
                }, {
                  xAxis: '10:00'
                }], [{
                  name: '晚高峰',
                  xAxis: '17:30'
                }, {
                  xAxis: '21:15'
                }]]
              }
            }
          ]
        };
      };
      cmethod.prototype.pieOption = function () {
        return {
          title: {
            text: '某站点用户访问来源',
            subtext: '纯属虚构',
            x: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
          },
          series: [
            {
              name: '访问来源',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: [
                {value: 335, name: '直接访问'},
                {value: 310, name: '邮件营销'},
                {value: 234, name: '联盟广告'},
                {value: 135, name: '视频广告'},
                {value: 1548, name: '搜索引擎'}
              ],
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      };
      cmethod.prototype.scatter3DOption = function () {
        var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
          '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
        var days = ['1', '2', '3', '4', '5', '6', '7'];
        var data = [[12, 0, 10], [3, 3, 15], [4, 3, 20], [10, 1, 12], [3, 0, 14]]
        var option = {
          tooltip: {},
          visualMap: {
            right: 0,
            max: 20,
            inRange: {
              color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
          },
          xAxis3D: {
            type: 'category',
            data: hours
          },
          yAxis3D: {
            type: 'category',
            data: days
          },
          zAxis3D: {
            type: 'value'
          },
          grid3D: {
            boxWidth: 160,
            boxHeight: 40,
            boxDepth: 90,
            viewControl: {
              // projection: 'orthographic'
            },
            // environment: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            //   offset: 0, color: '#00aaff' // 天空颜色
            // }, {
            //   offset: 0.7, color: '#998866' // 地面颜色
            // }, {
            //   offset: 1, color: '#998866' // 地面颜色
            // }], false),
            splitLine: {
              show: true
            },
            axisPointer: {
              show: true
            },
            light: {
              main: {
                intensity: 1.4,
//                    shadow: true
              },
              ambient: {
                intensity: 0.3
              }
            }
          },
          series: [{
            name: "散点图",
            type: 'scatter3D',
            symbol: 'arrow',

//            data: [{
//                // 数据项的名称
//                name: '数据1',
//                // 数据项值
//                value: [12, 3, 10]
//            }, {
//                name: '数据2',
//                value: [3, 5, 15],
//                itemStyle:{
//                    color:[255, 233, 1, 0.5]
//                }
//            }],
            data: data.map(function (item) {
              return {
                value: [item[1], item[0], item[2]],
              }
            }),
            shading: 'lambert',

            label: {
              textStyle: {
                fontSize: 12,
                borderWidth: 1
              },
//                formatter: '{a}: {b}'
            },

            emphasis: {
              label: {
                textStyle: {
                  fontSize: 20,
                  color: '#900'
                }
              },
              itemStyle: {
                color: '#900'
              }
            }
          }]
        };
        return option


      };
      cmethod.prototype.bar3DOption = function () {
        var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
          '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
        var days = ['1', '2', '3', '4', '5', '6', '7'];
        var data = [[12, 0, 10], [3, 3, 15], [4, 3, 20], [10, 1, 12], [3, 0, 14]]
        var option = {
          tooltip: {},
          visualMap: {
            max: 20,
            inRange: {
              color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
          },
          xAxis3D: {
            type: 'category',
            data: hours
          },
          yAxis3D: {
            type: 'category',
            data: days
          },
          zAxis3D: {
            type: 'value'
          },
          grid3D: {
            boxWidth: 200,
            boxHeight: 40,
            boxDepth: 90,
            light: {
              main: {
                intensity: 1.2
              },
              ambient: {
                intensity: 0.3
              }
            }
          },
          series: [{
            type: 'bar3D',
            data: data.map(function (item) {
              return {
                value: [item[1], item[0], item[2]]
              }
            }),
            shading: 'color',

            label: {
              show: false,
              textStyle: {
                fontSize: 16,
                borderWidth: 1
              }
            },

            itemStyle: {
              opacity: 0.8
            },

            emphasis: {
              label: {
                textStyle: {
                  fontSize: 20,
                  color: '#900'
                }
              },
              itemStyle: {
                color: '#900'
              }
            }
          }]
        };
        return option
      };
      cmethod.prototype.line3DOption = function () {
        var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a','7a', '8a', '9a', '10a', '11a',
          '12p', '1p', '2p', '3p', '4p', '5p','6p', '7p', '8p', '9p', '10p', '11p'];
        var days = ['1', '2', '3','4', '5', '6', '7'];
        var data = [[12, 0, 10], [3, 3, 15], [4, 3, 20], [10, 1, 12], [3, 0, 14]]
        var option = {
          tooltip: {},
          visualMap: {
            max: 20,
            inRange: {
              color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
          },
          xAxis3D: {
            type: 'category',
            data: hours
          },
          yAxis3D: {
            type: 'category',
            data: days
          },
          zAxis3D: {
            type: 'value'
          },
          grid3D: {
            boxWidth: 180,
            boxHeight: 40,
            boxDepth: 90,
            light: {
              main: {
                intensity: 1.2
              },
              ambient: {
                intensity: 0.3
              }
            }
          },
          series: [{
            type: 'line3D',
            data: data.map(function (item) {
              return {
                value: [item[1], item[0], item[2]]
              }
            }),
            shading: 'color',

            label: {
              show: false,
              textStyle: {
                fontSize: 16,
                borderWidth: 1
              }
            },

            itemStyle: {
              opacity: 0.8
            },

            emphasis: {
              label: {
                textStyle: {
                  fontSize: 20,
                  color: '#900'
                }
              },
              itemStyle: {
                color: '#900'
              }
            }
          }]
        };
        return option
      };
      cmethod.prototype.copyToClipBoard = function(dom, str, callback){
        dom.attr("data-clipboard-text", str);
        setTimeout(function(){
          $$.loadExternalJs(['clipboard'], function(Clipboard){
            var clipboard = new Clipboard(dom[0]);
            clipboard.on('success', function(e) {
              console.log("success");
              if(callback){
                callback();
              }
              e.clearSelection();
            });
            clipboard.on('error', function(e) {
              console.log(e);
              console.error('Action:', e.action);
              console.error('Trigger:', e.trigger);
            });
          });
        });
      };
      cmethod.prototype.getIcons = function(callback){
        var path = "../../localdb/bootstrapIcon.json";
        Info.get(path, function (icons) {
          callback(icons);
        });
      };
      cmethod.prototype.getCtrlGroupDemos = function () {
        return [{
          label: "普通文字",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var ctrlGroups = [\n       [{\n          type : \"label\",\n          value : \"普通标签\",\n          class : \"col-md-12\"\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        },{
          label: "基本按钮",
          expression : 'expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var ctrlGroups = [\n       [{\n          type : "button",\n          value : "按钮",\n          icon : "glyphicon glyphicon-search",\n          btnclass : "btn btn-primary",\n          class : "col-md-12",\n          on : {\n            click : function(elem){\n              target.console(elem);\n            }\n          }\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}'
        },{
          label: "按钮组",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var ctrlGroups = [\n        [{\n          type : \"buttonGroup\",\n          class : \"col-md-12\",\n          content : [{\n            type : \"button\",\n            value : \"保存\",\n            icon : \"glyphicon glyphicon-save\",\n            btnclass : \"btn btn-primary\",\n            on : {\n              click : function(elem){\n              }\n            }\n          },{\n            type : \"button\",\n            value : \"取消\",\n            icon : \"glyphicon glyphicon-remove\",\n            btnclass : \"btn btn-default\",\n            on : {\n              click : function(elem){\n              }\n            }\n          }]\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        },{
          label: "复制粘贴按钮",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var ctrlGroups = [\n       [{\n          type : \"clipboardButton\",\n          value : \"复制到剪切板\",\n          icon : \"glyphicon glyphicon-save\",\n          btnclass : \"btn btn-primary\",\n          clipboardText : \"123456\",\n          class : \"col-md-12\",\n          on : {\n            save : function(elem){\n              target.growl(\"保存到剪切板\");\n            }\n          }\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        },{
          label: "单选下拉框",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var options = [{\n        id : 0,\n        label : \"第一条\"\n      },{\n        id : 1,\n        label : \"第二条\"\n      }];\n      var ctrlGroups = [\n        [{\n          type : \"select\",\n          value : 0,\n          class : \"col-md-12\",\n          options : options,\n          format : {\n            id : \"id\",\n            label : \"label\"\n          },\n          on : {\n            change : function(elem){\n              console.log(elem.value)\n            }\n          }\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        },{
          label: "多选下拉框",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var options = [{\n        id : 0,\n        label : \"第一条\"\n      },{\n        id : 1,\n        label : \"第二条\"\n      }];\n      var ctrlGroups = [\n        [{\n          type : \"multiSelect\",\n          value : 0,\n          class : \"col-md-12\",\n          options : options,\n          format : {\n            id : \"id\",\n            label : \"label\"\n          },\n          on : {\n            change : function(elem){\n              console.log(elem.value)\n            }\n          }\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        },{
          label: "数结构下拉框",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var ctrlGroups = [\n       [{\n          type : \"clipboardButton\",\n          value : \"复制到剪切板\",\n          icon : \"glyphicon glyphicon-save\",\n          btnclass : \"btn btn-primary\",\n          clipboardText : \"123456\",\n          class : \"col-md-12\",\n          on : {\n            save : function(elem){\n              target.growl(\"保存到剪切板\");\n            }\n          }\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        },{
          label: "自动搜索下拉框",
          expression : "expression = {\n  on : {\n    init : function(event){\n      var target = event.target;\n      var global = event.global;\n      var ctrlGroups = [\n       [{\n          type : \"clipboardButton\",\n          value : \"复制到剪切板\",\n          icon : \"glyphicon glyphicon-save\",\n          btnclass : \"btn btn-primary\",\n          clipboardText : \"123456\",\n          class : \"col-md-12\",\n          on : {\n            save : function(elem){\n              target.growl(\"保存到剪切板\");\n            }\n          }\n        }]\n      ];\n      event.target.render(ctrlGroups);\n    }\n  }\n}"
        }]

      };
      cmethod.prototype.triggerSocket = function(config) {
        SwSocket.simuSend(config);
      };
      cmethod.prototype.getToolsMenu = function () {
        /**
        return [{
          label: "API调用",
          path: "apicall"
        }, {
          label: "绘制自定义视图",
          path: "drawechart"
        }, {
          label: "根据ID查询设备模型信息",
          path: "idSelector"
        }, {
          label: "SCP路径",
          path: "scp"
        },{
          label: "项目模版",
          url: "projectlist"
        },{
          label: "图标样式",
          url: "icon"
        }];*/
        return [{
          label: "API调用",
          url: "apiCall"
        }, {
          label: "绘制自定义视图",
          path: "drawechart"
        }, /*{
          label: "根据ID查询设备模型信息",
          path: "idSelector"
        }, */{
          label: "SCP路径",
          url: "scp"
        },{
          label: "项目模版",
          url: "projectlist"
        },{
          label: "图标样式",
          url: "icon"
        },{
          label: "JS代码转换字符串",
          url: "jstostring"
        },{
          label: "批量导出导入视图或配置项",
          url: "export"
        },{
          label: "输入框组",
          url: "ctrlGroupDemo"
        }]
      };
      cmethod.prototype.getHelpMenu = function () {
        return [{
          label: "布局设置",
          pdf: "layout"
        }, {
          label: "组件",
          url: "control",
          children: [{
            label: "常用组件",
            url: "common_ctrl",
            children: [{
              label: "文字",
              pdf: "text"
            }, {
              label: "图片",
              pdf: "image"
            }, {
              label: "控制板1",
              pdf: "control1"
            }, {
              label: "控制板2",
              pdf: "control2"
            }, {
              label: "TAB",
              pdf: "tab"
            }, {
              label: "开关",
              pdf: "switch"
            }]
          }, {
            label: "功能组件",
            url: "functional_ctrl",
            children: [{
              label: "天气信息",
              pdf: "weather"
            }]
          }, {
            label: "视图组件",
            url: "echart_ctrl",
            children: [{
              label: "线图",
              pdf: "line"
            }, {
              label: "饼图",
              pdf: "pie"
            }, {
              label: "柱图",
              pdf: "bar"
            }, {
              label: "仪表盘",
              pdf: "gauge"
            }, {
              label: "散点图",
              pdf: "scatter",
              show: false
            }]
          }, {
            label: "高级组件",
            url: "advance_ctrl",
            children: [{
              label: "地图扩展",
              pdf: "baidumap"
            }, {
              label: "视图嵌入",
              pdf: "injector"
            }, {
              label: "轮播组件",
              pdf: "echart_ctrl"
            }, {
              label: "高级图表",
              pdf: "advance_ctrl"
            }, {
              label: "输入框组",
              pdf: "ctrlgroup"
            }, {
              label: "伪TAB样式",
              pdf: "faketab"
            }, {
              label: "重复单元",
              pdf: "repeat"
            }]
          }]
        }, {
          label: "功能模块",
          url: "tool",
          children: [{
            label: "数据统计标签",
            pdf: "advance_ctrl"
          }, {
            label: "百分比状态条",
            pdf: "advance_ctrl"
          }, {
            label: "环比标签",
            pdf: "advance_ctrl"
          }, {
            label: "项目组态",
            pdf: "advance_ctrl"
          }, {
            label: "设备（列表）",
            pdf: "advance_ctrl"
          }, {
            label: "工单（列表）",
            pdf: "advance_ctrl"
          }, {
            label: "告警（列表）",
            pdf: "advance_ctrl"
          }, {
            label: "线图模板",
            pdf: "advance_ctrl"
          }, {
            label: "告警趋势",
            pdf: "advance_ctrl"
          }, {
            label: "设备分布",
            pdf: "advance_ctrl"
          }, {
            label: "地图分布",
            pdf: "advance_ctrl"
          }, {
            label: "设备地图列表",
            pdf: "advance_ctrl"
          }, {
            label: "最近一周告警",
            pdf: "advance_ctrl"
          }]
        }, {
          label: "导入视图",
          pdf: "import"
        }, {
          label: "实例",
          url: "example",
          show: false
        }, {
          label: "API",
          pdf: "commonMethod"
        }]
      };
      cmethod.prototype.getSignalShipInfo = function (id, callback) {
        thridPartyApiService.getSignalShipInfo(id, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getManyShipInfo = function (ids, callback) {
        thridPartyApiService.getManyShipInfo(ids, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getShipTrack = function (id, start, end, callback) {
        thridPartyApiService.getShipTrack(id, start, end, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getAllConfigs = function (callback) {
        configUIService.getAllConfigs(function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getAllConfigGroups = function (callback) {
        configUIService.getAllConfigGroups(function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getConfigsByGroupName = function (configGroupName, callback) {
        configUIService.getConfigsByGroupName(configGroupName, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.saveConfig = function (config, callback) {
        console.log(config)
        configUIService.saveConfig(config, function (event) {
          if(event.code == 0){
            if(typeof callback == "function"){
              callback({
                code : 0,
                msg : config.label + "添加成功"
              });
            };
          } else {
            if(typeof callback == "function"){
              callback({
                code: event.code,
                msg: config.label + "添加失败,原因" + event.message
              });
            };
          }
        });
      };
      cmethod.prototype.saveConfigGroup = function (configGroup, callback) {
        configUIService.saveConfigGroup(configGroup, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.deleteConfig = function (configId, callback) {
        configUIService.deleteConfig(configId, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.deleteConfigGroup = function (groupId, callback) {
        configUIService.deleteConfigGroup(groupId, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.createInfoHtml = function (obj) {
        var str = "";
        // var str = obj.label + "<br><hr/>";
        window.onclickHandler = function (event) {
          var key = event.target.id + "&" + event.target.name
          if (clickFnDic[key]) {
            clickFnDic[key](event.target.name);
          }
        };
        var createContent = function (cont) {
          return "<label><span>" + cont.label + ":</span><span>" + cont.value + "</span></label><br>";
        };
        var createButton = function (cont) {
          var clickFn = cont.$attr("on/click");
          var key = cont.label + "&" + cont.value;
          clickFnDic[key] = clickFn;
          var dataBtn = "<button id='" + cont.label + "' name='" + cont.value + "' onclick='onclickHandler(event)'>" + cont.label + "</button>";
          //var dataBtn = "<button id='"+cont.label+"' onclick='fnOK("+cont.value+")'>"+cont.label +"</button>";
          return dataBtn;
        };
        for (var i in obj.content) {
          if (!obj.content[i].type || obj.content[i].type == "label") {
            str += createContent(obj.content[i]);
          } else if (obj.content[i].type == "button") {
            str += createButton(obj.content[i]);
          }
        };
        return str;
      }
      cmethod.prototype.createShipShape = function (width, length, trailWidth, trailLength, headWidth, headLength) {
        var RIGHTOFFSET = .1;
        var leftBottomPoint = [(-width / 2) * trailWidth, -length / 2];
        var rightBottomPoint = [(width / 2) * trailWidth, -length / 2];
        var rightBottomPoint_1 = [(1 - RIGHTOFFSET) * width / 2, (trailLength / 2 - 1) * length / 2];
        var rightlowerPoint = [width / 2, (trailLength - 1) * length / 2];
        var rightupperPoint = [width / 2 * 1.4, (1 / 2 - headLength) * length];
        var rightupperPoint_1 = [(headWidth) / 2 * width, (1 / 2 - headLength / 3) * length];
        var topPoint1 = [width * .1, length / 2 * .99];
        var topPoint = [0, length / 2];
        var topPoint2 = [-width * .1, length / 2 * .99];
        var leftupperPoint_1 = [-(headWidth) / 2 * width, (1 / 2 - headLength / 3) * length];
        var leftupperPoint = [-width / 2 * 1.4, (1 / 2 - headLength) * length];
        var leftlowerPoint = [-width / 2, (trailLength - 1) * length / 2];
        var leftBottomPoint_1 = [-(1 - RIGHTOFFSET) * width / 2, (trailLength / 2 - 1) * length / 2];
        return [leftBottomPoint, rightBottomPoint, rightBottomPoint_1, rightlowerPoint,
          rightupperPoint, rightupperPoint_1, topPoint1, topPoint, topPoint2, leftupperPoint_1,
          leftupperPoint, leftlowerPoint, leftBottomPoint_1, leftBottomPoint];
      };
      cmethod.prototype.asyncCall = function (arr) {
      };
      cmethod.prototype.asyncRepeat = function (repeatCall, finish) {
        var self = this;
        var inx = 0;
        var repeat = function (inx) {
          if (self[inx]) {
            repeatCall(inx, self[inx], function () {
              inx++;
              repeat(inx);
            })
          } else {
            finish();
          }
        };
        repeat(inx)
      };
      cmethod.prototype.queryDomainTree = function (callback, isArryLike) {
        userDomainService.queryDomainTree(userLoginUIService.user.userID, function (event) {
          var $TreeObj = function (data) {
            this.$clone(data);
          };
          var treeObjToArr = function (data) {
            var result = [];
            var traverse = function (item, parent, level) {
              var to = new $TreeObj(item);
              to.parent = parent;
              to.level = level;
              result.push(to);
              for (var i in item.domainInfos) {
                var m = level + 1;
                traverse(item.domainInfos[i], item, m);
              }
            };
            traverse(event.data[0], null, 0);
            return result;
          };
          if (event.code) {
            if (isArryLike) {
              var to = treeObjToArr(event.data[0]);
              callback(to);
            } else {
              callback(event.data);
            }
          }
          ;
        })
      };
      cmethod.prototype.getAlertColor = function (str) {
        var color = "";
        switch (str) {
          case 4 :
            color = "#e7675d";
            break;
          case 3 :
            color = "#ed9700";
            break;
          case 2 :
            color = "#e1cd0a";
            break;
          case 1 :
            color = "#25bce7";
            break;
          default :
            color = "#4db6ac";
            break;
        }
        //console.log(color);
        return color;
      };
      cmethod.prototype.getCurrentDomainCi = function (callback) {
        var domainPath = userLoginUIService.user.domains;
        var domainId;
        var arr = domainPath.split("/");
        if (arr.length > 1) {
          domainId = arr[arr.length - 2];
        }
        $$.cacheAsyncData.call(resourceUIService.getResourceById, [domainId], function (event) {
          if (event.code == 0) {
            callback(event.data)
          }
        });
        /**
         resourceUIService.getResourceById(domainId, function(event){
      if(event.code == 0){
        callback(event.data)
      }
    })*/
      };
      cmethod.prototype.getDevicesByCondition = function (params, callback) {
        resourceUIService.getDevicesByCondition(params, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getCurrentDevices = function (callback) {
        this.getCurrentProject(function (project) {
          if (project) {
            var domainPath = project.domainPath;
            var params = {
              projectId: project.id
            };
            resourceUIService.getDevicesByCondition(params, function (event) {
              if (event.code == 0) {
                callback(event.data);
              }
            });
            /*
             $$.cacheAsyncData.call(resourceUIService.getDevicesByCondition, [params], function(event){
             if(event.code == 0){
             callback(event.data)
             }
             });*/
            /**
             resourceUIService.getDevicesByCondition(params, function(event){
          if(event.code == 0){
            callback(event.data);
          }
        });*/
          } else {
            callback([]);
          }
          ;
        });
      };
      cmethod.prototype.getCurrentResource = function (callback) {
        var id = this.getParameter("resourceId");
        if (id) {
          resourceUIService.getResourceById(id, function (event) {
            if (event.code == 0) {
              callback(event.data);
            }
          });
        } else {
          if (routeParam.resourceId) {
            id = routeParam.resourceId;
            $$.cacheAsyncData.call(resourceUIService.getResourceById, [id], function (event) {
              if (event.code == 0) {
                callback(event.data)
              }
            });
          } else {
            callback(null);
          }
        }
      };
      cmethod.prototype.getCurrentProject = function (callback) {
        var id = this.getParameter("projectId");
        if (id) {
          $$.cacheAsyncData.call(resourceUIService.getResourceById, [id], function (event) {
            if (event.code == 0) {
              callback(event.data)
            }
          });
          /**
           resourceUIService.getResourceById(id, function(event){
        if(event.code == 0){
          callback(event.data)
        }
      })*/
        } else {
          callback(null);
        }
      };
      cmethod.prototype.getCurrentCustomer = function (callback) {
        var id = this.getParameter("customerId");
        if (id) {
          $$.cacheAsyncData.call(resourceUIService.getResourceById, [id], function (event) {
            if (event.code == 0) {
              callback(event.data)
            }
          });
          /**
           resourceUIService.getResourceById(id, function(event){
        if(event.code == 0){
          callback(event.data)
        }
      })*/
        } else {
          callback(null);
        }

      };
      cmethod.prototype.getCiKpi = function (callback) {
        var model = this.$attr("data/model");
        var resources = this.$attr("data/resource");
        var modelType = this.$attr("data/modelType");
        var resfilltype = this.$attr("data/resfilltype");
        var kpis = this.$attr("data/kpi");
        resources = resources ? resources : [];
        kpis = kpis ? kpis : [];
        var cur = this, defers = [], res = [], ks = [];
        var getKpis = function () {
          var some = kpis.some(function (element) {
            return typeof element != "object";
          });
          if (some) {
            var modelId;
            if (modelType == 0 || modelType == undefined) {
              modelId = model.id;
            } else {
              modelId = modelType;
            }
            if (modelId) {
              $$.cacheAsyncData.call(resourceUIService.getDataItemsByModelId, [modelId], function (event) {
                if (event.code == 0) {
                  ks = event.data.filter(function (elem) {
                    return kpis.indexOf(elem.id) != -1;
                  });
                  callback(res, ks);
                }
              });
              /**
               resourceUIService.getKpisByModelId(modelId, function(event){
            if(event.code == 0){
              ks = event.data.filter(function(elem){
                return kpis.indexOf(elem.id) != -1;
              });
              callback(res, ks);
            }
          })*/
            } else {
              throw new Error("modelId is no avaliable!!!");
            }
          } else {
            ks = kpis;
            callback(res, ks);
          }
        };
        if (resources.length == 1 && resources[0] == "rootCi") {
          this.$attr("data/modelType", 300);
          this.$attr("data/resfilltype", "parameter");
          this.$attr("data/resource", []);
          modelType = 300;
          resfilltype = "parameter";
        }
        if (resfilltype == "parameter") {
          if (modelType == 300) {
            cmethod.prototype.getCurrentDomainCi(function (ci) {
              res = [ci];
              getKpis();
            })
          } else if (modelType == 0) {
            cmethod.prototype.getCurrentResource(function (ci) {
              res = ci ? [ci] : [];
              getKpis();
            })
          } else if (resfilltype == 301) {
            cmethod.prototype.getCurrentCustomer(function (ci) {
              res = ci ? [ci] : [];
              getKpis();
            })
          } else if (modelType == 302) {
            cmethod.prototype.getCurrentProject(function (ci) {
              res = ci ? [ci] : [];
              getKpis();
            })
          } else if (modelType == 303) {
            cmethod.prototype.getCurrentDomainCi(function (ci) {
              res = ci ? [ci] : [];
              getKpis();
            })
          } else {
            cmethod.prototype.getCurrentDomainCi(function (ci) {
              res = ci ? [ci] : [];
              getKpis();
            })
          }
        } else {
          var getResource = function (resource) {
            var defer = q.defer();
            if (typeof resource != "object") {
              cur.getResourceById(resource, function (data) {
                res.push(data);
                defer.resolve("success");
              })
            } else {
              res.push(resource);
              defer.resolve("success");
            }
            return defer.promise;
          };
          for (var i in resources) {
            defers.push(getResource(resources[i]));
          }
          q.all(defers).then(function (event) {
            getKpis();
          });
        }
        ;
      };
      cmethod.prototype.copyJSONFileToClipBoard = function () {
        var json = JSON.stringify(wholeJSON);
      };
      cmethod.prototype.postService = function (service, method, param, callback) {
        serviceProxy.get(service, method, param, callback);
      };
      cmethod.prototype.getLatestDevices = function (callback) {
        resourceUIService.getLatestDevices(function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getTicketsByStatus = function (callback) {
        ticketTaskService.getTicketsByStatus([100], function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.energyTypeList = function (callback) {
        var data = dictionaryService.dicts['energyType'];
        if (callback) {
          callback(data);
        }
      };
      cmethod.prototype.getDevicesByFilter = function (filter, callback) {
        var params = {
          modelId: filter.modelId,
          domainPath: filter.domainPath,
          label: filter.deviceName,
          sn: filter.sn
        };
        resourceUIService.getDevicesByCondition(params, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        });
      };
      cmethod.prototype.getCurrentAlert = function (callback) {
        var resourceId = this.getParameter("resourceId");
        if (resourceId) {
          alertService.queryFromDb({
            nodeIds: resourceId
          }, function (event) {
            if (event.code == 0) {
              callback(event.data);
            }
          })
        } else {
          callback([]);
        };
      };
      cmethod.prototype.getAllAlerts = function (callback) {
        alertService.queryFromDb({}, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getAlerts = function (callback) {
        var domainPath = userLoginUIService.user.domainPath;
        alertService.queryFromDb({domain: domainPath}, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.queryFromDb = function (param, callback) {
        alertService.queryFromDb(param, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.setExpression = function(str){
        this.$attr("advance/expression", str);
      }
      cmethod.prototype.runExpression = function(str){
        var expression;
        $$.runExpression(str, function(funRes) {
          if(funRes.code == "0") {
            var fnResult = funRes.data;
            expression = fnResult ? fnResult : {};
          } else {
            expression = {};
            //throw new Error(funRes.message);
          }
        });
        return expression;
      };
      cmethod.prototype.getCustomerFromCurrentUser = function (callback) {
        var cur = this;
        var domains = userLoginUIService.user.domains;
        var customerId;
        var arr = domains.split("/");
        if (arr.length > 2) {
          customerId = arr[arr.length - 2];
          cur.getResourceById(customerId, function (resource) {
            callback(resource);
          })
        } else {
          callback(resource);
        }
      };
      cmethod.prototype.getCurrentAlertByProject = function (callback) {
        var resourceId = this.getParameter("projectId");
        alertService.queryFromDb({
          nodeIds: resourceId
        }, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.currentDirective = function (callback) {
        var resId = this.getParameter("resourceId");
        if (resId) {
          this.getResourceById(resId, function (resource) {
            if (resource) {
              var modelId = resource.modelId;
              if (modelId) {
                resourceUIService.getDirectivesByModelId(modelId, function (event) {
                  if (event.code == 0) {
                    callback(event.data);
                  }
                  ;
                })
              } else {
                callback([]);
              }
              ;
            } else {
              callback([]);
            }
            ;
          });
        } else {
          callback([]);
        }
      };
      cmethod.prototype.getProjectByTYpeId = function (projectTypeId, callback) {
        customMethodService.getProjectsType(function (event) {
          if (event.code == 0) {
            var projectType = event.data.find(function (elem) {
              return projectTypeId == elem.id;
            });
            if (projectType == undefined) {
              projectType = event.data[0];
            }
            resourceUIService.getResourceByModelId(302, function (event) {
              if (event.code == 0) {
                var find = event.data.find(function (el) {
                  return el.values.projectType == projectType.valueCode;
                });
                if (typeof callback == "function") {
                  callback(find);
                } else {
                  console.log("请配置回调函数");
                }
              }
            });
          }
        })
      };
      cmethod.prototype.getViewById = cmethod.prototype.getViewByViewId = function (viewId, callback) {
        if (viewId) {
          viewFlexService.getViewById(viewId, function (event) {
            if (event.code == 0) {
              callback(event.data);
            }
          })
        } else {
          callback(null);
        }
      };
      cmethod.prototype.getProjectsType = function (callback, domains) {
        customMethodService.getProjectsType(function (event) {
          if (event.code == 0) {
            if (typeof callback == "function") {
              callback(event.data);
            } else {
              console.log("请配置回调函数");
            }
          }
        }, domains)
      };
      cmethod.prototype.getCached = function(){
        return cmethod.$cache;
      };
      cmethod.prototype.setValue = function (attr, value) {
        //console.log("setValue", attr, value);
        cmethod.$cache.$attr(attr, value);
      };
      cmethod.prototype.getValue = function (attr) {
        //console.log("getValue", attr);
        return cmethod.$cache.$attr(attr);
      };
      cmethod.prototype.deleteValue = function (attr, value) {
        delete cmethod.$cache[attr];
      };
      cmethod.prototype.findProjectsByCondition = function (param, callback) {
        projectUIService.findProjectsByCondition(param, function (event) {
          if (event.code == 0) {
            if (callback) {
              callback(event.data);
            }
          }
        })
      };
      cmethod.prototype.getCurrentProjects = function (callback) {
        var param = {
          domainPath: userLoginUIService.user.domainPath
        };
        projectUIService.findProjectsByCondition(param, function (event) {
          if (event.code == 0) {
            if (callback) {
              callback(event.data);
            }
          }
        })
      };
      cmethod.prototype.getViewsByOnlyRole = function (viewType, resourceType, resourceId, callback) {
        viewFlexService.getViewsByOnlyRole(viewType, function (event) {
          var views = event.data;
          /** 为防止同一模型有相同的视图被授权，在这里取VIEWID */
          var loop = function (view) {
            if (view.template && view.template.resourceType == resourceType && view.template.resourceId == resourceId) {
              viewFlexService.getViewById(view.viewId, function (event) {
                if (event.code == 0) {
                  callback(event.data);
                } else {
                  callback(null);
                }
              });
            }
            ;
          };
          for (var i in views) {
            loop(views[i])
          }
          /**
           var find = views.find(function(view){
        return view.template && view.template.resourceType == resourceType && view.template.resourceId == resourceId;
      });
           if(find){
        viewFlexService.getViewById(find.viewId, function(event){
          if(event.code == 0){
            callback(event.data);
          } else {
            callback(null);
          }
        })
      };*/
        });
      };
      cmethod.prototype.getManagedViewsByTypeAndRole = function (viewType, resourceType, resourceId, callback) {
        viewFlexService.getManagedViewsByTypeAndRole(viewType, function (event) {
          var views = event.data;
          /** 为防止同一模型有相同的视图被授权，在这里取VIEWID */
          var loop = function (view) {
            if (view.template && view.template.resourceType == resourceType && view.template.resourceId == resourceId) {
              viewFlexService.getViewById(view.viewId, function (event) {
                if (event.code == 0) {
                  callback(event.data);
                } else {
                  callback(null);
                }
              });
            }
            ;
          };
          for (var i in views) {
            loop(views[i])
          }
          /**
           var find = views.find(function(view){
        return view.template && view.template.resourceType == resourceType && view.template.resourceId == resourceId;
      });
           if(find){
        viewFlexService.getViewById(find.viewId, function(event){
          if(event.code == 0){
            callback(event.data);
          } else {
            callback(null);
          }
        })
      };*/
        });
      };
      cmethod.prototype.growl = function (str, fun) {
        fun = fun || "success"
        growl[fun](str);
      };
      cmethod.prototype.sendDirective = function (nodeId, dirId, data, callback) {
        resourceUIService.sendDeviceDirective(nodeId, dirId, data, function (returnObj) {
          if (returnObj.code == 0) {
            if (typeof callback == "function") {
              callback(returnObj);
            } else {
              console.log("callback is not defined");
            }
            //growl.success("指令发送成功", {});
          }
        });
      };
      cmethod.prototype.sendItemDir = function (dir, nodeId) {
        var itemDirValues = {};
        if (!dir.value) {
          growl.warning("请输入指令参数");
          return;
        }
        for (var i in dir.params) {
          var obj = dir.params[i];
          itemDirValues[obj.name] = dir.value;
        }
        BootstrapDialog.show({
          title: '提示',
          closable: false,
          message: '您发送的指令将会在设备上执行，状态数据返回会有一段时间，确认要发送指令吗？',
          buttons: [{
            label: '确定',
            cssClass: 'btn-success',
            action: function(dialogRef) {
              resourceUIService.sendDeviceDirective(nodeId ? nodeId : Number(this.getParameter("resourceId")), dir.id, itemDirValues, function (returnObj) {
                if (returnObj.code == 0) {
                  growl.success("指令发送成功，请勿重复发送，状态数据返回需要一定时间！", {});
                }
              });
              dialogRef.close();
            }
          }, {
            label: '取消',
            action: function(dialogRef) {
              dialogRef.close();
            }
          }]
        });

      };
      cmethod.prototype.sendItemDirAll = function (dir) {
        var itemDirValues = {};
        for (var i in dir.params) {
          var obj = dir.params[i];
          if (dir.params[i].$value) {
            itemDirValues[obj.name] = dir.params[i].$value;
          }
        }
        resourceUIService.sendDeviceDirective(Number(this.getParameter("resourceId")), dir.id, itemDirValues, function (returnObj) {
          if (returnObj.code == 0) {
            growl.success("指令发送成功", {});
          }
        });
      };
      cmethod.prototype.sendItemDirByValue = function (id, params) {
        resourceUIService.sendDeviceDirective(Number(this.getParameter("resourceId")), id, params, function (returnObj) {
          if (returnObj.code == 0) {
            growl.success("指令发送成功", {});
          }
        });
      };
      cmethod.prototype.getAllDevices = function () {

      };
      cmethod.prototype.getViewByViewTitle = function (viewTitle, callback) {
        viewFlexService.getAllMyViews(function (event) {
          var views = event.data;
          var find = views.find(function (view) {
            return view.viewTitle == viewTitle;
          });
          if (find) {
            viewFlexService.getViewById(find.viewId, function (event) {
              if (event.code == 0) {
                callback(event.data);
              }
            })
          } else {
            callback(null);
          }
        })
      };
      cmethod.prototype.getResources = function (callback) {
        resourceUIService.getResources(function (event) {
          if (event.code == 0) {
            if (typeof callback == "function") {
              callback(event.data);
            } else {
              console.log("请配置回调函数");
            }
            ;
          }
          ;
        });
      };
      cmethod.prototype.getProjectsAndKpiValue = function (callback) {
        var cur = this;
        cur.findProjectsByCondition({}, function (projects) {
          var cis = [];
          var kpis = [999999];
          var pushDiff = function (arr) {
            for (var i in arr) {
              if (this.indexOf(arr[i]) == -1) {
                this.push(arr[i]);
              }
            }
          }
          var sloop = function (arr, rptback, callback) {
            var inx = 0;
            var repeat = function (inx) {
              var item = arr[inx];
              if (item) {
                rptback(item, function () {
                  inx++;
                  repeat(inx);
                });
              } else {
                callback(arr);
              }
            }
            repeat(inx);
          };
          var traverse = function (callback) {
            var cur = this;
            for (var i in cur) {
              for (var j in cur[i].devices) {
                callback(cur[i], j, cur[i].devices[j]);
              }
            }
          }
          sloop(projects, function (project, callback1) {
            cur.getDevicesByCondition({
              projectId: project.id
            }, function (devices) {
              project.devices = devices;
              var devis = devices.map(function (elem) {
                return elem.id
              });
              pushDiff.call(cis, devis);
              sloop(devices, function (device, callback2) {
                var modelId = device.modelId;
                cur.getKpisByModelId(modelId, function (kpiDes) {
                  var kpiMaps = kpiDes.map(function (elem) {
                    return elem.id;
                  });
                  pushDiff.call(kpis, kpiMaps);
                  device.kpis = kpiDes;
                  callback2();
                })
              }, function () {
                callback1();
              })
            })
          }, function () {
            cur.getKpiValueCi(cis, kpis, function (valuelist) {
              traverse.call(projects, function (project, inx, device) {
                if (project.detail == undefined) {
                  project.detail = [];
                }
                ;
                var loop = function (kpi) {
                  var find = valuelist.find(function (el) {
                    return el.nodeId == device.id && el.kpiCode == kpi.id;
                  });
                  var alertFind = valuelist.find(function (el) {
                    return el.nodeId == device.id && el.kpiCode == 999999 && el.instance == kpi.id;
                  });
                  project.detail.push({
                    ci: {
                      label: device.label
                    },
                    kpi: {
                      label: kpi.label,
                      icon: kpi.icon ? kpi.icon : "proudsmart ps-system"
                    },
                    status: alertFind ? alertFind.value : 0,
                    value: find ? find.value : "-"
                  });
                }
                for (var i in device.kpis) {
                  loop(device.kpis[i]);
                }
                ;
              });
              callback(projects);
            }, {
              "includeInstance": true
            })
          });
        });
      };
      cmethod.prototype.getResourceByModelId = function (id, callback) {
        resourceUIService.getResourceByModelId(id, function (event) {
          if (event.code == 0) {
            if (typeof callback == "function") {
              callback(event.data);
            } else {
              console.log("请配置回调函数");
            }
            ;
          }
          ;
        });
      };
      cmethod.prototype.getProTypeByTypeId = function (id, callback) {
        customMethodService.getProTypeByTypeId(id, function (event) {
          if (event.code == 0) {
            if (typeof callback == "function") {
              callback(event.data);
            } else {
              console.log("请配置回调函数");
            }
          }
        })
      };
      cmethod.prototype.getParameter = function (str) {
        if (routeParam.parameter) {
          var all = JSON.parse(routeParam.parameter);
          var param = all[all.length - 1];
          return param.$attr(str);
        } else {
          return null;
        }
      };
      cmethod.prototype.getPages = function (str) {
        var pageArr = (routeParam.page || "index").split("|");
        var parameters = JSON.parse(routeParam.parameter || "[0]");
        var rs = [];
        var rootTarget = this.getRootTarget();
        var groups = rootTarget.groups;
        for(var i in pageArr){
          rs.push({
            path : pageArr[i],
            tabLabel : parameters[i].tabLabel || groups[i].label,
            parameter : parameters[i]
          });
        };
        console.log(rs);
        return rs;
      };
      cmethod.prototype.getResourceById = function (id, callback) {
        if (id) {
          resourceUIService.getResourceById(id, function (event) {
            if (event.code == 0) {
              callback(event.data);
            }
            ;
          })
        } else {
          callback(null);
        }
      };
      cmethod.prototype.getOnlineByKpiCodes = function (id, callback) {
        if (id) {
          var kpiQueryModel = {
            includeInstance: true,
            isRealTimeData: true,
            nodeIds: [id],
            kpiCodes: [999998],
            timePeriod: 0
          };
          var param = ["kpi", kpiQueryModel];
          kpiDataService.getValueList(param, function (event) {
            if (event.code == 0) {
              callback(event.data);
            }
            ;
          })
        } else {
          callback(null);
        }
      };
      cmethod.prototype.navigateBack = function () {
        var para, page = routeParam.page ? routeParam.page : "index";
        var oldParam = routeParam.parameter;
        if (oldParam == undefined) {
          oldParam = ['0']
        } else {
          oldParam = JSON.parse(oldParam);
        }
        var pageArr = page.split("|");
        pageArr.pop();
        page = pageArr.toString();
        page = page.replace(",", "|");
        var last = oldParam[oldParam.length - 1];
        var tabLabel = last.tabLabel;
        oldParam.pop();
        para = encodeURIComponent(JSON.stringify(oldParam));
        if (route.current.$$route.controller == "viewFreeboardCtrl") {
          if (page != "") {
            window.location.href = "../app-sc/index_freeboard.html#/freeboard/" + page + "/" + para;
          }
        } else if (route.current.$$route.controller == "freeStyleCtrl") {
          var viewId = routeParam.viewId;
          if (page != "") {
            window.location.href = "../app-free-style/index.html#/" + viewId + "/" + page + "/" + para;
          }
        } else {
          if (page != "") {
            window.location.href = "../app-oc/index.html#/dashboard/" + page + "/" + para;
          }
        }
        ;
      };
      cmethod.prototype.moveTo = function (url) {
        var para, page, pageStr = routeParam.page ? routeParam.page : "index";
        var oldParam = routeParam.parameter;
        if (oldParam == undefined) {
          oldParam = ['0']
        } else {
          oldParam = JSON.parse(oldParam);
        };
        var page = pageStr.split("|");
        var inx = page.indexOf(url);
        if(inx != -1){
          var pageArr = page.slice(0, inx + 1);
          oldParam = oldParam.slice(0, inx + 1);
          page = pageArr.toString();
          page = page.replace(/\,/g, "|");
          para = encodeURIComponent(JSON.stringify(oldParam));
          if (route.current.$$route.controller == "viewFreeboardCtrl") {
            window.location.href = "../app-sc/index_freeboard.html#/freeboard/" + page + "/" + para;
          } else if (route.current.$$route.controller == "freeStyleCtrl") {
            var viewId = routeParam.viewId;
            window.location.href = "../app-free-style/index.html#/" + viewId + "/" + page  + "/" + para;
          } else {
            window.location.href = "../app-oc/index.html#/dashboard/" + page + "/" + para;
          };
        };
      };
      cmethod.prototype.navigateToJson = function (url, parameter, type) {
        var para, page = routeParam.page ? routeParam.page : "index";
        if (parameter == undefined) {
          parameter = '0';
        }
        var oldParam = routeParam.parameter;
        if (oldParam == undefined) {
          oldParam = ['0']
        } else {
          oldParam = JSON.parse(oldParam);
        }
        if (type == "self") {
          var pageArr = page.split("|");
          pageArr.pop();
          page = pageArr.toString();
          page.replace(",", "|");
          var last = oldParam[oldParam.length - 1];
          var tabLabel = last.tabLabel;
          oldParam.pop();
          if (tabLabel) {
            parameter.tabLabel = tabLabel;
          }
          parameter.$target == "self";
          oldParam.push(parameter);
        } else {
          parameter.$target == "blank";
          oldParam.push(parameter);
        }
        para = encodeURIComponent(JSON.stringify(oldParam));
        if (route.current.$$route.controller == "viewFreeboardCtrl") {
          if (page != "") {
            window.location.href = "../app-sc/index_freeboard.html#/freeboard/" + page + "|json:" + url + "/" + para;
          } else {
            window.location.href = "../app-sc/index_freeboard.html#/freeboard/" + url + "/" + para;
          }
        } else if (route.current.$$route.controller == "freeStyleCtrl") {
          var viewId = routeParam.viewId;
          if (page != "") {
            window.location.href = "../app-free-style/index.html#/" + viewId + "/" + page + "|json:" + url + "/" + para;
          } else {
            window.location.href = "../app-free-style/index.html#/" + viewId + "/" + url + "/" + para;
          }
        } else {
          if (page != "") {
            window.location.href = "../app-oc/index.html#/dashboard/" + page + "|json:" + url + "/" + para;
          } else {
            window.location.href = "../app-oc/index.html#/dashboard/" + url + "/" + para;
          }
        }
        ;
      };
      cmethod.prototype.navigateTo = function (url, parameter, type) {
        var para, page = routeParam.page ? routeParam.page : "index";
        if (parameter == undefined) {
          parameter = '0';
        }
        var oldParam = routeParam.parameter;
        if (oldParam == undefined) {
          oldParam = ['0']
        } else {
          oldParam = JSON.parse(oldParam);
        }
        if (type == "self") {
          var pageArr = page.split("|");
          pageArr.pop();
          page = pageArr.toString();
          page.replace(",", "|");
          var last = oldParam[oldParam.length - 1];
          var tabLabel = last.tabLabel;
          oldParam.pop();
          if (tabLabel) {
            parameter.tabLabel = tabLabel;
          }
          parameter.$target == "self";
          oldParam.push(parameter);
        } else {
          parameter.$target == "blank";
          oldParam.push(parameter);
        }
        para = encodeURIComponent(JSON.stringify(oldParam));
        if (route.current.$$route.controller == "viewFreeboardCtrl") {
          if (page != "") {
            window.location.href = "../app-sc/index_freeboard.html#/freeboard/" + page + "|" + url + "/" + para;
          } else {
            window.location.href = "../app-sc/index_freeboard.html#/freeboard/" + url + "/" + para;
          }
        } else if (route.current.$$route.controller == "freeStyleCtrl") {
          var viewId = routeParam.viewId;
          if (page != "") {
            window.location.href = "../app-free-style/index.html#/" + viewId + "/" + page + "|" + url + "/" + para;
          } else {
            window.location.href = "../app-free-style/index.html#/" + viewId + "/" + url + "/" + para;
          }
        } else {
          if (page != "") {
            window.location.href = "../app-oc/index.html#/dashboard/" + page + "|" + url + "/" + para;
          } else {
            window.location.href = "../app-oc/index.html#/dashboard/" + url + "/" + para;
          }
        }
        ;
      };
      cmethod.prototype.explainDic = function(attr, elem){
        var label, type;
        if(typeof elem == "object"){
          label = elem.label;
          type = elem.type;
        } else {
          label = elem;
          type = "label";
        };
        return {
          type : type,
          value : attr,
          name : label
        }
      };
      cmethod.prototype.getSimulateApi = function(simulate, num, callback){
        var rs = [];
        var target = {
          randomText : function(strs){
            var length = strs.length - 1;
            var inx = Math.round(Math.random() * length);
            return strs[inx];
          },
          random : function(max, digital){
            var num = parseInt(Math.random() * max * Math.pow(10,digital)) / Math.pow(10,digital);
            return num;
          }
        }
        var repeat = function(inx){
          var obj = {};
          var loopAttr = function(attr, elem){
            if(typeof elem == "function"){
              obj[attr] = elem(inx, target, attr)
            } else {
              obj[attr] = elem;
            }
          }
          for(var i in simulate){
            loopAttr(i, simulate[i])
          }
          return obj;
        }
        for(var i = 0; i < num;  i++){
          rs.push(repeat(i))
        }
        if(callback){
          callback(rs);
        }
      };
      cmethod.prototype.wait = function (condition, success) {
        var repeat = function(){
          if(condition()){
            success();
          } else {
            setTimeout(function(){
              repeat();
            }, 10)
          }
        };
        repeat();
      };
      cmethod.prototype.http = function (url, callback) {
        customMethodService.http(url, function (event) {
          callback(event);
        })
      };
      cmethod.prototype.getScope = function(){
        var cur = this;
        var parent = cur;
        while(parent.parent){
          parent = parent.parent;
        };
        return parent;
      };
      cmethod.prototype.setScopeValue = function(attr, value){
        var t = this.getScope();
        if(!t['private']){
          t['private'] = {};
          Object.defineProperty(t, "private", {
            enumerable : false,
            value : {}
          })
        }
        var obj = t['private'];
        obj.$attr(attr, value);
      };
      cmethod.prototype.getScopeValue = function(attr){
        var t = this.getScope();
        var obj = t['private'] || {};
        return obj.$attr(attr);
      };
      cmethod.prototype.linkTo = function (url, target) {
        window.open(url, target ? target : "_blank");
      };
      cmethod.prototype.findViewHasProjectNameById = function (projectId, callback) {
        this.getResourceById(projectId, function (project) {
          var label = project.label;
          var getRootPath = function (domainPath) {
            var arr = domainPath.split("/");
            return "/" + arr[1] + "/" + arr[2] + "/";
          }
          var rootPath = getRootPath(userLoginUIService.user.domainPath);
          viewFlexService.getViewsOnlyPublishedByTypeAndDomainPath('dashboard', rootPath, function (event) {
            var views = event.data;
            var find = views.find(function (view) {
              return label.indexOf(view.viewTitle) != -1;
            });
            if (find) {
              viewFlexService.getViewById(find.viewId, function (event) {
                if (event.code == 0) {
                  callback(event.data);
                }
              })
            } else {
              callback(null);
            }
          })
        });
      };
      cmethod.prototype.getProjectsByCustomerId = function (customerId, callback) {
        var param = {};
        if (customerId) {
          param.customerId = customerId;
        }
        ;
        projectUIService.findProjectsByCondition(param, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.simulate = function (type, nodesDes, kpisDes, simulateFn, callback) {
        var result = [];
        var date = new Date();
        var timeStamp = date.getTime();
        var timeStampToStr = function (timeStamp) {
          var nDate = new Date(timeStamp - 8 * 3600 * 1000);
          var year = nDate.getFullYear();
          var month = nDate.getMonth() + 1;
          var dat = nDate.getDate();
          var hour = nDate.getHours();
          var min = nDate.getMinutes();
          var sec = nDate.getSeconds();
          if (month < 10) {
            month = "0" + month;
          }
          if (dat < 10) {
            dat = "0" + dat;
          }
          if (hour < 10) {
            hour = "0" + hour;
          }
          if (min < 10) {
            min = "0" + min;
          }
          if (sec < 10) {
            sec = "0" + sec;
          }
          ;
          return year + "-" + month + "-" + dat + "T" + hour + ":" + min + ":" + sec + ".000+0000";
        };
        var renderData = function (index) {
          var startTime = simulateFn.startTime.getTime();
          var period = simulateFn.period;
          var frequency = simulateFn.frequency;
          var range = simulateFn.range;
          var getData = function (curTime) {
            if (curTime - startTime < period) {
              var loopNodes = function (node) {
                var loopKpis = function (inx, kpi) {
                  var calcRandom = function (range) {
                    if (range) {
                      var max = range[1];
                      var min = range[0];
                      var ran = (max - min);
                      return Math.round((min + Math.random() * ran) * 10) / 10;
                    } else {
                      return Math.round(Math.random() * 100);
                    }
                  };
                  var val = calcRandom(range);
                  var sampleData = {
                    "agentId": "0",
                    "aggregatePeriod": null,
                    "aggregateStatus": null,
                    "aggregateType": null,
                    "arisingTime": timeStampToStr(curTime),
                    "compressCount": 0,
                    "computeTaskId": 0,
                    "dataSerialNumber": 0,
                    "dataTime": null,
                    "insertTime": timeStampToStr(curTime),
                    "kpiCode": kpi.id,
                    "nodeId": node.id,
                    "notes": null,
                    "numberValue": val,
                    "quality": 0,
                    "resourceId": 0,
                    "stringValue": null,
                    "value": val,
                    "valueStr": val + ""
                  };
                  result.push(sampleData);
                };
                for (var i in kpisDes) {
                  loopKpis(i, kpisDes[i])
                }
              };
              for (var i in nodesDes) {
                loopNodes(nodesDes[i])
              }
              ;
              getData(curTime + frequency);
            }
          };
          getData(startTime);
          if (typeof callback == "function") {
            callback(result);
          }
        };
        var renderData2D = function () {
          var dictionaryService = services.dictionaryService;
          var loadArray = ["energyType", "industryShortType"];
          var nextStep = function () {
            var loopNodes = function (node) {
              var loopKpis = function (inx, kpi) {
                var loopInstance = function (ins1) {
                  var loopInstance2 = function (ins2) {
                    var range;
                    if (ranges) {
                      range = ranges[inx];
                    }
                    var calcRandom = function (range) {
                      if (range) {
                        var max = range[1];
                        var min = range[0];
                        var ran = (max - min);
                        return Math.round((min + Math.random() * ran) * 10) / 10;
                      } else {
                        return Math.round(Math.random() * 100);
                      }
                    };
                    var val = calcRandom(range);
                    var newTime = timeStamp;
                    var sampleData = {
                      "agentId": "0",
                      "aggregatePeriod": null,
                      "aggregateStatus": null,
                      "aggregateType": null,
                      "arisingTime": timeStampToStr(newTime),
                      "compressCount": 0,
                      "computeTaskId": 0,
                      "dataSerialNumber": 0,
                      "dataTime": null,
                      "insertTime": timeStampToStr(newTime),
                      "kpiCode": kpi.id,
                      "nodeId": node.id,
                      "notes": null,
                      "numberValue": val,
                      "instance": ins1.label + "," + ins2.label,
                      "quality": 0,
                      "resourceId": 0,
                      "stringValue": null,
                      "value": val,
                      "valueStr": val + ""
                    };
                    result.push(sampleData);
                  };
                  for (var i in loadArray[1].data) {
                    loopInstance2(loadArray[1].data[i]);
                  }
                };
                for (var i in loadArray[0].data) {
                  loopInstance(loadArray[0].data[i]);
                }
              };
              for (var i in kpisDes) {
                loopKpis(i, kpisDes[i])
              }
            };
            for (var i in nodesDes) {
              loopNodes(nodesDes[i])
            }
            ;
            if (typeof callback == "function") {
              callback(result);
            }
          };
          var loop = function (inx, loadType) {
            var getEnergyType = function (event) {
              var checkFinished = function () {
                var every = loadArray.every(function (elem) {
                  return typeof elem == "object"
                });
                if (every) {
                  nextStep();
                }
              };
              if (event.code == 0) {
                var rs = [];
                var loop = function (el) {
                  var some = rs.some(function (itm) {
                    return itm.label == el.label;
                  });
                  if (!some) {
                    rs.push(el)
                  }
                }
                for (var i in event.data) {
                  loop(event.data[i]);
                }
                loadArray[inx] = {
                  path: loadType,
                  status: "finished",
                  data: rs
                };
                checkFinished();
              }
            };
            dictionaryService.getDictValues(loadType, getEnergyType);
          };
          for (var i in loadArray) {
            loop(i, loadArray[i])
          }
        };
        var renderData3D = function () {
          var aggr_type;
          var dictionaryService = services.dictionaryService;
          var loadArray = ["energyType", "industryShortType"];
          var nextStep = function () {
            var loopNodes = function (node) {
              var loopKpis = function (inx, kpi) {
                var loopAggrType = function (atype) {
                  var loopInstance = function (ins1) {
                    var loopInstance2 = function (ins2) {
                      var range;
                      if (ranges) {
                        range = ranges[inx];
                      }
                      var calcRandom = function (range) {
                        if (range) {
                          var max = range[1];
                          var min = range[0];
                          var ran = (max - min);
                          return Math.round((min + Math.random() * ran) * 10) / 10;
                        } else {
                          return Math.round(Math.random() * 100);
                        }
                      };
                      var val = calcRandom(range);
                      var newTime = timeStamp;
                      var sampleData = {
                        "agentId": "0",
                        "aggregatePeriod": null,
                        "aggregateStatus": null,
                        "aggregateType": atype.valueCode,
                        "arisingTime": timeStampToStr(newTime),
                        "compressCount": 0,
                        "computeTaskId": 0,
                        "dataSerialNumber": 0,
                        "dataTime": null,
                        "insertTime": timeStampToStr(newTime),
                        "kpiCode": kpi.id,
                        "nodeId": node.id,
                        "notes": null,
                        "numberValue": val,
                        "instance": ins2.label + "," + ins1.label,
                        "quality": 0,
                        "resourceId": 0,
                        "stringValue": null,
                        "value": val,
                        "valueStr": val + ""
                      };
                      result.push(sampleData);
                    };
                    for (var i in loadArray[1].data) {
                      loopInstance2(loadArray[1].data[i]);
                    }
                  };
                  for (var i in loadArray[0].data) {
                    loopInstance(loadArray[0].data[i]);
                  }
                };
                for (var i in aggr_type) {
                  loopAggrType(aggr_type[i])
                }
                ;
              };
              for (var i in kpisDes) {
                loopKpis(i, kpisDes[i])
              }
            };
            for (var i in nodesDes) {
              loopNodes(nodesDes[i])
            }
            ;
            if (typeof callback == "function") {
              callback(result);
            }
          };
          var loop = function (inx, loadType) {
            var getEnergyType = function (event) {
              var checkFinished = function () {
                var every = loadArray.every(function (elem) {
                  return typeof elem == "object"
                });
                if (every) {
                  nextStep();
                }
              };
              if (event.code == 0) {
                var rs = [];
                var loop = function (el) {
                  var some = rs.some(function (itm) {
                    return itm.label == el.label;
                  });
                  if (!some) {
                    rs.push(el)
                  }
                }
                for (var i in event.data) {
                  loop(event.data[i]);
                }
                loadArray[inx] = {
                  path: loadType,
                  status: "finished",
                  data: rs
                };
                checkFinished();
              }
            };
            dictionaryService.getDictValues(loadType, getEnergyType);
          };
          for (var i in loadArray) {
            loop(i, loadArray[i])
          }


          dictionaryService.getDictValues("aggregateType", function (event) {
            if (event.code == 0) {
              aggr_type = event.data.slice(0, 2);
            }
          });
        };
        if (type == "time") {
          renderData();
        } else if (type == "ci") {
          renderData(0);
        } else if (type == "ci_2d") {
          renderData2D();
        } else if (type == "ci_3d") {
          renderData3D();
        }
        ;
        return result;
      };
      cmethod.prototype.getModels = function (callback) {
        resourceUIService.getModels(function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getModelByIds = function (ids, callback) {
        resourceUIService.getModelByIds(ids, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getKpisByModelId = function (modelId, callback) {
        if (modelId) {
          resourceUIService.getKpisByModelId(modelId, function (event) {
            if (event.code == 0) {
              for(var i in event.data){
                var kpiId = event.data[i].id;
                if(!cmethod.kpiDic[kpiId]){
                  cmethod.kpiDic[kpiId] = event.data[i].label;
                }
              }
              callback(event.data);
            }
          })
        } else {
          callback([]);
        }
        ;
      };
      cmethod.prototype.getResourceByModelId = function (modelId, callback) {
        if (modelId) {
          resourceUIService.getResourceByModelId(modelId, function (event) {
            if (event.code == 0) {
              for(var i in event.data){
                var nodeId = event.data[i].id;
                if(!cmethod.resourceDic[nodeId]){
                  cmethod.resourceDic[nodeId] = event.data[i].label;
                }
              }
              callback(event.data);
            }
          })
        } else {
          callback([]);
        }
        ;
      };
      cmethod.prototype.getDomainsByFilter = function (filter, callback) {
        resourceUIService.getDomainsByFilter(filter, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.queryDomainsByEnterpriseId = function (filter, callback) {
        energyConsumeUIService.queryDomainsByEnterpriseId(filter, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getProjectsByDomains = function (domains, callback) {
        var param = {};
        if (domains) {
          param.domainPath = domains;
        }
        ;
        projectUIService.findProjectsByCondition(param, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getProjectsByDomains = function (domains, callback) {
        var param = {};
        if (domains) {
          param.domainPath = domains;
        }
        ;
        projectUIService.findProjectsByCondition(param, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.getCurrentProjectsFromDomain = function (callback) {
        var cur = this;
        var domains = userLoginUIService.user.domains;
        resourceUIService.getDomainsByFilter({
          domains: userLoginUIService.user.domains,
          modelId: 302
        }, function (event) {
          if (event.code == 0) {
            callback(event.data);
          }
        })
      };
      cmethod.prototype.findProjectById = function (id, callback) {
        projectUIService.findProjectById(id, function (event) {
          if (event.code == 0) {
            if (callback) {
              callback(event.data);
            }
          }
        })
      };
      cmethod.prototype.getCurrentProjectsByCustom = function (callback) {
        var cur = this;
        //如果没有subDomain的话，那就不是客户用户，没有customerId的
        if (!userLoginUIService.user.subDomain) {
          callback([]);
          return;
        }
        var arr = userLoginUIService.user.subDomain.split("/");
        var customerId = arr[arr.length - 2];
        var param = {
          customerId: customerId
        }
        projectUIService.findProjectsByCondition(param, function (event) {
          if (event.code == 0) {
            if (callback) {
              callback(event.data);
            }
          }
        })
      };
      cmethod.prototype.getViewByProjectId = function (resId, callback) {
        var getRootPath = function (domainPath) {
          var arr = domainPath.split("/");
          return "/" + arr[1] + "/" + arr[2] + "/";
        }
        var rootPath = getRootPath(userLoginUIService.user.domainPath);
        viewFlexService.getViewsOnlyPublishedByTypeAndDomainPath('configure', rootPath, function (event) {
          var views = event.data;
          var find = views.find(function (view) {
            if (view.template) {
              if (view.template.resourceType == "project") {
                if (view.template.resourceId == resId) {
                  return true;
                }
              }
            }
            return false;
          });
          if (find) {
            viewFlexService.getViewById(find.viewId, function (event) {
              if (event.code == 0) {
                callback(event.data);
              }
            })
          } else {
            callback(null);
          }
        })
      };
      cmethod.prototype.getAllMyViews = function(callback){
        viewFlexService.getAllMyViews(function (event) {
          if(event.code == 0){
            var views = event.data;
            callback(views);
          } else {
            callback(null);
          };
        });
      };
      cmethod.prototype.deleteView = function(viewId, callback){
        viewFlexService.deleteView(viewId, function (event) {
          if(event.code == 0){
            var views = event.data;
            callback(views);
          } else {
            callback(null);
          };
        });
      };
      cmethod.prototype.getDefaultView = function(modelId, callback){
        viewFlexService.getDefaultView(modelId, function (event) {
          if(event.code == 0){
            var views = event.data;
            callback(views);
          } else {
            callback(null);
          };
        });
      };
      cmethod.prototype.getManagedViewsByTypeAndRole = function(type, callback){
        viewFlexService.getManagedViewsByTypeAndRole(type, function (event) {
          if(event.code == 0){
            var views = event.data;
            callback(views);
          } else {
            callback(null);
          };
        });
      };
      cmethod.prototype.getViewsOnlyPublishedByTypeAndDomainPath = function(type, rootPath, callback){
        viewFlexService.getViewsOnlyPublishedByTypeAndDomainPath(type, rootPath, function (event) {
          if(event.code == 0){
            var views = event.data;
            callback(views);
          } else {
            callback(null);
          };
        });
      };
      cmethod.prototype.getViewsOnlyPublishedByTypeAndDomainPath = function(type, rootPath, callback){
        viewFlexService.getViewsOnlyPublishedByTypeAndDomainPath(type, rootPath, function (event) {
          if(event.code == 0){
            var views = event.data;
            callback(views);
          } else {
            callback(null);
          };
        });
      };
      cmethod.prototype.getViewByModelId = function (resId, callback) {
        var getRootPath = function (domainPath) {
          var arr = domainPath.split("/");
          return "/" + arr[1] + "/" + arr[2] + "/";
        }
        var rootPath = getRootPath(userLoginUIService.user.domainPath);
        viewFlexService.getViewsOnlyPublishedByTypeAndDomainPath('configure', rootPath, function (event) {
          var views = event.data;
          var find = views.find(function (view) {
            if (view.template) {
              if (view.template.resourceType == "device") {
                if (view.template.resourceId == resId) {
                  return true;
                }
              }
            }
            return false;
          });
          if (find) {
            viewFlexService.getViewById(find.viewId, function (event) {
              if (event.code == 0) {
                callback(event.data);
              }
            })
          } else {
            callback(null);
          }
        })
      };
      cmethod.prototype.getSimulateList = function (data, callback) {
        customMethodService.getSimulateList(data, callback);
      };
      cmethod.prototype.webSocket = function (nodeIds, kpiCodes, callback) {
        var uuid = Math.uuid();
        var paramSocket = {
          ciid: nodeIds.toString(),
          kpi: kpiCodes.toString()
        };
        /**
         var inx1 = Math.floor(Math.random() * nodeIds.length)
         var inx2 = Math.floor(Math.random() * kpiCodes.length);
         var val = Math.round(Math.random() * 100);
         callback({
      value : val,
      nodeId : nodeIds[inx1],
      kpiCode : kpiCodes[inx2]
    });
         var test = function(){
      setTimeout(function(){
        var inx1 = Math.floor(Math.random() * nodeIds.length);
        var inx2 = Math.floor(Math.random() * kpiCodes.length);
        var val = Math.round(Math.random() * 100);
        callback({
          value : val,
          nodeId : nodeIds[inx1],
          kpiCode : kpiCodes[inx2]
        });
        test();
      }, 6000);
    };
         test();*/
        SwSocket.unregister(uuid);
        var operation = "register";
        SwSocket.register(uuid, operation, function (event) {
          if (typeof callback == "function") {
            callback(event.data);
          }
        });
        SwSocket.send(uuid, operation, 'kpi', paramSocket);
      };
      cmethod.prototype.getKpiFromViewByTypeAndRole = function (viewType, resourceType, resourceId, callback, socketCallback) {
        var kpiCodes = [];
        var nodeIds = [Number(this.getParameter("resourceId"))];
        var valueDic = {};
        var uuid = Math.uuid();
        this.getViewsByOnlyRole(viewType, resourceType, resourceId, function (view) {
          var json = JSON.parse(view.content);
          json.cells.sort(function (a, b) {
            return parseInt(a.z) - parseInt(b.z);
          });
          json.cells.forEach(function (cell) {
            if (cell.type == "basic.Rect" && cell.kpiId && cell.kpiId.length > 8 && cell.nodeId && cell.nodeId.length > 8) {
              var kpiId;
              if (typeof cell.kpiId == "string" && cell.kpiId.search('number:') > -1) {
                kpiId = Number(cell.kpiId.split(":")[1]);
              } else {
                kpiId = Number(cell.kpiId);
              }
              var modelId
              if (typeof cell.modelId == "string" && cell.modelId.search('number:') > -1) {
                modelId = Number(cell.modelId.split(":")[1]);
              } else {
                modelId = Number(cell.modelId);
              }
              var kpiDef = {};
              if (resourceUIService.rootModelsDic && resourceUIService.rootModelsDic[modelId]) {
                if (resourceUIService.rootModelsDic[modelId].kpiDic && resourceUIService.rootModelsDic[modelId].kpiDic[kpiId]) {
                  kpiDef = resourceUIService.rootModelsDic[modelId].kpiDic[kpiId];
                }
              }
              kpiCodes.push(kpiId);
              valueDic[kpiId] = {
                kpiName: cell.attrs.text.text ? cell.attrs.text.text : kpiDef.label,
                kpiUnit: cell.unitType == "number:1" ? (kpiDef.unitLabel ? kpiDef.unitLabel : "") : "",
                value: "无",
                kpiCode: kpiDef.id,
                rangeObj: kpiDef.rangeObj
              }
            }
          });
          var kpiQueryModel = {
            category: 'ci',
            isRealTimeData: true,
            nodeIds: nodeIds,
            kpiCodes: kpiCodes,
            startTime: null,
            endTime: null,
            timeRange: "",
            statisticType: "psiot",
            condList: []
          };
          var param = ["kpi", kpiQueryModel];
          kpiDataService.getValueList(param, function (event) {
            if (event.code == 0) {
              event.data.forEach(function (kpi) {
                valueDic[kpi.kpiCode].value = kpi.value;
                if (valueDic[kpi.kpiCode].rangeObj)
                  valueDic[kpi.kpiCode].value = valueDic[kpi.kpiCode].rangeObj[valueDic[kpi.kpiCode].value];
              });
              var returnAry = [];
              for (var key in valueDic) {
                returnAry.push(valueDic[key])
              }
              callback(returnAry);
            }
          });
          var paramSocket = {
            ciid: nodeIds.toString(),
            kpi: kpiCodes.toString()
          };
          SwSocket.unregister(uuid);
          var operation = "register";
          SwSocket.register(uuid, operation, function (event) {
            if (typeof socketCallback == "function") {
              if (valueDic[event.data.kpiCode].rangeObj)
                event.data.value = valueDic[event.data.kpiCode].rangeObj[event.data.value];
              socketCallback(event.data);
            }
          });
          SwSocket.send(uuid, operation, 'kpi', paramSocket);
        });
      };
      cmethod.prototype.filterEnterprises = function (callback) {
        var domainPath = userLoginUIService.user.domains;
        energyConsumeUIService.findEnterpriseInfoByDomainPath(domainPath, function (returnObj) {
          if (returnObj.code == 0) {
            returnObj.data.valueCode = returnObj.data.industryType;
            cmethod.prototype.queryEnterpriseListByHis(returnObj.data, function (eventData) {
              callback(eventData);
            });
          }
        });
      };
      cmethod.prototype.queryEnterpriseListByHis = function (shortName, callback) {
        if (!shortName) {
          growl.warning("请选择行业");
          return;
        }
        var industryShortType = shortName.valueCode;
        //获取所有企业
        var queryEnterprises = [];
        (function queryAllEnterprises() {
          energyConsumeUIService.findEnterpriseInfos(function (returnObj) {
            if (returnObj.code == 0) {
              returnObj.data.forEach(function (item) {
                if (item.industryType == industryShortType) {
                  item.label = item.name;
                  queryEnterprises.push(item);
                }
              })
              callback(queryEnterprises);
            }
          });
        })();
      };
      cmethod.prototype.queryDomains = function (filter, callback) {
        var nodeIdAry = [];
        var index = 0;
        var queryDomainsByEnterpriseId = function (enterpriseId) {
          energyConsumeUIService.queryDomainsByEnterpriseId(enterpriseId, function (returnObj) {
            if (returnObj.code == 0) {
              index++;
              var ary = returnObj.data.filter(function (item) {
                return item.modelDefinitionId == filter.modelId;
              });
              ary.forEach(function (item) {
                nodeIdAry.push(item.id);
              });
              if (index == filter.enterpriseList.length) {
                callback(nodeIdAry);
                index = 0;
              }
            }
          })
        };
        filter.enterpriseList.forEach(function (item) {
          queryDomainsByEnterpriseId(item);
        });
      };
      cmethod.prototype.getDirectivesByTypeAndRole = function (viewType, resourceType, resourceId, callback) {
        var ids = {};
        var cur = this;
        cur.getManagedViewsByTypeAndRole(viewType, resourceType, resourceId, function (view) {
          var json = JSON.parse(view.content);
          json.cells.forEach(function (cell) {
            if (cell.directiveIds) {
              cell.directiveIds.forEach(function (dirctiveId) {
                if (typeof dirctiveId == "string")
                  ids[dirctiveId.split(":")[1]] = true;
                else
                  ids[dirctiveId] = true;
              })
            }
          });
          cur.getDirectivesByModelId(resourceId, function (event) {
            var resources = [];
            event.forEach(function (dir) {
              if (ids[dir.id]) resources.push(dir);
            })
            resources.sort(doubleCompare(["values", "index"], "desc"));
            callback(resources);
          });
        });
      };
      cmethod.prototype.getDirectivesByTypeAndRoleAndValue = function (viewType, resourceType, modelId, callback) {
        var ids = {};
        var resourceId = this.getParameter("resourceId");
        var cur = this;
        cur.getViewsByOnlyRole(viewType, resourceType, modelId, function (view) {
          var json = JSON.parse(view.content);
          json.cells.forEach(function (cell) {
            if (cell.directiveIds) {
              cell.directiveIds.forEach(function (dirctiveId) {
                if (typeof dirctiveId == "string")
                  ids[dirctiveId.split(":")[1]] = true;
                else
                  ids[dirctiveId] = true;
              })
            }
          });
          cur.getDirectivesByModelId(modelId, function (event) {
            var directives = [];
            event.forEach(function (dir) {
              if (ids[dir.id]) directives.push(dir);
            })
            directives.sort(doubleCompare(["values", "index"], "desc"));
            var kpis = directives.map(function (elem) {
              if (elem.params) {
                if (elem.params[0]) {
                  return elem.params[0].id;
                } else {
                  return 0;
                }
              } else {
                return 0;
              }
            });
            var ci = [parseInt(resourceId)];
            cur.getKpiValueCi(ci, kpis, function (event) {
              var loop = function (item) {
                var directive = directives.find(function (elem) {
                  if (elem.params[0]) {
                    return elem.params[0].id == item.kpiCode;
                  } else {
                    return false;
                  }
                });
                if (directive) {
                  directive.value = item.value;
                }
              };
              for (var i in event) {
                loop(event[i]);
              }
              ;
              callback(directives);
            });

          });
        });
      };
      cmethod.prototype.getDirectivesByModelId = function (modelId, callback) {
        if (modelId) {
          resourceUIService.getDirectivesByModelId(modelId, function (event) {
            if (event.code == 0) {
              callback(event.data);
            }
          })
        } else {
          callback([]);
        }
      };
      cmethod.prototype.queryBenchmarkByShortName = function (shortName, callback) {
        var industryDic = {};
        var energyDic = {};
        var industryShortType = [];
        var energyType = [];
        dictionaryService.getAllDicts(function (returnObj) {
          if (returnObj.code == 0) {
            returnObj.data.forEach(function (item) {
              if (item.dictCode == 'industryShortType') {
                industryShortType.push(item);
              } else if (item.dictCode == 'energyType') {
                energyType.push(item);
              }
            });
            industryShortType.forEach(function (item) {
              industryDic[item.label] = item;
            });
            energyType.forEach(function (item) {
              energyDic[item.label] = item;
            });
            callBack();
          }
        });
        function callBack() {
          var returnAry = [];
          var param = [
            "kpi", {
              "isRealTimeData": true,
              "nodeIds": [userLoginUIService.user.domainID],
              "kpiCodes": [
                3327
              ],
              "granularityUnit": 'MONTH',
              "aggregateType": ["VALENTWEIGHT"],
              "timeRange": "",
              "statisticType": "psiot",
              "includeInstance": true,
              "condList": [],
              "timePeriod": 1,
              "dataType": 1
            }
          ];
          kpiDataService.getValueList(param, function (returnObj) {
            if (returnObj.code == 0) {
              returnObj.data.forEach(function (item) {
                var instanceAry = item.instance.split(',');
                item.instanceName = industryDic[instanceAry[0]].param;
                item.instanceCode = industryDic[instanceAry[0]].valueCode;
                item.energyName = instanceAry[1];
                item.energyCode = energyDic[instanceAry[1]].valueCode;
                if (shortName.label == instanceAry[0]) {
                  returnAry.push(item);
                }

              });
              callback(returnAry);
            }
          })
        };
      };
      return cmethod;
    }
  ]);
});