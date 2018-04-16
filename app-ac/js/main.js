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
    'bootstrap-treeview': '../../bower_components/bootstrap-treeview/dist/bootstrap-treeview.min',
    'bootstrap-multiselect': '../../bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect',
    'ng-dialog': '../../bower_components/ng-dialog/js/ngDialog.min',
    'angular': '../../bower_components/angular/angular.min',
    'iCheck': '../../bower_components/iCheck/icheck.min',
    'moment': '../../bower_components/moment/min/moment.min',
    'locales': '../../bower_components/moment/min/locales.min',
    'angular-route': '../../bower_components/angular-route/angular-route.min',
    'angular-resource': '../../bower_components/angular-resource/angular-resource.min',
    'angular-animate': '../../bower_components/angular-animate/angular-animate.min',
    'angular-growl': '../../bower_components/angular-growl-v2/build/angular-growl.min',
    'slimscroll': '../../bower_components/jquery-slimscroll/jquery.slimscroll.min',
    'domReady': '../../bower_components/requirejs-domready/domReady',
    'slick': '../../bower_components/slick-carousel/slick/slick.min',
		'macarons': '../../bower_components/echarts/theme/macarons',
    'datatables.net': '../../bower_components/datatables.net/js/jquery.dataTables.min',
    'datatables.net-bs': '../../bower_components/datatables.net-bs/js/dataTables.bootstrap.min',
    'datatables.net-select': '../../bower_components/datatables.net-select/js/dataTables.select.min',
    'index-app': '../../toolkit/admin-lte/app',
    'tools': '../../toolkit/tools',
    'configs': '../../toolkit/configs',
		'echarts': '../../bower_components/echarts/dist/echarts.min',
		'jquery-ui': '../../bower_components/jquery-ui/jquery-ui.min',
		'Array': '../../toolkit/commonLib/js/lib/Array',
		'sparkline': '../../toolkit/sparkline/dist/jquery.sparkline.min',
		'bmap': '../../bower_components/echarts/dist/extension/bmap.min',
		'select2': '../../bower_components/select2/dist/js/select2.min',
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
    'slimscroll': {
      deps: ['jquery']
    },
    'tools': {
      deps: ['jquery','moment']
    },
    'configs': {
      deps: ['jquery']
    },
    'bootstrap-dialog': {
      deps: ['jquery', 'bootstrap']
    },
    'ng-dialog': {
      deps: ['jquery', 'bootstrap']
    },
    'iCheck': {
      deps: ['jquery']
    },
    'slick': {
      deps: ['jquery', 'angular']
    },
    'bootstrap-treeview': {
      deps: ['jquery', 'bootstrap']
    },
    'bootstrap-multiselect': {
      deps: ['jquery', 'bootstrap']
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
    'index-app': {
      deps: ['slimscroll', 'bootstrap']
    },
    'select2': {
      deps: ['jquery', 'bootstrap']
    }
  },
  deps: [
    // kick start application... see bootstrap.js
//  'angular',
//  'slick',
//  'iCheck',
    'index-app',
//  'bootstrap-dialog',
//  'bootstrap-treeview',
//  'ng-dialog',
//  'slimscroll',
    'tools',
    'configs'
//  'select2',
//		'sparkline',
//  'datatables',
//  'datatables.net',
//  './angular-bootstrap',
//		'baiduMap',
//		'Array'
  ]
});
require([
    'app',
    'routes',
    '../js/loader.js',
    //注意：这不是Twitter Bootstrap，而是AngularJS bootstrap
    'angular-bootstrap',
    //所创建的所有控制器、服务、指令及过滤器文件都必须写到这里，这块内容必须手动维护
    'controllers/controllers',
    '../js/services/services.js',
    'directives/directives',
    'filters/filters',
    'values/values'
  ],

  function(app, config, loader) {
    'use strict';
    app.config([
      '$routeProvider',
      '$locationProvider',
      '$controllerProvider',
      '$compileProvider',
      '$filterProvider',
      '$provide',
      "$httpProvider",
      'growlProvider',
      function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider, growlProvider) {
        app.registerController = $controllerProvider.register;
        app.registerDirective = $compileProvider.directive;
        app.registerFilter = $filterProvider.register;
        app.registerFactory = $provide.factory;
        app.registerService = $provide.service;

        if(config.routes != undefined) {
          angular.forEach(config.routes, function(route, path) {
            $routeProvider.when(path, {
              templateUrl: route.templateUrl,
              controller: route.controller,
              resolve: loader(route.dependencies)
            });
          });
        }

        if(config.defaultRoutePath != undefined) {
          $routeProvider.otherwise({
            redirectTo: config.defaultRoutePath
          });
        }
        growlProvider.globalTimeToLive({
          success: 3000,
          error: 5000,
          warning: 5000,
          info: 5000
        });
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
      }
    ]);
    return app;
  }
);