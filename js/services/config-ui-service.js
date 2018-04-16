define(['../services/services.js'], function(services) {
  'use strict';
  services.factory('configUIService', ['serviceProxy',
    function(serviceProxy) {
      var userServiceName = 'configUIService',
        service = {origin:serviceProxy.origin};

      /**
       * 保存配置组
       */
      service.saveConfigGroup = function(configGroup, callBack) {
        serviceProxy.get(userServiceName, "saveConfigGroup", configGroup, callBack);
      };
      
      /**
       * 获取所有配置组
       */
      service.getAllConfigGroups = function(callBack) {
        serviceProxy.get(userServiceName, "getAllConfigGroups", [], callBack);
      };
      
      /**
       * 获取当前企业的所有配置
       */
      service.getAllConfigs = function(callBack) {
        serviceProxy.get(userServiceName, "getAllConfigs", [], callBack);
      };
      
      /**
       * 保存配置
       */
      service.saveConfig = function(config, callBack) {
        serviceProxy.get(userServiceName, "saveConfig", config, callBack);
      };
      
      /**
       * 获取当前企业的某个类型的配置项列表
       */
      service.getConfigsByGroupName = function(configGroupName, callBack) {
        serviceProxy.get(userServiceName, "getConfigsByGroupName", configGroupName, callBack);
      };
      
      /**
       * 删除配置组
       */
      service.deleteConfigGroup = function(groupId, callBack) {
        serviceProxy.get(userServiceName, "deleteConfigGroup", groupId, callBack);
      };
     
     /**
       * 删除某个配置
       */
      service.deleteConfig = function(configId, callBack) {
        serviceProxy.get(userServiceName, "deleteConfig", configId, callBack);
      };
      return service;
    }
  ]);
});