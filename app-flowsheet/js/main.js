/**
 * 定义RequireJS配置
 */
require.config({
  urlArgs: "==version==",
  waitSeconds: 0,
  paths: {
    'jquery': '../../bower_components/jquery/dist/jquery.min',
    'bootstrap': '../../bower_components/bootstrap/dist/js/bootstrap.min',
    'bootstrap-dialog': '../../bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min',
    'angular': '../../bower_components/angular/angular.min',
    'angular-route': '../../bower_components/angular-route/angular-route.min',
    'angular-resource': '../../bower_components/angular-resource/angular-resource.min',
    'angular-animate': '../../bower_components/angular-animate/angular-animate.min',
    'angular-growl': '../../bower_components/angular-growl-v2/build/angular-growl.min',
    'domReady': '../../bower_components/requirejs-domready/domReady',
    'moment': '../../bower_components/moment/min/moment.min',
    'locales': '../../bower_components/moment/min/locales.min',
    'slimscroll': '../../bower_components/jquery-slimscroll/jquery.slimscroll.min',
    'keyboardJS': '../../bower_components/keyboardjs/dist/keyboard',
    'datatables.net': '../../bower_components/datatables.net/js/jquery.dataTables.min',
    'datatables.net-bs': '../../bower_components/datatables.net-bs/js/dataTables.bootstrap.min',
    'datatables.net-select': '../../bower_components/datatables.net-select/js/dataTables.select.min',
    'lodash': '../../bower_components/lodash/lodash',
    'backbone': '../../bower_components/backbone/backbone',
    'underscore': '../../bower_components/underscore/underscore',
    'echarts': '../../bower_components/echarts/dist/echarts.min',
    'bmap': '../../bower_components/echarts/dist/extension/bmap.min',
    'macarons': '../../bower_components/echarts/theme/macarons',
    'rappid-joint': '../../toolkit/rappid/dist/rappid',
    'bootstrap-multiselect': '../../bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect',
    'index-app': '../../toolkit/admin-lte/app',
    'tools': '../../toolkit/tools',
    'baiduMap': 'https://api.map.baidu.com/getscript?v=2.0&ak=eMekSXxqG1j2wLM57RFN61l8T6eB1EDx&services='
  },
  shim: {
    'angular': {
      exports: 'angular',
      deps: ['jquery']
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'angular-route': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-growl': {
      deps: ['angular']
    },
    'tools': {
      deps: ['jquery','moment']
    },
    'bootstrap-dialog': {
      deps: ['jquery', 'bootstrap']
    },
    'index-app': {
      deps: ['slimscroll', 'bootstrap']
    },
    'slimscroll': {
      deps: ['jquery']
    },
    'select2': {
      deps: ['jquery', 'bootstrap']
    },
    'backbone': {
      deps: ['underscore']
    },
    'datatables.net': {
      deps: ['jquery']
    },
    'datatables.net-bs': {
      deps: ['jquery','datatables.net']
    },
    'datatables.net-select': {
      deps: ['jquery','datatables.net']
    },
    'bootstrap-multiselect': {
      deps: ['jquery', 'bootstrap']
    },
    'lodash': {
      exports: '_'
    }
  },
  deps: [
    // kick start application... see bootstrap.js
    'angular',
    'index-app',
    'bootstrap-dialog',
    'tools',
    'slimscroll',
    'lodash',
    'rappid-joint',
    'backbone',
    'keyboardJS',
//  'datatables',
    'datatables.net',
    'bootstrap-multiselect',
    './angular-bootstrap'
  ]
});

require([
    'app',
    //注意：这不是Twitter Bootstrap，而是AngularJS bootstrap
    'angular-bootstrap',
    //所创建的所有控制器、服务、指令及过滤器文件都必须写到这里，这块内容必须手动维护
    'controllers/controllers',
    '../js/services/services.js',
    'directives/directives',
    'filters/filters'
  ],

  function(app) {
    'use strict';
    app.config(['$routeProvider',
      function($routeProvider) {
        $routeProvider.
        when('/index', {
          controller: 'flowConfigureCtrl'
        }).
        when('/flow/:viewId', {
          templateUrl: 'partials/flowid.html',
          controller: 'flowCtrl'
        }).
        when('/displayView/:viewId', {
          templateUrl: 'partials/flowid.html',
          controller: 'flowCtrl'
        }).
        when('/historyView/:viewId', {
          templateUrl: 'partials/flowid.html',
          controller: 'flowCtrl'
        }).
        when('/processView/:viewId', {
          templateUrl: 'partials/process.html',
          controller: 'flowProcessCtrl'
        })
      }
    ]);
    app.config(['growlProvider', function(growlProvider) {
      growlProvider.globalTimeToLive({
        success: 3000,
        error: 5000,
        warning: 5000,
        info: 5000
      });
    }]);
    
    app.config(["$httpProvider", function($httpProvider) {
      $httpProvider.defaults.withCredentials = true;
      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }]);
    return app;
  }
);