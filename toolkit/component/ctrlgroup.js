/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  return function(data) {
    var element = data.element;
    var global = data.global;
    var scope = data.scope;
    var wrap = $("<div></div>");
    var ctrlgroup = $("<table></table>");
    if(element.style) {
      wrap.css(element.style);
    };
    wrap.append(ctrlgroup);
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
    var format = expression.format;
    var layout = expression.layout || "fixed";
    var wholeWidth = expression.width || "100%";
    ctrlgroup.css("width", wholeWidth);
    ctrlgroup.css("table-layout", layout);
    var createIcon = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var style = fmt.style || {};
      var tdStyle = fmt.tdStyle || {};
      var cls = fmt.class || "";
      var icon = $("<span></span>");
      var clickFn = fmt.$attr("on/click");
      icon.addClass(fmt.icon);
      td.addClass(cls);
      td.css("padding", "3px");
      if(typeof style == "object"){
        icon.css(style);
      };
      icon.css(tdStyle);
      td.on("click", function(event){
        if(clickFn){
          clickFn();
        }
      })
      td.append(icon);
      return td;
    };
    var createLabel = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var style = fmt.style || {};
      var linkage = fmt.linkage;
      var cls = fmt.class || "";
      if(linkage){
        var label = $("<span></span>");
        label.css("cursor", "pointer");
      } else {
        var label = $("<span></span>");
      };
      var clickFn = fmt.$attr("on/click");
      td.addClass(cls);
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      };
      td.on("click", function(event){
        if(clickFn){
          clickFn();
        }
      })
      label.text(fmt.value);
      td.append(label);
      return td;
    };
    var createMultiSelect = function(fmt, ctrlGroup){
      var format = fmt.format || {id : "id", label : "label"};
      var td = $("<td></td>");
      var style = fmt.style || {};
      var data = fmt.options || [];
      var cls = fmt.class || "";
      td.addClass(cls);
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      };
      var getSelect = function(){
        var arr = [];
        var filter = td.find("ul.dropdown-menu li.active");
        filter.each(function(index, element){
          var target = $(element).find("input");
          var find = data.find(function(ele){
            return ele[format.id] == target.attr("value");
          });
          arr.push(find);
        });
        return arr;
      };
      var select = $("<select></select>")
        .addClass("multiselect multiselect-all multiselect-search");
      select.css("display", "none");
      select.attr("multiple", "multiple");
      td.append(select);
      var loop = function(item){
        if(format){
          var label = format.label;
          var value = format.id;
        };
        var option = $("<option></option>")
          .attr("value", item[value])
          .text(item[label]);
        if(item[format.value] == true){
          option.attr("selected", "selected");
        }
        return option;
      };
      select.children().remove();
      for(var i in data){
        select.append(loop(data[i]));
      }
      var domready = function(){
        var toolReady = function(multiselect){
          var buttonText = function(options){
            if (options.length == 0) {
              return '无做出任何选择';
            } else if(options.length > 1) {
              return "已选择" + options.length + "个";
            } else {
              var selected = '';
              options.each(function() {
                selected += $(this).text() + ', ';
              });
              return selected.substr(0, selected.length -2);
            }
          };
          var onChange = function(elem, checked){
            var changeFn = fmt.$attr("on/change");
            if(typeof changeFn == "function"){
              try {
                changeFn({
                  values : getSelect()
                });
              } catch(e){
                console.log(e);
              }
            }
          };
          select.multiselect('destroy');
          select.multiselect({
            buttonWidth : td.width(),
            buttonText: buttonText,
            onChange : onChange
          });
        };
        $$.loadExternalJs(["bootstrap-multiselect"], toolReady);
      };
      setTimeout(domready);
      return td;
    };
    var createAutoComplete = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var cls = fmt.class || "";
      td.addClass(cls);
      var value = fmt.value;
      var placeholder = fmt.placeholder;
      var format = fmt.format || {
          id : "id",
          label : "label"
        };
      var style = fmt.style || {};
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var changeFn = fmt.$attr("on/change");
      var autocomplete = $("<input />");
      autocomplete.attr("placeholder", placeholder);
      autocomplete.addClass("form-control");
      td.append(autocomplete);
      $$.loadExternalJs(['jquery-ui'], function(){
        /**
        var availableTags = fmt.options.map(function(elem){
          return elem[format.label];
        });*/
        var availableTags = fmt.options;
        autocomplete.autocomplete({
          source : function(request, response){
            var key = request.term.toUpperCase();
            var equalPinyin = function(text){
              var find = false;
              var loop = function(stxt){
                if(stxt.indexOf(key) == 0){
                  find = true;
                }
              };
              for(var i = 0; i < text.length - 1; i++){
                loop($$.chineseCharacterToPinyin(text.slice(i, -1)));
              };
              return find;
            };
            var check = function(text){
              return text.indexOf(key) != -1;
            };
            /**
            var filter = availableTags.filter(function(text){
              return equalPinyin(text) || check(text);
            });*/
            var filter = availableTags.filter(function(elem){
              var text = elem[format.label] + "";
              return equalPinyin(text) || check(text);
            }).map(function(elem){
              return {
                id : elem[format.id],
                label : elem[format.label]
              }
            });
            response(filter);
          },
          change : function(event, ui){
            var val = $(event.currentTarget).val();
            if(typeof changeFn == "function"){
              changeFn({
                current : fmt,
                value : val
              })
            }
          }
        })
      });
      return td;
    };
    var createTextarea = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var cls = fmt.class || "";
      td.addClass(cls);
      td.css("padding", "3px");
      var style = fmt.style || {};
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var input = $("<textarea \>");
      var changeFn = fmt.$attr("on/change")
      input.addClass("form-control");
      input.val(fmt.value);
      input.on("change", function(event){
        if(typeof changeFn == "function"){
          try {
            changeFn({
              row : ctrlGroup,
              current : fmt,
              value : input.val()
            });
          } catch (e){
            console.log(e);
          }
        }
      });
      td.append(input);
      return td;
    };
    var createToggle = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var cls = fmt.class || "";
      td.addClass(cls);
      td.css("padding", "3px");
      var style = fmt.style || {};
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var wrap = $("<div></div>").addClass("toggle-wrap");
      var inner = $("<div></div>").addClass("toggle-inner");
      if(fmt.value){
        wrap.addClass("active");
      };
      wrap.append(inner);
      var changeFn = fmt.$attr("on/change");
      wrap.on("click", function(event){
        if(wrap.hasClass("active")){
          wrap.removeClass("active");
        } else {
          wrap.addClass("active");
        }
        if(typeof changeFn == "function"){
          try {
            changeFn({
              row : ctrlGroup,
              current : fmt,
              value : wrap.hasClass("active")
            });
          } catch (e){
            console.log(e);
          }
        }
      });
      td.append(wrap);
      return td;
    };
    var createInput = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var cls = fmt.class || "";
      td.addClass(cls);
      td.css("padding", "3px");
      var style = fmt.style || {};
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var input = $("<input \>");
      var changeFn = fmt.$attr("on/change")
      input.addClass("form-control");
      input.val(fmt.value);
      input.on("change", function(event){
        if(typeof changeFn == "function"){
          try {
            changeFn({
              row : ctrlGroup,
              current : fmt,
              value : input.val()
            });
          } catch (e){
            console.log(e);
          }
        }
      });
      td.append(input);
      return td;
    };
    var createSelet = function(fmt, ctrlGroup){
      var format = fmt.format || {id : "id", label : "label"};
      var val = fmt.value + "";
      var options = fmt.options || [];
      var td = $("<td></td>");
      var cls = fmt.class || "";
      td.addClass(cls);
      var style = fmt.style;
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      td.css("padding", "3px");
      var inx = 0;
      var data = options.map(function(elem){
        var rs = {
          id : inx,
          text : elem[format.label]
        };
        inx++;
        return rs;
      });
      $$.loadExternalJs(['select2'], function(){
        var select2Dom = $("<select></select>");
        var changeFn = fmt.$attr("on/change");
        select2Dom.css("width", "100%");
        var baseSelect2 = {
          language: {
            noResults: function() {
              return fmt.noresults || "没有该匹配项";
            }
          },
          placeholder: fmt.placeholder || "请选择...",
          data : data
        };
        select2Dom.on("select2:select", function(evt) {
          if(typeof changeFn == "function"){
            var id = evt.params.data.id;
            var find = fmt.options[id];
            try {
              changeFn({
                row : ctrlGroup,
                current : fmt,
                value : find
              });
            } catch (e){
              console.log(e);
            }
          }
        });
        td.append(select2Dom);
        select2Dom.select2(baseSelect2);
        var find = options.find(function(elem){
          return elem[format.id] == val;
        });
        var inxStr = options.indexOf(find) + "";
        select2Dom.val(inxStr);
        select2Dom.trigger('change.select2');
      });
      return td;
    };
    var createClipboardButton = function(fmt, ctrlGroup){
      var cur = this;
      var td = $("<td></td>");
      var style = fmt.style || {};
      var btnStyle = fmt.btnStyle || {};
      var cls = fmt.class || "";
      var btnclass = fmt.btnclass || "";
      var saveFn = fmt.$attr("on/save");
      var disabled = fmt.disabled;
      td.addClass(cls);
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      };
      var button = $("<button></button>");
      var txt = $("<span></span>");
      var icon = $("<span></span>");
      var clickFn = fmt.$attr("on/click");
      button.addClass(btnclass);
      button.attr("type", "button");
      if(fmt.icon){
        icon.addClass(fmt.icon);
        button.append(icon);
      }
      if(disabled){
        button.prop("disabled", "disabled")
      };
      button.css(btnStyle);
      txt.text(fmt.value || "");
      button.append(txt);
      button.attr("data-clipboard-text", fmt.clipboardText || "");
      $$.loadExternalJs(['clipboard'], function(Clipboard){
        setTimeout(function(){
          var clipboard = new Clipboard(button[0]);
          clipboard.on('success', function(e) {
            if(saveFn){
              saveFn(e);
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
      td.append(button);
      return td;
    };
    var createButton = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var style = fmt.style || {};
      var btnStyle = fmt.btnStyle || {};
      var cls = fmt.class || "";
      var btnclass = fmt.btnclass || "";
      var disabled = fmt.disabled;
      td.addClass(cls);
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      };
      var button = $("<button></button>");
      var txt = $("<span></span>");
      var icon = $("<span></span>");
      var clickFn = fmt.$attr("on/click")
      button.addClass(btnclass);
      button.attr("type", "button");
      if(fmt.icon){
        icon.addClass(fmt.icon);
        button.append(icon);
      }
      if(disabled){
        button.prop("disabled", "disabled")
      };
      button.css(btnStyle);
      txt.text(fmt.value || "");
      button.append(txt);
      button.on("click", function(event){
        if(typeof clickFn == "function"){
          clickFn({
            row : ctrlGroup,
            current : fmt,
            ui : event
          })
        }
      });
      td.append(button);
      return td;
    };
    var createButtonGroup = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var style = fmt.style || {};
      var groupStyle = fmt.groupStyle || {}
      td.css(style);
      td.css("padding", "3px");
      var div = $("<div></div>");
      div.css(groupStyle);
      div.addClass("btn-group");
      var createBtn = function(fmtBtn){
        var style = fmtBtn.style || {};
        var disabled = fmtBtn.disabled;
        var btnStyle = fmtBtn.btnStyle || {};
        var cls = fmtBtn.class || "btn btn-default";
        var btnclass = fmtBtn.btnclass || "";
        var button = $("<button></button>");
        var txt = $("<span></span>");
        var icon = $("<span></span>");
        var clickFn = fmtBtn.$attr("on/click")
        button.addClass(btnclass);
        button.attr("type", "button");
        if(fmtBtn.icon){
          icon.addClass(fmtBtn.icon);
          button.append(icon);
        }
        if(disabled){
          button.prop("disabled", "disabled")
        };
        button.css(btnStyle);
        txt.text(fmtBtn.value || "");
        button.append(txt);
        td.append(button);
        button.on("click", function(event){
          if(typeof clickFn == "function"){
            clickFn({
              row : ctrlGroup,
              current : fmtBtn
            })
          }
        });
        return button;
      };
      var createClipboardBtn = function(fmtBtn){
        var cur = this;
        var style = fmtBtn.style || {};
        var btnStyle = fmtBtn.btnStyle || {};
        var cls = fmtBtn.class || "";
        var btnclass = fmtBtn.btnclass || "";
        var saveFn = fmtBtn.$attr("on/save");
        var disabled = fmtBtn.disabled;
        if(typeof style == "object"){
          td.css(style);
        };
        var button = $("<button></button>");
        var txt = $("<span></span>");
        var icon = $("<span></span>");
        button.addClass(btnclass);
        button.attr("type", "button");
        if(fmtBtn.icon){
          icon.addClass(fmtBtn.icon);
          button.append(icon);
        }
        if(disabled){
          button.prop("disabled", "disabled")
        };
        button.css(btnStyle);
        txt.text(fmtBtn.value || "");
        button.append(txt);
        button.attr("data-clipboard-text", fmtBtn.clipboardText || "");
        $$.loadExternalJs(['clipboard'], function(Clipboard){
          setTimeout(function(){
            var clipboard = new Clipboard(button[0]);
            clipboard.on('success', function(e) {
              if(saveFn){
                saveFn(e);
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
        return button
      }
      for(var i in fmt.content){
        if(fmt.content[i].type == "button"){
          div.append(createBtn(fmt.content[i]))
        } else if(fmt.content[i].type == "clipboardButton"){
          div.append(createClipboardBtn(fmt.content[i]))
        };
      };
      td.append(div);
      return td;
    };
    var createDatePicker = function(fmt, ctrlGrooup){
      var td = $("<td></td>");
      var style = fmt.style;
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      };
      var cls = fmt.class || "";
      td.addClass(cls);
      var wrap = $("<div></div>");
      var changeFn = fmt.$attr("on/change");
      var input = $("<input />").addClass("form-control").attr("type", "text");
      var i =  $('<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>')
        .css({
          position: "absolute",
          bottom: "10px",
          right: "14px",
          top: "auto",
          cursor: "pointer"
        });
      td.append(wrap);
      wrap.css("position", "relative");
      wrap.css("padding", "3px");
      wrap.append(input).append(i);
      setTimeout(function(){
        $$.loadExternalJs(['jquery-ui'],function(){
          input.datepicker({
            onSelect : function(event){
              if(changeFn){
                changeFn({
                  target: element,
                  global: global,
                  value: event
                })
              }
            }
          });
          input.datepicker("setDate", fmt.value || null);
        })
      });
      return td;
    };
    var createDateRangePicker = function(fmt, ctrlGrooup){
      var td = $("<td></td>");
      var style = fmt.style;
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var cls = fmt.class || "";
      var value = fmt.value;
      td.addClass(cls);
      var wrap = $("<div></div>");
      var changeFn = fmt.$attr("on/change");
      var input = $("<input />").addClass("form-control").attr("type", "text");
      var i =  $('<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>')
        .css({
          position: "absolute",
          bottom: "10px",
          right: "14px",
          top: "auto",
          cursor: "pointer"
        });
      td.append(wrap);
      wrap.css("position", "relative");
      wrap.css("padding", "3px");
      wrap.append(input).append(i);
      var config = {};
      setTimeout(function(){
        $$.loadExternalJs(['bootstrap-daterangepicker'],function(daterangepicker){
          wrap.daterangepicker(config, function(start, end, label) {
            if(changeFn){
              changeFn({
                target: element,
                element: element,
                global: global,
                tools: data,
                self: self,
                value: {
                  start: new Date(start.format("YYYY-MM-DD")),
                  end: new Date(end.format("YYYY-MM-DD"))
                }
              })
            }
            input.val(start.format('YYYY-MM-DD') + ", " + end.format('YYYY-MM-DD'));
            //console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
          });
          if(value){
            input.val(value[0].Format('yyyy-MM-dd') + ", " +value[1].Format('yyyy-MM-dd'));
          }
        })
      });
      return td;
    };
    var createJQury = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      td.css("padding", "3px");
      var renderFn = fmt.render;
      if(typeof renderFn == "function"){
        td.append(renderFn($));
      };
      return td;
    };
    var createDropDownTree = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var changeFn = fmt.$attr("on/change")
      td.css("padding", "3px");
      var style = fmt.style;
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var cls = fmt.class || "";
      td.addClass(cls);
      var dropDownTree = $("<div></div>");
      $$.loadExternalJs(['dropdowntree'], function(){
        dropDownTree.dropdowntree({
          value : fmt.value,
          options : fmt.options,
          format : fmt.format,
          change : function(event){
            if(typeof changeFn == "function"){
              changeFn({
                value : event.data
              })
            };
          }
        })
      });
      td.append(dropDownTree);
      return td;
    };
    var createSvg = function(fmt){
      var td = $("<td></td>");
      var style = fmt.style || {};
      var cls = fmt.class || "";
      var svgAttr = fmt.svgAttr || {};
      var svgStyle = fmt.svgStyle || {};
      var renderFn = fmt.render;
      td.addClass(cls);
      td.css("padding", "3px");
      $$.loadExternalJs(['d3'], function(d3){
        var wrap = d3.select(td[0]);
        var svg = wrap.append("svg");
        for(var i in svgAttr){
          svg.attr(i, svgAttr[i]);
        }
        for(var i in svgStyle){
          svg.style(i, svgStyle[i]);
        }
        renderFn(svg);
      });
      return td;
    };
    var createClock = function(fmt, item){
      var td = $("<td></td>");
      var style = fmt.style || {};
      var cls = fmt.class || "";
      var label = $("<div></div>");
      td.addClass(cls);
      td.css("padding", "3px");
      if(typeof style == "object"){
        label.css(style);
      };
      var valueFn = fmt.value || function(elem){
          return elem
        }
      $$.loadExternalJs(['clock'], function(clock){
        var myClock = clock.init();
        myClock.on("init", function(value){
          label.text(valueFn(value));
        });
        myClock.on("change", function(value){
          label.text(valueFn(value));
        });
        myClock.start();
      });
      td.append(label);
      return td;
    };
    var createRadio = function(fmt, ctrlGroup){
      var td = $("<td></td>");
      var val = fmt.value;
      var changeFn = fmt.$attr("on/change")
      td.css("padding", "3px");
      var style = fmt.style;
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var cls = fmt.class || "";
      td.addClass(cls);
      var radioDom = $("<div></div>")
        .addClass("btn-group btn-group-justified");
      radioDom.css("width", "100%");
      var createBtn = function(item){
        var btn = $("<div></div>")
          .addClass("btn");
        if(item.id == val){
          btn.addClass("btn-primary")
        } else {
          btn.addClass("btn-default")
        }
        btn.on("click", function(event){
          var btns = radioDom.find(".btn-primary");
          btns.removeClass("btn-primary");
          btns.addClass("btn-default");
          btn.removeClass("btn-default");
          btn.addClass("btn-primary");
          if(changeFn){
            try{
              changeFn({
                current : fmt,
                value : item.value
              })
            }catch(e){
              console.log(e);
            }
          }
        });
        btn.text(item.label);
        return btn;
      };
      for(var i in fmt.options){
        radioDom.append(createBtn(fmt.options[i]))
      }
      td.append(radioDom);
      return td;
    };
    var createProgress = function(fmt, ctrlGroup) {
      var td = $("<td></td>");
      td.css("padding", "3px");
      var style = fmt.style;
      td.css("padding", "3px");
      if(typeof style == "object"){
        td.css(style);
      }
      var cls = fmt.class || "";
      td.addClass(cls);
      var pwrap = $('<div></div>').addClass("progress sm");
      var data = fmt.value;
      var progress = $('<div></div>').addClass("progress-bar").css("width", (data || 0) + "%");
      pwrap.css("margin", "auto");
      pwrap.append(progress);
      td.append(pwrap)
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
      return td;
    };
    var render = function(ctrlGroups){
      ctrlgroup.children().remove();
      var loopCtrlGroups = function(ctrlGroup){
        var inputGroup = $("<tr></tr>");
        inputGroup.css("padding", "5px");
        var loopformat = function(fmt){
          var dom;
          if(fmt.type == "label"){
            dom = createLabel(fmt, ctrlGroup);
          } else if(fmt.type == "icon"){
            dom = createIcon(fmt, ctrlGroup);
          } else if(fmt.type == "toggle"){
            dom = createToggle(fmt, ctrlGroup);
          } else if(fmt.type == "autoComplete"){
            dom = createAutoComplete(fmt);
          } else if(fmt.type == "input"){
            dom = createInput(fmt, ctrlGroup);
          } else if(fmt.type == "textarea"){
            dom = createTextarea(fmt, ctrlGroup);
          } else if(fmt.type == "select"){
            dom = createSelet(fmt, ctrlGroup);
          } else if(fmt.type == "button"){
            dom = createButton(fmt, ctrlGroup);
          } else if(fmt.type == "dropdowntree"){
            dom = createDropDownTree(fmt, ctrlGroup);
          } else if(fmt.type == "dateRangePicker"){
            dom = createDateRangePicker(fmt, ctrlGroup);
          } else if(fmt.type == "datePicker"){
            dom = createDatePicker(fmt, ctrlGroup);
          } else if(fmt.type == "multiSelect"){
            dom = createMultiSelect(fmt, ctrlGroup);
          } else if(fmt.type == "radio"){
            dom = createRadio(fmt, ctrlGroup);
          } else if(fmt.type == "buttonGroup"){
            dom = createButtonGroup(fmt, ctrlGroup);
          } else if(fmt.type == "jquery"){
            dom = createJQury(fmt, ctrlGroup);
          } else if(fmt.type == "clipboardButton"){
            dom = createClipboardButton(fmt, ctrlGroup);
          } else if(fmt.type == "clock"){
            dom = createClock(fmt, ctrlGroup);
          } else if(fmt.type == "svg"){
            dom = createSvg(fmt, ctrlGroup);
          } else if(fmt.type == "progressbar"){
            dom = createProgress(fmt, ctrlGroup);
          }
          if(fmt.colSpan){
            dom.attr("colSpan", fmt.colSpan);
          };
          if(fmt.tdStyle){
            dom.css(fmt.tdStyle);
          }
          element.setSelfDom(dom);
          return dom;
        };
        for(var i in ctrlGroup){
          inputGroup.append(loopformat(ctrlGroup[i]));
        };
        return inputGroup;
      };
      for(var i in ctrlGroups){
        ctrlgroup.append(loopCtrlGroups(ctrlGroups[i]));
      }
    };
    element.render = render;
    element.show = function(){
      ctrlgroup.css("display", "block");
    }
    element.hide = function(){
      ctrlgroup.css("display", "none");
    }
    var initFn = expression.$attr("on/init");
    if(typeof initFn == "function"){
      try {
        initFn({
          target : element,
          global : global,
          scope : scope
        })
      } catch(e){
        console.log(e);
      }
    }
    return ctrlgroup;
  }
});
