/**
 * Created by leonlin on 16/11/3.
 */
define(['commonMethod', 'configs'], function(commonMethod) {
  return function(data) {
    var table;
    var tableFormat;
    var alertView;
    var elemData = data;
    var route = data.route;
    var element = data.element;
    var SwSocket = data.SwSocket;
    var previewMode = data.previewMode;
    var alertService = data.alertService;
    var userLoginUIService = data.userLoginUIService;
    var growl = data.growl;
    var serviceCenterService = data.serviceCenterService;
    var dictionaryService = data.dictionaryService;
    var resourceUIService = data.resourceUIService;
    var ticketTaskService = data.ticketTaskService;
    var projectUIService = data.projectUIService;
    var kpiDataService = data.kpiDataService;
    var window = data.window;
    var fun = element.advance.getfunction;
    var getOption = element.$attr("advance/getListTable");
    var global = data.global;
    var condition;
    /**
    var themeObj = {
      "dark" : {
        table : {
          color : "#fff"
        },
        class : {
          tr : {
            normal : {
              "background-color" : "rgba(250,250,250,0)"
            },
            hover : {
              "background-color" : "rgba(250,250,250,.2)"
            }
          },
          th : {
            normal : {
              "color" : "#73d9ff",
              "border-top" : "1px solid rgba(250,250,250,.1)",
              "border-bottom" : "1px solid rgba(250,250,250,.3)"
            }
          },
          td : {
            normal : {
              "border-top" : "1px solid rgba(250,250,250,.3)"
            }
          },
          ".progress" : {
            normal : {
              "border" : "1px solid rgba(250,250,250,.7)",
              "background-color" : "rgba(250,250,250,.1)"
            }
          }
        }
      }
    };*/
    var listbottom = element.$attr("parameters/listbottom");
    var col = element.$attr("parameters/col") || 1;
    var pageSize = 10;
    Object.defineProperty(element, "dataSource", {
      enumerable : false
    });
    var wrap = $("<div></div>");
    wrap.css("width", "100%");
    wrap.css("overflow-y", "auto");
    wrap.css("overflow-x", "hidden");
    var innerContent = $("<table></table>").addClass("table table-hover");
    var headerBtnGroup = $("<div></div>").addClass("btn-group").css("margin-bottom", "10px").css("display", "none");
    var expression;
    wrap.append(headerBtnGroup);
    wrap.append(innerContent);
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
    var format = expression.format;
    var theme = expression.theme || "default";
    var q = data.q;
    element.setFilter = function(obj){

    };
    element.setFormat = function(fmt){
      format = fmt;
    };
    element.search = function(){

    };
    element.render = function(source) {
      headerBtnGroup.children().remove();
      if(source instanceof Array){
        var data = source;
      } else {
        var data = source.data;
        format = source.format;
      };
      var createHeaderButton = function(btnConfig){
        var btn = $("<div></div>").addClass(btnConfig.class || "btn btn-primary");
        var clickFn = btnConfig.$attr("on/click");
        var span = $("<span></span>").addClass(btnConfig.icon);
        btn.text(btnConfig.label);
        btn.prepend(span);
        btn.on("click", function(event){
          if(clickFn){
            clickFn(event);
          }
        })
        return btn;
      };
      if(source.buttons){
        headerBtnGroup.css("display", "block")
        for(var i in source.buttons){
          headerBtnGroup.append(createHeaderButton(source.buttons[i]));
        };
      };
      $$.loadExternalJs(['datatables.net', 'datatables.net-bs', 'datatables.net-select'], function(dataTable){
        setTimeout(function(){
          var columns = [];
          var columnDefs = [];
          var windClick;
          var loopformat = function(inx, colInx, fmtInx, fmt){
            columns.push({
              data : colInx != 0 ? (fmt.value + "_$" + colInx) : fmt.value,
              title : fmt.name,
              render : function(data, type, full) {
                var dt = data;
                var type = fmt.type;
                var createText = function(item){
                  var nodeId = element.getParameter("resourceId");
                  var appendix = "";
                  if(colInx != 0){
                    appendix = "_$" + colInx
                  }
                  var kpiId = item['params' + appendix] ? item['params' + appendix][0].id : '';
                  var span = $("<span></span>");
                  span.attr("fmtInx", fmtInx);
                  if(fmt.websocket == true){
                    span.attr("webSocket", nodeId + "," + kpiId);
                  };
                  var style = fmt.style;
                  if(style){
                    span.css(style);
                  }
                  var format = fmt.format || function(){
                      return data == undefined ? "" : data;
                    };
                  span.text(format(data) || "-");

                  return span;
                };
                var createSelect = function(item, fmt){
                  var format = fmt.format || {id : "id", label : "label"};
                  var val = data;
                  var td = $("<div></div>");
                  var cls = fmt.class || "";
                  td.addClass(cls);
                  var style = fmt.style;
                  td.css("padding", "3px");
                  if(typeof style == "object"){
                    td.css(style);
                  }
                  td.css("padding", "3px");
                  return td;
                };
                var createInput = function(item, fmt){
                  var appendix = "";
                  if(colInx != 0){
                    appendix = "_$" + colInx
                  }
                  var changeFn = fmt.$attr("on/change");
                  var input = $("<input />");
                  input.attr("fmtInx", fmtInx);
                  input.addClass("form-control");
                  var style = fmt.style;
                  if(style){
                    input.css(style);
                  };
                  return input;
                };
                var createlink = function(){
                  var a = $("<a></a>").text(data || "");
                  a.attr("fmtInx", fmtInx);
                  a.css("text-decoration", "underline");
                  a.css("cursor", "pointer");
                  return a;
                };
                var createButton = function(item, fmt){
                  var clickFn = fmt.$attr("on/click");
                  var uuid = Math.uuid(32);
                  var icon = $("<span></span>").addClass(fmt.icon || "glyphicon glyphicon-asterisk");
                  var button = $("<button></button>").addClass(fmt.class || "btn btn-primary").text(fmt.label).attr("id", "dataTable_btn_" + inx);
                  button.attr("fmtInx", fmtInx);
                  button.prepend(icon);
                  return button;
                };
                var createButtonGroup = function(item, fmt){
                  var btnGroup = $("<div></div>").addClass("btn-group");
                  var createButton = function(ix, fm){
                    var clickFn = fmt.$attr("on/click");
                    var uuid = Math.uuid(32);
                    var icon = $("<span></span>").addClass(fm.icon || "glyphicon glyphicon-asterisk");
                    var button = $("<button></button>").addClass(fm.class || "btn btn-primary").text(fm.label).attr("id", "dataTable_btn_" + ix);
                    button.attr("fmtInx", fmtInx);
                    button.prepend(icon);
                    return button;
                  };
                  for(var i in fmt.content){
                    btnGroup.append(createButton(i, fmt.content[i]));
                  };
                  return btnGroup;
                };
                //这个为了解决告警查询的时候按钮加业务逻辑
                var createButtonGroupAlert = function(item, fmt){
                  var btnGroup = $("<div></div>").addClass("btn-group");
                  var createButton1 = function(ix, fm){
                    var clickFn = fm.$attr("on/click");
                    var uuid = Math.uuid(32);
                    var icon = $("<span></span>").addClass(fm.icon || "glyphicon glyphicon-asterisk");
                    var button = $("<button></button>").addClass(fm.class || "btn btn-primary").text(fm.label).attr("id", "dataTable_btn_" + ix);
                    button.attr("fmtInx", fmtInx);
                    button.prepend(icon);
                    if(fm.disabled){
                      button.attr('disabled',"true");
                    }
                    return button;
                  };
                  for(var i in fmt.content){
                    fmt.content[i]["disabled"] = false;
                    if(fmt.content[i].name == "confirm" && (full.state != 0 && full.state != 5)){
                      fmt.content[i]["disabled"] = true;
                    }
                    if(fmt.content[i].name == "ignore" && (full.state != 0 && full.state != 5&& full.state != 10)){
                      fmt.content[i]["disabled"] = true;
                    }
                    btnGroup.append(createButton1(i, fmt.content[i]));
                  };
                  return btnGroup;
                };
                var createProgress = function() {
                  var pwrap = $('<div></div>').addClass("progress sm");
                  pwrap.attr("fmtInx", fmtInx);
                  var progress = $('<div></div>').addClass("progress-bar").css("width", data || 0);
                  pwrap.append(progress);
                  switch(true) {
                    case data == 100:
                      progress.addClass("progress-bar-aqua");
                      break;
                    case data > 90:
                      progress.addClass("progress-bar-green");
                      break;
                    case data > 80:
                      progress.addClass("progress-bar-yellow");
                      break;
                    case data > 70:
                      progress.addClass("progress-bar-yellow");
                      break;
                    case data > 60:
                      progress.addClass("progress-bar-red");
                      break;
                    default:
                      progress.addClass("progress-bar-danger");
                      break;
                  };
                  return pwrap;
                };
                var createDirectiveInput = function(item, format){
                  var appendix = "";
                  if(colInx != 0){
                    appendix = "_$" + colInx
                  };
                  var outer = $("<div></div>").css("position", "relative");
                  var wrap = $("<div></div>").addClass("input-group");
                  var text = $("<div></div>").addClass("btn btn-default").text(item.name);
                  var groupBtn_before = $("<div></div>").addClass("input-group-btn");
                  var input = $("<input />").addClass("form-control").attr("id", "inputAll_" + full["id" + appendix]);
                  var groupBtn_after = $("<div></div>").addClass("input-group-btn");
                  var icon = $("<span></span>").addClass("glyphicon glyphicon-plus-sign").attr("id", "icon_" + full["id" + appendix]);
                  var button1 = $("<button></button>").addClass("btn btn-default").attr("id", "plusBtn_" + full["id" + appendix]);
                  var button2 = $("<button></button>").addClass("btn btn-default").text("发送").attr("id", "sendBtnAll_" + full["id" + appendix]);
                  $("button[id*=sendBtnAll_" + full["id" + appendix] +"]").on("click", function(event){
                    event.stopPropagation();
                    var params = {};
                    for(var i in item.params){
                      params[item.params[i].name] = $("input[id*=inputAll_" + full["id" + appendix] + "]").val();
                    }
                    element.sendItemDirByValue(full.id, params);
                    /**
                    if(clickFn){
                      clickFn({
                        target : element,
                        clickType : "outterBtn",
                        ui : event,
                        data : item,
                        value : input.val()
                      })
                    }*/
                  });
                  var ulWrap = $("<div></div>").attr("id", "ulWrap_" + full["id" + appendix]).css("display", "none");
                  var ul = $("<ul></ul>").css("width", "auto")
                    .css("box-shadow", "1px 1px 10px 1px rgba(0,0,0,.5)")
                    .css("border", "1px solid #ddd")
                    .css("position", "absolute")
                    .css("list-style", "none")
                    .css("background-color", "#ddd")
                    .css("margin", 0)
                    .css("padding", "0px")
                    .css("z-index", "99999");
                  var createLi = function(inner){
                    var resourceId = element.getParameter("resourceId");
                    var kpiId = inner.id;
                    var li = $("<li></li>").css("margin", "10px");
                    var bg = $("<div></div>").addClass("input-group");
                    var gr_bf = $("<div></div>").addClass("input-group-addon");
                    var gr_addon = $("<div></div>").attr("id", "add_" + inner.id).addClass("input-group-addon").text("-");
                    var gr_af = $("<div></div>").addClass("input-group-btn");
                    var text = $("<span></span>").text(inner.label);
                    var input = $("<input />").addClass("form-control").attr("id", "input_" + inner.id);
                    var button = $("<button></button>").addClass("btn btn-primary").text("发送").attr("id", "sendBtn_" + inner.id);
                    input.css("min-width", "60px");
                    element.getKpiValueCi([resourceId], [kpiId], function(data){
                      $("[id*=add_" + inner.id + "]").text(data[0].value)
                    });
                    var paramSocket = {
                      ciid: [resourceId].toString(),
                      kpi: [kpiId].toString()
                    };
                    var uuid = Math.uuid();
                    SwSocket.unregister(uuid);
                    var operation = "register";
                    SwSocket.register(uuid, operation, function(event) {
                      $("[id*=add_" + inner.id + "]").text(event.data.value);
                    });
                    SwSocket.send(uuid, operation, 'kpi', paramSocket);
                    $("input[id*=input_" + inner.id).on("change", function(event){
                      inner.$value = $(this).val();
                    });
                    $("input[id*=input_" + inner.id).on("click", function(event){
                      event.stopPropagation();
                    });
                    $("button[id*=sendBtn_" + inner.id).on("click", function(event){
                      windClick();
                      event.stopPropagation();
                      var inputVal = $("input[id*=input_" + inner.id).val();
                      var params = {};
                      params[inner.name] = inputVal;
                      element.sendItemDirByValue(full.id, params);
                    });
                    gr_bf.append(text);
                    gr_af.append(button);
                    bg.append(gr_bf).append(gr_addon).append(input).append(gr_af);
                    li.append(bg);
                    return li;
                  };
                  var btnClick;
                  $("div[id*=ulWrap_" + full["id" + appendix] +"]").on("click", function(event){
                    event.stopPropagation();
                  });
                  var appendix = ""
                  if(colInx != 0){
                    appendix = "_$" + colInx;
                  }
                  for(var i in item["params" + appendix]){
                    ul.append(createLi(item["params" + appendix][i]));
                  }
                  outer.attr("fmtInx", fmtInx);
                  wrap.append(input);
                  wrap.append(groupBtn_after);
                  groupBtn_before.append(text);
                  button1.append(icon);
                  groupBtn_after.append(button1);
                  groupBtn_after.append(button2);
                  ulWrap.append(ul)
                  outer.append(wrap);
                  outer.append(ulWrap);
                  return outer;
                };
                var createDirectiveSingle = function(item, format){
                  var nodeId = element.getParameter("resourceId");
                  var appendix = "";
                  if(colInx != 0){
                    appendix = "_$" + colInx
                  }
                  if(item['params' + appendix]){
                    var kpiId = item['params' + appendix][0].id;
                    var valueAddon = $('<span></span>');
                    var outer = $("<div></div>").css("position", "relative");
                    var wrap = $("<div></div>").addClass("input-group");
                    var text = $("<div></div>").addClass("btn btn-default").text(item.name);
                    var groupBtn_before = $("<div></div>").addClass("input-group-btn");
                    var input = $("<input />").addClass("form-control").attr("id", "inputAll_" + full["id" + appendix]);
                    var groupBtn_after = $("<div></div>").addClass("input-group-btn");
                    var button2 = $("<button></button>").addClass("btn btn-primary").text("发送").attr("id", "sendBtnAll_" + full["id" + appendix]);
                    var ulWrap = $("<div></div>").attr("id", "ulWrap_" + full["id" + appendix]).css("display", "none");
                    var appendix = ""
                    if(colInx != 0){
                      appendix = "_$" + colInx;
                    };
                    input.attr("webSocket", nodeId + "," + kpiId);
                    outer.attr("fmtInx", fmtInx);
                    valueAddon.addClass("input-group-addon");
                    valueAddon.text("500");
                    wrap.css("width", "100%");
                    wrap.append(input);
                    wrap.append(groupBtn_after);
                    groupBtn_before.append(text);
                    groupBtn_after.append(button2);
                    outer.append(wrap);
                    outer.append(ulWrap);
                    return outer;
                  } else {
                    return "";
                  };
                };
                var createPriority = function() {
                  var span = $("<span></span>").addClass("label");
                  span.attr("fmtInx", fmtInx);
                  if(data == 1) {
                    span.text("警告").addClass("alerts-warning");
                  } else if(data == 2) {
                    span.text("次要").addClass("alerts-minor");
                  } else if(data == 3) {
                    span.text("重要").addClass("alerts-major");
                  } else if(data == 4) {
                    span.text("严重").addClass("alerts-critical");
                  } else {
                    span.text("正常").addClass("alerts-normal").css("background-color", "#2eb473");
                  }
                  return span;
                };
                var createOrderStatus = function() {
                  var span = $("<span></span>").addClass("label");
                  span.attr("fmtInx", fmtInx);
                  if(data == 10) {
                    span.text("未发布").addClass(" label-primary");
                  } else if(data == 100) {
                    span.text("处理中").addClass("label-warning");
                  } else if(data == 200) {
                    span.text("已完成").addClass("label-info");
                  } else if(data == 150) {
                    span.text("已撤销").addClass("label-info");
                  }
                  return span;
                };
                var createDate = function(){
                  var span = $("<span></span>");
                  span.attr("fmtInx", fmtInx);
                  var style = fmt.style;
                  if(style){
                    span.css(style);
                  };
                  span.css("display", "inline-block");
                  if(data){
                    span.text(useMomentFormat(data, GetDateCategoryStrByLabel("年月日时分秒")));
//                  span.text(new Date(data).FormatByString("年月日时分秒"));
                  } else {
                    span.text("-");
                  };
                  return span;
                };
                var createStatus = function() {
                  //var span = $("<span></span>").addClass("label label-info");
                  var wrap = $("<div></div>");
                  var span = $("<span></span>").addClass("label");
                  span.attr("fmtInx", fmtInx);
                  if(data == 0) {
                    span.text("新产生").addClass("label-info");
                  } else if(data == 5) {
                    span.text("已确认").addClass("label-primary");
                  } else if(data == 10) {
                    span.text("处理中").addClass("label-warning");
                  } else if(data == 20) {
                    span.text("已解决").addClass("label-success");
                  } else {
                    span.text("已忽略").addClass("");
                  }

                  //calculeExp(format.value, item).then(success);
                  //return span;
                  wrap.append(span);
                  return wrap.html();
                };
                var wrap = $("<div></div>");
                var dom, fmtClone;
                if(type == "valueBased"){
                  fmtClone = fmt.options[data];
                  type = fmtClone.type;
                } else {
                  fmtClone = fmt
                };

                if(type == "text"){
                  dom = createText(full);
                } else if(type == "date"){
                  dom =  createDate();
                } else if(type == "input"){
                  dom =  createInput(full, fmtClone);
                } else if(type == "select"){
                  dom =  createSelect(full, fmtClone);
                } else if(type == "link"){
                  dom =  createlink();
                } else if(type == "progressbar") {
                  dom =  createProgress()
                } else if(type == "priority") {
                  dom =  createPriority()
                } else if(type == "button") {
                  dom =  createButton(full, fmtClone);
                } else if(type == "directiveSingle") {
                  dom =  createDirectiveSingle(full, fmtClone);
                } else if(type == "directiveInput") {
                  dom =  createDirectiveInput(full, fmtClone);
                } else if(type == "buttonGroup") {
                  dom =  createButtonGroup(full, fmtClone);
                }else if(type == "buttonGroupAlert") {
                  dom =  createButtonGroupAlert(full, fmtClone);
                } else if(type == "orderStatus") {
                  dom =  createOrderStatus(full, fmtClone);
                } else if(type == "status") {
                  return createStatus();
                }else {
                  dom =  createText(full);
                };
                dom.attr("col_index", inx);
                wrap.append(dom);
                return wrap.html();
              }
            });
            columnDefs.push({
              targets : inx,
              global : global,
              width : fmt.width || null,
              data : colInx != 0 ? (fmt.value + "_$" + colInx) : fmt.value
            })
          };
          var seperateToArray = function(data){
            var rs = [];
            var inx = 1;
            var obj = {};
            var sepData = function(inx){
              var obj = {};
              var appendix = "_$" + inx;
              var fd = false;
              for(var i in data){
                if(i.indexOf(appendix) != -1){
                  obj[i.split("_$")[0]] = data[i];
                  fd = true;
                }
              }
              if(fd){
                rs.push(obj);
                inx++;
                sepData(inx);
              }
            };
            for(var i in data){
              if(i.indexOf("_$") == -1){
                obj[i] = data[i];
              }
            }
            rs.push(obj);
            sepData(inx);
            return rs;
          };
          var loopCol = function(inx){
            for(var i in format){
              loopformat(((inx * format.length) + parseInt(i)), inx, i, format[i]);
            };
          };
          for(var i = 0; i < col; i ++){
            loopCol(i)
          };
          var rowCallback = function(row, data, index){
            var rowData = data;
            var tableElement = function(data){
              this.$clone(data);
            };
            tableElement.prototype = {
              removeRow : function(callback){
                table.row(row._DT_RowIndex).remove().draw(false);
                if(typeof callback == "function"){
                  var rs = [];
                  var dt = table.data()
                  for(var i in dt){
                    if(parseInt(i) == i){
                      rs.push(dt[i]);
                    }
                  }
                  callback(rs);
                }
              }
            };
            var rowClickFn = source.$attr("on/rowClick");
            $(row).on("click", function(event){
              if(rowClickFn){
                rowClickFn({
                  index : index,
                  row : rowData
                })
              }
            });
            var loopformat = function(inx, colInx, fmtInx, fmt){
              var dom =  $(row).find("[col_index*=" + inx + "]");
              if(fmt.type == "valueBased"){
                var val = data[fmt.value];
                fmt = fmt.options[val];
              };
              if(fmt.type == "button"){
                var clickFn = fmt.$attr("on/click");
                dom.on("click", function(event){
                  if(typeof clickFn == "function"){
                    clickFn({
                      index : index,
                      row : rowData
                    });
                  }
                });
              } else if(fmt.type == "buttonGroup"){
                for(var i in fmt.content){
                  (function(i){
                    var clickFn = fmt.content[i].$attr("on/click");
                    var subBtn = dom.find("#dataTable_btn_" + i);
                    subBtn.off("click");
                    subBtn.on("click", function(event){
                      event.stopPropagation();
                      if(typeof clickFn == "function"){
                        clickFn({
                          index : index,
                          row : rowData
                        });
                      }
                    });
                  })(i);
                }
              }else if(fmt.type == "buttonGroupAlert"){
                for(var i in fmt.content){
                  (function(i){
                    var clickFn = fmt.content[i].$attr("on/click");
                    var subBtn = dom.find("#dataTable_btn_" + i);
                    subBtn.off("click");
                    subBtn.on("click", function(event){
                      event.stopPropagation();
                      if(typeof clickFn == "function"){
                        clickFn({
                          index : index,
                          row : rowData
                        });
                      }
                    });
                  })(i);
                }
              } else if(fmt.type == "input"){
                var changeFn = fmt.$attr("on/change");
                dom.val(data[fmt.value] || "");
                dom.on("change", function(event){

                  event.stopPropagation();
                  if(changeFn){
                    changeFn({
                      index : index,
                      row : rowData,
                      value : dom.val()
                    });
                  }
                });
              } else if(fmt.type == "select"){
                var changeFn = fmt.$attr("on/change");
                var options = fmt.options || [];
                var format = fmt.format || {
                    "id" : "id",
                    "label" : "label"
                  };
                var ix = 0
                var dt = options.map(function(elem){
                  var rs = {
                    id : ix,
                    text : elem[format.label]
                  };
                  ix++;
                  return rs;
                });
                dom.children().remove();
                $$.loadExternalJs(['select2'], function(){
                  var select2Dom = $("<select></select>");
                  var changeFn = fmt.$attr("on/change");
                  select2Dom.css("width", "100%");
                  var find = options.find(function(elem){
                    return elem[format["id"]] == data[fmt.value];
                  });
                  var inxStr = options.indexOf(find) + "";
                  var baseSelect2 = {
                    language: {
                      noResults: function() {
                        return fmt.noresults || "没有该匹配项";
                      }
                    },
                    placeholder: fmt.placeholder || "请选择...",
                    data : dt
                  };
                  select2Dom.on("select2:select", function(evt) {
                    if(typeof changeFn == "function"){
                      var id = evt.params.data.id;
                      var find = fmt.options[id];
                      try {
                        changeFn({
                          row : rowData,
                          current : fmt,
                          value : find
                        });
                      } catch (e){
                        console.log(e);
                      }
                    }
                  });
                  dom.append(select2Dom);
                  select2Dom.select2(baseSelect2);
                  select2Dom.val(inxStr);
                  select2Dom.trigger('change.select2');
                });
              }
            };
            var loopCol = function(inx){
              for(var i in format){
                loopformat(((inx * format.length) + parseInt(i)), inx, i, format[i])
              }
            }
            for(var i=0; i<col; i++){
              loopCol(i)
            };
          };
          var rearrangeByCol = function(data){
            var rs = [];
            var extend = function(obj, item){
              for(var i in item){
                obj[i] = item[i];
              };
            };
            var clone = function(data, inx){
              var result = {};
              for(var i in data){
                var offset = inx != 0 ? "_$" + inx : "";
                result[i + offset] = data[i];
              }
              return result;
            };
            var loop = function(inx, item){
              var ix = Math.floor(inx / col);
              var ic = inx % col
              if(!rs[ix]){
                rs[ix] = {}
              };
              extend(rs[ix], clone(item, ic));
            };
            for(var i in data){
              loop(i, data[i])
            };
            return rs;
          };
          var rData = rearrangeByCol(data);
          var domTxt = "";
          if(listbottom == "standard"){
	  //如果没有数据不显示表格页脚
            if(data.length > 0){
              domTxt = $.ProudSmart.datatable.footerdom;
            }else{
              domTxt = '';
            }
          } else if(listbottom == "none"){
            domTxt = "";
          } else if(listbottom == "pageAndTotal"){
            domTxt = '<"row"<"clo-lg-12">>t<"row footerdom"<"col-lg-4"l><"col-lg-8"p>>';
          } else if(listbottom == "pageOnly"){
            domTxt = '<"row"<"clo-lg-12">>t<"row footerdom"<"col-lg-12"p>>';
          } else {
            domTxt = '<"row"<"clo-lg-12">>t<"row footerdom"<"col-lg-12"p>>';
          }
          var initComplete = function(){

          };
          var config = {
            ordering : col < 2,
            dom: domTxt,
            language : $.ProudSmart.datatable.language,
            rowCallback : rowCallback,
            initComplete : initComplete,
            pageLength : pageSize,
            data : rData,
            columns: columns,
            columnDefs : columnDefs
          };
          if(table){
            table.destroy();
            innerContent.empty();
          }
          table = innerContent.DataTable(config);
          element.search = function(){
            if(arguments.length == 1){
              var key = arguments[0];
              innerContent.DataTable().search(key, false, true);
            } else if(arguments.length == 2){
              var inx = arguments[0];
              var key = arguments[1];
              innerContent.DataTable().column(inx).search(key, false, true);
            }
          };
          innerContent.css("width", "100%");
        });
      });
    };
    var initFn = expression.$attr("on/init");
    var start = function(){
      if(getOption == "simulate"){
        var param = expression.$attr("simulate");
        if(param == undefined){
          param = {
            size : 4,
            formatter : [{
              label : "label",
              value : function(index, elem){
                return "设备列表" + index;
              }
            },{
              label : "data1",
              value : function(index, elem){
                return elem.random([0,100]);
              }
            },{
              label : "data2",
              value : function(index, elem){
                return elem.random([0,100]);
              }
            },{
              label : "data3",
              value : function(index, elem){
                return elem.random([0,1]);
              }
            }]
          }
        } else {
          if(param.formatter == undefined){
            param.formatter = [{
              label : "label",
              value : function(index, elem){
                return "设备列表" + index;
              }
            },{
              label : "data1",
              value : function(index, elem){
                return elem.random([0,100]);
              }
            },{
              label : "data2",
              value : function(index, elem){
                return elem.random([0,100]);
              }
            },{
              label : "data3",
              value : function(index, elem){
                return elem.random([0,1]);
              }
            }];
          }
        }
        element.getSimulateList(param, function(data){
          element.render(data);
        });
      } else if(getOption == "alert"){
        element.getAllAlerts(function(alerts){
          element.render(alerts);
        });
      } else if(getOption == "newdevice"){
        var params = {
          domainPath : userLoginUIService.user.domains
        };
        element.getDevicesByCondition(params, function(devices){
          element.render(devices);
        });
      } else if (getOption == "energyType") {
        element.energyTypeList(function(energyType) {
          element.render(energyType);
        });
      } else if (getOption == "currentDirectiveByDevice") {
        element.currentDirective(function(directives) {
          element.render(directives);
        });
      } else if(getOption == "currentAlertByDevice"){
        element.getCurrentAlert(function(alerts){
          element.render(alerts);
        });
      } else if(getOption == "currentDevicesByProject"){
        element.getCurrentDevices(function(devices){
          element.render(devices);
        });
      }
    };
    if(typeof initFn == "function") {
      try{
        initFn({
          target: element,
          global : global
        })
      } catch(e){
        growl.error("组件［列表］的初始化表达式配置发生错误" + e.message);
        console.log(e);
      }

    } else {
      start();
    }
    return wrap;
  }
});