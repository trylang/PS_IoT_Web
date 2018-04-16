define(['controllers/controllers', 'bootstrap-dialog'], function(controllers, BootstrapDialog) {
  'use strict';

  // ==========================================    备件信息    ===================================
  controllers.initController('sparePartInfoCtrl', ['$scope', 'ngDialog', '$location', '$routeParams', '$timeout', 'sparePartUIService', 'userEnterpriseService', 'userLoginUIService', 'Info', 'growl',
    function($scope, ngDialog, $location, $routeParams, $timeout, sparePartUIService, userEnterpriseService, userLoginUIService, Info, growl) {
      $scope.selecteditem = true; //是否有已选中的备件信息
      $scope.spareInfoList = []; //存储备件信息列表，用于添加
      $scope.allSpareInfos = []; //用来存储备件信息列表
      $scope.editStatus = 3; //3为新增，2为修改
      $scope.ifRouteParams = 0; //是否是跳转，如果是跳转隐藏添加按钮
      $scope.queryState = 1; //用于tab切换
      var getSpareInfoList = function(item) {
        var newObjAry = [];
        for (var i in item) {
          var obj = item[i];
          var newObj = jQuery.extend(true, {}, obj);
          newObj.isEdit = newObj.isEdit ? newObj.isEdit : 0;
          newObj.id = obj.id;
          newObj.name = obj.name;
          newObj.label = obj.label;
          newObj.unit = obj.unit;
          newObj.desc = obj.desc;
          newObj.originalNumber = obj.originalNumber;
          newObj.upperLimit = obj.upperLimit;
          newObj.lowerLimit = obj.lowerLimit;
          newObjAry.push(newObj);
        }
        $scope.$broadcast(Event.SPAREINFOINIT, {
          "option": [newObjAry]
        });
      }

      //添加备件信息
      $scope.addSpareInfo = function() {
        $scope.editStatus = 3;
        for (var i in $scope.spareInfoList) {
          if ($scope.spareInfoList[i].id == 0 || $scope.spareInfoList[i].isEdit == 2) {
            growl.warning("已存在正在编辑的备件信息", {});
            return;
          }
        }
        var newObj = {
          "name": "",
          "unit": "",
          "model": "",
          "label": "",
          "desc": "",
          "originalNumber": "",
          "upperLimit": "",
          "lowerLimit": "",
          'id': 0,
          'isEdit': 2
        };
        $scope.spareInfoList.push(newObj);
        getSpareInfoList($scope.spareInfoList);
      }
      $scope.doActionInfo = function(type, select, callback) {
        if (type == "savespareInfo") {
          if (select != "" && select != null) {
            var param = {};
            //说明是修改项目
            if (select.id > 0) {
              param = {
                "name": select.name,
                "unit": select.unit,
                "model": select.model,
                "label": select.label,
                "desc": select.desc,
                "originalNumber": select.originalNumber,
                "upperLimit": select.upperLimit,
                "lowerLimit": select.lowerLimit,
                "id": select.id
              };
            } else {
              param = {
                "name": select.name,
                "unit": select.unit,
                "model": select.model,
                "label": select.label,
                "desc": select.desc,
                "originalNumber": select.originalNumber,
                "upperLimit": select.upperLimit,
                "lowerLimit": select.lowerLimit
              };
            }
            sparePartUIService.saveSparePart(param, function(returnObj) {
              if (returnObj.code == 0) {
                if (select.id > 0) {
                  growl.success("已成功修改此备件信息", {});
                } else {
                  growl.success("已成功添加备件信息", {});
                }
                getAllSpareParts();
                return;
              }
            })
          } else {
            growl.warning("请填写完整备件信息", {});
            return;
          }
        } else if (type == "deletespareInfo") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: '确认删除此备件信息吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                sparePartUIService.deleteSparePart(select.id, function(returnObj) {
                  if (returnObj.code == 0) {
                    growl.success("成功删除此备件信息", {});
                    getAllSpareParts();
                    return;
                  }
                })
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        } else if (type == "cancel") {
          getAllSpareParts();
        } else if (type == "showStockOrder") {
          $scope.SpareName = select.name;
          getStockOrderBySpareId(select.id);
        }
      }

      //根据备件Id获取备件信息
      var getSparePartById = function(id) {
        if (!id) {
          growl.info("此备件信息不存在", {});
          return;
        }
        sparePartUIService.getSparePartById(id, function(returnObj) {
          if (returnObj.code == 0) {
            var arr = [];
            if (isArray(returnObj.data)) {
              arr = returnObj.data;
            } else {
              if (returnObj.data == null) {
                arr = [];
              } else {
                arr.push(returnObj.data);
              }
            }
            $timeout(function() {
              $scope.$broadcast(Event.SPAREINFOINIT, {
                "option": [arr]
              });
            })
          }
        })
      };

      //根据备件Id获取条目信息
      var getStockOrderBySpareId = function(id) {
        sparePartUIService.getStockOrderItemsBySparePartId(id, function(returnObj) {
          if (returnObj.code == 0) {
            var arr = [];
            for (var i in returnObj.data) {
              var obj = {};
              obj.handlerPerson = returnObj.data[i].stockOder.handlerPerson; //处理人
              obj.name = returnObj.data[i].stockOder.name; //库单编号
              obj.createTime = returnObj.data[i].stockOder.createTime; //创建时间
              obj.category = returnObj.data[i].stockOder.category; // 出入库
              obj.sparePartNumber = returnObj.data[i].sparePartNumber; //备件数量
              arr.push(obj);
            }
            $timeout(function() {
              $scope.$broadcast(Event.SPAREINFOINIT + "record", {
                "option": [arr]
              });
            })
          }
        })
      };

      //获取所有备件信息
      var getAllSpareParts = function() {
        sparePartUIService.getAllSpareParts(function(returnObj) {
          if (returnObj.code == 0) {
            $scope.allSpareInfos = returnObj.data;
            $scope.spareInfoList = [];
            $scope.spareInfos = [];
            for (var i in returnObj.data) {
              var obj = returnObj.data[i];
              obj.isEdit = 0;
              $scope.spareInfoList.push(obj);
            }
            $scope.$broadcast(Event.SPAREINFOINIT, {
              "option": [$scope.spareInfoList]
            });
          }
        })
      };

      //根据条件获取备件信息
      var getSpares = function() {
        if ($routeParams.spareinfoId) {
          $scope.ifRouteParams = 2010; //隐藏添加按钮 
          getSparePartById($routeParams.spareinfoId);
        } else {
          getAllSpareParts();
        }
      };
      getSpares();

      $scope.getEvent = function() {
        if ($scope.queryState == 1) {
          getSpares();
        } else if ($scope.queryState == 2) {
          $timeout(function() {
            $scope.$broadcast('spareIn');
          })
        } else if ($scope.queryState == 3) {
          $timeout(function() {
            $scope.$broadcast('spareOut');
          })
        }
      };

      $scope.getEvent();


    }
  ]);

  // ==========================================    备件入库    ===================================
  controllers.initController('spareInPartCtrl', ['$scope', 'ngDialog', '$location', '$routeParams', '$timeout', 'sparePartUIService', 'userEnterpriseService', 'userLoginUIService', 'Info', 'growl',
    function($scope, ngDialog, $location, $routeParams, $timeout, sparePartUIService, userEnterpriseService, userLoginUIService, Info, growl) {
      $scope.selecteditem = true; //是否有已选中的入库单
      $scope.spareInLists = []; //存储入库单列表，用于添加
      $scope.$parent.selectedSparecalInList = []; //存储入库中条目，用于添加
      $scope.$parent.ifSubmitIn = 0;
      $scope.selectedConItem = {}; //选择到的入库单与设备关联
      $scope.createTime = '';
      $scope.$parent.selected = {
        'sparePartId': '', //所选备件Id
        'stockOrderId': '' //所选库单Id
      };
      $scope.relatedDeviceList = []; //用于存储关联班组的设备id组
      $scope.$on('spareIn', function() {
        initIn();
      });

      var getcontectList = function(item) {
        var newObjAry = [];
        for (var i in item) {
          var obj = item[i];
          var newObj = jQuery.extend(true, {}, obj);
          newObj.isEdit = newObj.isEdit ? newObj.isEdit : 0;
          newObj.id = obj.id;
          newObj.name = obj.name;
          newObj.handlerPerson = obj.handlerPerson;
          newObj.createTime = obj.createTime;
          newObj.desc = obj.desc;
          newObjAry.unshift(newObj);
        }
        $scope.$broadcast(Event.SPAREININIT, {
          "option": [newObjAry]
        });
      };

      var getSpareCalList = function(item) {
        var newObjAry = [];
        for (var i in item) {
          var obj = item[i];
          var newObj = jQuery.extend(true, {}, obj);
          newObj.isEdit = newObj.isEdit ? newObj.isEdit : 0;
          newObj.id = obj.id;
          newObj.sparePartName = obj.sparePartName;
          newObj.handlerPerson = obj.handlerPerson;
          newObj.desc = obj.desc;
          newObjAry.unshift(newObj);
        }
        $scope.$parent.$broadcast(Event.INSPARECLAUSESINIT, {
          "option": [newObjAry]
        });
      };

      //添加入库单
      $scope.addspareIn = function() {
        for (var i in $scope.spareInLists) {
          if ($scope.spareInLists[i].id == 0) {
            growl.warning("已存在正在编辑的入库单", {});
            return;
          }
        }
        var newObj = {
          'name': '',
          'handlerPerson': '',
          'createTime': '',
          'desc': '',
          'id': 0,
          'isEdit': 2
        };
        $scope.spareInLists.unshift(newObj);
        getcontectList($scope.spareInLists);
      }

      $scope.doActionIns = function(type, select, callback) {
        if (type == "cancel") {
          getInStockOrders();
          // for (var i = $scope.spareInLists.length - 1; i > -1; i--) {
          //   if ($scope.spareInLists[i].id == 0) {
          //     $scope.spareInLists.splice(i, 1);
          //   } else {
          //     $scope.spareInLists[i]["isEdit"] = 0;
          //   }
          // }
          // $scope.$broadcast(Event.SPAREININIT, {
          //   "option": [$scope.spareInLists]
          // });
        } else if (type == "saveSpareIn") {
          for (var i = $scope.spareInLists.length - 1; i > -1; i--) {
            if ($scope.spareInLists[i].id == 0) {
              $scope.spareInLists.splice(i, 1);
            } else {
              $scope.spareInLists[i]["isEdit"] = 0;
            }
          }
          if (select != "" && select != null) {
            var param = {};
            //说明是修改项目
            if (select.id > 0) {
              param = {
                'name': select.name,
                'handlerPerson': select.handlerPerson,
                'createTime': select.createTime,
                'desc': select.desc,
                "id": select.id
              };
            } else {
              param = {
                'name': select.name,
                'handlerPerson': select.handlerPerson,
                'createTime': select.createTime,
                'desc': select.desc
              };
            }
            sparePartUIService.saveInStockOrder(param, function(returnObj) {
              if (returnObj.code == 0) {
                callback(returnObj.data);
                if (select.id > 0) {
                  growl.success("已成功保存入库单", {});
                  var k = -1;
                  for (var i in $scope.spareInLists) {
                    if ($scope.spareInLists[i].id == select.id) {
                      k = select.id;
                      $scope.spareInLists[i] = jQuery.extend(true, {}, returnObj.data);
                      break;
                    }
                  }
                  if (k == -1) {
                    $scope.spareInLists.push(returnObj.data);
                  }
                }

              }
            })
          }
        } else if (type == "deleteSpareIn") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: '确认删除此入库单吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                sparePartUIService.deleteStockOrder(select.id, function(returnObj) {
                  if (returnObj.code == 0) {
                    growl.success("成功删除此入库单", {});
                  }
                  getInStockOrders();
                })
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        } else if (type == "showSpareList") {
          $scope.$parent.selSpareName = select.name;
          getStockOrderItemsById(select.id);
          $scope.$parent.selected.stockOrderId = select.id; //所选库单id
          if (select.commit) {
            $scope.$parent.ifSubmitIn = 2010;
          } else {
            $scope.$parent.ifSubmitIn = 0;
          }
        }
      }

      $scope.$parent.doActionIn = function(type, select, callback) {
        if (type == "saveSpareInCaluses") {
          if (select != "" && select != null) {
            var param = {};
            //说明是修改项目
            if (select.id > 0) {
              param = {
                'sparePartId': select.sparePartId, //备件Id
                'stockOrderId': $scope.$parent.selected.stockOrderId, //库单Id
                'sparePartNumber': select.sparePartNumber, //备件数量
                'desc': select.desc,
                "id": select.id
              };
            } else {
              param = {
                'sparePartId': select.sparePartId,
                'stockOrderId': $scope.$parent.selected.stockOrderId,
                'sparePartNumber': select.sparePartNumber,
                'desc': select.desc
              };
            }

            sparePartUIService.saveStockOrderItem(param, function(returnObj) {
              if (returnObj.code == 0) {
                if (select.id > 0) {
                  growl.success("已成功修改此库单条目", {});
                } else {
                  growl.success("已成功添加入库单条目", {});
                }

                getStockOrderItemsById($scope.$parent.selected.stockOrderId);
                return;
              }
            });
          }
        } else if (type == "cancel") {
          for (var i = $scope.$parent.selectedSparecalInList.length - 1; i > -1; i--) {
            if ($scope.$parent.selectedSparecalInList[i].id == 0) {
              $scope.$parent.selectedSparecalInList.splice(i, 1);
            } else {
              $scope.$parent.selectedSparecalInList[i]["isEdit"] = 0;
            }
          }
          $scope.$parent.$broadcast(Event.INSPARECLAUSESINIT, {
            "option": [$scope.$parent.selectedSparecalInList]
          });
        } else if (type == "deleteStockOrderItem") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: '确认删除此条目吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                sparePartUIService.deleteStockOrderItem(select.id, function(returnObj) {
                  if (returnObj.code == 0) {
                    growl.success("成功删除此条目", {});
                    getStockOrderItemsById($scope.$parent.selected.stockOrderId);
                    return;
                  } else {
                    growl.warning("删除此条目失败", {});
                    return;
                  }
                })
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        }
      }

      //添加条目
      $scope.$parent.addInSpareClauseItem = function() {
        for (var i in $scope.$parent.selectedSparecalInList) {
          if ($scope.$parent.selectedSparecalInList[i].id == 0) {
            growl.warning("已存在正在编辑的条目", {});
            return;
          }
        }
        var newObj = {
          'sparePartName': '',
          'sparePartNumber': '',
          'desc': '',
          'id': 0,
          'isEdit': 2
        };
        $scope.$parent.selectedSparecalInList.push(newObj);
        getSpareCalList($scope.$parent.selectedSparecalInList);
      };

      //提交库单
      $scope.submitInCaluses = function() {
        var selectedId = $scope.$parent.selected.stockOrderId;
        if (selectedId) {
          var arr = [selectedId, true];
          sparePartUIService.commitStockOrder(arr, function(returnObj) {
            if (returnObj.code == 0) {
              growl.success("已成功提交此入库单", {});
              getInStockOrders();
              $scope.$parent.ifSubmitIn = 2010;

            } else if (returnObj.code == 20622) {
              getInStockOrders();
            }

          })
        }
      }

      //根据库单id获取相关条目
      function getStockOrderItemsById(id) {
        sparePartUIService.getStockOrderItemsById(id, function(returnObj) {
          if (returnObj.code == 0) {
            $scope.$parent.selectedSparecalInList = returnObj.data;
            $timeout(function() {
              $scope.$parent.$broadcast(Event.INSPARECLAUSESINIT, {
                "option": [returnObj.data]
              });
            })

          }
        })
      }

      //获取所有备件
      var getAllSpareParts = function() {
        sparePartUIService.getAllSpareParts(function(returnObj) {
          if (returnObj.code == 0) {
            $scope.spareInfos = returnObj.data;
          }
        })
      };

      //获取所有入库单
      var getInStockOrders = function(flg) {
        if (!$routeParams.spareInId) {
          sparePartUIService.getAllInStockOrders(function(returnObj) {
            if (returnObj.code == 0) {
              $scope.spareInLists = returnObj.data;
              for (var i in returnObj.data) {
                $scope.spareInLists[i].isEdit = 0;
              }
              $timeout(function() {
                $scope.$parent.$broadcast(Event.SPAREININIT, {
                  "option": [$scope.spareInLists]
                });
              })

            }
          })
        } else {
          sparePartUIService.getInStockOrdersByhandlerId($routeParams.spareInId, function(returnObj) {
            if (returnObj.code == 0) {
              $scope.spareInLists = returnObj.data;
              for (var i in returnObj.data) {
                $scope.spareInLists[i].isEdit = 0;
              }
              $timeout(function() {
                $scope.$parent.$broadcast(Event.SPAREININIT, {
                  "option": [$scope.spareInLists]
                });
              })
            }
          })
        }

      };

      function initIn() {
        getAllSpareParts();
        getInStockOrders();
      };

    }
  ]);

  // ==========================================    备件出库    ===================================
  controllers.initController('spareOutPartCtrl', ['$scope', 'ngDialog', '$location', '$routeParams', '$timeout', 'sparePartUIService', 'userEnterpriseService', 'userLoginUIService', 'Info', 'growl',
    function($scope, ngDialog, $location, $routeParams, $timeout, sparePartUIService, userEnterpriseService, userLoginUIService, Info, growl) {
      $scope.selecteditem = true; //是否有已选中的出库单
      $scope.spareOutLists = []; //存储出库单列表，用于添加
      $scope.$parent.selectedSparecalOutList = []; //存储出库中条目，用于添加

      $scope.$parent.ifSubmitOut = 0;
      $scope.selectedConItem = {}; //选择到的出库单与条目关联
      $scope.$parent.selected = {
        'sparePartId': '', //所选备件Id
        'stockOrderId': '' //所选库单Id
      };
      $scope.$on('spareOut', function() {
        initOut();
      });

      var getcontectList = function(item) {
        var newObjAry = [];
        for (var i in item) {
          var obj = item[i];
          var newObj = jQuery.extend(true, {}, obj);
          newObj.isEdit = newObj.isEdit ? newObj.isEdit : 0;
          newObj.id = obj.id;
          newObj.name = obj.name;
          newObj.handlerPerson = obj.handlerPerson;
          newObj.createTime = obj.createTime;
          newObj.desc = obj.desc;
          newObjAry.push(newObj);
        }
        $scope.$parent.$broadcast(Event.SPAREOUTINIT, {
          "option": [newObjAry]
        });
      };

      var getSpareCalList = function(item) {
        var newObjAry = [];
        for (var i in item) {
          var obj = item[i];
          var newObj = jQuery.extend(true, {}, obj);
          newObj.isEdit = newObj.isEdit ? newObj.isEdit : 0;
          newObj.id = obj.id;
          newObj.sparePartName = obj.sparePartName;
          newObj.handlerPerson = obj.handlerPerson;
          newObj.desc = obj.desc;
          newObjAry.push(newObj);
        }
        $scope.$parent.$broadcast(Event.OUTSPARECLAUSESINIT, {
          "option": [newObjAry]
        });
      };

      //添加出库单
      $scope.addspareOut = function() {
        for (var i in $scope.spareOutLists) {
          if ($scope.spareOutLists[i].id == 0) {
            growl.warning("已存在正在编辑的出库单", {});
            return;
          }
        }
        var newObj = {
          'name': '',
          'handlerPerson': '',
          'createTime': '',
          'desc': '',
          'id': 0,
          'isEdit': 2
        };
        $scope.spareOutLists.push(newObj);
        getcontectList($scope.spareOutLists);
      }

      $scope.doAction = function(type, select, callback) {
        if (type == "cancel") {
          getOutStockOrders();
        } else if (type == "saveSpareOut") {
          for (var i = $scope.spareOutLists.length - 1; i > -1; i--) {
            if ($scope.spareOutLists[i].id == 0) {
              $scope.spareOutLists.splice(i, 1);
            } else {
              $scope.spareOutLists[i]["isEdit"] = 0;
            }
          }
          if (select != "" && select != null) {
            var param = {};
            //说明是修改项目
            if (select.id > 0) {
              param = {
                'name': select.name,
                'handlerPerson': select.handlerPerson,
                'createTime': select.createTime,
                'desc': select.desc,
                "id": select.id
              };
            } else {
              param = {
                'name': select.name,
                'handlerPerson': select.handlerPerson,
                'createTime': select.createTime,
                'desc': select.desc
              };
            }
            sparePartUIService.saveOutStockOrder(param, function(returnObj) {
              if (returnObj.code == 0) {
                callback(returnObj.data);
                if (select.id > 0) {
                  growl.success("已成功保存出库单", {});
                  var k = -1;
                  for (var i in $scope.spareOutLists) {
                    if ($scope.spareOutLists[i].id == select.id) {
                      k = select.id;
                      $scope.spareOutLists[i] = jQuery.extend(true, {}, returnObj.data);
                      break;
                    }
                  }
                  if (k == -1) {
                    $scope.spareOutLists.push(returnObj.data);
                  }
                }

              }
            })
          }
        } else if (type == "deleteSpareOut") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: '确认删除此出库单吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                sparePartUIService.deleteStockOrder(select.id, function(returnObj) {
                  if (returnObj.code == 0) {
                    growl.success("成功删除此出库单", {});
                  }
                  getOutStockOrders();
                })
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        } else if (type == "showSpareList") {
          $scope.$parent.selSpareName = select.name;
          getStockOrderItemsById(select.id);
          $scope.$parent.selected.stockOrderId = select.id; //所选库单id
          if (select.commit) {
            $scope.$parent.ifSubmitOut = 2010;
          } else {
            $scope.$parent.ifSubmitOut = 0;
          }
        }
      }

      $scope.$parent.doActionOut = function(type, select, callback) {
        if (type == "saveSpareOutCaluses") {
          if (select != "" && select != null) {
            var param = {};
            //说明是修改项目
            if (select.id > 0) {
              param = {
                'sparePartId': select.sparePartId, //备件Id
                'stockOrderId': $scope.$parent.selected.stockOrderId, //库单Id
                'sparePartNumber': select.sparePartNumber, //备件数量
                'desc': select.desc,
                "id": select.id
              };
            } else {
              param = {
                'sparePartId': select.sparePartId,
                'stockOrderId': $scope.$parent.selected.stockOrderId,
                'sparePartNumber': select.sparePartNumber,
                'desc': select.desc
              };
            }

            sparePartUIService.saveStockOrderItem(param, function(returnObj) {
              if (returnObj.code == 0) {
                if (select.id > 0) {
                  growl.success("已成功修改此库单条目", {});
                } else {
                  growl.success("已成功添加库单条目", {});
                }
                getStockOrderItemsById($scope.$parent.selected.stockOrderId);
                return;
              }
            });
          }
        } else if (type == "cancel") {
          for (var i = $scope.$parent.selectedSparecalOutList.length - 1; i > -1; i--) {
            if ($scope.$parent.selectedSparecalOutList[i].id == 0) {
              $scope.$parent.selectedSparecalOutList.splice(i, 1);
            } else {
              $scope.$parent.selectedSparecalOutList[i]["isEdit"] = 0;
            }
          }
          $scope.$parent.$broadcast(Event.OUTSPARECLAUSESINIT, {
            "option": [$scope.$parent.selectedSparecalOutList]
          });
        } else if (type == "deleteStockOrderItem") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: '确认删除此条目吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                sparePartUIService.deleteStockOrderItem(select.id, function(returnObj) {
                  if (returnObj.code == 0) {
                    growl.success("成功删除此条目", {});
                    getStockOrderItemsById($scope.$parent.selected.stockOrderId);

                    return;
                  } else {
                    growl.warning("删除此条目失败", {});
                    return;
                  }
                })
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        }
      }

      //添加条目
      $scope.$parent.addOutSpareClauseItem = function() {
        for (var i in $scope.$parent.selectedSparecalOutList) {
          if ($scope.$parent.selectedSparecalOutList[i].id == 0) {
            growl.warning("已存在正在编辑的条目", {});
            return;
          }
        }
        var newObj = {
          'sparePartName': '',
          'sparePartNumber': '',
          'desc': '',
          'id': 0,
          'isEdit': 2
        };
        $scope.$parent.selectedSparecalOutList.push(newObj);
        getSpareCalList($scope.$parent.selectedSparecalOutList);
      }

      //根据出库单id获取相关条目
      function getStockOrderItemsById(id) {
        sparePartUIService.getStockOrderItemsById(id, function(returnObj) {
          if (returnObj.code == 0) {
            $scope.$parent.selectedSparecalOutList = returnObj.data;
            $timeout(function() {
              $scope.$parent.$broadcast(Event.OUTSPARECLAUSESINIT, {
                "option": [returnObj.data]
              });
            })

          }
        })
      }

      //提交函数
      function submitFun(arr) {
        sparePartUIService.commitStockOrder(arr, function(returnObj) {
          if (returnObj.code == 0) {
            if (returnObj.data.length > 0) {
              BootstrapDialog.show({
                title: '提示',
                closable: false,
                message: '此库单显示备件不足,仍确定提交此库单吗？',
                buttons: [{
                  label: '确定',
                  cssClass: 'btn-success',
                  action: function(dialogRef) {
                    var arrObj = [arr[0], false];
                    submitFun(arrObj);
                    getOutStockOrders();
                    dialogRef.close();
                  }
                }, {
                  label: '取消',
                  action: function(dialogRef) {
                    dialogRef.close();
                  }
                }]
              });
            } else {
              growl.success("已成功提交此出库单", {});
              getOutStockOrders();
            }
          }
        })
      }

      //提交库单
      $scope.submitOutCaluses = function() {
        var selectedId = $scope.$parent.selected.stockOrderId;
        if (selectedId) {
          var arr = [selectedId, true];
          submitFun(arr);
        }
      }

      //获取所有备件
      var getAllSpareParts = function() {
        sparePartUIService.getAllSpareParts(function(returnObj) {
          if (returnObj.code == 0) {
            $scope.spareInfos = returnObj.data;
          }
        })
      };
      //获取所有出库单
      var getOutStockOrders = function() {
        if (!$routeParams.spareInId) {
          sparePartUIService.getAllOutStockOrders(function(returnObj) {
            if (returnObj.code == 0) {
              $scope.spareOutLists = returnObj.data;
              for (var i in returnObj.data) {
                $scope.spareOutLists[i].isEdit = 0;
              }

              $timeout(function() {
                $scope.$parent.$broadcast(Event.SPAREOUTINIT, {
                  "option": [$scope.spareOutLists]
                });
              })
            }
          })
        } else {
          sparePartUIService.getOutStockOrdersByhandlerId($routeParams.spareInId, function(returnObj) {
            if (returnObj.code == 0) {
              $scope.spareOutLists = returnObj.data;
              for (var i in returnObj.data) {
                $scope.spareOutLists[i].isEdit = 0;
              }

              $timeout(function() {
                $scope.$parent.$broadcast(Event.SPAREOUTINIT, {
                  "option": [$scope.spareOutLists]
                });
              })
            }
          })
        }
      }

      function initOut() {
        getAllSpareParts();
        getOutStockOrders();
      };

    }
  ]);


});
