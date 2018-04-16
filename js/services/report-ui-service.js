define(['../services/services.js'], function(services) {
  'use strict';
  services.factory('reportUIService', ['serviceProxy',
    function(serviceProxy) {
      var service = 'reportUIService',
        factory = {};
      //获取报表信息
      factory.getReportInfo = function(param, callback) {
        serviceProxy.get(service, 'getReportInfo', param, callback);
      };
      //读取报表分类列表
      factory.getReportCatalogList = function(callback) {
        serviceProxy.get(service, 'getReportCatalogList', [], callback);
      };
      //读取数据源列表
      factory.getDataSourceConfigList = function(callback) {
        serviceProxy.get(service, 'getDataSourceConfigList', [], callback);
      };

      return factory;
    }
  ]);

});
