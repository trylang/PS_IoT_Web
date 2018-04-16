define(['../services/services.js'], function(services) {
  'use strict';
  services.factory('userLoginUIService', ['$http', '$rootScope', 'serviceProxy', '$q', '$location', '$window', '$timeout','growl',
    function($http, $rootScope, serviceProxy, $q, location, window, timeout,growl) {
      var factory, loginService = 'userLoginUIService';
      var defer;
      factory = {
        loginPath: '',
        user: {
          wait: function(callback) {
            defer = callback;
          },
          isAuthenticated: false,
          roles: null,
          viewType: null,
          firstCode: null
        },
        result: {}
      };
      window.document.title = '';
      factory.getCurrentUser = function() {
        var deferred = $q.defer();
        serviceProxy.get(loginService, 'getCurrentUser', null, function(result) {
          if(result != null && result != "" && result.code == 0 && result.data) {
            factory.user = result.data;
            factory.user.isAuthenticated = true;
            deferred.resolve(result.data);
            changeAuth(true);
            var currentUrl = document.location.href;
            if(result.data.loginTimes  == 0 && currentUrl.indexOf('password.html') < 0 ){
              window.location.href = "../app-uc/password.html";
            }
          } else {
            
            deferred.reject("error");
            changeAuth(false);
          }
        });
        return deferred.promise;
      };
      factory.login = function(account, password) {
        serviceProxy.get(loginService, 'login', [account, password], function(result) {
          if(result != null && result != "" && result.code == 0 && result.data) {
            factory.user = result.data;
            factory.user.isAuthenticated = true;
            changeAuth(true);
          } else {
            factory.result = result;
            changeAuth(false);
          }
        });
      };
      factory.logout = function() {
        serviceProxy.get(loginService, 'logout', null, function(result) {
          if(result != null && result != "" && result.code == 0) {
            window.location.href = result.data;
            factory.user = {};
            factory.user.isAuthenticated = false;
            changeAuth(false);
          }
        });
      };
      /**
       * 修改密码
       */
      factory.modifyPassword = function(email, password, newPassword, callBack) {
        serviceProxy.get(loginService, "modifyPassword", [email, password, newPassword], callBack);
      };

      /**
       * 超级管理员切换用户
       * loginName  登录名称
       */
      factory.loginin = function(loginName, callBack) {
        serviceProxy.get(loginService, "loginin", loginName, callBack);
      };

      factory.redirectToLogin = function() {
        $rootScope.$broadcast('redirectToLogin', null);
      };

      /**
       * 跳转路径的切换，解决方案优先行业
       */
      factory.changePos = function() {
        var loginChangedefer = $q.defer();
        var defer = $q.defer();
        if(factory.user ? factory.user.appData == null : true) {
          $rootScope.$on('loginStatusChanged', function(event) {
            loginChangedefer.resolve({
              appData: factory.user.appData,
              industry: factory.user.industry
            });
          });
        } else {
          loginChangedefer.resolve({
            appData: factory.user.appData,
            industry: factory.user.industry
          });
        }
        loginChangedefer.promise.then(function(data) {
          window.location.href = '../app-sc/index_freeboard.html#/freeboard/index';
          /**
          if(data.appData != null) {
            if(data.appData.serviceViewTemplate == 200) {
              window.location.href = '../app-sc/index_freeboard.html#/freeboard/index';
            } else if(data.appData.serviceViewTemplate == 201) {
              window.location.href = '../app-sc/index_machine.html#/machine';
            } else if(data.appData.serviceViewTemplate == 202) {
              window.location.href = '../app-sc/index_consumer.html#/nongye';
            } else if(data.appData.serviceViewTemplate == 203) {
              window.location.href = '../app-sc/index_tongji.html#/tongji/prev';
            } else if(data.appData.serviceViewTemplate == 204) {
              window.location.href = '../app-sc/index_consumer.html#/nongye';
            } else if(data.appData.serviceViewTemplate == 205) {
              window.location.href = '../app-sc/index_configure.html#/display/all/service';
            } else if(data.appData.serviceViewTemplate == 206) {
              window.location.href = '../app-sc/index_freeboard.html#/freeboard/index';
            } else if(data.industry == 201004) {
              window.location.href = '../app-sc/index_machine.html#/machine';
            } else if(data.industry == 201010) {
              window.location.href = '../app-sc/index_consumer.html#/nongye';
            }
            else if(data.industry == 201009) {
              window.location.href = '../app-sc/index_tongji.html#/tongji';
            } else {
              window.location.href = '../app-sc/index_machine.html#/machine';
              //defer.resolve('noNeedChangePath');
            }
          } else if((data.industry == 201004) || (data.industry == 201010)) {
            window.location.href = '../app-sc/index_machine.html#/machine';
          } else if(data.industry == 201009) {
            window.location.href = '../app-sc/index_tongji.html#/tongji';
          } else {
            defer.resolve('noNeedChangePath');
          }*/
        });
        return defer.promise;
      };

      function changeAuth(loggedIn) {
        if(loggedIn) {
          factory.user.userId = factory.user.userID;
          // 设置企业ICON
          if(factory.user.enterprise != null) {
            if(factory.user.enterprise.enterpriseLogo != null && factory.user.enterprise.enterpriseLogo != "") {
              var url = serviceProxy.origin + "/" + factory.user.enterprise.enterpriseLogo;
              factory.user.enterprise.enterpriseLogo = url;
              factory.user.enterprise["logoStatus"] = "0";
            } else {
              factory.user.enterprise.enterpriseLogo = "../images/enterprise/logo.svg";
            }
          } else {
            var logo = {
              "enterpriseLogo": "../images/enterprise/logo.svg"
            };
            factory.user.enterprise = logo;
          }
          factory.user.isAuthenticated = loggedIn;
          $rootScope.$broadcast('loginStatusChanged', loggedIn);
          /**
          serviceProxy.get("resourceUIService", 'getAppData', null, function(result) {
            if(result != null && result != "" && result.code == 0) {
              factory.user.appData = result.data;
              factory.user.isAuthenticated = loggedIn;
              if(defer) {
                defer();
              }
              delete factory.user.wait;
              $rootScope.$broadcast('loginStatusChanged', loggedIn);
            } else {

            }
          });*/
        } else {
          factory.user.isAuthenticated = loggedIn;
          $rootScope.$broadcast('loginStatusChanged', loggedIn);
        }
      };
      
      factory.rootHandler = function($scope,$location) {
        var absUrl = $location.absUrl().split("#")[0];
        if(absUrl.search("/app-oc/") > -1) { //运营中心
          $scope.localMenuCode = "F01";
        } else if(absUrl.search("/app-sc/") > -1) { //服务中心
          $scope.localMenuCode = "F02";
        } else if(absUrl.search("/app-ac/") > -1) { //应用中心
          $scope.localMenuCode = "F03";
        } else if(absUrl.search("/app-uc/") > -1) { //用户中心
          $scope.localMenuCode = "F04";
        } else if(absUrl.search("/app-help/") > -1) { //帮助中心
          $scope.localMenuCode = "F05";
        }

        //权限没有加载完成时跳出
        if (!$scope.menuitems["isloaded"]) {
          return;
        }
        $scope.currentMenuCode = null;
        $scope.treeviewIndex = $location.path();
        var locationAry = $location.path().split("/");
        var locationStr;
        var menuObj;
        if (locationAry.length == 1 || !locationAry[1]) { //没有默认路由时，使用权限第一个M权限，如果M权限没有url则使用其下的一个S权限
          for (var key in $scope.menuitems) {
            if (key.indexOf("M") == 0 && $scope.menuitems[key].parentCode == $scope.localMenuCode && !menuObj) {
              if ($scope.menuitems[key].url) {
                if ($scope.defaultRoute) {
                  window.location.href = $scope.defaultRoute
                } else {
                  var path = $scope.menuitems[key].url.substr(1);
                  $location.path(path);
                  menuObj = $scope.menuitems[key];
                }
                return false;
              } else {
                $scope.menuitems[key].function.forEach(function(subItem) {
                  if (subItem.functionCode.indexOf("S") == 0 && subItem.url && !menuObj) {
                    var path = subItem.url.substr(1);
                    $location.path(path);
                    menuObj = subItem;
                    return false;
                  }
                });
              }
            }
          }
          if (!menuObj) {
            growl.warning("您并没有访问该功能的权限，请联系系统管理人员",{});
          }
          return;
        } else if (locationAry.length > 2) { //两级以上路由时，仅判断到第二级，如有特殊需求可自行扩展
          locationStr = "#/"+locationAry[1] + "/" + locationAry[2];
          //locationStr = "#/"+locationAry[1] + "/";
          menuObj = $scope.menuitems[locationStr];
          if (!menuObj) { //如果指定二级路由没有权限，查看0模式下是否存在（告警查询权限）
            menuObj = $scope.menuitems["#/"+locationAry[1] + "/0"];
          }
        }
        if (!menuObj) { //如果二级路由0模式下也没有权限，上推到一级路由
          locationStr = "#/"+locationAry[1];
          var locaStr1 = "#/"+locationAry[1] + "/";
          menuObj = $scope.menuitems[locationStr] || $scope.menuitems[locaStr1];
        }
        if (!menuObj) { //如果都没有权限，提示权限错误
          growl.warning("您并没有访问该功能的权限，请联系系统管理人员",{});
          $location.path($scope.oldTreeviewIndex);
          return;
        };

        $scope.oldTreeviewIndex = $scope.treeviewIndex;
        $scope.currentMenuCode = menuObj.functionCode;
        $scope.firstMenuCode = menuObj.functionCode;
        if (menuObj.parentCode.charAt(0) == "M") {
          $scope.firstMenuCode = $scope.menuitems[menuObj.parentCode].functionCode;
        } else {
          if ($scope.menuitems[menuObj.parentCode].parentCode.charAt(0) == "M") {
            $scope.firstMenuCode = $scope.menuitems[$scope.menuitems[menuObj.parentCode].parentCode].functionCode;
          }
        }

        if ($scope.oldFirstMenuCode != $scope.firstMenuCode && $scope.firstMenuCode != null && $scope.oldFirstMenuCode != null) {
          $("[name='"+$scope.oldFirstMenuCode+"']").css('display','none');
          $("[name='"+$scope.oldFirstMenuCode+"']").removeClass('menu-open');
          $("[name='"+$scope.firstMenuCode+"']").css('display','block');
        }
        $scope.oldFirstMenuCode = $scope.firstMenuCode;
        timeout(function() {
          $.AdminLTE.layout.fix(); //调整一下页面
        });
      };
      factory.initMenus = function($scope,$location) {
        function menuhandle(menuInfo) {
          menuInfo.searchUrl = menuInfo.url?menuInfo.url.substring(1)+"/":""; //菜单选中状态用
          if (menuInfo.function) {
            menuInfo.function.forEach(function(handlemenu){
              if ($scope.baseConfig && $scope.baseConfig[handlemenu.functionCode]) {
                handlemenu.name = $scope.baseConfig[handlemenu.functionCode].label;
                handlemenu.label = $scope.baseConfig[handlemenu.functionCode].sublabel;
              }
              menuInfo.searchUrl = menuInfo.searchUrl +(handlemenu.url?handlemenu.url.substring(1)+"/":"");
              //console.log(handlemenu.functionCode);
              $scope.menuitems[handlemenu.functionCode] = handlemenu;
              if (handlemenu.url ){
                var url = decodeURIComponent(handlemenu.url);
                $scope.menuitems[url] = handlemenu;
              }
              menuhandle(handlemenu);
            });
          }
        }
        $scope.userInfo.functionList.forEach(function(menu){
          if ($scope.baseConfig && $scope.baseConfig[menu.functionCode]) {
            menu.name = $scope.baseConfig[menu.functionCode].label;
            menu.label = $scope.baseConfig[menu.functionCode].sublabel;
          }
          $scope.menuitems[menu.functionCode] = menu;
          if (menu.url){
            var url = decodeURIComponent(menu.url);
            $scope.menuitems[url] = menu;
          };
          menuhandle(menu);
        });
        $scope.menuitems["isloaded"] = true; //加载完毕
        factory.rootHandler($scope,$location);
      };
      factory.getAddressPoint = function(address, callBack) {
        if(address) {
          jQuery.ajax({
            type: "GET",
            url: window.location.protocol + "//api.map.baidu.com/geocoder/v2/?address="+address+"&output=json&ak=eMekSXxqG1j2wLM57RFN61l8T6eB1EDx",
            dataType: "jsonp",
            jsoncallback: 'callBack',
            success: function(d) {
              if(d.status == 0) {
                if(callBack) {
                  callBack(d.result)
                }
              } else {
                if(callBack) {
                  callBack({location:{lat:"",lng:""}})
                }
              }
            },
            error: function(e) {
              console.log('ajax error');
            }
          });
        } else {
          if(callBack) {
            callBack(null)
          }
        }
      }
      factory.getCurrentUser();
      return factory;
    }
  ]);
});