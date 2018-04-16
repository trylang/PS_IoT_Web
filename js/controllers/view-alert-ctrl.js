define(['controllers/controllers', 'bootstrap-dialog'], function(controllers, BootstrapDialog) {
  'use strict';
  controllers.initController('ViewAlertCtrl', ['$scope', '$routeParams', 'ngDialog', 'userLoginUIService', 'alertService', 'SwSocket', 'Info',
    'viewFlexService', 'alertManageFlexService', 'growl', 'ticketCategoryService', 'ticketService', 'processService', '$filter', '$timeout', '$location',
    function($scope, $routeParams, ngDialog, userLoginUIService, alertService, SwSocket, Info, viewFlexService,
      alertManageFlexService, growl, ticketCategoryService, ticketService, processService, $filter, $timeout, $location) {
      console.info("进入设备故障");

      var columns = [];
      var columsData = [];
      var viewInfo;
      var searchAlertData;
      var stateIndex;
      var severityIndex;
      var states;
      var uuid = Math.uuid();

      // $scope.commitloading = false; //发布工单，取消工单状态。目的不让多次点击提交取消

      $scope.priority = [{
        "value": "0",
        "label": "低"
      }, {
        "value": "100",
        "label": "中"
      }, {
        "value": "200",
        "label": "高"
      }];

      var alertStyle;
      var info = Info.get("../localdb/info.json", function(info) {
        alertStyle = info.alertStyle;
      });

      var callback = function(evendata) {
        if(columsData.length > 0) {
          var tmp = 0;
          columsData.forEach(function(item) {
            if(item.alertId == evendata.data.alertId) {
              tmp = 1;
              item.message = evendata.data.message;
              item.title = evendata.data.title;
              item.severity = evendata.data.severity;
              item.state = evendata.data.state;
              item.arisingTime = evendata.data.arisingTime;
            }
          })
          if(tmp <= 0) {
            columsData.push(evendata.data);
          }
        } else {
          columsData.push(evendata.data);
        }
        $scope.$broadcast(Event.ALERTINFOSINIT + "_view", {
          "option": [columsData]
        });
        /*var addDatas = [];
        $scope.$broadcast('OptionStatusChange', {
          "data": addDatas
        });*/
      };
      $scope.processTypeData = [];
      var getProcedure = function() {
        ticketCategoryService.getTicketCategorys(function(returnObj) {
          if(returnObj.code == 0) {
            $scope.processTypeData = returnObj.data;
          /*  var arr1 = [];
            var arr2 = [];
            var arr3 = [];
            var arr4 = [];
            var arr5 = [];
            for(var i in returnObj.data) {
              if(returnObj.data[i].category == 10) { //告警工单
                arr1.push(returnObj.data[i]);
              } else if(returnObj.data[i].category == 20) {
                arr2.push(returnObj.data[i]);
              } else if(returnObj.data[i].category == 30) {
                arr3.push(returnObj.data[i]);
              } else if(returnObj.data[i].category == 40) {
                arr4.push(returnObj.data[i]);
              }else if(returnObj.data[i].category == 50) {
                arr5.push(returnObj.data[i]);
              }
            }
            $scope.processType1 = arr1;
            $scope.processType2 = arr2;
            $scope.processType3 = arr3;
            $scope.processType4 = arr4;
            $scope.processType5 = arr5;*/
          }
        })
      }
      getProcedure();

      $scope.getOrderProcedure = function() {
       /* if($scope.orderData.category == 10) {
         $scope.processType = $scope.processType1;
         } else if($scope.orderData.category == 20) {
         $scope.processType = $scope.processType2;
         } else if($scope.orderData.category == 30) {
         $scope.processType = $scope.processType3;
         } else if($scope.orderData.category == 40) {
         $scope.processType = $scope.processType4;
         } else if($scope.orderData.category == 50) {
         $scope.processType = $scope.processType5;
         } else {
         $scope.processType = [];
         }*/
        $scope.processType = [];
        var processTypeList = $scope.processTypeData;
        for (var i in processTypeList) {
          if(processTypeList[i].category == $scope.orderData.category){
            $scope.processType.push(processTypeList[i]);
          }
        }
      }

      //添加工单
      $scope.showOrder = function() {
        initHistry();
        ngDialog.open({
          template: 'addOrder',
          className: 'ngdialog-theme-plain',
          scope: $scope
        });
      };

      /**
       * 获取工单数据
       *
       * orderId
       */
      $scope.getOrderData = function() {
        ticketService.getAllTickets(function(returnObj) {
          if(returnObj.code == 0) {
            $scope.workOrderData = returnObj.data;
          }
        })
      }
      $scope.getOrderData();

      var getColumns = function(ary) {
        for(var i in ary) {
          var col = ary[i];
          if(col.visible == true || col.visible == "true") {
            var colobj = new Object();
            colobj.data = col.dataField;
            colobj.title = col.headerText;
            columns.push(colobj);
            if(colobj.data == "state") {
              stateIndex = columns.length - 1;
            } else if(colobj.data == "severity") {
              severityIndex = columns.length - 1;
            }
          }
        }
        var colobj = new Object();
        colobj.data = "option";
        colobj.title = "操作";
        columns.push(colobj);
        //告警查询添加，转工单，确认，关闭的全选
        var checkObj = {};
        checkObj.data = "selected";
        checkObj.title = '<input id="allselect-btn" type="checkbox">';
        checkObj.width = "8px";
        columns.unshift(checkObj);
      };
      var formatDate = function(str) {
        if(str) {
          str = newDateJson(str).Format(GetDateCategoryStrByLabel());
        }
        return str;
      }
      var initAlertInfo = function(alertReturnObj) {
        columns = [];
        columsData = [];
        var alertItme = viewInfo.view;
        var profile
        if(alertItme)
          profile = jQuery.xml2json(alertItme.profile);
        if(profile != null && profile.hasOwnProperty("style")) {
          getColumns(profile.style.column);
        } else {
          getColumns(alertStyle);
        }
        // var columnDefs = [];
        // if (stateIndex != -1) {
        //   columnDefs.push({
        //     "targets": stateIndex + 1,
        //     "data": "state",
        //     "render": function(data, type, full) {
        //       var stateStr;
        //       // 返回自定义内容
        //       if (data == 0)
        //         stateStr = "<span class='label label-info'>新产生</span>";
        //       else if (data == 5)
        //         stateStr = "<span class='label label-primary'>已确认</span>";
        //       else if (data == 10)
        //         stateStr = "<span class='label label-warning'>处理中</span>";
        //       else if (data == 20)
        //         stateStr = "<span class='label label-success'>已解决</span>";
        //       else if (data == 30)
        //         stateStr = "已忽略";
        //       else
        //         stateStr = "未知";
        //       return stateStr;
        //     }
        //   })
        // }
        // if (severityIndex != -1) {
        //   columnDefs.push({
        //     "targets": severityIndex + 1,
        //     "data": "severity",
        //     "render": function(data, type, full) {
        //       // 返回自定义内容
        //       var severityStr = "未知";
        //       var severityBg = "alerts-warning";
        //       if (data == 4) {
        //         severityStr = "严重";
        //         severityBg = "alerts-critical";
        //       } else if (data == 3) {
        //         severityStr = "重要";
        //         severityBg = "alerts-major";
        //       } else if (data == 2) {
        //         severityStr = "次要";
        //         severityBg = "alerts-minor";
        //       } else if (data == 1) {
        //         severityStr = "警告";
        //         severityBg = "alerts-warning";
        //       }
        //       return "<span class='label " + severityBg + "'>" + severityStr + "</span>";
        //     }
        //   })
        // }

        // columnDefs.push({
        //   "targets": 0,
        //   "data": "selected",
        //   "render": function(data, type, full) {
        //     // 返回自定义内容
        //     if (type == "display") {
        //       if (data) {
        //         return '<input class="itemCheckBox" checked type="checkbox">';
        //       } else {
        //         return '<input class="itemCheckBox" type="checkbox">';
        //       }
        //     }
        //     return "";
        //   }
        // });

        // columnDefs.push({
        //   "targets": 1,
        //   "data": "title",
        //   "render": function(data, type, full) {
        //     // 返回自定义内容
        //     var domainstring = '';
        //     for (var i in full.domainList) {
        //       domainstring += full.domainList[i] + '-';
        //     }
        //     domainstring = domainstring.substring(0, domainstring.length - 1);

        //     if (full.kpiCode == 0) {
        //       var str = "<a href='#/resource_type/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/fault'>" + data + "</a>";
        //     } else {
        //       var str = "<a href='#/resource_type/" + full.nodeTypeList[full.nodeTypeList.length - 1] + "/alert'>" + data + "</a>";
        //     }

        //     return str;
        //   }
        // });

        // columnDefs.push({
        //   "targets": 5,
        //   "data": "arisingTime",
        //   "render": function(data, type, full) {
        //     // 返回自定义内容
        //     var str;
        //     str = $filter('date')(data, 'yyyy-MM-dd HH:mm:ss');
        //     //str = "<span date-label value=" + data + " format='yyyy-MM-dd HH:mm:ss'></span>";
        //     return str;
        //   }
        // });
        // columnDefs.push({
        //   "targets": 2,
        //   "data": "message",
        //   "render": function(data, type, full) {
        //     // 返回自定义内容
        //     var str;
        //     str = escape(data);
        //     return str;
        //   }
        // });
        // columnDefs.push({
        //   "targets": columns.length - 1,
        //   "orderable": false,
        //   "data": "option",
        //   "width": "141px",
        //   "render": function(data, type, full) {
        //     // 返回自定义内容
        //     var str = "<div class='btn-group btn-group-sm'>";

        //     if (full.state == 0) {
        //       str += "<button id='claim-btn' class='btn btn-primary' ><span class='hidden-xs'> 确认</span></button>";
        //       str += "<button id='close-btn' class='btn btn-default' ><span class='hidden-xs'> 关闭</span></button>";
        //       str += "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'> 更多<span class='caret'></span></button>";
        //       str += "<ul class='dropdown-menu' role='menu'>";
        //       str += "<li><a role='button' id='order-btn'>转工单</a></li>";
        //       str += "</ul></div>";
        //     }
        //     if (full.state == 5) {
        //       str += "<button id='order-btn' class='btn btn-primary btn-sm'><span> 转工单</span></button>";
        //       str += "<button id='close-btn' class='btn btn-default btn-sm'><span > 关闭</span></button>";
        //       str += "</div>";
        //     }
        //     if (full.state == 10) {
        //       str += "<button id='close-btn' class='btn btn-default btn-sm'><span > 关闭</span></button>";
        //       str += "</div>";
        //     }
        //     if (full.state == 20) { // 处理中的告警不能关？
        //       str = "<div class='btn-group table-option-group'>" +
        //         "<button type='button' class='btn btn-sm' style='cursor:text;'>操作</button>" +
        //         "<button type='button' class='btn btn-sm dropdown-toggle' style='cursor:text;'>" +
        //         "<span class='caret'></span>" +
        //         "<span class='sr-only'>Toggle Dropdown</span>" +
        //         "</button>" +
        //         "</div>";
        //     }
        //     return str;
        //   }
        // });

        // if (!alertReturnObj) { //原始进入页面数据为空
        //   $timeout(function() {
        //     $scope.$broadcast(Event.ALERTINFOSINIT, {
        //       "option": [
        //         []
        //       ]
        //     });
        //   })
        //   return;
        // }

        for(var i in alertReturnObj) {
          var alertobj = alertReturnObj[i];
          alertobj.arisingTime = alertobj.arisingTime;
          alertobj.claimTime = formatDate(alertobj.claimTime);
          alertobj.firstArisingTime = formatDate(alertobj.firstArisingTime);
          alertobj.updateTime = formatDate(alertobj.updateTime);
          alertobj.receiveTime = formatDate(alertobj.receiveTime);
          columsData.push(alertobj);
        }

        /*$timeout(function() {
          $scope.$broadcast(Event.ALERTINFOSINIT, {
            "option": [columsData]
          });
        })*/
        if($location.path() == "/configAlert") {
          $scope.selLength = 10;
          $scope.$broadcast(Event.ALERTINFOSINIT + "_view", {
            "option": [columsData]
          });
          var param = {
            viewId: alertItme.viewId
          };
          SwSocket.unregister(uuid);
          uuid = Math.uuid();
          var operation = "register";
          //考虑极端情况，一个页面有多个模块监听同一个方法
          //但展示在页面的数据需对接收的实时监听的数据做不同处理
          SwSocket.register(uuid, operation, callback);

          //websocket发送请求
          SwSocket.send(uuid, operation, 'alertView', param);
        } else {
          $scope.$broadcast(Event.ALERTINFOSINIT, {
            "option": []
          });
        }
      }
      var getAlertData = function() {
        alertService.queryByView(viewInfo.viewId, null, function(returnObj) {
          if(returnObj.code == 0) {
            initAlertInfo(returnObj.data);
          }
        });
      };

      /**
       * 提交告警转工单对象
       */
      var initHistry = function() {
        $scope.orderData = {
          "title": "",
          "priorityCode": "0",
          "category": "",
          "ticketCategoryId": "",
          "values": null,
          "deviceId": "",
          "faultId": "",
          "message": ""
        };
      };

      /**
       * 发起工单必输项验证
       * @param o
       */
      var requiredFiledValidation = function(o) {
        var m = null;
        if(!o.title || o.title == "") {
          m = '工单名称不能为空';
        } else if(o.priorityCode == null || !String(o.priorityCode) || String(o.priorityCode) == "") {
          m = '紧急度不能为空';
        } else if(!o.category || o.category == "") {
          m = '工单类型不能为空';
        }
        //  else if (!o.ticketCategoryId || o.ticketCategoryId == "") {
        //   m = '工单流程不能为空';
        // }
        else if(!o.message || o.message == "") {
          m = '工单内容不能为空';
        }
        return m;
      };
      $scope.confirmActiveAlert = [];
      $scope.closeActiveAlert = [];
      $scope.selectedHandler = function() {
        $scope.confirmActiveAlert = [];
        $scope.closeActiveAlert = [];
        $scope.pageAlertList.forEach(function(obj) {
          if(obj.selected && obj.state == 0) {
            $scope.confirmActiveAlert.push(obj);
            $scope.closeActiveAlert.push(obj);
          }else if(obj.selected && (obj.state == 5 || obj.state == 10)){
            $scope.closeActiveAlert.push(obj);
          }
        });
        $scope.$apply();
      };
      $scope.ngDialogOrder = function(rowData) {
        $scope.alertInfo = {
          "actionType": "forward",
          "alertIds": [rowData.alertId],
          "severity": 0,
          "target": "EOMS://auttest/auttest"
        };
        $scope.orderData = {
          "title": rowData.title,
          "priorityCode": "",
          "category": "",
          "ticketCategoryId": "",
          "values": null,
          "deviceId": rowData.nodeId,
          "appName": rowData.appName,
          "faultId": "",
          "message": rowData.message
        };
        $scope.alertDefinition(rowData.alertCode, rowData.nodeTypeList[rowData.nodeTypeList.length - 1], function(e) {
          if($scope.faultList.length > 0) {
            $scope.orderData.faultId = $scope.faultList[0].faultId;
            console.log($scope.faultList[0].faultId);
          }
        })
        $scope.priority = [{
          "value": "0",
          "label": "低"
        }, {
          "value": "100",
          "label": "中"
        }, {
          "value": "200",
          "label": "高"
        }]

        var severity = rowData.severity;
        if(severity == 1 || severity == 2) {
          severity = $scope.priority[0].value;
        } else if(severity == 3) {
          severity = $scope.priority[1].value;
        } else if(severity == 5 || severity == 4) {
          severity = $scope.priority[2].value;
        }
        $scope.orderData.priorityCode = severity;
        ngDialog.open({
          template: '../partials/dialogue/add_order.html',
          scope: $scope,
          className: 'ngdialog-theme-plain'
        });
      }
      $scope.doAction = function(type, select, callbackFun) {
        if(type == "claim") {
          var alertInfo = {
            actionType: "claim",
            alertIds: select
          };
          // callbackFun(alertInfo);
          alertManageFlexService.sendClaimAction(alertInfo, function(returnObj) {
            if(returnObj.code == 0) {
              growl.success("确认告警成功", {});
              if(callbackFun) {
                callbackFun(true)
              }
            }
          });
        } else if(type == "claim2") {
          var alertInfo = {
            actionType: "claim",
            alertIds: select
          };
          // callbackFun(alertInfo);
          alertManageFlexService.sendClaimAction(alertInfo, function(returnObj) {
            if(returnObj.code == 0) {
              if(callbackFun) {
                callbackFun(true)
              }
            }
          });
        } else if(type == "close") {
          var alertInfo = {
            "actionType": "recover",
            "alertIds": select,
            "recoverAll": true,
            "resolved": true,
            "clearOut": true
          };
          // callbackFun(alertInfo);
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: '确认关闭告警吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                alertManageFlexService.sendRecoverAction(alertInfo, function(returnObj) {
                  if(returnObj.code == 0) {
                    growl.success("关闭告警成功", {});
                    for(var i = columsData.length - 1; i > -1; i--) {
                      var delItem = columsData[i]
                      if(delItem.alertId == select.alertId) {
                        columsData.splice(i, 1);
                        break;
                      }
                    };
                    // if (callbackFun) {
                    // if ($location.path() == "/configAlert/0") {
                    callbackFun(returnObj);

                    dialogRef.close();
                    // } else {
                    //   callbackFun(false)
                    // }
                    // }
                  }
                });
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });

        } else if(type == "close2") {
          var alertInfo = {
            "actionType": "recover",
            "alertIds": select,
            "recoverAll": true,
            "resolved": true,
            "clearOut": true
          };
          alertManageFlexService.sendRecoverAction(alertInfo, function(returnObj) {
            if(returnObj.code == 0) {
              for(var i = columsData.length - 1; i > -1; i--) {
                var delItem = columsData[i]
                if(delItem.alertId == select.alertId) {
                  columsData.splice(i, 1);
                  break;
                }
              };
              // if (callbackFun) {
              // if ($location.path() == "/configAlert/0") {
              callbackFun(true)
              // } else {
              //   callbackFun(false)
              // }
              // }
            } else {
              callbackFun(false)
            }
          });
        } else if(type == "order") {
          $scope.alertInfo = {
            "actionType": "forward",
            "alertIds": select,
            "severity": 0,
            "target": "EOMS://auttest/auttest"
          };
          $scope.showOrder();

          // callbackFun($scope.alertInfo);

        } else if(type == "submit-btn") {

          //校验必输项
          var rv = requiredFiledValidation($scope.orderData);
          if(rv != null) {
            growl.warning(rv, {});
            return;
          }

          if($scope.commitloading) {
            growl.warning("请等待，正在发布工单");
            return;
          }

          // $scope.commitloading = true;
          var cat = $scope.orderData.ticketCategoryId.split(":");
          var ticket = {
            "title": $scope.orderData.title,
            "category": $scope.orderData.category,
            "ticketCategoryId": cat[1],
            "priorityCode": $scope.orderData.priorityCode,
            "faultId": $scope.orderData.faultId,
            "deviceId": $scope.orderData.deviceId,
            "message": $scope.orderData.message
          };
          var alertInfo = $scope.alertInfo;
          alertManageFlexService.sendForwardAction(alertInfo, ticket, function(returnObj) {
            if(returnObj.code == 0) {
              $scope.commitloading = false;
              $scope.closeDialog();
              growl.success("已转工单", {});
              //$("#newtr").css("display","none");
              //这里有两种情况“设备故障”，“故障查询”
              if($routeParams && $routeParams.nodeId) { //故障查询
                var item = {
                  viewId: null,
                  nodeId: $routeParams.nodeId
                };
                if($scope.selectAlertList.search) {
                  $scope.selectAlertList.searchStatus = true;
                  $scope.$broadcast(Event.ALERTINFOSINIT, {
                    "option": []
                  });
                } else {
                  $scope.$broadcast("alertViewClick", {
                    "option": item
                  });
                }
              } else { //设备故障
                if(callbackFun) {
                  callbackFun(true);
                }
                // if($scope.commitItem) {
                //   $scope.alertViewClick($scope.commitItem);
                // } else {
                /*if($scope.selectAlertList.search){
                  $scope.selectAlertList.searchStatus = true;
                  $scope.$broadcast(Event.ALERTINFOSINIT, {
                    "option": []
                  });
                }else {
                  $scope.$broadcast("alertViewClick", {
                    "option": item
                  });
                }*/
              }
              // }
            } else {
              $scope.commitloading = false;
            }
          });
        } else if(type == "cancel-btn") {
          //这里有两种情况，设备故障和故障查询
          if($routeParams && $routeParams.nodeId) { //故障查询
            var item = {
              viewId: null,
              nodeId: $routeParams.nodeId
            };
            $scope.$broadcast("alertViewClick", {
              "option": item
            });
          } else { //设备故障
            if($scope.commitItem) {
              $scope.alertViewClick($scope.commitItem);
            } else {
              $scope.$broadcast("alertViewClick", {
                "option": "",
                "states": states
              });
            }
          }
          growl.success("取消告警转工单", {});
        }
      };
      $scope.reloadViewId = function() {
        alertService.queryByView(viewInfo.viewId, null, function(returnObj) {
          if(returnObj.code == 0) {
            columsData = [];
            var alertReturnObj = returnObj.data;
            for(var i in alertReturnObj) {
              var alertobj = alertReturnObj[i];
              alertobj.arisingTime = alertobj.arisingTime;
              alertobj.claimTime = formatDate(alertobj.claimTime);
              alertobj.firstArisingTime = formatDate(alertobj.firstArisingTime);
              alertobj.updateTime = formatDate(alertobj.updateTime);
              alertobj.receiveTime = formatDate(alertobj.receiveTime);
              columsData.push(alertobj);
            }
            $scope.selLength = 10;
            $scope.$broadcast(Event.ALERTINFOSINIT + "_view", {
              "option": [columsData]
            });

          }
        });
      }
      $scope.pipeline = function(opts) {
        // Configuration options
        var conf = $.extend({
          pages: 1, // number of pages to cache
          url: '', // script url
          data: null, // function or object with parameters to send to the server
          // matching how `ajax.data` works in DataTables
          method: 'POST' // Ajax HTTP method
        }, opts);

        // Private variables for storing the cache
        var cacheLower = -1;
        var cacheUpper = null;
        var cacheLastRequest = null;
        var cacheLastJson = null;

        return function(request, drawCallback, settings) {
          var ajax = false;
          var requestStart = request.start;
          var drawStart = request.start;
          var requestLength = request.length;
          var requestEnd = requestStart + requestLength;
//        var sort = request.columns[request.order[0].column].data; //排序列的字段
//        var sortType = request.order[0].dir; //排序的方式
          request.order.pop();
          if(settings.clearCache) {
            // API requested that the cache be cleared
            ajax = true;
            settings.clearCache = false;
          } else if(cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper) {
            // outside cached data - need to make a request
            ajax = true;
          } else if(JSON.stringify(request.order) !== JSON.stringify(cacheLastRequest.order) ||
            JSON.stringify(request.columns) !== JSON.stringify(cacheLastRequest.columns) ||
            JSON.stringify(request.search) !== JSON.stringify(cacheLastRequest.search)
          ) {
            // properties changed (ordering, columns, searching)
            ajax = true;
          }

          // Store the request for checking next time around
          cacheLastRequest = $.extend(true, {}, request);

          if(ajax) {
            // Need data from the server
            if(requestStart < cacheLower) {
              requestStart = requestStart - (requestLength * (conf.pages - 1));

              if(requestStart < 0) {
                requestStart = 0;
              }
            }

            cacheLower = requestStart;
            cacheUpper = requestStart + (requestLength * conf.pages);

            request.start = requestStart;
            request.length = requestLength * conf.pages;

            // Provide the same `data` options as DataTables.
            if($.isFunction(conf.data)) {
              // As a function it is executed with the data object as an arg
              // for manipulation. If an object is returned, it is used as the
              // data object to submit
              var d = conf.data(request);
              if(d) {
                $.extend(request, d);
              }
            } else if($.isPlainObject(conf.data)) {
              // As an object, the data given extends the default
              $.extend(request, conf.data);
            }
            var pageRequest = {
              start: request.start,
              length: request.length,
              //            sort :sort,
              //            sortType :sortType,
              statCount: request.draw == 1
            }

            $scope.getDevicesByPage(searchAlertData, pageRequest, function(returnObj, total) {
              //初始化选中状态
              returnObj.forEach(function(item){
                item.selected = false;
              })
              var json = {};
              json.data = returnObj;
              json.draw = request.draw; // Update the echo for each response
              json.recordsTotal = total != undefined ? (total == -1 ? cacheLastJson.recordsTotal : total) : returnObj.length;
              json.recordsFiltered = json.recordsTotal;
              cacheLastJson = $.extend(true, {}, json);
              if(cacheLower != drawStart) {
                json.data.splice(0, drawStart - cacheLower);
              }
              if(requestLength >= -1) {
                json.data.splice(requestLength, json.data.length);
              }

              drawCallback(json);
            });
          } else {
//          if($scope.ajaxListUpdate.length > 0) {
//            cacheLastJson.data = $scope.ajaxListUpdate
//          }
//          var json = $.extend(true, {}, cacheLastJson);
//          json.draw = request.draw; 
//          json.data.splice(0, requestStart - cacheLower);
//          json.data.splice(requestLength, json.data.length);
//          $scope.ajaxListUpdate = [];
//          drawCallback(json);
          }
        }
      };
      $scope.ajaxListUpdate = [];
      $scope.getDevicesByPage = function(queryItem, pageRequest, callback) {
        alertService.getAlertByPage(queryItem, pageRequest, function(returnObj) {
          if(returnObj.code == 0) {
            $scope.pageAlertList = returnObj.data.data;
            callback(returnObj.data.data, returnObj.data.total);
          }
        })
      };
      //弹出框的关闭事件
      $scope.closeDialog = function() {
        ngDialog.close();
      };

      //设备告警的三个操作
      $scope.configAlert = function(type) {
        if(type == "addOrder") { //转工单
          $scope.$broadcast("addOrder");
        } else if(type == "selectedOrder") {
          $scope.$broadcast("selectedOrder");
        } else if(type == "selectedClose") {
          $scope.$broadcast("selectedClose");
        }
      };

      var init = function() {
        $scope.category = $scope.myDicts['ticketCategory'];
        initHistry();
        if(states) {
          var p = {
            "states": states
          }
          alertService.queryFromCache(p, function(returnObj) {
            if(returnObj.code == 0) {
              initAlertInfo(returnObj.data);

            }
          });
        } else if($routeParams.nodeId) {
          if(!searchAlertData) {
            return;
          };
          if(searchAlertData) {
            $scope.selectAlertList.searchStatus = true;
            $scope.$broadcast(Event.ALERTINFOSINIT, {
              "option": []
            });
          }
        } else if(viewInfo != undefined && viewInfo["nodeId"]) {
          if(!searchAlertData) {
            return;
          }
          var info = {};
          for(var key in searchAlertData) {
            info[key] = searchAlertData[key];
          }
          if(info) {
            initAlertInfo();
          }
        } else {
          if($scope.selectAlertList.search && searchAlertData) {
            $scope.selectAlertList.searchStatus = true;
            $scope.$broadcast(Event.ALERTINFOSINIT, {
              "option": []
            });
          } else if(viewInfo && viewInfo.viewId) {
            getAlertData();
          }
        }
      };
      //查询告警
      $scope.$on("searchAlertView", function(event, args) {
        searchAlertData = args.option;
        init();
      });

      $scope.$on("alertViewClick", function(event, args) {
        viewInfo = args.option;
        states = args.states;
        columns = [];
        columsData = [];
        stateIndex = -1;
        severityIndex = -1;
        $scope.selectAlertList.searchStatus = false;
        init();
      });
      //注销scope时注销方法heartBeat，回调函数callback
      $scope.$on("$destroy", function() {
        SwSocket.unregister(uuid);
      });

      if($routeParams.nodeId) {
        initHistry();
        var item = {
          viewId: null,
          nodeId: $routeParams.nodeId
        };
        $scope.$broadcast("alertViewClick", {
          "option": item
        });
      }
      // if ($routeParams.nodeId == 0 && !searchAlertData) {
      //   initAlertInfo();
      //   initHistry();
      // }
    }
  ]);
});