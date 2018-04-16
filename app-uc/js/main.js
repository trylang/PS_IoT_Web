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
    'iCheck': '../../bower_components/iCheck/icheck.min',
    'moment': '../../bower_components/moment/min/moment.min',
    'locales': '../../bower_components/moment/min/locales.min',
    'angular-route': '../../bower_components/angular-route/angular-route.min',
    'angular-resource': '../../bower_components/angular-resource/angular-resource.min',
    'angular-animate': '../../bower_components/angular-animate/angular-animate.min',
    'datatables.net': '../../bower_components/datatables.net/js/jquery.dataTables.min',
    'datatables.net-bs': '../../bower_components/datatables.net-bs/js/dataTables.bootstrap.min',
    'datatables.net-select': '../../bower_components/datatables.net-select/js/dataTables.select.min',
    'angular-growl': '../../bower_components/angular-growl-v2/build/angular-growl.min',
    'slimscroll': '../../bower_components/jquery-slimscroll/jquery.slimscroll.min',
    'domReady': '../../bower_components/requirejs-domready/domReady',
    'slick': '../../bower_components/slick-carousel/slick/slick.min',
    'index-app': '../../toolkit/admin-lte/app',
    'configs': '../../toolkit/configs',
    'tools': '../../toolkit/tools'
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
    'configs': {
      deps: ['jquery']
    },
    'tools': {
      deps: ['jquery', 'moment']
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
    'bootstrap-dialog': {
      deps: ['jquery', 'bootstrap']
    },
    'iCheck': {
      deps: ['jquery']
    },
    'slick': {
      deps: ['jquery', 'angular']
    },
    'index-app': {
      deps: ['slimscroll', 'bootstrap']
    }
  },
  deps: [
    'index-app',
    'tools',
    'configs'
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
    'filters/filters'
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