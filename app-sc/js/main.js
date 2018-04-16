/**
 * 定义RequireJS配置
 */
require.config({
  urlArgs: "==version==",
  waitSeconds: 0,
  paths: {
    'toolkit' : "../../toolkit",
    'echartGalleryJs': "../../toolkit/echarts-gl/echarts-gl.min",
    'jquery': '../../bower_components/jquery/dist/jquery.min',
    'bootstrap': '../../bower_components/bootstrap/dist/js/bootstrap.min',
    'moment': '../../bower_components/moment/min/moment.min',
    'locales': '../../bower_components/moment/min/locales.min',
    'ng-dialog': '../../bower_components/ng-dialog/js/ngDialog.min',
    'bootstrap-dialog': '../../bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min',
    'bootstrap-switch': '../../bower_components/bootstrap-switch/dist/js/bootstrap-switch.min',
    'bootstrap-daterangepicker': '../../bower_components/bootstrap-daterangepicker/daterangepicker',
    'bootstrap-treeview': '../../bower_components/bootstrap-treeview/dist/bootstrap-treeview.min',
    'angular-style':'../../toolkit/angular-custom/angular-style',
    'jquery-ui': '../../bower_components/jquery-ui/jquery-ui.min',
    'datatables.net': '../../bower_components/datatables.net/js/jquery.dataTables.min',
    'datatables.net-bs': '../../bower_components/datatables.net-bs/js/dataTables.bootstrap.min',
    'datatables.net-select': '../../bower_components/datatables.net-select/js/dataTables.select.min',
    'd3': '../../bower_components/d3/d3.min',
    'svgcharts': '../../toolkit/svgcharts/svgcharts',
    'jwplayer':'../../toolkit/jwplayer',
    'ckplayer' : '../../toolkit/ckplayer/ckplayer',
    'ezuikit' : '../../toolkit/ezuikit',
    'jwplayer.html5':'../../toolkit/jwplayer.html5',
    'iCheck': '../../bower_components/iCheck/icheck.min',
    'fastclick': '../../bower_components/fastclick/lib/fastclick',
    'slimscroll': '../../bower_components/jquery-slimscroll/jquery.slimscroll.min',
    'fullcalendar': '../../bower_components/fullcalendar/dist/fullcalendar.min',
    'echarts': '../../bower_components/echarts/dist/echarts.min',
    'bmap': '../../bower_components/echarts/dist/extension/bmap.min',
    'macarons': '../../bower_components/echarts/theme/macarons',
    'slick': '../../bower_components/slick-carousel/slick/slick.min',
    'angular': '../../bower_components/angular/angular.min',
    'angular-route': '../../bower_components/angular-route/angular-route.min',
    'angular-resource': '../../bower_components/angular-resource/angular-resource.min',
    'angular-animate': '../../bower_components/angular-animate/angular-animate.min',
    'angular-growl': '../../bower_components/angular-growl-v2/build/angular-growl.min',
    'angular-file-upload': '../../bower_components/angular-file-upload/dist/angular-file-upload.min',
    'domReady': '../../bower_components/requirejs-domready/domReady',
    'qrcode': '../../bower_components/jquery-qrcode/jquery.qrcode.min',
    'multiselect': '../../bower_components/multiselect/js/jquery.multi-select',
    'underscore': '../../bower_components/underscore/underscore',
    'index-app': '../../toolkit/admin-lte/app',
    'Array': '../../toolkit/commonLib/js/lib/Array',
    'select2': '../../bower_components/select2/dist/js/select2.min',
    'simulate' : '../../toolkit/component/simulate',
    'tools': '../../toolkit/tools',
    'configs': '../../toolkit/configs',
    'lodash': '../../bower_components/lodash/lodash',
    'backbone': '../../bower_components/backbone/backbone',
    'rappid-joint': '../../toolkit/rappid/dist/rappid',
    'keyboardJS': '../../bower_components/keyboardjs/dist/keyboard',
    'sparkline': '../../toolkit/sparkline/dist/jquery.sparkline.min',
    'bootstrap-multiselect': '../../bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect',
    'baiduMap': 'https://api.map.baidu.com/getscript?v=2.0&ak=eMekSXxqG1j2wLM57RFN61l8T6eB1EDx&services=',
    'BMapLib' : '../../toolkit/component/BMapLib',
    'simulate_time' : '../../toolkit/component/simulate_time',
    'clock' : '../../toolkit/component/explainer/clock',
    'commonMethod' : '../../toolkit/component/commonMethod',
    'dropdowntree' : '../../toolkit/component/dropdowntree'
  },
  shim: {
    'angular': {
      deps: ['jquery'],
      exports: 'angular'
    },
    'angular-route': {
      deps: ['angular']
    },
    'angular-style': {
      deps: ['angular']
    },
    'ng-dialog': {
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
    'angular-file-upload': {
      deps: ['angular']
    },
    'jwplayer' : {
      deps: ['jquery']
    },
    'bootstrap': {
      deps: ['jquery']
    },
    'datatables.net': {
      deps: ['jquery']
    },
    'bootstrap-multiselect': {
      deps: ['jquery', 'bootstrap']
    },
    'datatables.net-bs': {
      deps: ['jquery','datatables.net']
    },
    'datatables.net-select': {
      deps: ['jquery','datatables.net']
    },
    'slimscroll': {
      deps: ['jquery']
    },
    'slick': {
      deps: ['jquery']
    },
    'iCheck': {
      deps: ['jquery']
    },
    'tools': {
      deps: ['jquery','moment']
    },
    'bootstrap-dialog': {
      deps: ['jquery', 'bootstrap']
    },
    'bootstrap-switch': {
      deps: ['jquery', 'bootstrap']
    },

    'bootstrap-treeview': {
      deps: ['jquery', 'bootstrap']
    },
    'bootstrap-daterangepicker': {
      deps: ['jquery', 'bootstrap']
    },
    'sparkline': {
      deps: ['jquery']
    },
    'qrcode': {
      deps: ['jquery']
    },
    'multiselect': {
      deps: ['jquery']
    },
    'index-app': {
      deps: ['slimscroll', 'bootstrap']
    },
    'underscore': {
      exports: 'underscore'
    }
  },
  deps: [
    // kick start application... see bootstrap.js
    'index-app',
//		'angular',
//		'iCheck',
//		'bootstrap-dialog',
//		'bootstrap-switch',
//		'bootstrap-treeview',
//		'bootstrap-daterangepicker',
//		'datatables',
//		'datatables.net',
//		'echarts',
//		'baiduMap',
//		'sparkline',
//		'slick',
    'tools'
//		'slimscroll',
//		'qrcode',
//		'multiselect',
//		'Array',
//		'lodash',
//		'rappid-joint',
//		'backbone',
//		'keyboardJS',
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