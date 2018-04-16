define(['../services/services.js'], function(services) {
  'use strict';
  services.factory('maintenanceTaskUIService', ['serviceProxy',
    function(serviceProxy) {
      var placeServiceName = 'maintenanceTaskUIService',
        recordServiceName = 'maintenanceRecordService',
        service = {};
      /**
       * 获取维保任务
       */
      service.getTaskByCondition = function(obj,callBack) {
        serviceProxy.get(placeServiceName, "getTaskByCondition", [obj], callBack);
      };
      /**
       * 获取维保记录
       */
      service.getRecordByCondition = function(obj,callBack) {
        serviceProxy.get(recordServiceName, "getRecordByCondition", [obj], callBack);
      };
      /**
       * 保存维保记录备注
       */
      service.saveMaintenanceRecord = function(obj,callBack) {
        serviceProxy.get(recordServiceName, "saveMaintenanceRecord", [obj], callBack);
      };
      /**
       * 新增维保任务
       */
      service.addMaintenanceTask = function(obj,callBack) {
        serviceProxy.get(placeServiceName, "addMaintenanceTask", obj, callBack);
      };
      /**
       * 更新维保计划
       */
      service.updateMaintenanceTask = function(obj,callBack) {
        serviceProxy.get(placeServiceName, "updateMaintenanceTask", obj, callBack);
      };
      /**
       * 删除维保计划
       */
      service.deleteMaintenanceTask = function(id,callBack) {
        serviceProxy.get(placeServiceName, "deleteMaintenanceTask", id, callBack);
      };
      /**
       * 删除维保计划
       */
      service.deleteTask = function(id,callBack) {
        serviceProxy.get(placeServiceName, "deleteTask", id, callBack);
      };
      /**
       * 批量停用启用
       */
      service.modifyStatus = function(obj,callBack) {
        serviceProxy.get(placeServiceName, "modifyStatus", obj, callBack);
      };
      return service;
    }
  ]);
});