/**
 * Created by leonlin on 16/11/3.
 */
define([], function() {
  return function(data) {
    var elemData = data;
    if(elemData == undefined) {
      throw new Error("undefined");
    };
    var uuid;
    var self = elemData.element;
    var viewId = self.viewId;
    var all_resources = [];
    var all_kpis = [];
    var viewFlexService = elemData.viewFlexService;
    var userLoginUIService = elemData.userLoginUIService;
    var element = elemData.element;
    var commonMethod = element.constructor;
    var global = elemData.global;
    var SwSocket = elemData.SwSocket;
    var parentheight, parentwidth;
    var json = element.JSON;
    var taDom;
    var svgId = "svg_" + Math.uuid();
    var q = elemData.q;
    var traverseRow = elemData.traverseRow;
    var traverseCol = elemData.traverseCol;
    var timeout = elemData.timeout;
    var route = elemData.route;
    var previewMode = elemData.previewMode;
    var openAngles = {};
    $$.runExpression(element.$attr("advance/expression"), function(funRes) {
      if(funRes.code == "0") {
        var fnResult = funRes.data;
        expression = fnResult;
      } else {
        console.log(funRes.message)
      }
    });
    var resourceUIService = elemData.resourceUIService;
    var max_height, max_width;
    var topo = $("<div></div>");
    var wrap = $("<div></div>");
    topo.css("position", "relative");
    var resourceUIService = elemData.resourceUIService;
    var serviceCenterService = elemData.serviceCenterService;
    var kpiDataService = elemData.kpiDataService;
    var displayModeLink = {
      'arrowheadMarkup': '<g></g>',
      'toolMarkup': '<g></g>',
      'vertexMarkup': '<g></g>'
    };
    if(typeof element.setSelfDom == "function"){
      element.setSelfDom(topo);
    };
    element.off("$loadCiKpiComplete");
    topo.append(wrap);
    self.error = function(str) {
      wrap.children().remove();
      var warning = $('<p>' + str + '</p>');
      warning.css({
        'font-size': "12px",
        'min-height': '300px',
        'text-align': 'center',
        'line-height': '300px'
      });
      wrap.append(warning)
    };
    self.setResources = function(resources) {
      self.composoryRes = resources;
      Object.defineProperty(self, "composoryRes", {
        enumerable: false
      });
    };
    self.render = function(inputJson) {
      wrap.children().remove();
      var run = function(json){
        if(typeof json == 'object' && json != null) {
          var callback = function(joint) {
            timeout(function() {
              parentheight = topo.parent().height();
              parentwidth = topo.parent().width();
              var openCellTools = function(cellView) {
                if(previewMode) {
                  var cell = cellView.model || cellView,
                    modelId, nodeId, subViewId, kpiId;
                  var strModelId = cell.get("modelId");
                  var strNodeId = cell.get("nodeId");
                  var strsubViewId = cell.get("subViewId");
                  var strKpiId = cell.get("kpiId");
                  var text = cell.attr("text");
                  var getNumber = function(str) {
                    var numRegExp = /number\:(.*)/
                    if(typeof str == "string") {
                      var exp = numRegExp.exec(str);
                      if(exp) {
                        return exp[1];
                      }
                    }
                    return undefined;
                  };
                  modelId = getNumber(strModelId);
                  nodeId = getNumber(strNodeId);
                  kpiId = getNumber(strKpiId);
                  subViewId = getNumber(strsubViewId);
                  if(cell.get('valueConfig')) {
                    var isSend = false; //是否发送过
                    var dirModel = resourceUIService.rootModelsDic[modelId];
                    if(cell.get('valueConfig') && dirModel) {
                      cell.get('valueConfig').forEach(function(valueLvevel) {
                        if(valueLvevel.stateDisplay && valueLvevel.valueDirective && valueLvevel.valueDirectiveAttr) {
                          isSend = true;
                          dirModel.directives.forEach(function(dirObj) {
                            if(valueLvevel.valueDirective == dirObj.id) {
                              dirObj.value = valueLvevel.valueDirectiveAttr;
                              self.sendItemDir(dirObj, nodeId)
                            }
                          })

                        }
                      });
                      if(!isSend && cell.get('valueConfig')[0].valueDirective && cell.get('valueConfig')[0].valueDirectiveAttr) {
                        dirModel.directives.forEach(function(dirObj) {
                          if(cell.get('valueConfig')[0].valueDirective == dirObj.id) {
                            dirObj.value = cell.get('valueConfig')[0].valueDirectiveAttr;
                            self.sendItemDir(dirObj, nodeId)
                          }
                        })
                      }
                    }
                    return;
                  }
                  console.log(cell);
                  if(typeof clickEvent == "function") {
                    clickEvent({
                      cellView: cell,
                      ui: {
                        modelId: modelId,
                        resourceId: nodeId,
                        kpiId : kpiId,
                        subViewId: subViewId
                      },
                      target: self,
                      self: self,
                      global: global,
                      tools: elemData
                    })
                  };
                }
              };
              var graph = new joint.dia.Graph;
              var oldwidth = json.width;
              var oldheight = json.height;
              var config = json.$clone();
              config.el = wrap;
              var domwidth = topo.width();
              var domheight = topo.height();
              var PatternLinkView = joint.dia.LinkView.extend({
                patternMarkup: [
                  '<pattern id="pattern-<%= id %>" patternUnits="userSpaceOnUse">',
                  '<image xlink:href=""/>',
                  '</pattern>'
                ].join(''),
                render: function() {
                  joint.dia.LinkView.prototype.render.apply(this, arguments);
                  if(this.model && !this.model.get("pattern")) {
                    return;
                  }
                  this.listenTo(this.model, 'change:pattern change:patternColor', this.update);
                  return this;
                },
                remove: function() {
                  joint.util.cancelFrame(this.frameId);
                  joint.dia.LinkView.prototype.remove.apply(this, arguments);
                  if(this.pattern) {
                    this.pattern.remove();
                    this.pattern = null;
                  }
                },
                update: function() {
                  joint.dia.LinkView.prototype.update.apply(this, arguments);
                  if(this.model && !this.model.get("pattern")) {
                    return;
                  }
                  if(!this.pattern) {
                    this.pattern = joint.V(_.template(this.patternMarkup)({
                      id: this.id
                    }));
                    this.patternImage = this.pattern.findOne('image');
                    joint.V(this.paper.svg).defs().append(this.pattern);
                  }
                  this._V.connection.attr({
                    'stroke': 'url(#pattern-' + this.id + ')'
                  });
                  this.strokeWidth = this._V.connection.attr('stroke-width') || 1;
                  joint.util.cancelFrame(this.frameId);
                  this.frameId = joint.util.nextFrame(_.bind(this.fillWithPattern, this));
                  return this;
                },
                fillWithPattern: function() {
                  var strokeWidth = this.strokeWidth;
                  var bbox = joint.g.rect(joint.V(this.el).bbox(true)).moveAndExpand({
                    x: -strokeWidth,
                    y: -strokeWidth,
                    width: 2 * strokeWidth,
                    height: 2 * strokeWidth
                  });
                  var points = [].concat(this.sourcePoint, this.route, this.targetPoint);
                  points = _.map(points, function(point) {
                    return joint.g.point(point.x - bbox.x, point.y - bbox.y);
                  });
                  var canvas = document.createElement('canvas');
                  canvas.width = bbox.width;
                  canvas.height = bbox.height;
                  var ctx = canvas.getContext('2d');
                  ctx.lineWidth = strokeWidth;
                  ctx.lineJoin = "round";
                  ctx.lineCap = "round";
                  for(var i = 0, pointsCount = points.length - 1; i < pointsCount; i++) {
                    ctx.save();
                    var gradientPoints = this.gradientPoints(points[i], points[i + 1], strokeWidth);
                    var gradient = ctx.createLinearGradient.apply(ctx, gradientPoints);
                    this.drawPattern.call(this, ctx, points[i], points[i + 1], strokeWidth, gradient, points, i);
                    ctx.restore();
                  }
                  var dataUri = canvas.toDataURL('image/png');
                  this.pattern.attr(bbox);
                  this.patternImage.attr({
                    width: bbox.width,
                    height: bbox.height,
                    'xlink:href': dataUri
                  });
                },
                gradientPoints: function(from, to, width) {
                  var angle = joint.g.toRad(from.theta(to) - 90);
                  var center = joint.g.line(from, to).midpoint();
                  var start = joint.g.point.fromPolar(width / 2, angle, center);
                  var end = joint.g.point.fromPolar(width / 2, Math.PI + angle, center);
                  return [start.x, start.y, end.x, end.y];
                },
                drawPattern: function(ctx, from, to, width, gradient) {
                  ctx.beginPath();
                  ctx.moveTo(from.x, from.y);
                  ctx.lineTo(to.x, to.y);
                  ctx.stroke();
                  ctx.closePath();
                  ctx.beginPath();
                  ctx.strokeStyle = "white";
                  ctx.lineWidth = width - 2;
                  ctx.moveTo(from.x, from.y);
                  ctx.lineTo(to.x, to.y);
                  ctx.stroke();
                  ctx.closePath();
                }
              });
              config.model = graph;
              config.interactive = false;
              config.perpendicularLinks = true;
              config.gridSize = 10;
              config.markAvailable = true;
              config.linkConnectionPoint = joint.util.shapePerimeterConnectionPoint;
              config.defaultLink = new joint.dia.Link({
                attrs: {
                  '.marker-source': {
                    d: 'M 10 0 L 0 5 L 10 10 z',
                    transform: 'scale(0.001)'
                  },
                  '.marker-target': {
                    d: 'M 10 0 L 0 5 L 10 10 z'
                  },
                  '.connection': {
                    stroke: 'black'
                  }
                }
              });
              config.linkView = PatternLinkView.extend({
                drawPattern: function(ctx, from, to, width, gradient) {
                  var innerWidth = width - 4;
                  var outerWidth = width;
                  var buttFrom = joint.g.point(from).move(to, -outerWidth / 2);
                  var buttTo = joint.g.point(to).move(from, -outerWidth / 2);
                  var lineColor = "blue";
                  if(this.model.get("attrs") && this.model.get("attrs")[".connection"]) {
                    lineColor = this.model.get("attrs")[".connection"]["stroke"] ? this.model.get("attrs")[".connection"]["stroke"] : lineColor;
                  }
                  gradient.addColorStop(0.300, lineColor);
                  var patternColor = "#ffffff";
                  if(this.model.get("patternColor")) {
                    patternColor = this.model.get("patternColor");
                  }
                  gradient.addColorStop(0.500, patternColor);
                  gradient.addColorStop(0.700, lineColor);

                  ctx.beginPath();
                  ctx.lineWidth = innerWidth;
                  ctx.strokeStyle = gradient;
                  ctx.moveTo(from.x, from.y);
                  ctx.lineTo(to.x, to.y);
                  ctx.stroke();
                  ctx.closePath();
                }
              });
              delete config.cells;
              var repeat = function(target) {
                target.attr('circle/opacity', 1)
                target.attr('circle/r', 1);
                target.transition('attrs/circle/r', 30, {
                  delay: 0,
                  duration: 1000,
                  timingFunction: function(t) {
                    return t * t;
                  },
                  valueFunction: function(a, b) {
                    return function(t) {
                      return a + (b - a) * t
                    }
                  }
                });
                target.transition('attrs/circle/opacity', 0, {
                  delay: 0,
                  duration: 1000,
                  timingFunction: function(t) {
                    return t * t;
                  },
                  valueFunction: function(a, b) {
                    return function(t) {
                      return a + (b - a) * t
                    }
                  }
                });
                timeout(function() {
                  repeat(target)
                }, 1600);
              };
              var scale = 1,
                portion, translate = "0,0",
                ys = 0;
              portion = oldwidth / oldheight;
              if(oldwidth / oldheight < domwidth / domheight) {
                scale = domheight / oldheight;
                config.width = domheight * portion;
                config.height = domheight;
                ys = (domwidth - config.width) / 2;
              } else {
                scale = domwidth / oldwidth;
                config.width = domwidth;
                config.height = domwidth / portion;
              }
              wrap.css("width", config.width);
              wrap.css("height", config.height);
              wrap.css("margin", "auto");
              if(config.width > 0 && config.height > 0) {
                var paper = new joint.dia.Paper(config);
                graph.fromJSON(json);
                paper.on('cell:pointerup', function(cellView) {
                  if(cellView.model instanceof joint.dia.Element) {
                    openCellTools(cellView);
                  }
                });
                paper.on('link:options', function(evt, cellView, x, y) {
                  openCellTools(cellView);
                });
                if($$.isString(json.bgimage)) {
                  wrap.find("svg").css('background-image', "url(" + json.bgimage + ")");
                };
                wrap.find("svg").css("background-size", "contain");
                wrap.find("svg").css("background-repeat", "no-repeat");
                wrap.find("svg").css("background-position", "top");
                wrap.find("svg").attr("id", svgId);
                wrap.find(".viewport").attr("transform", "scale(" + scale + ")");
                wrap.find(".chart.Plot").css("display", "none");
                var defers = [],
                  nodes = [],
                  kpis = [];
                var pages = [];
                if(elemData.routeParam.page) {
                  pages = elemData.routeParam.page.split("|");
                };
                var distype = self.getParameter("type");
                var currentPath = pages[pages.length - 1];
                var mleft = element.style.margin;
                try {
                  if(mleft) {
                    mleft = parseInt(mleft.split("px")[0]);
                  };
                } catch(e) {
                  console.log(e);
                } finally {}
                var loop = function(cell) {
                  var defer = q.defer();
                  var elementId = cell.id;
                  var elDom = graph.getCell(elementId);
                  var cellType = cell.type;
                  var nodeStr = elDom.get("nodeId"),
                    nodeId;
                  var kpiStr = elDom.get("kpiId"),
                    kpiId;
       
                  var findNumber = /^number\:(.*)/;
                  var extend = elDom.get("extend");
                  if(extend == "angle"){
                    elDom.attr("text/style/display", "none");
                    elDom.attr("rect/style/display", "none");
                    $$.loadExternalJs(['../../toolkit/configure/openAngle'], function(openAngle){
                      var ins = openAngle.init(svgId);
                      openAngles[cell.id] = ins;
                      ins.setPos(cell.position);
                      ins.setValue(0);
                    })
                  };
                  if(currentPath != "panel" && distype != "panel") {
                    if(nodeStr != "?") {
                      nodeId = $$.runRegExp(nodeStr, findNumber, 1);
                    }
                    if(nodeId) {
                      nodeId = parseInt(nodeId);
                    }
                    if(nodes.indexOf(nodeId) == -1 && nodeId) {
                      nodes.push((nodeId));
                    }
                  } else if(self.composoryRes) {
                    if(nodes.indexOf(self.composoryRes.id) == -1) {
                      nodes.push(self.composoryRes.id)
                    };
                  } else {
                    nodeId = self.getParameter("resourceId");
                    if(nodes.indexOf(nodeId) == -1) {
                      nodes.push(nodeId);
                    };
                  }
                  if(kpiStr != "?") {
                    kpiId = $$.runRegExp(kpiStr, findNumber, 1);
                  }
                  if(kpiId && kpiId != "null") {
                    kpiId = parseInt(kpiId);
                  }
                  if(kpis.indexOf(kpiId) == -1 && nodeId && kpiId != "null" && kpiId) {
                    kpis.push((kpiId));
                  };
                  if(cellType == "chart.Plot") {
                    var position = cell.position;
                    var size = cell.size;
                    var findNumber = /^number\:(.*)/;
                    var viewId = $$.runRegExp(cell.echartViewId, findNumber, 1);
                    self.getViewById(viewId, function(view) {
                      if(view) {
                        var chartWrap = $("<div></div>");
                        chartWrap.css("width", size.width * scale + "px");
                        chartWrap.css("height", "auto");
                        chartWrap.css("top", position.y * scale + "px");
                        chartWrap.css("left", (position.x * scale + ys + 5) + "px");
                        chartWrap.css("position", "absolute");
                        chartWrap.css("background-color", "#eee");
                        chartWrap.css("box-shadow", "1px 1px 10px 1px rgba(0,0,0,.2)");
                        chartWrap.css("border-radius", "2px");
                        wrap.prepend(chartWrap);
                        var json = JSON.parse(view.content);
                        json.layout = json.layout.$remapByChild(function(element) {
                          var rs = new commonMethod(element);
                          return rs;
                        });
                        var layout = json.layout;
                        element.children = layout.children;
                        element.traverse(function(elem) {});
                        if(cell.nodeIds){
                          cell.nodeIds.$remove(function(index, element) {
                            return element == 0;
                          });
                          if(cell.nodeIds.length > 0) {
                            var callback = function(event) {
                              if(event) {
                                var resource = event[cell.nodeIds[0]];
                                if(resource) {
                                  var success = function(data) {
                                    layout.traveseByChild(function(elem) {
                                      if(elem.type == "echart") {
                                        elem.data.resource = [resource];
                                        var kpis = elem.data.kpi;
                                        elem.data.kpi = data.filter(function(elm) {
                                          return kpis.indexOf(elm.id) != -1;
                                        });
                                      }
                                    });
                                    traverseRow(chartWrap, layout.children, true);
                                  };
                                  serviceCenterService.kpis.getBymodelId(resource.modelId).then(success);
                                };
                              };
                            };
                            var strToNumer = function(arr){
                              for(var i in arr){
                                if(typeof arr[i] == "string"){
                                  if(arr[i].indexOf("number:") != -1){
                                    var numStr = arr[i].split("number:")[1];
                                    arr[i] = parseInt(numStr);
                                  }
                                }
                              }
                              return arr;
                            }
                            resourceUIService.getResourceByIds(strToNumer(cell.nodeIds), callback);
                          } else {
                            traverseRow(chartWrap, layout.children, true);
                          };
                        } else {
                          traverseRow(chartWrap, layout.children, true);
                        };
                      };
                    });
                    defer.resolve("success");
                  } else {
                    if(cell.type == "link") {
                      jQuery.extend(cell, displayModeLink);
                      cell.attrs['.connection-wrap'] = {
                        display: 'none'
                      };
                    };
                    if(elDom.attributes.nodeId) {
//                    elDom.attr('circle/opacity', 0); 这个是为什么要设置为0呢？zhangfa12月15日取消
                      if(nodeId) {
                        var callback = function(event) {
                          if(event) {
                            var resource = event[nodeId];
                            cell.resourceObj = resource;
                            elDom.resourceObj = resource;
                            //console.log("resourceObj=====", event, resource);
                            all_resources.push(cell.resourceObj)
                            if(resource) {
                              if(extend == "alert") {
                                elDom.kpiObj = cell.kpiObj = {
                                  id: 999999
                                }
                                defer.resolve("success");
                              } else if(kpiId != undefined && kpiId != '0' && kpiId != null) {
                                var success = function(data) {
                                  elDom.kpiObj = cell.kpiObj = data.find(function(elem) {
                                    return elem.id == kpiId;
                                  });
                                  all_kpis.push(cell.kpiObj)
                                  defer.resolve("success");
                                };
                                serviceCenterService.kpis.getBymodelId(resource.modelId).then(success);
                              } else {
                                defer.resolve("success");
                              }
                            } else {
                              defer.resolve("success");
                            };
                          } else {
                            defer.resolve("success");
                          }
                        };
                        resourceUIService.getResourceByIds([nodeId], callback)
                      } else {
                        defer.resolve("success");
                      }
                    } else {
                      defer.resolve("success");
                    }
                  }
                  return defer.promise;
                };
                for(var i in json.cells) {
                  defers.push(loop(json.cells[i]))
                }
                q.all(defers).then(function() {
                  var cellsDic = {} //拓扑节点集合的定义
                  var getData_success = function(data) {
                    var loop = function(cell, find, findState) {
                      var elementId = cell.id;
                      var elDom = graph.getCell(elementId);
                      if(cell.resourceObj) {
                        var findNumber = /^number\:(.*)/;
                        if(currentPath != "panel" && distype != "panel") {
                          var nodeStr = elDom.get("nodeId"),
                            nodeId;
                          nodeId = $$.runRegExp(nodeStr, findNumber, 1);
                        } else if(self.composoryRes) {
                          var nodeId = self.composoryRes.id;
                        } else {
                          var nodeId = self.getParameter("resourceId");
                        }
                        var kpiId = cell.$attr("kpiObj/id");
                        if(find || findState) {
                          var createData = function(find) {
                            var setLevel = function(cell, value) {
                              var range = cell.attributes.range;
                              if(range) {
                                range = eval(range);
                              }
                              var persent = (value - range[0]) / (range[1] - range[0]);
                              cell.prop("attrs/text/text", "");
                              cell.transition('attrs/rect', {
                                'transform': 'translate(0,0)',
                                'height': 60 * persent
                              }, {
                                delay: 0,
                                duration: 1000,
                                valueFunction: function(start, end) {
                                  return function(time) {
                                    var height = start['height'] + (end['height'] - start['height']) * time;
                                    var all = 0;
                                    return {
                                      'transform': 'translate(0,' + (60 - height) + ')',
                                      'height': height,
                                    }
                                  }
                                }
                              });
                            };
                            var setOpenAngle = function(cell, value, element) {
                              var range = cell.attributes.range;
                              var id = cell.id;
                              openAngles[id].setValue(value);
                            };
                            var fillColor = function(cell, type, color, state, color2) {
                              var stateId = cell.get("stateId");
                              if(stateId) {
                                if(state < 1) state = 0;
                                cell.state = state;
                                var colorAry = [color, '#25bce7', '#e1cd0a', '#ed9700', '#e7675d'];
                                var colorAry2 = [color2, '#25bce7', '#e1cd0a', '#ed9700', '#e7675d'];
                                if(stateId == "number:1" || stateId == "number:3") {
                                  if(type && colorAry[state]) {
                                    cell.transition('attrs/' + type + '/fill', colorAry[state], {
                                      delay: 300,
                                      duration: 500,
                                      valueFunction: joint.util.interpolate.hexColor
                                    });
                                  }
                                }
                                if((stateId == "number:2" || stateId == "number:3") && colorAry2[state]) {
                                  cell.transition('attrs/text/fill', colorAry2[state], {
                                    delay: 300,
                                    duration: 500,
                                    valueFunction: joint.util.interpolate.hexColor
                                  });
                                }
                              }
                            }
                            var breathFlash = function(cell, type, color, state, opacityState) {
                              var stateId = cell.get("stateId");
                              var flash = function(el) {
                                var defaultOpacity = opacityState ? 1 : el.opacity;
                                el.transition('attrs/' + type + '/opacity', defaultOpacity, {
                                  delay: 0,
                                  duration: 3000,
                                  timingFunction: joint.util.timing.inout,
                                  valueFunction: function(a, b) {
                                    return function(t) {
                                      var o = a + b * (defaultOpacity - Math.abs(defaultOpacity - 2 * defaultOpacity * t))
                                      return Number(o.toFixed(2));
                                    }
                                  }
                                });
                              };

                              if(stateId) {
                                if(state < 0) state = 0;
                                var colorAry = [color, '#25bce7', '#e1cd0a', '#ed9700', '#e7675d'];
                                if(stateId == "number:2") {
                                  type = "text";
                                }
                                if(type) {
                                  if(!cell.opacity) {
                                    cell.opacity = jQuery.isNumeric(cell.prop('attrs/' + type + '/opacity')) ? cell.prop('attrs/' + type + '/opacity') : 1;
                                  }
                                  cell.state = state;
                                  cell.prop('attrs/' + type + '/opacity', 0.5);
                                  cell.prop('attrs/' + type + '/fill', colorAry[state]);
                                  if(cell.state > 0) {
                                    if(_.contains(cell.getTransitions(), 'attrs/' + type + '/opacity')) return;
                                    cell.on('transition:end', function(el, path) {
                                      if(el.state > 0) {
                                        flash(el);
                                      } else {
                                        el.off('transition:end');
                                        el.prop('attrs/' + type + '/opacity', el.opacity);
                                      }
                                    });
                                    flash(cell);
                                  } else {
                                    cell.prop('attrs/' + type + '/opacity', cell.opacity);
                                  }
                                }
                              }
                            }
                            var bubbleFlash = function(cell, type, color, state, opacityState) {
                              var stateId = cell.get("stateId");
                              var flash = function() {
                                cell.prop('attrs/' + type + '/r', 0);
                                cell.prop('attrs/' + type + '/opacity', opacityState ? 1 : cell.opacity);
                                cell.transition('attrs/' + type, {
                                  'r': cell.r,
                                  'opacity': 0
                                }, {
                                  delay: 0,
                                  duration: 1500,
                                  valueFunction: function(start, end) {
                                    return function(time) {
                                      return {
                                        'r': start['r'] + (end['r'] - start['r']) * time,
                                        'opacity': start['opacity'] - (start['opacity']) * time
                                      }
                                    }
                                  }
                                });
                              }
                              if(stateId) {
                                if(state < 0) state = 0;
                                var colorAry = [color, '#25bce7', '#e1cd0a', '#ed9700', '#e7675d'];
                                if(stateId == "number:2") {
                                  type = "text";
                                }
                                if(type) {
                                  if(!cell.opacity) {
                                    cell.opacity = jQuery.isNumeric(cell.prop('attrs/' + type + '/opacity')) ? cell.prop('attrs/' + type + '/opacity') : 1;
                                    cell.r = cell.prop('attrs/' + type + '/r');
                                    cell.prop('attrs/' + type + '/opacity', opacityState ? 1 : cell.opacity);
                                  }
                                  cell.state = state;
                                  cell.prop('attrs/' + type + '/fill', colorAry[state]);
                                  if(cell.state > 0) {
                                    if(_.contains(cell.getTransitions(), 'attrs/' + type)) return;
                                    cell.on('transition:end', function(el) {
                                      if(el.state > 0) {
                                        flash();
                                      } else {
                                        cell.prop('attrs/' + type + '/opacity', cell.opacity);
                                        cell.prop('attrs/' + type + '/r', cell.r);
                                      }
                                    });
                                    flash();
                                  } else {
                                    cell.prop('attrs/' + type + '/opacity', cell.opacity);
                                    cell.prop('attrs/' + type + '/r', cell.r);
                                  }
                                }
                              }
                            }
                            var changeIconAndText = function(cell, state, type) {
                              if(!type) type = "alertConfig";
                              if(type == "alertConfig") {
                                var alertIcon = cell.get("alertIcon");
                                if(alertIcon) {
                                  if(state < 1) state = 0;
                                  var alertConfig = cell.get(type);
                                  alertConfig.forEach(function(item) {
                                    if(item.id == state) {
                                      if(item.alertText)
                                        cell.prop('attrs/text/text', item.alertText);
                                      if(item.alertIcon)
                                        cell.prop('attrs/image/xlink:href', item.alertIcon);
                                    }
                                  })
                                }
                              } else if(type == "valueConfig") {
                                var valueConfig = cell.get(type);
                                valueConfig.forEach(function(item) {
                                  item.stateDisplay = false;
                                  if(item.valueText == state) {
                                    item.stateDisplay = true;
                                    if(item.valueText)
                                      cell.prop('attrs/text/text', item.valueText);
                                    if(item.valueIcon)
                                      cell.prop('attrs/image/xlink:href', item.valueIcon);
                                  }
                                })
                              }
                            };
                            var getFill = function(obj) {
                              var rs = {};
                              for(var i in obj) {
                                rs = obj[i];
                                break;
                              };
                              return rs.fill;
                            }
                            var getType = function(type) {
                              if(type == "basic.Rect") {
                                return "rect";
                              } else if(type == "basic.Circle") {
                                return "circle";
                              }
                            };
                            var getTextFill = function(obj) {
                              return obj['text']['fill'];
                            };
                            var getAllUnit_success = function(data) {
                              var extend = elDom.get('extend');
                              if(extend == 'alert' && findState) {
                                changeIconAndText(elDom, findState.value);
                              } else if(extend == 'value' && find) {
                                changeIconAndText(elDom, find.value, "valueConfig");
                              } else if(extend == 'level' && find) {
                                setLevel(elDom, find.value);
                              }  else if(extend == 'angle' && find) {
                                setOpenAngle(elDom, find.value, cell);
                              } else {
                                if(findState) {
                                  var stateType = cell['stateType'];
                                  if(stateType == "number:1") {
                                    breathFlash(elDom, getType(cell['type']), getFill(cell['attrs']), findState.value, false);
                                  } else if(stateType == "number:2") {
                                    bubbleFlash(elDom, getType(cell['type']), getFill(cell['attrs']), findState.value, false);
                                  } else if(stateType == "number:3") {
                                    breathFlash(elDom, getType(cell['type']), getFill(cell['attrs']), findState.value, true);
                                  } else if(stateType == "number:4") {
                                    bubbleFlash(elDom, getType(cell['type']), getFill(cell['attrs']), findState.value, true);
                                  } else {
                                    fillColor(elDom, getType(cell['type']), getFill(cell['attrs']), findState.value, getTextFill(cell['attrs']));
                                  }
                                }
                                if(find) {
                                  var allUnits = data;
                                  var unit = allUnits.find(function(elem) {
                                    if(cell.kpiObj)
                                      return elem.unitCode == cell.kpiObj.unit;
                                    else
                                      return "";
                                  });
                                  var unitType = false;
                                  if(elDom.get("unitType")) {
                                    unitType = elDom.get("unitType").split("number:")[1] == 1;
                                  };
                                  var rangeObj
                                  if(cell.resourceObj.modelId) {
                                    rangeObj = resourceUIService.$attr("rootModelsDic/" + cell.resourceObj.modelId + "/kpiDic/" + find.kpiCode + "/rangeObj");
                                    find.value = rangeObj ? rangeObj[find.value] : find.value;
                                  };
                                  var y = elDom.attributes.position.y;
                                  if(unit && unitType) {
                                    elDom.prop('attrs/text/text', find.value + "" + unit.unitName);
                                  } else {
                                    elDom.prop('attrs/text/text', find.value);
                                  };
                                  elDom.prop('position/y', y);
                                };
                              };
                            };
                            var error = function(err) {
                              elDom.prop('attrs/text/text', find.value);
                            };
                            serviceCenterService.units.getAll().then(getAllUnit_success, error);
                          }
                          createData(find);
                        }
                      }
                    };
                    data.forEach(function(returnData) {
                      if(returnData.kpiCode == 999999) { //节点告警状态处理
                        if(cellsDic[returnData.nodeId]) { //已经存在的节点
                          cellsDic[returnData.nodeId].forEach(function(cell) {
                            if(cell.state != returnData.value) {
                              var showEffect = true;
                              if(cell["kpiId"] && cell["kpiId"] != "number:0") {
                                if(returnData.instance) {
                                  if("number:" + returnData.instance != cell["kpiId"]) {
                                    showEffect = false;
                                  }
                                } else {
                                  showEffect = false;
                                }
                              } else {
                                if(returnData.instance) {
                                  showEffect = false;
                                }
                              }
                              if(!showEffect) return;
                              loop(cell, null, returnData);
                            }
                          })
                        } else {
                          json.cells.forEach(function(cell) {
                            if(cell["nodeId"]) {
                              var nodeIdAry = cell["nodeId"].split(":");
                              if(nodeIdAry.length > 0 && nodeIdAry[nodeIdAry.length - 1] == returnData.nodeId) {
                                if(!cellsDic[returnData.nodeId]) cellsDic[returnData.nodeId] = [];
                                cellsDic[returnData.nodeId].push(cell);
                                var showEffect = true;
                                if(cell["kpiId"] && cell["kpiId"] != "number:0") {
                                  if(returnData.instance) {
                                    if("number:" + returnData.instance != cell["kpiId"]) {
                                      showEffect = false;
                                    }
                                  } else {
                                    showEffect = false;
                                  }
                                } else {
                                  if(returnData.instance) {
                                    showEffect = false;
                                  }
                                }
                                if(!showEffect) return;
                                loop(cell, null, returnData);
                              }
                            }
                          })
                        }
                      } else {
                        if(cellsDic[returnData.nodeId + "_" + returnData.kpiCode]) {
                          cellsDic[returnData.nodeId + "_" + returnData.kpiCode].forEach(function(cellObj) {
                            loop(cellObj, returnData, null);
                          });
                        } else {
                          graph.getCells().forEach(function(cell) {
                            /** 考虑的组态内变量被负值的情况用cell.resourceObj.id来判断*/
                            if(cell.$attr("resourceObj/id") == returnData.nodeId) {
                              if(cell["kpiId"] || cell.$attr("kpiObj/id")) {
                                if(cell["kpiId"]){
                                  var kpiIdAry = cell["kpiId"].split(":");
                                }
                                if(cell.$attr("kpiObj/id")){
                                  var kpiIdAry = [cell.$attr("kpiObj/id")];
                                }
                                if(kpiIdAry.length > 0 && kpiIdAry[kpiIdAry.length - 1] == returnData.kpiCode) {
                                  if(cellsDic[returnData.nodeId + "_" + returnData.kpiCode] == undefined) {
                                    cellsDic[returnData.nodeId + "_" + returnData.kpiCode] = [];
                                  }
                                  cellsDic[returnData.nodeId + "_" + returnData.kpiCode].push(cell);
                                  loop(cell, returnData, null);
                                }
                              }
                            }
                            /**
                             if(cell["nodeId"]) {
                            var nodeIdAry = cell["nodeId"].split(":");
                            console.log(cell.resourceObj.id == returnData.nodeId);
                            if(nodeIdAry.length > 0 && nodeIdAry[nodeIdAry.length - 1] == returnData.nodeId) {
                              if(!cellsDic[returnData.nodeId + "_" + returnData.kpiCode]) cellsDic[returnData.nodeId + "_" + returnData.kpiCode] = [];
                              if(cell["kpiId"]) {
                                var kpiIdAry = cell["kpiId"].split(":");
                                if(kpiIdAry.length > 0 && kpiIdAry[kpiIdAry.length - 1] == returnData.kpiCode) {
                                  cellsDic[returnData.nodeId + "_" + returnData.kpiCode].push(cell);
                                  console.log("loop");
                                  loop(cell, returnData, null);
                                }
                              }
                            }
                          }*/
                          })
                        }
                      }
                    })
                  };
                  //获得设备的告警状态，包括实例
                  kpiDataService.getRealTimeKpiData(nodes, [999999], function(returnObj) {
                    if(returnObj.code == 0) {
                      getData_success(returnObj.data);
                    }
                  }, true);
                  //获得设备的数据
                  kpiDataService.getRealTimeKpiData(nodes, kpis, function(returnObj) {
                    if(returnObj.code == 0) {
                      getData_success(returnObj.data);
                    }
                  });
                  //加入节点告警状态
                  kpis.push(999999);
                  var paramSocket = {
                    ciid: nodes.toString(),
                    kpi: kpis.toString()
                  };
                  uuid = Math.uuid();
                  var operation = "register";
                  SwSocket.register(uuid, operation, function(event) {
                    getData_success([event.data]);
                  });
                  SwSocket.send(uuid, operation, 'kpi', paramSocket);
                  element.trigger("$loadCiKpiComplete", graph.getCells());
                });
                $("g.marker-vertices").attr("display", "none");
                $("g.marker-arrowheads").attr("display", "none");
                $("g.link-tools").attr("display", "none");
                /**
                 * PROMETHEUS-586
                 * 注销scope时注销方法heartBeat，回调函数callback
                 */
                $('#free-board').on('naviClick', function() {
                  console.log("on-destroy");
                  SwSocket.unregister(uuid);
                });
              };
            })
          }
          $$.loadExternalJs(['rappid-joint', 'lodash', 'backbone'], callback);
        } else {
          var warning = $('<p>视图不存在!</p>');
          warning.css({
            'min-height': '300px',
            'text-align': 'center',
            'line-height': '300px'
          });
          wrap.append(warning);
        }
      };
      if(inputJson){
        json = inputJson;
        run(json);
      } else {
        self.getViewById(viewId, function(view){
          json = JSON.parse(view.content);
          run(json);
        })
      }
    };
    delete element.self;
    topo.css("background-position", "top");
    topo.css("background-size", "contain");
    expression = expression ? expression : {};
    var initEvent = expression.$attr("on/init");
    var clickEvent = expression.$attr("on/click");
    var wholeClickEvent = expression.$attr("on/wholeClick");
    if(element.style) {
      topo.css(element.style)
    }
    if(typeof initEvent == "function") {
      try {
        initEvent({
          target: self,
          self: self,
          global: global,
          tools: elemData
        });
      } catch(e) {
        console.log(e);
      }
    } else {
      self.render(json);
    };
    topo.on("click", function(event) {
      if(typeof wholeClickEvent == "function") {
        try {
          wholeClickEvent({
            target: self,
            global: global
          });
        } catch(e) {
          console.log(e);
        }
      };
    });
    return topo;
  }
});