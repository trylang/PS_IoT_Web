define(['controllers/controllers', 'bootstrap-dialog'], function (controllers, BootstrapDialog) {
  'use strict';
  controllers.initController('WorkOrderCtrl', ['$scope', 'ngDialog', 'resourceUIService', 'workflowService', 'ticketCategoryService', 'alertService', 'SwSocket', 'Info', 'userLoginUIService', 'growl', '$routeParams', 'processService', 'ticketTaskService','ticketService',
    function ($scope, ngDialog, resourceUIService, workflowService, ticketCategoryService, alertService, SwSocket, Info, userLoginUIService, growl, $routeParams, processService, ticketTaskService, ticketService) {
      console.info("切换到工单管理");
      var previousTab; //前一个激活的标签tab名称
      $scope.editVisible = false;
      $scope.addOrderShow = false;
      $scope.processType = [];
      $scope.activeTab = "执行中";
      $scope.activeListTab = "tab1";
      var type = $routeParams.type;
      var id = $routeParams.id;
      $scope.seleStatus = 100;

      $scope.initAddList = function(){
        //新增工单初始化
        $scope.orderAddData = {
          "title": "",
          "priorityCode": "0",
          "ticketNo": '',
          "category": "",
          "ticketCategoryId": 0,
          "values": null,
          "deviceId": "",
          "faultId": "",
          "message": ""
        };
      }
      //各阶段工单数量
      $scope.orderCount = {
        "doing": 0,
        "unpush": 0,
        "done": 0,
        "all": 0
      };
      var info = Info.get("../localdb/info.json", function (info) {
        $scope.priorityData = info.priorityData;
        $scope.statusData = info.statusData;
        // $scope.workOrderType = info.workOrderType;
        // $scope.workOrderType = $scope.myDicts['ticketCategory'];
      });
      $scope.formAryList = [];
      $scope.definitions = {};
      $scope.selectItem = "";
      //根据流程查开始节点属性
      $scope.process = function () {
        if ($scope.orderAddData.ticketCategoryId != "" && $scope.orderAddData.ticketCategoryId != undefined && $scope.orderAddData.ticketCategoryId != null) {
          var spl = $scope.orderAddData.ticketCategoryId.split(":");
          workflowService.getWorkflowById(spl[0], function (res) {
            if (res.code == 0) {
              $scope.selectItem = res.data;
              var resAry = res.data.startAttributeDefinitions;
              $scope.formAryList = []
              for (var i in resAry) {
                var typePro = {};
                typePro["label"] = resAry[i].label;
                typePro["name"] = resAry[i].name;
                typePro["dataType"] = resAry[i].dataType;
                $scope.definitions[resAry[i].label] = "";
                $scope.formAryList.push(typePro);
              }
              console.log("arry==" + JSON.stringify($scope.formAryList) + "arry==" + JSON.stringify($scope.definitions));
            }
          });
        }else{
          $scope.formAryList = [];
        }

      };
      $scope.initData = {"devicesAll":"","faultList":""};
      $scope.devicesAll = "";
      //根据工单分类初始化工单流程
      var getProcedure = function () {
        ticketCategoryService.getTicketCategorys(function (returnObj) {
          if (returnObj.code == 0) {
            $scope.processTypeData = returnObj.data;//展示table数据的工单流程
            var arr1 = [];
            var arr2 = [];
            var arr3 = [];
            var arr4 = [];
            for (var i in returnObj.data) {
              if (returnObj.data[i].category == "10") { //告警工单
                arr1.push(returnObj.data[i]);
              } else if (returnObj.data[i].category == "20") {
                arr2.push(returnObj.data[i]);
              } else if (returnObj.data[i].category == "30") {
                arr3.push(returnObj.data[i]);
              } else if (returnObj.data[i].category == "40") {
                arr4.push(returnObj.data[i]);
              }
            }
            $scope.processType1 = arr1;
            $scope.processType2 = arr2;
            $scope.processType3 = arr3;
            $scope.processType4 = arr4;
            getOrderData(100);
          }
        });
        $scope.devicesDic = {};
        resourceUIService.getDevicesByCondition({},function(res){
          if(res.code == 0){
            var newObj = [];
            newObj.push({
              text: '请选择',
              label: '请选择',
              id: '-1'
            });
            res.data.forEach(function (obj) {
              if(obj.label){
                obj.text = obj.label;
                $scope.devicesDic[obj.id] = obj;
                newObj.push(obj);
              }
            });
            $scope.devicesAll = newObj;
          }
        });
      }
      $scope.findFault = function(){
        if($scope.devicesDic[$scope.orderAddData.deviceId]){
          resourceUIService.findFaultKnowledgeByModelId($scope.devicesDic[$scope.orderAddData.deviceId].modelId, function (res) {
            if (res.code == 0) {
              $scope.initData.faultList = res.data;
            }
          });
        }
      };
      var searchList = function (obj) {
        ticketTaskService.findTickets(obj, function (returnObj) {
          if (returnObj.code == 0) {
            console.log("工单数据");
             var status = $scope.seleStatus;
            var state = "";
            var count = returnObj.data.length;
            if (status == 100) {
              $scope.orderCount.doing = count;
              state = "doing";//执行中
              $scope.workOrderData["tab"] = true;
            } else if (status == 10) {
              $scope.orderCount.unpush = count;
              state = "undo";//未发布
              $scope.workOrderData["tab"] = false;
            } else if (status == 200) {
              $scope.orderCount.done = count;
              state = "did";//已完成
              $scope.workOrderData["tab"] = false;
            }
            //$scope.orderData = returnObj.data;
            $scope.workOrderData.data = returnObj.data;
            $scope.orderGirtData.data = returnObj.data;
            $scope.workOrderData.state = state;
            if (status == 10) {
              $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
            } else {
              $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
            }
          }
        });
      }

      //查询条件事件
      $scope.goSearch = function() {
        var v = {};
        v["title"] = $scope.loaderValue;
        v["status"] = $scope.seleStatus;
        searchList(v);
   /*     if($scope.queryDitem.state > 0) {
          v[$scope.queryDitem.attributeName] = $scope.loaderValue;
          if($scope.seleStatus > 0){
            v["status"] = $scope.seleStatus;
          }
          searchList(v);
        }else {
          v['title'] = $scope.loaderValue;
          if($scope.seleStatus > 0){
            v["status"] = $scope.seleStatus;
          }
          searchList(v);
        }*/
      };

      //未发布工单查询刷新
      $scope.wordCancel = function () {
        $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
      }
      //根据工单分类初始化工单流程
      $scope.getOrderProcedure = function () {
      /*  if ($scope.orderAddData.category == 10) {
          $scope.processType = $scope.processType1;
        } else if ($scope.orderAddData.category == 20) {
          $scope.processType = $scope.processType2;
        } else if ($scope.orderAddData.category == 30) {
          $scope.processType = $scope.processType3;
        } else if ($scope.orderAddData.category == 40) {
          $scope.processType = $scope.processType4;
        } else {
          $scope.processType = [];
        }*/
	//通过传值方式获取流程分类
        var processTypeList = $scope.processTypeData;
        var processType = []
        for (var i in processTypeList) {
          if(processTypeList[i].category == $scope.orderAddData.category){
            processType.push(processTypeList[i]);
          }
        }
        $scope.processType = processType;
      }
      /**
       * 新建工单
       */
      $scope.addWorkOrder = function(obj){
        if(obj){
          $scope.orderAddData = obj;
        }else{
          $scope.initAddList();
        }

        $scope.workOrderType = $scope.myDicts['ticketCategory'];
        ngDialog.open({
          template: '../partials/dialogue/add_workorder.html',
          scope: $scope,
          className: 'ngdialog-theme-plain'
        });
        /*if($scope.addOrderShow){
          growl.warning("当前有未保存工单",{});
        }else{
          $scope.addOrderShow = true;
          $scope.processType = [];
        }*/
      };
      /**
       * 获取各工单count(执行中，未发布，已完成)
       */
      function getDoingOrderCount() {
        var status = 100;
        if (type == "gateway") {
          ticketTaskService.getTicketsByStatusAndDeviceId(100, id, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.doing = returnObj.data.length;
            }
          })
        } else {
          var obj = {"status":status};
          ticketTaskService.findTickets(obj, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.doing = returnObj.data.length;
            }
          })
        }
      }

      function getUnpushOrderCount() {
        var status = 10;
        if (type == "gateway") {
          ticketTaskService.getTicketsByStatusAndDeviceId(100, id, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.doing = returnObj.data.length;
            }
          })
        } else {
          var obj = {"status":status};
          ticketTaskService.findTickets(obj, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.unpush = returnObj.data.length;
            }
          })
        }
      }

      function getDoneOrderCount() {
        var status = 200;
        if (type == "gateway") {
          ticketTaskService.getTicketsByStatusAndDeviceId(100, id, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.doing = returnObj.data.length;
            }
          })
        } else {
          var obj = {"status":status};
          ticketTaskService.findTickets(obj, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.done = returnObj.data.length;
            }
          })
        }
      }

      function getAllOrderCount() {
        if (type == "gateway") {
          ticketTaskService.getTicketsByDeviceId(id,function(res) {
            if (res.code == 0) {
              $scope.orderCount.all = res.data.length;
            }
          });
        } else {
          ticketTaskService.getAllTickets(function (returnObj) {
            if (returnObj.code == 0) {
              $scope.orderCount.all = returnObj.data.length;
            }
          });
        }
      }

      /**
       * 获取工单数据(执行中，未发布，已完成)
       */
      function getOrderData(status) {
        if (type == "gateway") {
          ticketTaskService.getTicketsByStatusAndDeviceId(status, id, function (returnObj) {
            if (returnObj.code == 0) {
              console.log("工单数据");
              var state = "";
              var count = returnObj.data.length;
              if (status == 100) {
                $scope.orderCount.doing = count;
                state = "doing";//执行中
                $scope.workOrderData["tab"] = true;
              } else if (status == 10) {
                $scope.orderCount.unpush = count;
                state = "undo";//未发布
                $scope.workOrderData["tab"] = false;
              } else if (status == 200) {
                $scope.orderCount.done = count;
                state = "did";//已完成
                $scope.workOrderData["tab"] = false;
              }
              //$scope.orderData = returnObj.data;
              $scope.workOrderData.data = returnObj.data;
              $scope.orderGirtData.data = returnObj.data;
              $scope.workOrderData.state = state;
              if (status == 10) {
                $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
              } else {
                $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
              }
            }
          });
        } else {
          var obj = {"status":status};
          ticketTaskService.findTickets(obj, function (returnObj) {
            if (returnObj.code == 0) {
              console.log("工单数据");
              var state = "";
              var count = returnObj.data.length;
              if (status == 100) {
                $scope.orderCount.doing = count;
                state = "doing";//执行中
                $scope.workOrderData["tab"] = true;
              } else if (status == 10) {
                $scope.orderCount.unpush = count;
                state = "undo";//未发布
                $scope.workOrderData["tab"] = false;
              } else if (status == 200) {
                $scope.orderCount.done = count;
                state = "did";//已完成
                $scope.workOrderData["tab"] = false;
              }
              //$scope.orderData = returnObj.data;
              $scope.workOrderData.data = returnObj.data;
              $scope.orderGirtData.data = returnObj.data;
              $scope.workOrderData.state = state;
              if (status == 10) {
                $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
              } else {
                $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
              }
            }
          });
        }
      }

      /**
       * 获取所有工单数据
       */
      function getAllOrderData() {
        if (type == "gateway") {
          ticketTaskService.getTicketsByDeviceId(id,function (res) {
            if (res.code == 0) {
              $scope.orderCount.all = res.data.length;
            }
          });
        } else {
          ticketTaskService.getAllTickets(function (returnObj) {
            if (returnObj.code == 0) {
              $scope.workOrderData.data = returnObj.data;
              $scope.orderCount.all = returnObj.data.length;
              $scope.workOrderData.state = 'all';//全部
              $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
            }
          });
        }
      }

      /**
       * 发起工单必输项验证
       * @param o
       */
      var requiredFiledValidation = function (o) {
        var m = null;
        if (!o.title || o.title==""){
          m = '工单名称不能为空';
        }else if (!String(o.priorityCode) || String(o.priorityCode)==""){
          m = '紧急度不能为空';
        }else
        if (!o.category || o.category == "") {
          m = '工单类型不能为空';
        } else if (!o.ticketCategoryId || o.ticketCategoryId == "") {
          m = '工单流程不能为空';
        }else if (!o.deviceId || o.deviceId == ""|| o.deviceId == "-1") {
          m = '设备不能为空';
        }
        else if (!o.message || o.message == ""){
          m = '工单内容不能为空';
        }
        return m;
      };
      /**
       * 保存工单
       */
      $scope.saveOrder = function () {
        //校验必输项
       /* var rv = requiredFiledValidation($scope.orderAddData);
        if (rv != null) {
          growl.warning(rv, {});
          return;
        }*/
        if ($scope.commitloading) {
          growl.warning("请等待，正在保存工单", {});
          return;
        }
        $scope.commitloading = true;
        $scope.orderAddData.values = $scope.definitions;
       /* var cat = $scope.orderAddData.ticketCategoryId.split(":");
        $scope.orderAddData.ticketCategoryId = cat[1];*/
        $scope.orderAddData.deviceId = $scope.orderAddData.deviceId;
        var ticket = $scope.orderAddData;
        ticketTaskService.saveTicket(ticket, function (returnObj) {
          $scope.commitloading = false;
          if (returnObj.code == 0) {
            growl.success("保存工单成功", {});
            $scope.closeDialog();
            $scope.initAddList();
            getAllOrderCount(); //刷新总工单数量
            getDoingOrderCount();
            getUnpushOrderCount();

            $scope.addOrderShow = false;
            //跳转到未发布
            if ($scope.activeTab.indexOf("未发布") > -1) {
              changeWorkOrderItem($scope.activeTab);
            } else {
              $('#myTab li:eq(3) a').tab('show');
            }
          }
        });
      };
      /**
       * 取消工单
       */
      $scope.cancelOrder = function () {
        $scope.addOrderShow = false;
        growl.info("取消发布工单", {});
        $scope.initAddList();
      };

      /**
       * 发布工单
       */
      $scope.uploadOrder = function () {
       /* var r = requiredFiledValidation($scope.orderAddData);
        if (r != null) {
          growl.warning(r, {});
          return;
        }*/
        if ($scope.commitloading) {
          growl.warning("请等待，正在发布工单");
          return;
        }
        $scope.commitloading = true;
        $scope.orderAddData.values = $scope.definitions;
      /*  var temporary = $scope.orderAddData.ticketCategoryId;
        var cat = $scope.orderAddData.ticketCategoryId.split(":");
        $scope.orderAddData.ticketCategoryId = cat[1];*/
        $scope.orderAddData.deviceId = $scope.orderAddData.deviceId;
        var ticket = $scope.orderAddData;
        //ticket.push(obj);
        ticketTaskService.commitTicket(ticket, function (returnObj) {
          $scope.commitloading = false;
          if (returnObj.code == 0) {
            //$scope.$apply();
            growl.success("发布工单成功", {});
            $scope.closeDialog();
            $scope.addOrderShow = false;
            $scope.formAryList = [];
            if($scope.orderAddData.status == 10){
              var dataList =  $scope.orderGirtData.data;
              for(var j in dataList){
                if(dataList[j].ticketCategoryId == returnObj.data.ticketCategoryId) {
                  $scope.orderGirtData.data.splice(j, 1);
                  break;
                }
              }
              $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
            }
            $scope.initAddList();
            getAllOrderCount(); //刷新总工单数量
            getDoingOrderCount();
            getDoneOrderCount();
            getUnpushOrderCount();
            //跳转到执行中
            if ($scope.activeTab.indexOf("执行中") > -1) {
              changeWorkOrderItem($scope.activeTab);
            } else {
              $('#myTab li:eq(0) a').tab('show');
            }
          }else{
            $scope.commitloading = false;
            $scope.orderAddData.ticketCategoryId = "";
          }
        });
      };
      //格式化时间
      var formatDate = function (str) {
        if (str) {
          str = newDateJson(str).Format(GetDateCategoryStrByLabel());
        }
        return str;
      };
      //标准时间转换2017-07-17T03:10:38.931+0000
      var chGMT = function(dateStr) {
//      var mydate = new Date(dateStr);
//      return mydate.Format("yyyy-MM-dd hh:mm:ss");
        return useMomentFormat(dateStr, "yyyy-MM-dd hh:mm:ss");
      }
      $scope.workOrderData = {
        "columnDefs": [{
          "targets": 1,
          "data": "ticketNo",
          "render": function (data, type, full) {
            return data;
          }
        }, {
          "targets": 2,
          "data": "ticketCategoryId",
          "render": function (data, type, full) {
            //返回自定义内容
            var str = "";
            for (var i in $scope.processTypeData) {
              if ($scope.processTypeData[i].id == data) {
                str = $scope.processTypeData[i].name;
              }
            }
            return str;
          }
        }, {
          "targets": 3,
          "data": "status",
          "render": function (data, type, full) {
            // 返回自定义内容
            var str = "";
            var strIcon = "";
            if (data == 10) {
              str = "未发布";
              strIcon = "label-primary";
            } else if (data == 100) {
              str = "处理中";
              strIcon = "label-warning";
            } else if (data == 200) {
              str = "已完成";
              strIcon = "label-info";
            } else if (data == 150) {
              str = "已撤销";
              strIcon = "label-info";
            }
            return "<span class='label " + strIcon + "'>" + str + "</span>";
          }
        }, {
          "targets": 5,
          "data": "",
          "render": function (data, type, full) {
            //  返回自定义内容
            return chGMT(data);
          }
        }, {
          "targets": 6,
          "data": "",
          "render": function (data, type, full) {
            //  返回自定义内容
            return formatDate(data);
          }
        }, {
          "targets": 8,
          "data": "option",
          "render": function (data, type, full) {
            // 返回自定义内容
            var str = "<div class='btn-group btn-group-sm'>";
            if ($scope.menuitems['A01_S09']) {
              str += "<button id='history'    class='btn btn-primary' ><i class='fa fa-edit hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 执行历史</span></button>";
            }
            if($scope.activeTab == null || $scope.activeTab.indexOf("执行中") > -1 && $scope.menuitems['A06_S09']) {
              str += "<button id='revoke'   class='btn btn-default' ><i class='fa fa-trash hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 撤销</span></button>";
            }
            str += "</div>";
            return str;
          }
        }]
      };
      $scope.orderGirtData = {
        "columns": [{
          "data": "title",
          "title": "工单名称"
        },{
          "data": "ticketCategoryId",
          "title": "工单流程"
        }, {
          "data": "status",
          "title": "工单状态"
        }, $.ProudSmart.datatable.optionCol2],
        "columnDefs": [{
          "targets": 0,
          "data": "title",
          "render": function (data, type, full) {
            return "<span style='cursor: pointer;'>"+data+"</span>";
          }
        },{
          "targets": 1,
          "data": "ticketCategoryId",
          "render": function (data, type, full) {
            var str = "";
            for (var i in $scope.processTypeData) {
              if ($scope.processTypeData[i].id == data) {
                str = $scope.processTypeData[i].name;
              }
            }
            return "<span style='cursor: pointer;'>"+str+"</span>";
          }
        }, {
          "targets": 2,
          "data": "status",
          "render": function (data, type, full) {
            return "<span style='cursor: pointer;' class='label " + (data == 10 ? "label-primary" : (data == 100 ? "label-warning" : "label-info")) + "'>" + (data == 10 ? "未发布" : (data == 100 ? "处理中" : "已完成")) + "</span>";
          }
        }, {
          "targets": 3,
          "data": "option",
          "render": function (data, type, full) {  // 返回自定义内容
            var str = "<div class='btn-group btn-group-sm'>";
            if ($scope.menuitems['A07_S09']) {
              str += "<button id='release-btn'   class='btn btn-default' ><i class='fa fa-trash hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 发布</span></button>";
            }
            if ($scope.menuitems['A08_S09']) {
              str += "<button id='del-btn'   class='btn btn-default' ><i class='fa fa-trash hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 删除</span></button>";
            }
             str += "</div>";
            return str;
          }
        }]
      };
      $scope.cancelTicket = function (ticketNo) {
        BootstrapDialog.show({
          title: '提示',
          closable: false,
          //size:BootstrapDialog.SIZE_WIDE,
          message: '确认要撤销该工单？',
          buttons: [{
            label: '确定',
            cssClass: 'btn-success',
            action: function (dialogRef) {
              dialogRef.close();
              ticketTaskService.cancelTicket(ticketNo, function (resultObj) {
                if (resultObj.code == 0) {
                  growl.success("撤销工单成功!", {});
                  //changeWorkOrderItem("执行中");
                  if (type == "gateway") {
                    ticketTaskService.getTicketsByStatusAndDeviceId(100, id, function (returnObj) {
                      if (returnObj.code == 0) {
                        $scope.workOrderData.data = returnObj.data;
                        $scope.orderCount.doing = returnObj.data.length;
                        $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
                      }
                    });
                  } else {
                    var obj = {"status":100};
                    ticketTaskService.findTickets(obj, function (returnObj) {
                      $scope.workOrderData.data = returnObj.data;
                      $scope.orderCount.doing = returnObj.data.length;
                      $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
                    });
                  }
                  // $scope.$broadcast(Event.WORKORDERINIT+"_order", $scope.orderGirtData);
                }
              });
            }
          }, {
            label: '取消',
            action: function (dialogRef) {
              dialogRef.close();
            }
          }]
        });
      }
      $scope.delTicket = function (ticketNo) {
        BootstrapDialog.show({
          title: '提示',
          closable: false,
          //size:BootstrapDialog.SIZE_WIDE,
          message: '是否要删除该工单',
          buttons: [{
            label: '确定',
            cssClass: 'btn-success',
            action: function (dialogRef) {
              ticketService.deleteTicket(ticketNo, function (resultObj) {
                if (resultObj.code == 0) {
                  growl.success("删除工单成功!", {});
                  if (type == "gateway") {
                    ticketTaskService.getTicketsByStatusAndDeviceId(10, id, function (returnObj) {
                      if (returnObj.code == 0) {
                        $scope.workOrderData.data = returnObj.data;
                        $scope.orderCount.doing = returnObj.data.length;
                        $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
                      }
                    });
                  } else {
                    var obj = {"status":10};
                    ticketTaskService.findTickets(obj, function (returnObj) {
                      $scope.orderGirtData.data = returnObj.data;
                      $scope.orderCount.unpush = returnObj.data.length;
                      $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
                    });
                    // $scope.$broadcast(Event.WORKORDERINIT+"_order", $scope.orderGirtData);
                  }
                }
              });
              dialogRef.close();
            }
          }, {
            label: '取消',
            action: function (dialogRef) {
              dialogRef.close();
            }
          }]
        });
      }
      $scope.tabStatus = "false";
      var changeWorkOrderItem = function (activeTab) {
        if (activeTab == null || activeTab.indexOf("执行中") > -1) {
          getOrderData(100);
          $scope.workOrderData["tab"] = true;
          $scope.seleStatus = 100;
        } else if (activeTab.indexOf("未发布") > -1) {
          getOrderData(10);
          $scope.seleStatus = 10;
        } else if (activeTab.indexOf("已完成") > -1) {
          getOrderData(200);
          $scope.seleStatus = 200;
          $scope.workOrderData["tab"] = false;
        } else if (activeTab.indexOf("全部工单") > -1) {
          getAllOrderData();
          $scope.seleStatus = 0;
          $scope.workOrderData["tab"] = false;
        }
      };
      $scope.cancelOrderNo = function(){
        if (type == "gateway") {
          ticketTaskService.getTicketsByStatusAndDeviceId(10, id, function (returnObj) {
            if (returnObj.code == 0) {
              $scope.workOrderData.data = returnObj.data;
              $scope.orderCount.doing = returnObj.data.length;
              $scope.$broadcast(Event.WORKORDERINIT, $scope.workOrderData);
            }
          });
        } else {
          var obj = {"status":10};
          ticketTaskService.findTickets(obj, function (returnObj) {
            $scope.orderGirtData.data = returnObj.data;
            $scope.orderCount.unpush = returnObj.data.length;
            $scope.$broadcast(Event.WORKORDERINIT + "_order", $scope.orderGirtData);
          });
          // $scope.$broadcast(Event.WORKORDERINIT+"_order", $scope.orderGirtData);
        }
      };
      /**
       * tab页的事件监听
       */
      var initEvent = function() {
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
          if($(e.target).closest("li.disabled").length > 0) {
            $(e.target).closest("li.disabled").removeClass("active");
            $(e.target).closest("ul").children("[name=" + $scope.activeListTab + "]").addClass("active");
            return;
          }
          var aname = $(e.target).closest("li").attr("name");
          if(aname) {
            $scope.activeListTab = aname;
            $scope.$apply();
            $scope.initAddList();
            // 获取已激活的标签页的名称
            $scope.activeTab = $(e.target).text();
            // 获取前一个激活的标签页的名称
            previousTab = $(e.relatedTarget).text();
            $scope.addOrderShow = false;
            changeWorkOrderItem($scope.activeTab);
          }
        });
      }
      //初始化工单管理
      function init() {
        initEvent();
        $scope.initAddList();
        //根据状态获取工单数量
        getUnpushOrderCount();
        getDoneOrderCount();
        //获取所有工单
        getAllOrderCount();
        getDoingOrderCount();
        getProcedure();
        if ($routeParams && $routeParams.state) {//从工单详情返回到工单管理页面
          var activeTab = "";
          var id = null;
          switch ($routeParams.state) {
            case 'doing':
              activeTab = "执行中";
              id = 0;
              break;
            case 'did':
              activeTab = "已完成";
              id = 1;
              break;
            case 'all':
              activeTab = "全部工单";
              id = 2;
              break;
            case 'undo':
              activeTab = "未发布";
              id = 3;
              break;
          }
          $("#myTab li:eq(" + id + ") a").tab('show');
          changeWorkOrderItem(activeTab);
        }
        else {//进入工单管理页面
          getOrderData(100); //执行中
        }
      }
      init();
    }
  ]);
});
