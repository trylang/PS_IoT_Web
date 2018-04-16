define(['controllers/controllers', 'bootstrap-dialog'], function (controllers, BootstrapDialog) {
  'use strict';
  controllers.initController('WorkOrderRecordCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'growl', 'userLoginUIService', 'userEnterpriseService', 'Info', '$route', 'ticketTaskService', 'ticketCategoryService',
    function ($scope, $rootScope, $location, $routeParams, $timeout, growl, userLoginUIService, userEnterpriseService, Info, $route, ticketTaskService, ticketCategoryService) {
      console.log('进入工单任务');
      $scope.processType = {};
      $scope.activeListTab = "tab1";
      //工单计数
      $scope.ordercount = {
        "notdeal": 0,
        "dealing": 0,
        "done": 0
      }
      //获取工单流程定义
      function getProcessDefinitions() {
        ticketCategoryService.getTicketCategorys(function (returnObj) {
          if (returnObj.code == 0) {
            for (var i in returnObj.data) {
              $scope.processType[returnObj.data[i].workflowId] = returnObj.data[i];
            }
          }
        });
      };
      //格式化时间
      var formatDate = function (str) {
        if (str) {
          str = newDateJson(str).Format(GetDateCategoryStrByLabel());
        }
        return str;
      }
      $scope.herfList = function (name, data, state) {//state == 是工单任务的三种状态（待处理，处理中，已完成）
        $rootScope.dataList = data;
        if (data != undefined && data.ticketNo != null) {
          if (data.templateURL != "" && data.templateURL != undefined && data.templateURL != null) {
            var url=$.trim(data.templateURL)+"/" + data.id ;
            // var url = "../app-oc/index.html#/deviceTask/" + data.id;
            location.href = url;
          } else {
            location.href = "index.html#/orderdetail/" + data.id + "/task";
          }
          //location.href = "index.html#/orderdetail/" + data.id + "/task"+"/"+state;
          //location.href = "../app-flowsheet/index.html#/processView/" + data.id ;
        }
      };
      /**
       * 获取任务数量
       *
       */
      $scope.getRecordCount = function () {
        ticketTaskService.getTicketTasksByStatus(10, function (returnObj) {
          if (returnObj.code == 0) {
            $scope.ordercount.notdeal = returnObj.data.length;
          }
        });
        ticketTaskService.getTicketTasksByStatus(100, function (returnObj) {
          if (returnObj.code == 0) {
            $scope.ordercount.dealing = returnObj.data.length;
          }
        });
        ticketTaskService.getTicketTasksByStatus(200, function (returnObj) {
          if (returnObj.code == 0) {
            $scope.ordercount.done = returnObj.data.length;
          }
        });
      };
      //获取工单任务数据
      $scope.getRecordData = function (status) {
        // 10 - 待处理 100-处理中 200-已完成
        ticketTaskService.getTicketTasksByStatus(status, function (returnObj) {
          if (returnObj.code == 0) {
            var state = null;
            if (status == 10) {
              $scope.ordercount.notdeal = returnObj.data.length;
              state = "notdeal";//待处理
            } else if (status == 100) {
              $scope.ordercount.dealing = returnObj.data.length;
              state = "dealing";//处理中
            } else if (status == 200) {
              $scope.ordercount.done = returnObj.data.length;
              state = "done";//已完成
            }
            // statusTab(status);

            $scope.recordData = {
              "columns": [{
                "data": "ticketTitle",
                "title": "工单名称"
              },{
                "data": "ticketNo",
                "title": "工单号"
              }, {
                "data": "processDefinitionId",
                "title": "工单流程"
              }, {
                "data": "taskConfigName",
                "title": "任务名称"
              }, {
                "data": "ticketPriorityCode",
                "title": "紧急度"
              }, {
                "data": "senderName",
                "title": "发送人"
              }, {
                "data": "sendTime",
                "title": "发送时间"
              }, {
                "data": "finishedTime",
                "title": "完成时间",
                "visible": false
              }, {
                "data": "option",
                "orderable": false,
                // "visible": optionStatus,
                "visible": $scope.menuitems['A01_S08'] != undefined,
                "title": "操作"
              }],
              "columnDefs": [{
                "targets": 0,
                "data": "ticketTitle",
                "render": function (data, type, full) {
                  return "<span style='cursor:pointer;'>" + data + "</span>";
                }
              },{
                "targets": 1,
                "data": "ticketNo",
                "render": function (data, type, full) {
                  return "<span style='cursor:pointer;'>" + data + "</span>";
                }
              }, {
                "targets": 2,
                "data": "processDefinitionId",
                "render": function (data, type, full) {
                  var str = "";
                  if ($scope.processType && $scope.processType[data] != undefined) {
                    str = $scope.processType[data].name;
                  }
                  return "<span style='cursor:pointer;'>" + str + "</span>";
                }
              }, {
                "targets": 3,
                "data": "taskConfigName",
                "render": function (data, type, full) {
                  return "<span style='cursor:pointer;'>" + data + "</span>";
                }
              }, {
                "targets": 5,
                "data": "senderName",
                "render": function (data, type, full) {
                  return "<span style='cursor:pointer;'>" + data + "</span>";
                }
              }, {
                "targets": 4,
                "data": "ticketPriorityCode",
                "render": function (data, type, full) {
                  //紧急度
                  var priorityBg;
                  var priorityName;
                  if (data == 0) {
                    priorityBg = "alerts-minor";
                    priorityName = "低";
                  } else if (data == 100) {
                    priorityBg = "alerts-major";
                    priorityName = "中";
                  } else if (data == 200) {
                    priorityBg = "alerts-critical";
                    priorityName = "高";
                  }
                  return '<span class="label ' + priorityBg + '" style="cursor: pointer;">' + priorityName + '</span>';
                }
              }, {
                "targets": 6,
                "data": "sendTime",
                "render": function (data, type, full) {
                  //发送时间
                  return "<span style='cursor:pointer;'>" + useMomentFormat(data, "yyyy-MM-dd hh:mm:ss") + "</span>";
                }
              }, {
                "targets": 7,
                "data": "sendTime",
                "render": function (data, type, full) {
                  //完成时间
                  return "<span style='cursor:pointer;'>" + useMomentFormat(data, "yyyy-MM-dd hh:mm:ss")+ "</span>";
                }
              }, {
                "targets": 8,
                "data": "option",
                "render": function (data, type, full) {
                  var str = '';
                  if($scope.menuitems['S08']){
                    str = "<a id='process' class='btn btn-default btn-sm' style='cursor: pointer;' ><i class='fa fa-close hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'>执行历史</span></a>";
                  }
                  return str;
                }
              }],
              data: []
            }
            var list = [];
            for(var i in returnObj.data){
              if(returnObj.data[i].variables.theTicketType != 'bid' && returnObj.data[i].variables.theTicketType != 'allocated'){
                list.push(returnObj.data[i]);
              }
            }
            $scope.recordData.data = list;
            $scope.recordData.state = state;
            $scope.$broadcast(Event.WORKORDERRECORDINIT, $scope.recordData);
          }
        });
      }
      /*var statusTab = function(status){

        for (var i = $scope.recordData.columns.length - 1; i > -1; i--) {
          var item = $scope.recordData.columns[i]
          if (item.data == "finishedTime") {
            if(status == 200){
              item.visible = true;
              item.bVisible = true;
            }else{
              item.visible = false;
              item.bVisible = false;
            }
            $scope.recordData.columns[i] = item;
            break;
          }
        }
      }*/
      //监测Tab页的变换
      var previousTab;
    /*  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        // 获取已激活的标签页的名称
        $scope.activeTab = $(e.target).text();
        // 获取前一个激活的标签页的名称
        previousTab = $(e.relatedTarget).text();
        var state = null;
        if ($scope.activeTab.indexOf('待处理') > -1) {
          state = 10;
        } else if ($scope.activeTab.indexOf('处理中') > -1) {
          state = 100;
        } else if ($scope.activeTab.indexOf('已完成') > -1) {
          state = 200;
        }
        $scope.getRecordData(state);
      });*/
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
            // 获取已激活的标签页的名称
            $scope.activeTab = $(e.target).text();
            var state = null;
            if (aname == 'tab1') {
              state = 10;
            } else if (aname == 'tab2') {
              state = 100;
            } else if (aname == 'tab3') {
              state = 200;
            }
            $scope.getRecordData(state);
          }
        });
      }
      //初始化数据
      function init() {
      initEvent();
        getProcessDefinitions();
        $scope.getRecordCount();
        if ($routeParams && $routeParams.state) {
          var id = null;
          var state = null;
          switch ($routeParams.state) {
            case 'notdeal':
              id = 0;
              state = 10;
              break;
            case 'dealing':
              id = 1;
              state = 100;
              break;
            case 'done':
              id = 2;
              state = 200;
              break;
          }
          $("#myTab li:eq(" + id + ") a").tab('show');
          $scope.getRecordData(state);
        } else {
          $scope.getRecordData(10);
          // $scope.getRecordData(100);
          // $scope.getRecordData(200);
        }
      }

      init();
    }
  ]);
  /**
   * 工单详情，同时也可以直接处理任务，如果不是模板任务的时候
   */
  controllers.initController('orderDetailCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'growl', 'resourceUIService', 'workflowService', 'faultKnowledgeUIService', 'userEnterpriseService', 'Info', '$route', 'ticketTaskService', 'ticketCategoryService',
    function ($scope, $rootScope, $location, $routeParams, $timeout, growl, resourceUIService, workflowService, faultKnowledgeUIService, userEnterpriseService, Info, $route, ticketTaskService, ticketCategoryService) {
      var id = $routeParams.id;
      $scope.workType = $routeParams.workType;
      $scope.state = $routeParams.state;
      $scope.orderType = "";
      $scope.priorityCode = "";
      $scope.processType = [];
      $scope.workList = "";
      $scope.tasksList = "";
      $scope.historyData = "";
      $scope.process = "";
      $scope.processTime = "";
      $scope.myObj = {};
      $scope.myObjTop = {};
      $scope.historyData = {
        columns: [{
          title: "处理人",
          data: "handlerName"
        }, {
          title: "处理时间",
          data: "finishedTime"
        }],
        columnDefs: [{
          "targets": 1,
          "data": "option",
          "render": function (data, type, full) {
            // 返回自定义内容
            return useMomentFormat(data, "yyyy-MM-dd hh:mm:ss");
          }
        }]
      };
      $scope.devicesAll = "";
      $scope.allFault = "";
      var info = Info.get("../localdb/info.json", function (info) {
        $scope.orderType = $scope.myDicts['ticketCategory'];//工单分类
        $scope.priorityCodeList = info.priorityData;//紧急度
      });
      //获取工单类型
      ticketCategoryService.getTicketCategorys(function (returnObj) {
        if (returnObj.code == 0) {
          for (var i in returnObj.data) {
            $scope.processType = returnObj.data;
          }
        }
      });
      //获取所有工单
      resourceUIService.getDevicesByCondition({}, function (res) {
        if (res.code == 0) {
          $scope.devicesAll = res.data;
        }
      });
      //获取所有故障知识
      faultKnowledgeUIService.getAllFaultKnowledges(function (res) {
        if (res.code == 0) {
          $scope.allFault = res.data;
        }
      });
      $scope.findFault = function () {
        resourceUIService.findFaultKnowledgeByModelId($scope.orderAddData.deviceId.modelId, function (res) {
          if (res.code == 0) {
            $scope.initData.faultList = res.data;
          }
        });
      }
      $scope.formAryList = [];
      $scope.definitions = {};
      var process = function getProcessType() {
        if ($scope.workType == 'task') {
          //通过任务id，获取任务
          ticketTaskService.getTicketTaskById(id, function (taskObj) {
            if (taskObj.code == 0) {
              $scope.detail = taskObj.data;
              if (taskObj.data && taskObj.data.attributeDefinitions != "" && taskObj.data.attributeDefinitions != null) {
                var resAry = taskObj.data.attributeDefinitions;
                for (var i in resAry) {
                  var typePro = {};
                  typePro["label"] = resAry[i].label;
                  typePro["name"] = resAry[i].name;
                  typePro["dataType"] = resAry[i].dataType;
                  if (taskObj.data.taskStatus == "200" || taskObj.data.taskStatus == "100") {
                    var statList = taskObj.data.values;
                    $scope.definitions[resAry[i].label] = statList[resAry[i].label];
                  } else {
                    $scope.definitions[resAry[i].label] = "";
                  }
                  $scope.formAryList.push(typePro);
                }
                orderTicket(taskObj.data.ticketNo, taskObj.data.processDefinitionId);
              } else {
                orderTicket(taskObj.data.ticketNo, taskObj.data.processDefinitionId);
              }
            }
          });
          ticketTaskService.isMyTicketTask(id, function (ticketStatus) {
            if (ticketStatus.code == 0) {
              $scope.myObj["ticketStatus"] = ticketStatus.data;
            }
          });
        } else if ($scope.workType == 'order') {
          orderTicket(id, 0);
        }
      };
      $scope.startList = "";
      var workFlowValue = function (flowId, value) {
        workflowService.getWorkflowById(flowId, function (returnObj) {
          if (returnObj.code == 0) {
            var resAry = returnObj.data.startAttributeDefinitions;
            var vList = [];
            for (var i in resAry) {
              var typePro = {};
              typePro["label"] = resAry[i].label;
              typePro["name"] = resAry[i].name;
              typePro["dataType"] = resAry[i].dataType;
              typePro["value"] = value[resAry[i].label];
              vList.push(typePro);
            }
            $scope.startList = vList;
            console.log("startvalue======" + JSON.stringify(vList));
          }
        })
      }
      var orderTicket = function (id, processDefinitionId) {
        //根据工单Id获取工单详情
        ticketTaskService.getTicket(id, function (returnObj) {
          if (returnObj.code == 0) {
            //$scope.detail = returnObj.data;
            returnObj.data.commitTime = formatDate(returnObj.data.commitTime);
            returnObj.data.finishedTime = formatDate(returnObj.data.finishedTime);
            $scope.workList = returnObj.data;
            if ($scope.workType == 'task') {
              if ($scope.workList.finishedTime == null || $scope.workList.finishedTime == '') {
                $scope.processTime = "0";
              }
              if (returnObj.data.values != null && returnObj.data.values != "") {
                workFlowValue(processDefinitionId, returnObj.data.values);
              }
            }
            //通过工单号,获取任务
            ticketTaskService.getTicketTasks(id, function (returnObj1) {
              if (returnObj1.code == 0) {
                var searchList = [];
                for (var i in returnObj1.data) {
                  if (returnObj1.data[i].taskStatus == 200 || returnObj1.data[i].taskStatus == 100) {
                    searchList.push(returnObj1.data[i]);
                  }
                }
                $scope.historyData.data = searchList;
                $scope.$broadcast(Event.WORKORDERRECORDINIT + "_history", $scope.historyData);
              }
            });
            //}else{
            //  $scope.historyData.data = [];
            //  $scope.$broadcast(Event.WORKORDERRECORDINIT + "_history", $scope.historyData);
            //}
          }
        });
      }
      var formatDate = function (str) {
        if (str) {
          str = newDateJson(str).Format(GetDateCategoryStrByLabel());
        }
        return str;
      }
      $scope.historyGo = function () {
        var state = $routeParams.state;
        //if ($scope.workType == 'task') {
        location.href = "index.html#/workorderrecord";
        //} else if ($scope.workType == 'alert') {
        //  location.href = "index.html#/configAlert";
        //} else if ($scope.workType == 'manage') {
        //  location.href = "index.html#/workOrder/" + state;
        //}
      }
      $scope.save = function (status) {
        $scope.detail.taskStatus = status;
        //$scope.detail.status = status;
        // if($scope.detail.taskStatus != 200 ){
        $scope.detail["values"] = $scope.definitions;
        if ($scope.myObj.ticketStatus != false) {
          ticketTaskService.doTask($scope.detail, function (returnObj) {
            if (returnObj.code == 0) {
              if (status == 100) {
                growl.success("工单已确认", {});
              } else if (status == 200) {
                growl.success("工单已完成", {});
                $scope.historyGo();
              }
            } else {
              growl.success("工单操作失败", {});
            }
          });
        }
        // }
      }
      var init = function () {
        //getProcessDefinitions();
        var UA = navigator.userAgent.toLowerCase();
        if (UA.indexOf("webkit") < 0) {
          $scope.browserClass = "wrong";
          $scope.myObj = {"display": "inline-flex"};
          $scope.myObjTop = {"margin-top": "6px"};
        }
        process();
      }
      init();
    }
  ]);
  //从模板地址进来的地址
  controllers.initController('processDetailCtrl', ['$scope', '$rootScope', 'FileUploader', '$location', '$controller', '$routeParams', '$timeout','userUIService', 'sparePartUIService', 'growl', 'workflowService', 'userEnterpriseService', 'Info', '$route', 'projectUIService', 'ticketTaskService', 'maintenanceUIService',
    function ($scope, $rootScope,FileUploader, $location,$controller, $routeParams, $timeout,userUIService, sparePartUIService, growl, workflowService, userEnterpriseService, Info, $route,projectUIService, ticketTaskService, maintenanceUIService) {
      $scope.status = $routeParams.status;//获取跳转过来的任务状态
      var id = $routeParams.id;//获取跳转过来的任务id
      $scope.workType = $routeParams.workType;
      $scope.sparePartsArray = {};
      $scope.devicesList = [];
      $scope.imgList = [];
      $scope.selectMajor = '';
      $scope.taskList = {
        "ticketNo": "",
        "ticketTitle": "",
        "ticketCommitTime": "",
        "ticketCreatorName": "",
        "customerName": "",
        "projectName": "",
        "projectID": "",
        "modelName": "",
        "modelID": "",
        "deviceSn": "",
        "faultNo": "",
        "faultPhenomenon": ""
      };
      $scope.selectList = {};
      $scope.urlService = userUIService.uploadFileUrl;
      $scope.definitions = {"faultPhenomenon": "", "stockOrderItemList": "", "ticketTaskDesc": ""};
      $scope.addAttachment = function () {
        var newObj = {
          name: "",
          label: "",
          stockNumber: "",
          isEdit: 3,
          id: null
        }
        var addList = []
        for (var n in $scope.selectList.allSparePartsList) {
          var index = -1;
          for (var j in $scope.sparePartsInitList.data) {
            if ($scope.selectList.allSparePartsList[n].id == $scope.sparePartsInitList.data[j].id) {
              index = j
            }
          }
          if (index == -1) {
            addList.push($scope.selectList.allSparePartsList[n]);
          }
        }
        for (var i in $scope.sparePartsInitList.data) {
          if ($scope.sparePartsInitList.data[i].id == null) {
            growl.warning("当前有未保存的备件", {})
            return;
          }
        }
        $scope.sparePartsInitList.data.unshift(newObj);
        //$scope.$broadcast(Event.WORKORDERRECORDINIT + "_deviceTask", $scope.sparePartsInitList);
        $scope.definitions.selectList = "";
      }
      $scope.sparePartsInitList = {};
      $scope.serviceOrigin = userUIService.uploadFileUrl + '/api/rest/upload/maintenanceUIService/uploadTaskImage';
      $controller('AppUploadCtrl',{$scope: $scope ,growl:growl,FileUploader:FileUploader});
      $scope.toggle = function toggle() {
        $('#nv-file-select').click();
      }
      $scope.uploadExcel = function(config) {
      /*  $scope.uploader.formData = [];
        $scope.uploader.formData.push({
          config: 'deviceModel'
        });*/
        $scope.uploader.uploadAll();
      };
      $scope.$on("uploadTemplate", function(event, args) {
        if(args.response.code == 0){
          growl.success("上传成功", {})
          $scope.imgList.push(args.response.data.file);
          $scope.$apply();
        }
      });
      $scope.uploader.onAfterAddingFile = function(fileItem) {
        if ($scope.uploader.queue.length > $scope.queueLimit){
          $scope.uploader.removeFromQueue(0);
        }
        $scope.uploadExcel();
      };
      $scope.saveAttachment = function (selectStatus) {
        var tmp = -1;
        // if (selectStatus.id == -1) return;
        for (var i in $scope.sparePartsInitList.data) {
          if ($scope.selectMajor == $scope.sparePartsInitList.data[i].id) {
            growl.warning("该备件已经使用", {});
            tmp = $scope.selectMajor;
            break;
          }
        }
        if(tmp == -1){
          if (!$scope.sparePartsInitList.data) $scope.sparePartsInitList.data = [];
          $scope.sparePartsArray[$scope.selectMajor]["edit"] = 7;
          // $scope.sparePartsArray[$scope.selectMajor] = selectStatus;
          $scope.sparePartsArray[$scope.selectMajor].editNumber = "";
          $scope.sparePartsInitList.data.unshift($scope.sparePartsArray[$scope.selectMajor]);
          $scope.selectMajor = "";
          $scope.$broadcast(Event.WORKORDERRECORDINIT + "_deviceTask", $scope.sparePartsInitList);

        }
        //if($scope.sparePartsArray[selectStatus.id]){
        //
        //}
      };
      $scope.cancelAttach = function (data) {
        for (var j in $scope.sparePartsInitList.data) {
          if ($scope.sparePartsInitList.data[j].isEdit == 3 && data.isEdit == 3) {
            $scope.sparePartsInitList.data.splice(j, 1);
          } else if ($scope.sparePartsInitList.data[j].id == data.id) {
            $scope.sparePartsInitList.data.splice(j, 1);
          }
        }
        $scope.$broadcast(Event.WORKORDERRECORDINIT + "_deviceTask", $scope.sparePartsInitList);
      }
      $scope.processTask = function (status) {
        var table = $('table[name="major"]').DataTable();
        var data = table.$('input').serializeArray();
        var spareList = $scope.sparePartsInitList.data;
        var valueList = [];
        var statusSel = $scope.detail.taskStatus;
        for (var i in data) {
          for (var j in spareList) {
            if (data[i].name == spareList[j].id) {
              if (data[i].value) {
                spareList[j].stockNumber = data[i].value;
                valueList.push(spareList[j]);
              } else {
                growl.warning("您有备件数量没有输入,请输入之后再保存", {});
                return;
              }
            }
          }
        }
        $scope.definitions.stockOrderItemList = valueList;
        $scope.detail["values"] = $scope.definitions;
        $scope.detail["maintenanceContent"] = $scope.devicesList;//	维保内容
        $scope.detail["images"] = $scope.imgList;//图片
        $scope.detail.taskStatus = status;
        if ($scope.selectList.ticketStatus) {
          ticketTaskService.doTask($scope.detail, function (returnObj) {
            if (returnObj.code == 0) {
              if (status == 200) {
                growl.success("处理任务成功", {});
                location.href = "index.html#/workorderrecord";
              } else {
                growl.success("任务已确认", {});
              }
            }else{
              $scope.detail.taskStatus = statusSel;
            }
          });
        }
      }
      var ticketDetail = function(){
        //通过任务id查任务详情
        ticketTaskService.getTicketTaskById(id, function (taskObj) {
          if (taskObj.code == 0) {
            if(taskObj.data.deviceId){
              if(taskObj.data.maintenanceContent && taskObj.data.maintenanceContent.length > 0){
                $scope.devicesList = taskObj.data.maintenanceContent;
              }else{
                itemsByDevice(taskObj.data.deviceId);
              }
            }
            $scope.detail = taskObj.data;
            $scope.taskList.ticketNo = taskObj.data.ticketNo;
            $scope.taskList.ticketTitle = taskObj.data.ticketTitle;
            if (taskObj.data.variables != "" && taskObj.data.variables != null) {
              $scope.taskList.ticketCommitTime = newDateJson(taskObj.data.variables.ticketCommitTime).Format(GetDateCategoryStrByLabel());
              $scope.taskList.projectId = taskObj.data.variables.device.projectId;
            }
            $scope.taskList.ticketCreatorName = taskObj.data.variables.ticketCreatorName;
            $scope.taskList.modelName = taskObj.data.variables.modelName;
            $scope.taskList.modelID = taskObj.data.variables.modelID;
            //if(taskObj.data.variables.customer != "" && taskObj.data.variables.customer != ""){
            $scope.taskList.customerID = taskObj.data.variables.customerID;
            $scope.taskList.customerName = taskObj.data.variables.customerName;
            //}
           /* if (taskObj.data.variables.project != "" && taskObj.data.variables.project != null) {
              $scope.taskList.projectName = taskObj.data.variables.project.label;
              $scope.taskList.projectID = taskObj.data.variables.project.id;
            }*/
            $scope.taskList.faultNo = taskObj.data.variables.faultNo;
            $scope.taskList.deviceSn = taskObj.data.variables.deviceSn;
            $scope.taskList.faultPhenomenon = taskObj.data.variables.faultPhenomenon;
            if(taskObj.data.images){
              $scope.imgList = taskObj.data.images;
            }
            if (taskObj.data.values != null && taskObj.data.values != "") {
              $scope.definitions.ticketTaskDesc = taskObj.data.values.ticketTaskDesc;
              if (taskObj.data.values.stockOrderItemList != null && taskObj.data.values.stockOrderItemList != "") {
                $scope.sparePartsInitList.data = taskObj.data.values.stockOrderItemList;
                var orderList = taskObj.data.values.stockOrderItemList;
                for (var j in orderList) {
                  if($scope.sparePartsArray[orderList[j].id] != undefined){
                    $scope.sparePartsArray[orderList[j].id].editNumber = orderList[j].stockNumber;
                  }
                }
                //$scope.$broadcast(Event.WORKORDERRECORDINIT+"_deviceTask", $scope.sparePartsInitList);
              }
            }
            $scope.$broadcast(Event.WORKORDERRECORDINIT + "_deviceTask", $scope.sparePartsInitList);
          }
        });
      };
      var itemsByDevice = function (deviceId) {
        maintenanceUIService.getInspectionItemsByDeviceId(deviceId,function (res) {
          if(res.code == 0){
            res.data.forEach(function (obj) {
              obj["status"] = "0";
            });
            $scope.devicesList = res.data;
          }
        });
      }
      var init = function () {
        ticketTaskService.isMyTicketTask(id, function (ticketStatus) {
          if (ticketStatus.code == 0) {
            $scope.selectList["ticketStatus"] = ticketStatus.data;
          }
        });
        $scope.sparePartsInitList.data = [];
        //查询所有备件
        sparePartUIService.getAllSpareParts(function (data) {
          if (data.code == 0) {
            //$scope.selectList["allSpareParts"] = data.data;
            //$scope.selectList["allSparePartsList"] = data.data;
            var newObj = [];
            newObj.push({
              text: '请选择',
              label: '请选择',
              id: -1
            });
            data.data.forEach(function (obj) {
              obj.text = obj.name;
              $scope.sparePartsArray[obj.id] = obj;
              //$scope.sparePartsArray[obj.id]["editNumber"] = obj;
              newObj.push(obj);
            });
            ticketDetail();
            $scope.allSpareParts = newObj;
          }
        });
      };
      /**
       * 查询项目
       */
      $scope.projectsList;
      $scope.projectsDic = {};
      $scope.queryProject = function() {
        projectUIService.findProjectsByCondition({}, function(returnObj) {
          if(returnObj.code == 0) {
            returnObj.data.forEach(function(item) {
              $scope.projectsDic[item.id] = item;
              item.text = item.projectName;
            })
            $scope.projectsList = returnObj.data;
            init();
          }
        })
      };
      $scope.queryProject();
    }
  ]);
  //工单任务历史记录
  controllers.initController('workTimeLineCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$timeout', 'ticketLogService', 'growl', 'workflowService', 'userEnterpriseService', 'Info', '$route', 'ticketTaskService', 'processService',
    function ($scope, $rootScope, $location, $routeParams, $timeout, ticketLogService, growl, workflowService, userEnterpriseService, Info, $route, ticketTaskService, processService) {
      var id = $routeParams.id;//获取跳转过来的任务id
      $scope.historyList = null;
      $scope.workOrderId = id;
      $scope.workOrderDetail = null;
      if (id != '' && id != null) {
        ticketTaskService.getTicket(id, function (resData) {
          if (resData.code == 0) {
            $scope.workOrderDetail = resData.data;
          }
        });
        ticketLogService.getByTicketNo(id, function (res) {
          if (res.code == 0) {
            $scope.historyList = res.data;
          }
        });
      }
    }
  ]);
});
