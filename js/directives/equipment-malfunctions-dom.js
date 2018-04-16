define(['directives/directives', 'bootstrap-dialog', 'datatables.net', 'datatables.net-bs', 'datatables.net-select'], function(directives, BootstrapDialog, datatables) {
  'use strict';
  directives.initDirective('alertTable', ['$timeout', '$compile', 'growl', '$filter', function($timeout, $compile, growl, $filter) {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          var domMain = $element;
          var table;
          var isEditing = false;
          $scope.$on(Event.ALERTINFOSINIT + "_view", function(event, args) {
            if(table) {
              table.destroy();
              domMain.empty();
            }
            isEditing = false;
            table = domMain.DataTable({
              dom: args.option[0] && args.option[0].length > 0 ? $.ProudSmart.datatable.footerdom : '',
              language: $.ProudSmart.datatable.language,
              data: args.option[0],
              "pageLength": $scope.selLength,
              // select: $.ProudSmart.datatable.select,
              order: [
                [6, "desc"]
              ],
              columns: [
                // $.ProudSmart.datatable.selectCol,
                {
                  title: "告警对象",
                  data: "devName"
                }, {
                  title: "告警名称",
                  data: "title"
                }, {
                  title: "告警消息",
                  data: "message"
                }, {
                  title: "告警级别",
                  data: "severity"
                }, {
                  title: "状态",
                  data: "state"
                }, {
                  title: "首次告警时间",
                  data: "firstArisingTime"
                }, {
                  title: "最近告警时间",
                  data: "arisingTime"
                }, {
                  title: "关闭告警时间",
                  data: "closeTime"
                },
                $.ProudSmart.datatable.optionCol3
              ],
              columnDefs: [
                //   {
                //   "targets": 0,
                //   orderable: false,
                //   "render": function(data, type, full) {
                //     // 返回自定义内容
                //     if(type == "display") {
                //       if(data) {
                //         return '<input class="itemCheckBox" checked type="checkbox">';
                //       } else {
                //         return '<input class="itemCheckBox" type="checkbox">';
                //       }
                //     }
                //     return "";
                //   }
                // },
                {
                  "targets": 0,
                  "data": "devName",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str = '';
                    if($scope.menuitems['A02_S02']) {
                      var modelId = full.nodeTypeList[full.nodeTypeList.length-1];
                      if (modelId == 300) {
                        str = "[管理域]" + data;
                      } else if (modelId == 301) {
                        str = "[客户域]" + data;
                      } else if (modelId == 302) {
                        str = "[项目域]" + data;
                      } else {
                        str = "<a href='#/facility/DEVICESEARCH/" + full.nodeId + "'>" + data + "</a>";
                      }
                    } else {
                      str = data;
                    }
                    return str;
                  }
                }, {
                  "targets": 1,
                  "data": "title",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str = '';
                    if($scope.menuitems['A01_S05']) {
                      // str = "<a href='#/alertRules/special/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/view'>" + data + "</a>";
                      if(full.agentId && full.agentId.indexOf("RULE:") != -1) {
                        str = "<a href='#/alertRules/" + full.nodeId + "/" + full.alertCode + "'>" + data + "</a>";
                      } else {
                        str = data;
                      }
                    } else {
                      str = data;
                    }
                    return str;
                  }
                }, {
                  "targets": 2,
                  "data": "message",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str;
                    str = escape(data);
                    return str;
                  }
                }, {
                  "targets": 3,
                  "data": "severity",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var severityStr = "无数据";
                    var severityBg = "alerts-warning";
                    if(data == 4) {
                      severityStr = "严重";
                      severityBg = "alerts-critical";
                    } else if(data == 3) {
                      severityStr = "重要";
                      severityBg = "alerts-major";
                    } else if(data == 2) {
                      severityStr = "次要";
                      severityBg = "alerts-minor";
                    } else if(data == 1) {
                      severityStr = "警告";
                      severityBg = "alerts-warning";
                    }
                    return "<span class='label " + severityBg + "'>" + severityStr + "</span>";
                  }
                }, {
                  "targets": 4,
                  "data": "state",
                  "render": function(data, type, full) {
                    var stateStr;
                    // 返回自定义内容
                    if(data == 0)
                      stateStr = "<span class='label label-info'>新产生</span>";
                    else if(data == 5)
                      stateStr = "<span class='label label-primary'>已确认</span>";
                    else if(data == 10)
                      stateStr = "<span class='label label-warning'>处理中</span>";
                    else if(data == 20)
                      stateStr = "<span class='label label-success'>已解决</span>";
                    else if(data == 30)
                      stateStr = "已忽略";
                    else
                      stateStr = "无数据";
                    return stateStr;
                  }
                }, {
                  "targets": 5,
                  "data": "firstArisingTime",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str;
                    str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                    //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
                    return str;
                  }
                }, {
                  "targets": 6,
                  "data": "arisingTime",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str;
                    str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                    //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
                    return str;
                  }
                }, {
                  "targets": 7,
                  "data": "closeTime",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str;
                    str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                    //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
                    return str;
                  }
                }, {
                  "targets": 8,
                  "orderable": false,
                  "data": "option",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str = "<div class='btn-group btn-group-sm'>";
                    if(full.state == 0) {
                      if($scope.menuitems['A08_S05']) {
                        str += "<button id='claim-btn' class='btn btn-primary' ><span class='hidden-xs'> 确认</span></button>";
                      }
                    } else {
                      if($scope.menuitems['A08_S05']) {
                        str += "<button disabled class='btn btn-primary' ><span class='hidden-xs'> 确认</span></button>";
                      }
                    }
                    if(full.state == 0 || full.state == 5 || full.state == 10) {
                      if($scope.menuitems['A07_S05']) {
                        str += "<button id='close-btn' class='btn btn-default' ><span class='hidden-xs'> 关闭</span></button>";
                      }
                    } else {
                      if($scope.menuitems['A07_S05']) {
                        str += "<button disabled class='btn btn-default' ><span class='hidden-xs'> 关闭</span></button>";
                      }
                    }
                    if($scope.menuitems['A06_S05'] && (full.state == 0 || full.state == 5)) {
                      str += "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'> 更多<span class='caret'></span></button>";
                      str += "<ul class='dropdown-menu' role='menu'>";
                      if($scope.menuitems['A06_S05']) {
                        str += "<li><a role='button' id='order-btn'>转工单</a></li>";
                      }
                      str += "</ul>";
                    }
                    str += "</div>";
                    return str;
                  }
                }
              ],
              rowCallback: function(nRow, aData, iDataIndex) {
                if(aData.selected) {
                  $(nRow).addClass("selected")
                } else {
                  $(nRow).removeClass("selected")
                }
                $compile(nRow)($scope);
              }
            });
          });
          /**
           * 监听表格初始化后，添加按钮
           */
          domMain.on('init.dt', function() {
            /*if(table != undefined){
              console.log( 'Showing page: '+$scope.selLength);
              if($scope.selLength > 0){
                table.page.len($scope.selLength).draw();
              }
            }*/

          });
          domMain.on('length.dt', function(e, settings, len) {
            $scope.selLength = len;
          });
          domMain.on('change', '#allselect-btn', function(e) {
            e.stopPropagation();
            if(e.target.checked) {
              table.rows().select();
              var tableRows = table.rows({
                selected: true
              });
              for(var i = 0; i < tableRows.nodes().length; i++) {
                var row = table.row(tableRows.nodes()[i]);
                row.data().selected = true;
              };
              table.rows().invalidate().draw(false);
            } else {
              var tableRows = table.rows({
                selected: true
              });
              for(var i = 0; i < tableRows.nodes().length; i++) {
                var row = table.row(tableRows.nodes()[i]);
                row.data().selected = false;
              };
              table.rows().deselect();
              table.rows().invalidate().draw(false);
            }
            $scope.selectedHandler();
          });

          domMain.on('change', '.itemCheckBox', function(e) {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            if(e.target.checked) {
              row.data().selected = true;
            } else {
              row.data().selected = false;
            }
            var tableRows = table.rows({
              selected: true
            });
            if(tableRows.count() != table.rows()[0].length) {
              $('#allselect-btn').attr('checked', false)
              $('#allselect-btn').prop('checked', false);
            } else if(tableRows.count() == table.rows()[0].length) {
              $('#allselect-btn').attr('checked', true)
              $('#allselect-btn').prop('checked', true);
            }
            $scope.selectedHandler();
          });

          // domMain.on('click', 'td', function(e) {
          //   var tr = $(this).closest('tr');
          //   var row = table.row(tr);
          //   var name = $(this).text();
          //   var rowData = row.data();
          //   if (rowData) {
          //     if (($(this).context.cellIndex == 5) || ($(this).context.cellIndex == 0)) {
          //       return;
          //     }
          //     if (name.indexOf("Dropdown") < 0) {
          //       if (rowData.orderId != null && rowData.orderId != '') {
          //         location.href = "index.html#/orderdetail/" + rowData.orderId + "/order";
          //       }
          //     }
          //   }
          // });
          domMain.on('click', '#claim-btn', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            $scope.doAction('claim', [row.data()['alertId']], function(flg) {
              if(flg) {
                $scope.reloadViewId();
                /* row.data().state = 5;
                 row.cells().invalidate().draw(false);*/
              }
            });
          });
          domMain.on('click', '#close-btn', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            $scope.doAction('close', [row.data()['alertId']], function(flg) {
              if(flg.code == 0) {
                $scope.reloadViewId();
                /*row.data().state = 20;
                if(flg.data.closeTime == undefined){
                  row.data().closeTime = flg.data.actTime;
                }
                // row.cells().invalidate().draw(false);
                row.remove().draw(false);*/
              } else {
                row.cells().invalidate().draw(false);
              }
            });
          });
          domMain.on('click', '#order-btn', function(e) {
            e.preventDefault()
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var rowData = row.data();
            $scope.ngDialogOrder(rowData);
            $scope.submitBtn = function() {
              // var tr = $(this).closest('tr').parent();
              // var row = table.row(tr);
              $scope.doAction('submit-btn', 111, function(flg) {
                if(flg) {
                  row.data().state = 10;
                  row.cells().invalidate().draw(false);
                }
              });
            };
          });
          // domMain.on('click', '#submit-btn', function(e) {
          //   e.preventDefault();
          //   var tr = $(this).closest('tr').parent();
          //   var row = table.row(tr);
          //   $scope.isEditing = false;
          //   tr.removeClass('shown');
          //   $scope.doAction('submit-btn', 111, function(flg) {
          //     if (flg) {
          //       row.data().state = 10;
          //       row.cells().invalidate().draw(false);
          //     }
          //   });
          // });
          domMain.on('click', "#cancel-btn", function(e) {
            e.preventDefault();
            console.log("取消");
            var tr = $("#newtr").closest('tr');
            var row = table.row(tr);
            var rowData = row.data();
            tr.css("display", "none");
            $scope.doAction('cancel-btn', row.data(), function(returnObj) {});
          });

          $scope.$on("addOrder", function() {
            $scope.addOrder();
          });
          $scope.$on("selectedOrder", function() {
            $scope.selectedOrder();
          });
          $scope.$on("selectedClose", function() {
            $scope.selectedClose();
          });
          $scope.$on("changeState", function() {
            changeState();
          });

          //多项确认
          $scope.selectedOrder = function() {
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            if(selectedCount == 0) {
              growl.warning("当前没有选中的告警项", {});
              return;
            }
            BootstrapDialog.show({
              title: '提示',
              closable: false,
              //size:BootstrapDialog.SIZE_WIDE,
              message: '确认您所选择的 ' + selectedCount + ' 条记录吗？',
              buttons: [{
                label: '确定',
                cssClass: 'btn-success',
                action: function(dialogRef) {
                  var successCount = 0;
                  var errorCount = 0;
                  var AlertIdsArr = [];
                  var ifGo = false;
                  for(var i = 0; i < nodes.length; i++) {
                    var row = table.row(nodes[i]);
                    var rowData = row.data();
                    if(rowData.state == 0) {
                      AlertIdsArr.push(rowData.alertId);
                      successCount++;
                      row.data().state = 5;
                    } else {
                      errorCount++;
                    }
                    if(selectedCount == (successCount + errorCount)) {
                      ifGo = true;
                      growl.success("成功确认" + successCount + "个,失败" + errorCount + "个", {});
                      $scope.selectAlertList.selList = [];
                      $scope.$apply();
                    }
                  };
                  if(ifGo) {
                    $scope.doAction("claim", AlertIdsArr, function(returnObj) {
                      if(returnObj) {
                        row.cells().invalidate().draw(false);
                        $(".itemCheckBox").each(function() {
                          $(this).attr("checked", false);
                        });
                        $("#allselect-btn").attr("checked", false);
                        table.rows().deselect();
                      }
                    });
                  }
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

          //多项关闭
          $scope.selectedClose = function() {
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            if(selectedCount == 0) {
              growl.warning("当前没有选中的告警项", {});
              return;
            }
            BootstrapDialog.show({
              title: '提示',
              closable: false,
              //size:BootstrapDialog.SIZE_WIDE,
              message: '确认您所选择的 ' + selectedCount + ' 条记录吗？',
              buttons: [{
                label: '确定',
                cssClass: 'btn-success',
                action: function(dialogRef) {
                  var successCount = 0;
                  var errorCount = 0;
                  var AlertIdsArr = [];
                  var ifGo = false;
                  for(var i = 0; i < nodes.length; i++) {
                    var row = table.row(nodes[i]);
                    var rowData = row.data();
                    if(rowData.state == 0 || rowData.state == 5 || rowData.state == 10) {
                      AlertIdsArr.push(rowData.alertId);
                      successCount++;
                      row.data().state = 20;
                    } else {
                      errorCount++;
                    }
                    if(selectedCount == (successCount + errorCount)) {
                      ifGo = true;

                      growl.success("成功确认" + successCount + "个,失败" + errorCount + "个", {});
                      $scope.selectAlertList.selList = [];
                      $scope.$apply();
                    }
                  };
                  if(ifGo) {
                    $scope.doAction("close2", AlertIdsArr, function(returnObj) {
                      if(returnObj) {
                        row.cells().invalidate().draw(false);
                        $(".itemCheckBox").each(function() {
                          $(this).attr("checked", false);
                        });
                        $("#allselect-btn").attr("checked", false);
                        table.rows().deselect();
                      }
                    });
                  }
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

          //多项转工单
          $scope.addOrder = function() {
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            if(selectedCount == 0) {
              growl.warning("当前没有选中的告警项", {});
              return;
            }
            var successCount = 0;
            var errorCount = 0;
            var AlertIdsArr = [];
            var ifGo = false;
            for(var i = 0; i < nodes.length; i++) {
              var row = table.row(nodes[i]);
              var rowData = row.data();
              if(rowData.state == 0 || rowData.state == 5) {
                AlertIdsArr.push(rowData.alertId);
                successCount++;
                row.data().state = 10;
              } else {
                errorCount++;
              }
              if(selectedCount == (successCount + errorCount)) {
                ifGo = true;
                growl.success("成功确认" + successCount + "个,失败" + errorCount + "个", {});
              }
            };
            if(ifGo) {
              $scope.doAction("order", AlertIdsArr, function(returnObj) {
                if(returnObj) {

                }
              });
            }
          };

          //转工单成功后改变状态
          function changeState() {
            var ifGo = false;
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            for(var i = 0; i < nodes.length; i++) {
              var row = table.row(nodes[i]);
              var rowData = row.data();
              // row.data().state = 10;
              row.cells().invalidate().draw(false);
              ifGo = true;
            };
            if(ifGo) {
              $(".itemCheckBox").each(function() {
                $(this).attr("checked", false);
              });
              $("#allselect-btn").attr("checked", false);
              table.rows().deselect();
            }
          }
        }
      ]
    };
  }]);
  directives.initDirective('alertPageTable', ['$timeout', '$compile', 'growl', '$filter', function($timeout, $compile, growl, $filter) {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          var domMain = $element;
          var table;
          var isEditing = false;
          $scope.$on(Event.ALERTINFOSINIT, function(event, args) {
            if(table) {
              table.destroy();
              domMain.empty();
            }
            isEditing = false;
            table = domMain.DataTable({
              ordering: false,
              dom: $.ProudSmart.datatable.specialdom,
              language: $.ProudSmart.datatable.language,
              processing: true,
              serverSide: true,
              select: $.ProudSmart.datatable.select,
              ajax: $scope.pipeline(),
              columns: [
                $.ProudSmart.datatable.selectCol,
                {
                  title: "告警对象",
                  data: "devName"
                }, {
                  title: "告警名称",
                  data: "title"
                }, {
                  title: "告警消息",
                  data: "message"
                }, {
                  title: "告警级别",
                  data: "severity"
                }, {
                  title: "状态",
                  data: "state"
                }, {
                  title: "首次告警时间",
                  data: "firstArisingTime"
                }, {
                  title: "最近告警时间",
                  data: "arisingTime"
                }, {
                  title: "关闭告警时间",
                  data: "closeTime"
                },
                $.ProudSmart.datatable.optionCol3
              ],
              columnDefs: [{
                "targets": 0,
                "orderable": false,
                "render": function(data, type, full) {
                  // 返回自定义内容
                  if(type == "display") {
                    if(data) {
                      return '<input class="itemCheckBox" checked type="checkbox">';
                    } else {
                      return '<input class="itemCheckBox" type="checkbox">';
                    }
                  }
                  return "";
                }
              }, {
                "targets": 1,
                "data": "devName",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str = '';
                  if($scope.menuitems['A02_S02']) {
                    var modelId = full.nodeTypeList[full.nodeTypeList.length-1];
                    if (modelId == 300) {
                      str = "[管理域]" + data;
                    } else if (modelId == 301) {
                      str = "[客户域]" + data;
                    } else if (modelId == 302) {
                      str = "[项目域]" + data;
                    } else {
                      str = "<a href='#/facility/DEVICESEARCH/" + full.nodeId + "'>" + data + "</a>";
                    }
                  } else {
                    str = data;
                  }
                  return str;
                }
              }, {
                "targets": 2,
                "data": "title",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str = '';
                  if($scope.menuitems['A01_S05']) {
                    // str = "<a href='#/alertRules/special/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/view'>" + data + "</a>";
                    // str = "<a href='#/alertRules//" + full.alertCode + "'>" + data + "</a>";
                    if(full.agentId && full.agentId.indexOf("RULE:") != -1) {
                      str = "<a href='#/alertRules/" + full.nodeId + "/" + full.alertCode + "'>" + data + "</a>";
                    } else {
                      str = data;
                    }
                  } else {
                    str = data;
                  }
                  /*if(full.kpiCode == 0) {
                    // var str = "<a href='#/resource_type/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/fault'>" + data + "</a>";
                     str = "<a href='#/alertRules/special/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/fault'>" + data + "</a>";
                  } else {
                    // var str = "<a href='#/resource_type/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/alert'>" + data + "</a>";
                    var str = "<a href='#/alertRules/special/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/alert'>" + data + "</a>";
                  }*/

                  return str;
                }
              }, {
                "targets": 3,
                "data": "message",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str;
                  str = escape(data);
                  return str;
                }
              }, {
                "targets": 4,
                "data": "severity",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var severityStr = "无数据";
                  var severityBg = "alerts-warning";
                  if(data == 4) {
                    severityStr = "严重";
                    severityBg = "alerts-critical";
                  } else if(data == 3) {
                    severityStr = "重要";
                    severityBg = "alerts-major";
                  } else if(data == 2) {
                    severityStr = "次要";
                    severityBg = "alerts-minor";
                  } else if(data == 1) {
                    severityStr = "警告";
                    severityBg = "alerts-warning";
                  }
                  return "<span class='label " + severityBg + "'>" + severityStr + "</span>";
                }
              }, {
                "targets": 5,
                "data": "state",
                "render": function(data, type, full) {
                  var stateStr;
                  // 返回自定义内容
                  if(data == 0)
                    stateStr = "<span class='label label-info'>新产生</span>";
                  else if(data == 5)
                    stateStr = "<span class='label label-primary'>已确认</span>";
                  else if(data == 10)
                    stateStr = "<span class='label label-warning'>处理中</span>";
                  else if(data == 20)
                    stateStr = "<span class='label label-success'>已解决</span>";
                  else if(data == 30)
                    stateStr = "已忽略";
                  else
                    stateStr = "无数据";
                  return stateStr;
                }
              }, {
                "targets": 6,
                "data": "firstArisingTime",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str;
                  str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                  //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
                  return str;
                }
              }, {
                "targets": 7,
                "data": "arisingTime",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str;
                  str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                  //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
                  return str;
                }
              }, {
                "targets": 8,
                "data": "closeTime",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str;
                  str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
                  //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
                  return str;
                }
              }, {
                "targets": 9,
                "data": "option",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str = "<div class='btn-group btn-group-sm'>";
                  if(full.state == 0) {
                    if($scope.menuitems['A08_S05']) {
                      str += "<button id='claim-btn' class='btn btn-primary' ><span class='hidden-xs'> 确认</span></button>";
                    }
                  } else {
                    if($scope.menuitems['A08_S05']) {
                      str += "<button disabled class='btn btn-primary' ><span class='hidden-xs'> 确认</span></button>";
                    }
                  }
                  if(full.state == 0 || full.state == 5 || full.state == 10) {
                    if($scope.menuitems['A07_S05']) {
                      str += "<button id='close-btn' class='btn btn-default' ><span class='hidden-xs'> 关闭</span></button>";
                    }
                  } else {
                    if($scope.menuitems['A07_S05']) {
                      str += "<button disabled class='btn btn-default' ><span class='hidden-xs'> 关闭</span></button>";
                    }
                  }
                  if($scope.menuitems['A06_S05'] && (full.state == 0 || full.state == 5)) {
                    str += "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'> 更多<span class='caret'></span></button>";
                    str += "<ul class='dropdown-menu' role='menu'>";
                    if($scope.menuitems['A06_S05']) {
                      str += "<li><a role='button' id='order-btn'>转工单</a></li>";
                    }
                    str += "</ul>";
                  }
                  str += "</div>";
                  return str;
                }
              }],
              rowCallback: function(nRow, aData, iDataIndex) {
                if(aData.selected) {
                  $(nRow).addClass("selected")
                } else {
                  $(nRow).removeClass("selected")
                }
                $compile(nRow)($scope);
              },
              drawCallback: function(settings) {
                var api = this.api();
                if(api.data().length > 0) {
                  $(".footerdom").show();
//                $(".dataTables_wrapper .dataTables_filter").show();
                  $(".dataTables_wrapper .dataTables_filter").empty();
                } else {
                  $(".footerdom").hide();
                  $(".dataTables_wrapper .row").hide()
                  $(".dataTables_wrapper .dataTables_filter").empty();
                }
                $('#allselect-btn').attr('checked', false)
                $('#allselect-btn').prop('checked', false);
              }
            });
          });
          /**
           * 监听表格初始化后，添加按钮
           */
          domMain.on('init.dt', function() {
            var parentDom = $(".special-btn").parent();
            var str = '<div class="btn-group margin-bottom-5">';
            str += '<button type="button" ng-click="selectedOrder();" ng-show="menuitems[&apos;A08_S05&apos;]" ng-disabled="confirmActiveAlert.length == 0" class="btn btn-default btn-sm"><i class="fa fa-check"></i><span class="hidden-sm"> 确认告警</span></button>';
            str += '<button type="button" ng-click="selectedClose();" ng-show="menuitems[&apos;A07_S05&apos;]" ng-disabled="closeActiveAlert.length == 0" class="btn btn-default btn-sm"><i class="fa fa-close"></i><span class="hidden-sm"> 关闭告警</span></button>';
            str += '<button type="button" ng-if="false" ng-click="addOrder();" class="btn btn-default btn-sm"><i class="fa fa-mail-forward"></i><span class="hidden-sm"> 转工单</span></button></div>';
            parentDom.html(str);
            $compile(parentDom)($scope);
          });
          domMain.on('change', '#allselect-btn', function(e) {
            e.stopPropagation();
            if(e.target.checked) {
              table.rows().select();
              var tableRows = table.rows({
                selected: true
              });
              for(var i = 0; i < tableRows.nodes().length; i++) {
                var row = table.row(tableRows.nodes()[i]);
                row.data().selected = true;
              };
              table.rows().invalidate().draw(false);
            } else {
              var tableRows = table.rows({
                selected: true
              });
              for(var i = 0; i < tableRows.nodes().length; i++) {
                var row = table.row(tableRows.nodes()[i]);
                row.data().selected = false;
              };
              table.rows().deselect();
              table.rows().invalidate().draw(false);
            }
            $scope.selectedHandler();
          });

          domMain.on('change', '.itemCheckBox', function(e) {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            if(e.target.checked) {
              row.data().selected = true;
            } else {
              row.data().selected = false;
            }
            var tableRows = table.rows({
              selected: true
            });
            if(tableRows.count() != table.rows()[0].length) {
              $('#allselect-btn').attr('checked', false)
              $('#allselect-btn').prop('checked', false);
            } else if(tableRows.count() == table.rows()[0].length) {
              $('#allselect-btn').attr('checked', true)
              $('#allselect-btn').prop('checked', true);
            }
            $scope.selectedHandler();
          });

          // domMain.on('click', 'td', function(e) {
          //   var tr = $(this).closest('tr');
          //   var row = table.row(tr);
          //   var name = $(this).text();
          //   var rowData = row.data();
          //   if (rowData) {
          //     if (($(this).context.cellIndex == 5) || ($(this).context.cellIndex == 0)) {
          //       return;
          //     }
          //     if (name.indexOf("Dropdown") < 0) {
          //       if (rowData.orderId != null && rowData.orderId != '') {
          //         location.href = "index.html#/orderdetail/" + rowData.orderId + "/order";
          //       }
          //     }
          //   }
          // });
          domMain.on('click', '#claim-btn', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            $scope.doAction('claim', [row.data()['alertId']], function(flg) {
              if(flg) {
                row.data().state = 5;
                $scope.$broadcast(Event.ALERTINFOSINIT, {
                  "option": []
                });
                // row.cells().invalidate().draw(false);
              }
            });
          });
          domMain.on('click', '#close-btn', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            $scope.doAction('close', [row.data()['alertId']], function(flg) {
              if(flg.code == 0) {
                row.data().state = 20;
                if(flg.data.closeTime == undefined) {
                  row.data().closeTime = flg.data.actTime;
                }
                $scope.$broadcast(Event.ALERTINFOSINIT, {
                  "option": []
                });
              } else {
                row.cells().invalidate().draw(false);
              }
            });
          });
          domMain.on('click', '#order-btn', function(e) {
            e.preventDefault()
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var rowData = row.data();
            $scope.ngDialogOrder(rowData);

            $scope.submitBtn = function() {
              // var tr = $(this).closest('tr').parent();
              // var row = table.row(tr);
              $scope.doAction('submit-btn', 111, function(flg) {
                if(flg) {
                  var list = $scope.pageAlertList;
                  var data = row.data();
                  for(var i in list) {
                    if(list[i].alertId == data.alertId) {
                      list[i].state = 10;
                    }
                    $scope.ajaxListUpdate.push(list[i]);
                  }
                  table.ajax.reload();
                  // row.data().state = 10;
                  // row.cells().invalidate().draw(false);
                }
              });
            };
          });
          // domMain.on('click', '#submit-btn', function(e) {
          //   e.preventDefault();
          //   var tr = $(this).closest('tr').parent();
          //   var row = table.row(tr);
          //   $scope.isEditing = false;
          //   tr.removeClass('shown');
          //   $scope.doAction('submit-btn', 111, function(flg) {
          //     if (flg) {
          //       row.data().state = 10;
          //       row.cells().invalidate().draw(false);
          //     }
          //   });
          // });
          domMain.on('click', "#cancel-btn", function(e) {
            e.preventDefault();
            console.log("取消");
            var tr = $("#newtr").closest('tr');
            var row = table.row(tr);
            var rowData = row.data();
            tr.css("display", "none");
            $scope.doAction('cancel-btn', row.data(), function(returnObj) {});
          });

          $scope.$on("addOrder", function() {
            $scope.addOrder();
          });
          $scope.$on("selectedOrder", function() {
            $scope.selectedOrder();
          });
          $scope.$on("selectedClose", function() {
            $scope.selectedClose();
          });
          $scope.$on("changeState", function() {
            changeState();
          });

          //多项确认
          $scope.selectedOrder = function() {
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            if($scope.confirmActiveAlert.length == 0) {
              growl.warning("当前没有要确认的告警项", {});
              return;
            }
            BootstrapDialog.show({
              title: '提示',
              closable: false,
              //size:BootstrapDialog.SIZE_WIDE,
              message: '当前有 ' + $scope.confirmActiveAlert.length + ' 个告警未确认状态，要确认吗？',
              buttons: [{
                label: '确定',
                cssClass: 'btn-success',
                action: function(dialogRef) {
                  var successCount = 0;
                  var errorCount = 0;
                  var AlertIdsArr = [];
                  var ifGo = false;
                   for(var i = 0; i < nodes.length; i++) {
                   var row = table.row(nodes[i]);
                   var rowData = row.data();
                   if(rowData.state == 0) {
                   // AlertIdsArr.push(rowData.alertId);
                   successCount++;
                   row.data().state = 5;
                   } else {
                   errorCount++;
                   }
                   if(selectedCount == (successCount + errorCount)) {
                   ifGo = true;
                   growl.success("成功确认" + successCount + "个,失败" + errorCount + "个", {});
                   $scope.selectAlertList.selList = [];
                   $scope.$apply();
                   }
                   };
                  $scope.confirmActiveAlert.forEach(function(deactiveGate) {
                    AlertIdsArr.push(deactiveGate.alertId);
                  });
                  if(ifGo) {
                    $scope.doAction("claim2", AlertIdsArr, function(returnObj) {
                      if(returnObj) {
                        $scope.confirmActiveAlert = [];
                        row.cells().invalidate().draw(false);
                        $(".itemCheckBox").each(function() {
                          $(this).attr("checked", false);
                        });
                        $("#allselect-btn").attr("checked", false);
                        table.rows().deselect();
                      }
                    });
                  }
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

          //多项关闭
          $scope.selectedClose = function() {
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            if($scope.closeActiveAlert.length == 0) {
              growl.warning("当前没有要关闭的告警项", {});
              return;
            }
            BootstrapDialog.show({
              title: '提示',
              closable: false,
              //size:BootstrapDialog.SIZE_WIDE,
              message: '当前有 ' + $scope.closeActiveAlert.length + ' 个告警未关闭状态，要关闭吗？',
              buttons: [{
                label: '确定',
                cssClass: 'btn-success',
                action: function(dialogRef) {
                  var successCount = 0;
                  var errorCount = 0;
                  var AlertIdsArr = [];
                  var ifGo = false;
                  for(var i = 0; i < nodes.length; i++) {
                    var row = table.row(nodes[i]);
                    var rowData = row.data();
                    if(rowData.state == 0 || rowData.state == 5 || rowData.state == 10) {
                      // AlertIdsArr.push(rowData.alertId);
                      successCount++;
                      row.data().state = 20;
                    } else {
                      errorCount++;
                    }
                    if(selectedCount == (successCount + errorCount)) {
                      ifGo = true;

                      growl.success("成功关闭" + successCount + "个,失败" + errorCount + "个", {});
                      $scope.selectAlertList.selList = [];
                      $scope.$apply();
                    }
                  };
                  if(ifGo) {
                    $scope.closeActiveAlert.forEach(function(deactiveGate) {
                      AlertIdsArr.push(deactiveGate.alertId);
                    });
                    $scope.doAction("close2", AlertIdsArr, function(returnObj) {
                      if(returnObj) {
                        $scope.closeActiveAlert = [];
                        row.cells().invalidate().draw(false);
                        $(".itemCheckBox").each(function() {
                          $(this).attr("checked", false);
                        });
                        $("#allselect-btn").attr("checked", false);
                        table.rows().deselect();
                      }
                    });
                  }
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

          //多项转工单
          $scope.addOrder = function() {
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            if(selectedCount == 0) {
              growl.warning("当前没有选中的告警项", {});
              return;
            }
            var successCount = 0;
            var errorCount = 0;
            var AlertIdsArr = [];
            var ifGo = false;
            for(var i = 0; i < nodes.length; i++) {
              var row = table.row(nodes[i]);
              var rowData = row.data();
              if(rowData.state == 0 || rowData.state == 5) {
                AlertIdsArr.push(rowData.alertId);
                successCount++;
                row.data().state = 10;
              } else {
                errorCount++;
              }
              if(selectedCount == (successCount + errorCount)) {
                ifGo = true;
                growl.success("成功确认" + successCount + "个,失败" + errorCount + "个", {});
              }
            };
            if(ifGo) {
              $scope.doAction("order", AlertIdsArr, function(returnObj) {
                if(returnObj) {

                }
              });
            }
          };

          //转工单成功后改变状态
          function changeState() {
            var ifGo = false;
            var tableRows = table.rows({
              selected: true
            });
            var selectedCount = tableRows.count();
            var nodes = tableRows.nodes();
            for(var i = 0; i < nodes.length; i++) {
              var row = table.row(nodes[i]);
              var rowData = row.data();
              // row.data().state = 10;
              row.cells().invalidate().draw(false);
              ifGo = true;
            };
            if(ifGo) {
              $(".itemCheckBox").each(function() {
                $(this).attr("checked", false);
              });
              $("#allselect-btn").attr("checked", false);
              table.rows().deselect();
            }
          }
        }
      ]
    };
  }]);

});