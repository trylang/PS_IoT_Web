define(['controllers/controllers', 'bootstrap-dialog'], function(controllers, BootstrapDialog) {
  'use strict';
  controllers.controller('AppNavCtrl', ['$scope','ngDialog', '$location', 'Info', 'alertService', 'userLoginUIService',
    'viewFlexService', 'unitService', 'configUIService','resourceUIService', 'dictionaryService', 'ticketTaskService', '$route', '$timeout', '$rootScope', 'growl',
    function($scope,ngDialog, $location, Info, alertService, userLoginUIService, viewFlexService, unitService,configUIService,
      resourceUIService, dictionaryService, ticketTaskService, route, timeout, $rootScope, growl) {
      var dialogInstance; // 弹出框实例
      var localmodel = false; // 本地测试模式
      var menuDisplayAlertCount = false; //菜单是否显示告警数量
      $scope.criticalCount = 0; // 菜单栏严重告警个数
      $scope.orderCount = 0; // 待处理工单
      $scope.myOptions; // 单位对象
      $scope.myOptionDic; //单位字典
      $scope.myDicts; // 配置项字典
      $scope.provinces; // 省级区域
      $scope.citys; // 市级区域
      $scope.districts; // 县级区域
      $scope.cityDics; // 市级区域
      $scope.districtDics; // 县级区域
//    $scope.powers = {}; // 权限列表
      $scope.alertView = []; //告警视图集合
      $scope.designView = []; //性能视图集合
      $scope.enterpriseType = 0; // 企业类型
      $scope.treeviewIndex = "";
      $scope.oldTreeviewIndex = "";

      $scope.loadingShow = false;//true 显示loading false 隐藏
      $scope.currentMenuCode = null; //当前的菜单编码
      $scope.firstMenuCode = null; //第一层的菜单编码

      $scope.localMenuCode = "F01"; //判断使用哪一个服务中心，用来替代localIndex
      $scope.showMenu = false;
      $scope.menuitems = {};
      
      // 路由跳转成功后触发
      $scope.$on('$routeChangeSuccess', function() {
        userLoginUIService.rootHandler($scope, $location);
        if(route.current.params.mode == 'detail') {
          $scope.detailshow = true;
        } else {
          $scope.detailshow = false;
        }
      });

      //弹出框的关闭事件
      $scope.closeDialog = function () {
        ngDialog.close();
      }
      
      /**
       * 判断未登录后如何处理
       * localmodel＝true 本地测试使用
       */
      var showLogin = function() {
        if(!localmodel) {
          return;
        }
        dialogInstance = BootstrapDialog.show({
          title: '欢迎来到普奥的世界',
          closable: false,
          //size:BootstrapDialog.SIZE_WIDE,
          message: function(dialog) {
            var $message = $('<div></div>');
            var pageToLoad = dialog.getData('pageToLoad');
            $message.load(pageToLoad);

            return $message;
          },
          data: {
            'pageToLoad': 'partials/login.html'
          },
          buttons: [{
            label: '登录',
            cssClass: 'btn-success',
            action: function(dialogRef) {
              var userInput = document.getElementById('username');
              var psdInput = document.getElementById('password');
              userLoginUIService.login(userInput.value, psdInput.value);
            }
          }, {
            label: '退出',
            action: function(dialogRef) {
              dialogRef.close();
              location.href = "../index.html"
            }
          }]
        });
      };

      /**
       * 获得基础配置
       */
      Info.get("../localdb/info.json", function(info) {
        if ($scope.baseConfig) {
          delete info.customerConfig;
          delete info.projectConfig;
          $scope.baseConfig = jQuery.extend(true, $scope.baseConfig, info);
        } else {
          $scope.baseConfig = info;
        }
      });
      
      /**
       * 获得KPI的图片配置
       */
      Info.get("../localdb/icon.json", function (info) {
        $scope.kpiIconList = info.kpiIcon;
      });
      
      $scope.gotoHomePage = function() {
        if(userLoginUIService.user.enterprise.logoStatus != '0') {
          location.href = "http://www.proudsmart.com";
        }
      };

      $scope.gotoAppPage = function() {
        location.href = "index.html";
      };

      $scope.showMenuFun = function() {
        $scope.showMenu = !$scope.showMenu;
      };

      $scope.logout = function() {
        userLoginUIService.logout();
      };

      $scope.onViewLoad = function() {
        console.log('view changed');
      };

      function initUnit(callbackFun) {
        unitService.getAllUnits(function(returnObj) {
          if(returnObj.code == 0) {
            unitService.units = returnObj.data;
            $scope.myOptions = returnObj.data;
            unitService.unitDics = {};
            for(var i in $scope.myOptions) {
              unitService.unitDics[$scope.myOptions[i].unitCode] = $scope.myOptions[i].unitName;
              if($scope.myOptions[i].unitCode == "NA" || $scope.myOptions[i].unitCode == "Number")
                unitService.unitDics[$scope.myOptions[i].unitCode] = "";
            }
            $scope.myOptionDic = unitService.unitDics;
            if (callbackFun) {
              callbackFun();
            }
          }
        });
        dictionaryService.getAllDicts(function(returnObj) {
          if(returnObj.code == 0) {
            dictionaryService.dicts = returnObj.data;
            $scope.myDicts = returnObj.data;
            var dic = {};
            for(var i in returnObj.data) {
              var obj = returnObj.data[i];
              if(dic[obj.dictCode]) {
                dic[obj.dictCode].push(obj);
              } else {
                dic[obj.dictCode] = [];
                dic[obj.dictCode].push(obj);
              }
            }
            for(var items in dic) {
              $scope.myDicts[items] = dic[items];
            }
          }
        });
        if(!resourceUIService.hasOwnProperty("provinces")) {
          resourceUIService.getSimpleDistricts(function(returnObj) {
            if(returnObj.code == 0) {
              resourceUIService.provinces = returnObj.data;
              $scope.provinces = returnObj.data;
              $scope.cityDics = {};
              $scope.districtDics = {};
	      //查询的时候会有null 的状态
              if(returnObj.data){
                $scope.provinces.forEach(function(province) {
                  $scope.cityDics[province.id] = province.children;
                  province.children.forEach(function(city){
                    $scope.districtDics[city.id] = city.children;
                  })
                })
              }
            }
          });
        };
        resourceUIService.getAllDataTypes(function (returnObj) {
          if (returnObj.code == 0) {
            $scope.allDataTypes = returnObj.data;
          }
        });
      };

      function initRootDomain() {
        resourceUIService.getRootDomain(function(returnObj) {
          if(returnObj.code == 0) {
            if(returnObj.data) {
              $scope.rootCi = returnObj.data.id;
            } else {
              growl.error("当前用户不存在rootCi，请联系客服处理。", {});
            }
          }
        });
      };
      
      /**
       * 获得基本的模型定义，包括：
       * 测点定义
       * 指令定义
       * 属性定义
       */
      var initRootModels = function() {
        $rootScope.rootModelsDic = {};
        resourceUIService.rootModelsDic = $rootScope.rootModelsDic;
        resourceUIService.getModelsByCondition({},function(returnObj){
          if (returnObj.code == 0) {
            returnObj.data.forEach(function(model) {
              if (!$rootScope.rootModelsDic[model.id]) $rootScope.rootModelsDic[model.id] = {};
              $rootScope.rootModelsDic[model.id]["model"] = model;
              resourceUIService.getDataItemsByModelId(model.id,function(subReturnObj) {
                if (subReturnObj.code == 0) {
                  if (!$rootScope.rootModelsDic[model.id]) $rootScope.rootModelsDic[model.id] = {};
                  subReturnObj.data.forEach(function(kpiDef) {
                    if (!$rootScope.rootModelsDic[model.id].kpiDic) $rootScope.rootModelsDic[model.id].kpiDic = {};
                    kpiDef = resourceUIService.getKpiRangeAndUnit($scope.myOptionDic,kpiDef)
                    $rootScope.rootModelsDic[model.id].kpiDic[kpiDef.id] = kpiDef;
                  })
                }
              })
              resourceUIService.getAttrsByModelId(model.id, function(subReturnObj) {
                if (subReturnObj.code == 0) {
                  if (!$rootScope.rootModelsDic[model.id]) $rootScope.rootModelsDic[model.id] = {};
                  $rootScope.rootModelsDic[model.id].attrs = subReturnObj.data;
                };
              });
              
              resourceUIService.getDirectivesByModelId(model.id, function(subReturnObj) {
                if(subReturnObj.code == 0) {
                  subReturnObj.data.sort(doubleCompare(["values", "index"], "desc"));
                  if (!$rootScope.rootModelsDic[model.id]) $rootScope.rootModelsDic[model.id] = {};
                  $rootScope.rootModelsDic[model.id].directives = subReturnObj.data;
                };
              });
            })
          }
        })
      }
      
//    var setPower = function(pow, len) {
//      pow = pow.substring(0, len);
//      $scope.powers[pow] = true;
//      if(len > 5) {
//        setPower(pow, len - 2);
//      }
//    };
//
//    var initPower = function() {
//      for(var i in userLoginUIService.user.functionCodeSet) {
//        var funCode = userLoginUIService.user.functionCodeSet[i];
//        $scope.powers[funCode] = true;
//        if(funCode.length > 5) {
//          setPower(funCode, funCode.length - 2);
//        }
//      }
//    };

      var initCount = function() {
        if(menuDisplayAlertCount) {
          var params = {};
          params.states = "0";
          alertService.countFromCache(params, function(returnObj) {
            if(returnObj.code == 0) {
              $scope.criticalCount = returnObj.data.criticalCount;
            }
          });
        }
        //获取执行中工单
        var status = 100;
        ticketTaskService.getTicketsByStatus(status, function(m) {
          if(m.code == 0) {
            $scope.orderCount = m.data.length;
          }
        });
      };

      function initViews() {
        $scope.alertView = [];
        $scope.designView = [];
        viewFlexService.getAllMyViews(function(returnObj) {
          if(returnObj.code == 0) {
            var v = returnObj.data;
            var viewList = [];
            for(var i = 0; i < v.length; i++) {
              var view = v[i];
              if(view) {
                viewList.push(view);
                var description = {};
                if(typeof view.description == "string") {
                  var objectLike = /^\{(.|\n)*\}$/;
                  var reg = objectLike.test(view.description)
                  if(reg){
                    description = JSON.parse(view.description);
                  }
                }
                if(view.viewType == "designView") {
                  var viewmenus = {
                    "title": view.viewTitle.split("?")[0],
                    "url": "#/" + view.viewType + "/" + view.viewId,
                    "viewId": view.viewId,
                    "view": view,
                    "status": description['status'],
                    "statusBg": description["status"] == 1 ? 'bg-red' : (description["status"] == 2 ? 'bg-green' : ''),
                    "statusLab": description["status"] == 1 ? '授权' : (description["status"] == 2 ? '购买' : ''),
                    "icon": "fa fa-area-chart"
                  };
                  $scope.designView.push(viewmenus);
                } else
                if(view.viewType == "configAlert") {
                  var viewmenus = {
                    "title": view.viewTitle.split("?")[0],
                    "url": "#/" + view.viewType + "/" + view.viewId,
                    "viewId": view.viewId,
                    "view": view,
                    "status": description["status"],
                    "statusBg": description["status"] == 1 ? 'bg-red' : (description["status"] == 2 ? 'bg-green' : ''),
                    "statusLab": description["status"] == 1 ? '授权' : (description["status"] == 2 ? '购买' : ''),

                    "icon": "fa fa-warning"
                  };
                  if(viewmenus.title == "全部告警") {
                    $scope.alertView.splice(0, 0, viewmenus);
                  } else {
                    $scope.alertView.push(viewmenus);
                  }

                }
              }
            }
           /* for(var i = 0; i < 1; i++){
              var viewmenus = {
                "title": "viewmenus" + i,
                "url": "#",
                "viewId": i,
                "icon": "fa fa-warning",
                "view" : {
                  "viewId" : 123
                }
              };
              $scope.alertView.push(viewmenus);
            }*/
            viewFlexService.viewLoadFinished = true;
            viewFlexService.viewList = viewList;
            $scope.viewList = viewList;
            $scope.$broadcast('viewLoadFinished');
          }
        });
      };
      
      var initDefaultKpis = function() {
        resourceUIService.getKpiTypeByFilter({}, function (returnObj) {
          if (returnObj.code == 0) {
            var newObj = [];
            returnObj.data.forEach(function (obj) {
              obj.text = obj.label;
              newObj.push(obj);
            });
            $scope.defaultKpiList = newObj;
          }
        });
      };
      
      $scope.menusFilter = function(item) {
        return item.functionCode.charAt(0) === "S";
      };
      
      $scope.publicTableSearch = function(tabelname,value) {
        $scope.$broadcast('table-search-handle', {name:tabelname,value:value});
      };
      
      var initConfigManager = function(callbackFun) {
        configUIService.getConfigsByGroupName("EnterpriseConfig",function(returnObj){
          if (returnObj.code == 0) {
            if (returnObj.data && returnObj.data.length > 0) {
              returnObj.data.forEach(function(item) {
                try {
                  if ($scope.baseConfig) {
                    $scope.baseConfig = jQuery.extend(true, $scope.baseConfig, JSON.parse(item.value));
                  } else {
                    $scope.baseConfig = JSON.parse(item.value);
                  }
                  if ($scope.baseConfig) { //拥有企业设置
                    if ($scope.baseConfig.title) 
                      $("title").html($scope.baseConfig.title);
                    else
                      $("title").html("");
                    if ($scope.baseConfig.shortcut) 
                      $("link[rel='shortcut icon']").attr("href",$scope.baseConfig.shortcut+"?"+new Date().getTime());
                    else 
                      $("link[rel='shortcut icon']").attr("href", "../login/images/shortcut_null.png"+"?"+new Date().getTime());
                  }
                } catch (e) {
                }
              });
            } else {
              $("title").html("");
              $("link[rel='shortcut icon']").attr("href", "../login/images/shortcut_null.png"+"?"+new Date().getTime());
            }
            callbackFun();
          }
        });
      };
      
      function initUserObjects() {
        initConfigManager(function(){
          userLoginUIService.initMenus($scope, $location);
        });
        initUnit(function(){
          initRootModels();
        });
        initViews();
        initRootDomain();
        initCount();
//      initPower();
        initDefaultKpis();
      };

      // 监听用户登录状态
      $scope.$on('loginStatusChanged', function(evt, d) {
        if(userLoginUIService.user.isAuthenticated) {
          if(dialogInstance) {
            dialogInstance.close();
          }
          $scope.userInfo = userLoginUIService.user;
          $scope.lastLoginTime = newDateJson(userLoginUIService.user.lastLoginTime).Format(GetDateCategoryStrByLabel());
          if(userLoginUIService.user.enterprise)
            $scope.enterpriseType = userLoginUIService.user.enterprise.enterpriseType;
          initUserObjects();
        } else {
          $scope.userInfo = {};
          $scope.lastLoginTime = "";
          showLogin();
        }
      });
    }
  ]);
  
  controllers.controller('AppUploadCtrl', ['$scope','growl','FileUploader',
    function($scope,growl,FileUploader) {
      $scope.fileMaxSize = $scope.fileMaxSize?$scope.fileMaxSize:1;
      $scope.fileFormat = $scope.fileFormat?$scope.fileFormat:"jpg、png、jpeg、bmp、gif、svg";
      $scope.queueLimit = $scope.queueLimit?$scope.queueLimit:1;
      var uploader = $scope.uploader = new FileUploader({
        url: $scope.serviceOrigin,
        withCredentials: true,
//      queueLimit: 1, //文件个数
        removeAfterUpload: true //上传后删除文件
      });

      // FILTERS
      uploader.filters.push({
        name: 'fileFilter',
        fn: function(item, options) {
          var nameAry = item.name.split(".");
          var type = nameAry[nameAry.length - 1];
          if($scope.fileFormat.indexOf(type) == -1) {
            growl.warning("文件格式仅支持"+$scope.fileFormat+"文件，请重新选择", {});
            return false;
          }
          if((item.size / 1024) > $scope.fileMaxSize*1000) {
            growl.warning("您选择的文件大于"+$scope.fileMaxSize+"M，请重新选择", {});
            return false;
          }
          return true;
        }
      });

      // CALLBACKS
      uploader.onWhenAddingFileFailed = function(item, filter, options) {
//      uploader.clearQueue();
//      uploader.destroy();
        console.info('onWhenAddingFileFailed', item, filter, options);
      };
      uploader.onAfterAddingFile = function(fileItem) {
        if (uploader.queue.length > $scope.queueLimit)
          uploader.removeFromQueue(0);
        console.info('onAfterAddingFile', fileItem);
      };
      uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      uploader.onBeforeUploadItem = function(item) {
        Array.prototype.push.apply(item.formData, uploader.formData);
        console.info('onBeforeUploadItem', item);
      };
      uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
      };
      uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
      };
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        growl.warning("上传文件失败", {});
        $scope.loadingShow = false;
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
      };
      uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        uploader.formData = [];//清空参数
        if(response){
          if(response.code == 0)
            $scope.$broadcast("uploadTemplate", {
              state: true,
              response: response
            });
          else
            growl.error(response.message, {});
            $scope.loadingShow = false;
        }else{
          growl.error("操作异常了，尝试重新刷新", {});
        }
      };
      uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
      };
    }
  ]);
});