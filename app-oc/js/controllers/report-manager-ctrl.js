define(['controllers/controllers', 'bootstrap-dialog'], function (controllers, BootstrapDialog) {
  'use strict';
  controllers.initController('reportTemplateCtrl', ['$scope', "$routeParams", 'ngDialog', 'FileUploader', 'userLoginUIService',
    'userDomainService', 'reportFlexService','reportUIService', 'growl',
    function ($scope, $routeParams, ngDialog, FileUploader, userLoginUIService, userDomainService, reportFlexService,reportUIService, growl) {
      var uploader = $scope.uploader = new FileUploader({
        url: reportFlexService.origin + '/api/rest/uploadReport/reportUIService/updateTemplateFileName',
        withCredentials: true
      });
      var fileSize = 50;
      // FILTERS
      uploader.filters.push({
        name: 'fileFilter',
        fn: function(item /*{File|FileLikeObject}*/ , options) {
          var nameAry = item.name.split(".");
          var type = nameAry[nameAry.length - 1];
          if((item.size / 1024) > fileSize*1024) {
            growl.warning("您选择的文件大于"+fileSize+"M，请重新选择", {});
            return false;
          }
          // if(type != 'zip' && type != 'jrxml') {//zip文件功能暂时没做，先去掉后期后端功能实现之后重新加上
          if(type != 'jrxml') {
            growl.warning("文件格式仅支持jrxml文件，请重新选择", {});
            // growl.warning("文件格式仅支持jrxml和zip文件，请重新选择", {});
            return false;
          }
          return true;
        }
      });

      // CALLBACKS
      uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/ , filter, options) {
        uploader.clearQueue();
        uploader.destroy();
        console.info('onWhenAddingFileFailed', item, filter, options);
      };
      uploader.onAfterAddingFile = function(fileItem) {
        $scope.selectedTemplate.tplFileName = fileItem._file.name;
        uploader.queue[0].file.name = fileItem._file.name;
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
        // if(response.code != 0){
        //   growl.warning(response.message,{})
        // }

        console.info('onSuccessItem', fileItem, response, status, headers);
      };
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        growl.warning("上传模版文件失败", {})
        console.info('onErrorItem', fileItem, response, status, headers);
      };
      uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
      };
      uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        var nameAry = fileItem.file.name.split(".");
        var tTemplRelPath = '/' + nameAry[0] + '/' + fileItem.file.name
        if(nameAry[nameAry.length - 1] == "zip") {
          growl.warning("次功能暂时还不能用",{});
         /*reportFlexService.getJrxmlFileList(tTemplRelPath,function(mod:JrxmlFileListModel):void {
               if (mod != null) {
                 if (mod.code == 0) {
                   if (mod.fileNames.length > 0) {
                     FileNameSelector.popUp(mod.fileNames, function(file:String):void{
                       zipPath.text = fileName;
                       TTemplName.text = file.substr(file.lastIndexOf("/")+1,file.length);
                       TTemplRelPath.text = file;
                       ReportService.instance.getReportTemplateMetaByFileName(file,function(model:ReportTemplateMeta):void {
                         var list:ArrayCollection = new ArrayCollection();
                         for each (var mod:ReportParamsModel in model.reportParams) {
                           if (mod.defaultShow) {
                             list.addItem(mod);
                           }
                         }
                         dg.dataProvider = list;
                       });
                     });
                   }else {
                     Alert.show("取得报表文件列表异常。","警告");
                   }
                 }else {
                   Alert.show(mod.errorMsg,"提示");
                 }
               }else {
                 Alert.show("zip文件中没有可识别的报表文件。","警告");
               }
             });*/
        } else {
          reportFlexService.getReportTemplateMeta(response.file, function(returnObj) {
            if(returnObj.code == 0) {
              // $scope.selectedTemplate = returnObj.data;
              $scope.selectedTemplate.tplFileName = response.file;
              $scope.selectedTemplate.reportParams = returnObj.data.reportParams;
              //            returnObj.data.reportParams.forEach(function(param) {
              //              var newParam = {};
              //              newParam.name = param.name;// 参数名称(唯一)
              //              newParam.title= param.title;// 显示名称
              //              newParam.showType = getShowType(param.valueClass);     // 展示类型
              //              newParam.value = param.value;
              //              newParam.defaultValue= param.defaultValue;// 参数默认值
              //              newParam.defaultShow= param.defaultShow;// 默认是否显示
              //              newParam.format= param.format;// 参数显示格式（当参数是日期型的时候启用）
              //              newParam.optionList=param.optionList;// 参数数据项（当参数是下拉列表的时候启用）
              //              $scope.selectedTemplate.reportParams.push(newParam);
              //            });
              uploader.clearQueue();
              $scope.$broadcast("uploadTemplate", true);
            }
          });
        }

      };
      uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
      };
      $scope.clearUploader = function () {
        uploader.clearQueue();
      }
      function getShowType(classType) {
        var showtype = "";
        switch(classType) {
          case "java.lang.String":
            showtype = "STRING";
            break;
          case "java.sql.Date":
          case "java.sql.Time":
          case "java.sql.Timestamp":
          case "java.util.Date":
            showtype = "DATETIME";
            break;
          default:
            showtype = "STRING";
        }
        return showtype;
      };
      $scope.uploadImage = function(templateId) {
        if(uploader.queue.length == 0) {
          $scope.$broadcast("uploadTemplate", true);
          return;
        }
        var formObj = {"templateId":templateId};
        uploader.formData.push(formObj);
        uploader.uploadAll();
      };

      $scope.queryDitem = {};

      var initSearch = function() {
        $scope.queryDitem = {
          name: "", // 报表名称
          title: "", // 报表标题
          dataSourceId: "", // 数据源唯一标识
          catalogId: "",
          domainPath: "",
          insertUser: "" //创建人
        };
      }
      $scope.reportDataSourceModel = {
        id: 0,
        name: "",
        driver: "",
        url: "",
        userName: "",
        passWord: ""
      };
      $scope.dataSources = [];
      $scope.dataSourcesDic = {}
      $scope.catalogs = [];
      $scope.catalogsDic = {}
      $scope.reportTemplateModel = {
        id: 0, // 报表ID
        name: "", // 报表名称
        title: "", // 报表标题
        catalogId: 1, // 报表所属分类ID
        catalogName: "", //报表所属分类名称
        dataSourceId: 1, // 数据源唯一标识
        dataSourceName: "", //数据源名称
        tplFileName: "", // 报表模板文件名称
        folder: "", //模板报表所在的目录(不保存在数据库中)
        insertUser: "", //创建人
        updateUser: "", //修改人
        insertTime: new Date(), //创建时间
        updateTime: null, //修改时间
        reportParams: [], // 报表的参数信息。
        reportParamXML: "",
        columns: [],
        existBuildPolicy: 0, //判断模板是否设置发送策略
        zipFileName: "", // Zip压缩文件
        fileName: "", //文件名 前端用
        domainPath: "", // 数据域
        domain: "",
        isEdit: 3
      };
      $scope.selectedTemplate; //选中的对象
      $scope.reportTemplates;
      $scope.goSearch = function () {
        var obj = {};
        if (!$scope.queryDitem.domainPath || $scope.queryDitem.domainPath == undefined) {
          obj = jQuery.extend(true, {}, $scope.queryDitem);
          obj["domainPath"] = userLoginUIService.user.domainPath;
        } else {
          obj = $scope.queryDitem;
        }
        reportFlexService.getReportTemplatesByCondition(obj, function (returnObj) {
          if (returnObj.code == 0) {
            returnObj.data.forEach(function (item) {
              // item.domainPath = item.domain;
              item.fileName = item.tplFileName ? item.tplFileName : item.zipFileName;
            });
            $scope.reportTemplates = returnObj.data;
            $scope.$broadcast(Event.REPORTMODULE + "_template", {
              "data": $scope.reportTemplates
            });
          }
        });
      };
      //取消参数的时候清空selectedTemplate
      $scope.closeParams = function () {
        $scope.selectedTemplate = null;
        $scope.closeDialog();
      }
      $scope.goClear = function () {
        initSearch();
      };
      $scope.addtemplate = function() {
        if($scope.selectedTemplate) {
          growl.warning("当前有未保存的数据");
          return;
        };
        if(!$scope.reportTemplates) $scope.reportTemplates = [];
        $scope.selectedTemplate = jQuery.extend({}, $scope.reportTemplateModel);
        $scope.reportTemplates.unshift(jQuery.extend({}, $scope.reportTemplateModel));
        $scope.$broadcast(Event.REPORTMODULE + "_template", {
          "data": $scope.reportTemplates
        });
      };
      $scope.updateParams = function () {
        reportFlexService.updateReportTemplate($scope.selectedTemplate, function (returnObj) {
          if (returnObj.code == 0) {
            growl.success("参数设置更新成功", {});
            $scope.selectedTemplate = null;
            $scope.closeDialog();
          }
        });
      }
      $scope.doAction = function (type, select, callback) {
        if (type == "saveTemplate") {

          var unbindHandler = $scope.$on("uploadTemplate", function (event, args) {
            // select.reportParamXML = null;
            reportFlexService.updateReportTemplate($scope.selectedTemplate, function (returnObj) {
              if (returnObj.code == 0) {
                // $scope.uploadImage(returnObj.data.id);
                if(select.id == 0){
                  growl.success("添加报表模板成功", {});
                }else{
                  growl.success("更新报表模板成功", {});
                }
                if (callback) {
                  callback(returnObj.data);
                }
                unbindHandler();
              }
            });
          });
          // var unbindHandler = $scope.$on("uploadTemplate", function (event, args) {
            select.zipFileName = $scope.selectedTemplate.zipFileName;
            select.tplFileName = $scope.selectedTemplate.tplFileName;
            select.reportParams = $scope.selectedTemplate.reportParams;
            if(select.id == 0) {
              select.tplFileName = "";
              // select.domain = userLoginUIService.user.domainPath;
              reportFlexService.addReportTemplate(select, function(returnObj) {
                if(returnObj.code == 0) {
                  $scope.uploadImage(returnObj.data.id);
                  $scope.selectedTemplate = returnObj.data;
                  returnObj.data.fileName = returnObj.data.tplFileName ? returnObj.data.tplFileName : returnObj.data.zipFileName;
                }
              });
            } else {
              $scope.uploadImage(select.id);
            }
            //执行完成后就把该事件解绑
            // unbindHandler();
          // });
          // $scope.uploadImage(select.id);
        } else if(type == "deleteTemplate") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            //size:BootstrapDialog.SIZE_WIDE,
            message: '确认删除报表模板吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                reportFlexService.deleteReportTemplate(select.id, function(returnObj) {
                  if(returnObj.code == 0) {
                    for(var i = $scope.reportTemplates.length - 1; i > -1; i--) {
                      if($scope.reportTemplates[i].id == select.id) {
                        $scope.reportTemplates.splice(i, 1);
                      }
                    }
                    $scope.selectedTemplate = null;
                    growl.success("删除报表模板成功", {});
                    if($scope.reportTemplates.length <= 0){
                      $scope.$broadcast(Event.REPORTMODULE + "_template", {
                        "data": $scope.reportTemplates
                      });
                    }
                    if(callback) {
                      callback(true);
                    }
                  }
                });
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        } else if(type == "paramsHandler") {
          $scope.selectedTemplate = select;
          var showWin = function() {
            ngDialog.open({
              template: '../partials/dialogue/report_params_dia.html',
              className: 'ngdialog-theme-plain',
              scope: $scope
            });
          }
          if(!$scope.paramShowList) {
            reportFlexService.getParamShowList(function(returnObj) {
              if(returnObj.code == 0) {
                var list = [{
                  label: "请选择",
                  value: "-99",
                }]
                list = list.concat(returnObj.data)
                $scope.paramShowList = list;
                showWin();
              }
            });
          } else {
            showWin();
          }
        }
      };
      //读取数据源列表
      var sourceConfigList = function () {
        reportUIService.getDataSourceConfigList(function (data) {
          if (data.code == 0) {
            for(var i in data.data){
              $scope.dataSourcesDic[data.data[i].id] = data.data[i];
            }
            $scope.dataSources = data.data;
          }
          ;
        });
      };
      //读取分类列表
      var catalogList = function () {
        reportUIService.getReportCatalogList(function (data) {
          if (data.code == 0) {
            for(var i in data.data){
              $scope.catalogsDic[data.data[i].id] = data.data[i];
            }
            $scope.catalogs = data.data;
          }
          ;
        });
      };
      //根据用户Id查用户域
      var domainTreeQuery = function() {
        userDomainService.queryDomainTree(userLoginUIService.user.userID, function(data) {
          if(data.code == 0) {
            var domainList = data.data;
            $scope.domainListTree = domainList;
            $scope.domainListDic = data.domainListDic;
            $scope.goSearch();
          };
        });
      };
      //弹出框的关闭事件
      $scope.closeDialog = function() {
        ngDialog.close();
      };
      var init = function () {
        sourceConfigList();
        catalogList();
        // 初始化域目录树
        domainTreeQuery();
      };

      /**
       * 监听登录状态
       */
      if(!userLoginUIService.user.isAuthenticated) {
        $scope.$on('loginStatusChanged', function(evt, d) {
          if(userLoginUIService.user.isAuthenticated) {
            init();
          }
        });
      } else {
        init();
      }
    }
  ]);
  controllers.initController('reportSearchCtrl', ['$scope', "$routeParams", 'userLoginUIService', 'userDomainService', 'reportFlexService', 'growl', 'userUIService',
    function($scope, $routeParams, userLoginUIService, userDomainService, reportFlexService, growl, userUIService) {

      $scope.iframeSrc = ""
      $scope.queryDitem = {};
      var initSearch = function() {
        $scope.queryDitem = {
          name: "", // 报表名称
          title: "", // 报表标题
          dataSourceId: "", // 数据源唯一标识
          catalogId: "",
          insertUser: "" //创建人
        };
      };

      $scope.goClear = function () {
        $scope.selectedTemplate = {};
      };
      $scope.reportDataSourceModel = {
        id: 0,
        name: "",
        driver: "",
        url: "",
        userName: "",
        passWord: ""
      };

      $scope.dataSources = [{
          dataSourceId: 0,
          dataSourceName: "无数据源",
          driver: "",
          url: "",
          userName: "",
          passWord: ""
        },
        {
          dataSourceId: 1,
          dataSourceName: "postgres",
          driver: "org.postgresql.Driver",
          url: "jdbc\:postgresql\://192.168.1.112\:5432/psiot",
          userName: "postgres",
          passWord: "psiot2015"
        }
      ];
      $scope.dataSourcesDic = { }
      $scope.catalogs = [{
        catalogId: 0,
        catalogName: "无分类"
      }, {
        catalogId: 1,
        catalogName: "默认分类"
      }];
      $scope.catalogsDic = {}
      $scope.selectedTemplate; //选中的对象
      $scope.reportTemplates;
      $scope.getTemplates = function () {
        var obj = {};
        obj["domainPath"] = userLoginUIService.user.domainPath;
        reportFlexService.getReportTemplatesByCondition(obj, function (returnObj) {
          if (returnObj.code == 0) {
            returnObj.data.forEach(function (item) {
              item.domainPath = item.domain;
              item.fileName = item.tplFileName ? item.tplFileName : item.zipFileName;
            });
            $scope.reportTemplates = returnObj.data;
          }
        });
      };

      $scope.doAction = function(type, select, callback) {
        if(type == "pdfTemplate") {
          var params = [];
          var nowTime = new Date().getTime();
          select.reportParams.forEach(function(param) {
            var newparam = {};
            newparam.label = param.name;
            newparam.value = param.name == "STARTTIME" ? new Date(nowTime - 1000 * 60 * 60).Format("yyyy-MM-dd hh:mm:ss") : (param.name == "ENDTIME" ? new Date().Format("yyyy-MM-dd hh:mm:ss") : "");
            params.push(newparam)
          })
          reportFlexService.getReportPdf(select.id, params, [], function(returnObj) {
            if(returnObj.code == 0) {
              alert("");
            }
          });
        }
      };

      $scope.goSearch = function(flg) {
        if(!$scope.selectedTemplate) {
          growl.warning("请选择一个报表模板");
          return;
        }
        var nowTime = new Date().getTime();
        $scope.selectedTemplate.reportParams.forEach(function(param) {
          param.label = param.name;
          if(!param.value)
            param.value = param.name == "STARTTIME" ? new Date(nowTime - 1000 * 60 * 60 * 24).Format("yyyy-MM-dd hh:mm:ss") : (param.name == "ENDTIME" ? new Date().Format("yyyy-MM-dd hh:mm:ss") : "");
        })
        if(!flg || flg == "HTML") {
          reportFlexService.getReportHTML($scope.selectedTemplate.id, $scope.selectedTemplate.reportParams, [], function(returnObj) {
            if(returnObj.code == 0) {
              $scope.iframeSrc = userUIService.uploadFileUrl + returnObj.data;
            }
          });
        } else if(flg == "PDF") {
          reportFlexService.getReportPdf($scope.selectedTemplate.id, $scope.selectedTemplate.reportParams, [], function(returnObj) {
            if(returnObj.code == 0) {
              // window.open(''+ userUIService.uploadFileUrl+''+returnObj.data+'');
              window.open(""+userUIService.uploadFileUrl+"/api/rest/downloadReport/reportUIService/download?reportName="+returnObj.data+"&reportFileName="+returnObj.data+"");

            }
          });
        } else if(flg == "WORD") {
          reportFlexService.getReportWord($scope.selectedTemplate.id, $scope.selectedTemplate.reportParams, [], function(returnObj) {
            if(returnObj.code == 0) {
              location.href = '' + userUIService.uploadFileUrl + '' + returnObj.data + '';
            }
          });
        } else if(flg == "XLS") {
          reportFlexService.getReportXls($scope.selectedTemplate.id, $scope.selectedTemplate.reportParams, [], function(returnObj) {
            if(returnObj.code == 0) {
              location.href = '' + userUIService.uploadFileUrl + '' + returnObj.data + '';
            }
          });
        } else if(flg == "PPT") {
          reportFlexService.getReportPpt($scope.selectedTemplate.id, $scope.selectedTemplate.reportParams, [], function(returnObj) {
            if(returnObj.code == 0) {
              location.href = '' + userUIService.uploadFileUrl + '' + returnObj.data + '';
            }
          });
        }
      }

      //根据用户Id查用户域
      var domainTreeQuery = function() {
        userDomainService.queryDomainTree(userLoginUIService.user.userID, function(data) {
          if(data.code == 0) {
            var domainList = data.data;
            $scope.domainListTree = domainList;
            $scope.domainListDic = data.domainListDic;
          };
        });
      };

      var init = function() {
        // 初始化域目录树
        domainTreeQuery();
        $scope.getTemplates();
        initSearch();
      };

      /**
       * 监听登录状态
       */
      if(!userLoginUIService.user.isAuthenticated) {
        $scope.$on('loginStatusChanged', function(evt, d) {
          if(userLoginUIService.user.isAuthenticated) {
            init();
          }
        });
      } else {
        init();
      }
    }
  ]);
  controllers.initController('reportPolicyCtrl', ['$scope', "$routeParams", 'ngDialog', 'userLoginUIService', 'userDomainService', 'reportFlexService', 'growl',
    function($scope, $routeParams, ngDialog, userLoginUIService, userDomainService, reportFlexService, growl) {

      $scope.queryDitem = {};
      var initSearch = function() {
        $scope.queryDitem = {
          name: "", // 报表名称
          periodTypeValue: "",
          dataSourceId: "", // 数据源唯一标识
          catalogId: "",
          domainPath: "",
          id: "",
          cronExp: ""
        };
      };
      $scope.escapeCheck = function (val) {
        return "" + val + "";
      }
      $scope.goClear = function () {
        initSearch();
      };
      $scope.selectedPolicy; //选中的对象
      $scope.reportTemplates;
      $scope.reportTemplatePolicys;
      $scope.periodList;
      $scope.reportPolicyObj = {};
      $scope.savePolicy = function() {
        if($scope.selectedPolicy.id) {
          $scope.selectedPolicy.reportParamXML = null;
          $scope.selectedPolicy.reportParams = $scope.selectedPolicy.template.reportParams;
          reportFlexService.updateReportBuildPolicy($scope.selectedPolicy, function(returnObj) {
            if(returnObj.code == 0) {
              $scope.goSearch();
              growl.success("更新报表生成策略成功", {});
              $scope.closeDialog();
            }
          })

        } else {
          $scope.selectedPolicy.id = $scope.selectedPolicy.template.id;
          $scope.selectedPolicy.tplName = $scope.selectedPolicy.template.name;
          $scope.selectedPolicy.tplTitle = $scope.selectedPolicy.template.title;
          $scope.selectedPolicy.reportParams = $scope.selectedPolicy.template.reportParams;
          $scope.selectedPolicy.reportParamXML = null;
          reportFlexService.addReportBuildPolicy($scope.selectedPolicy, function(returnObj) {
            if(returnObj.code == 0) {
              $scope.goSearch();
              growl.success("添加报表生成策略成功", {});
              $scope.closeDialog();
            }else {
              $scope.selectedPolicy.id = 0;
            }
          })
        }
      };
      $scope.reportTemplatesAll = [];
      $scope.policyhandler = function(policy) {
        var showWin = function() {
          ngDialog.open({
            template: '../partials/dialogue/report_policy_dia.html',
            className: 'ngdialog-theme-plain',
            scope: $scope
          });
        };
        var templatesList = $scope.reportTemplatesAll;
        var list = [];
        for(var j in templatesList) {
          if(!$scope.reportPolicyObj[templatesList[j].id]) {
            list.push(templatesList[j]);
          }
        };
        //如果是新增的过滤模板的内容，有不过滤
        if(policy != undefined && policy.id > 0) {
          $scope.reportTemplates = $scope.reportTemplatesAll;
        } else {
          $scope.reportTemplates = list;
        }
        if(!policy) {
          $scope.selectedPolicy = {
            template: {}
          };
        } else {
          $scope.selectedPolicy = policy;
          $scope.reportTemplates.forEach(function(item) {
            if(item.id == $scope.selectedPolicy.id) {
              $scope.selectedPolicy.template = item;
              $scope.selectedPolicy.template.reportParams = $scope.selectedPolicy.reportParams;
            }
          });
        }
        showWin();
      };
      $scope.initTemplateInfo = function () {
        var obj = {};
        obj["domainPath"] = userLoginUIService.user.domainPath;
        reportFlexService.getReportTemplatesByCondition(obj, function (returnObj) {
          if (returnObj.code == 0) {
            returnObj.data.forEach(function (item) {
              item.domainPath = item.domain;
              item.fileName = item.tplFileName ? item.tplFileName : item.zipFileName;
            });
            $scope.reportTemplatesAll = returnObj.data;
            $scope.reportTemplates = returnObj.data;
          }
        });
        $scope.periodListObj = {};
        reportFlexService.getSendPeriod(function(returnObj) {
          if(returnObj.code == 0) {
            for(var i in returnObj.data) {
              $scope.periodListObj[returnObj.data[i].value] = returnObj.data[i];
            }
            $scope.periodList = returnObj.data;
          }
        });
      }

      $scope.getTemplatePolicys = function() {
        reportFlexService.getReportBuildPolicyListByCondition({},function(returnObj) {
          if(returnObj.code == 0)
            $scope.reportTemplatePolicys = returnObj.data;
          var d = returnObj.data;
          for(var n in d) {
            $scope.reportPolicyObj["" + d[n].id + ""] = d[n];
          }
          $scope.$broadcast(Event.REPORTMODULE + "_policy", {
            "data": $scope.reportTemplatePolicys
          });
        });
      };

      $scope.doAction = function(type, select, callback) {
        if(type == "deletepolicy") {
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            //size:BootstrapDialog.SIZE_WIDE,
            message: '确认删除报表生成策略吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function(dialogRef) {
                reportFlexService.deleteReportBuildPolicy(select.id, function(returnObj) {
                  if(returnObj.code == 0) {
		  //不用getTemplatePolicys因为不同用户域登录进来的用户可以看到别人的策略
                    $scope.goSearch();
                    delete $scope.reportPolicyObj[select.id];
                    growl.success("删除报表生成策略成功",{});
                  }
                });
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function(dialogRef) {
                dialogRef.close();
              }
            }]
          });
        } else if(type == "editpolicy") {
          $scope.policyhandler(select)
        } else if (type == "AlertEnable") {
          var enabled = select.enabled;
          BootstrapDialog.show({
            title: '提示',
            closable: false,
            message: enabled == 1 ? '确认要启用此报表生成策略吗？' : '确认要停用此报表生成策略吗？',
            buttons: [{
              label: '确定',
              cssClass: 'btn-success',
              action: function (dialogRef) {
                reportFlexService.updateReportBuildPolicy(select, function (returnObj) {
                  if (returnObj.code == 0) {
                    callback(returnObj);
                  }
                })
                dialogRef.close();
              }
            }, {
              label: '取消',
              action: function (dialogRef) {
                callback(false);
                dialogRef.close();
              }
            }]
          });
        }
      };
      $scope.goSearch = function () {
        //根据当前用户域查询
        var obj = {};
        if (!$scope.queryDitem.domainPath || $scope.queryDitem.domainPath == undefined) {
          obj = jQuery.extend(true, {}, $scope.queryDitem);
          obj["domainPath"] = userLoginUIService.user.domainPath;
        } else {
          obj = $scope.queryDitem;
        }
        reportFlexService.getReportBuildPolicyListByCondition($scope.queryDitem, function (returnObj) {
          if (returnObj.code == 0)
            $scope.reportTemplatePolicys = returnObj.data;
            var d = returnObj.data;
            for (var n in d) {
              $scope.reportPolicyObj["" + d[n].id + ""] = d[n];
            }
          $scope.$broadcast(Event.REPORTMODULE + "_policy", {
            "data": returnObj.data
          });
        });
      }
      var domainTreeQuery = function () {
        userDomainService.queryDomainTree(userLoginUIService.user.userID, function (data) {
          if (data.code == 0) {
            var domainList = data.data;
            $scope.domainListTree = domainList;
            $scope.domainListDic = data.domainListDic;
          };
        });
      };

      var init = function() {
        // 初始化域目录树
        domainTreeQuery();
        $scope.initTemplateInfo();
        $scope.goSearch();
        initSearch();
      };

      //弹出框的关闭事件
      $scope.closeDialog = function() {
        ngDialog.close();
      };

      /**
       * 监听登录状态
       */
      if(!userLoginUIService.user.isAuthenticated) {
        $scope.$on('loginStatusChanged', function(evt, d) {
          if(userLoginUIService.user.isAuthenticated) {
            init();
          }
        });
      } else {
        init();
      }
    }
  ]);

});
