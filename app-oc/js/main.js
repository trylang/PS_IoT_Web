/**
 * 定义RequireJS配置
 */
require.config({
  urlArgs: "==version==",
  waitSeconds: 0,
  paths: {
    'toolkit': "../../toolkit",
    'component': "../../toolkit/component",
    'echartGalleryJs': "../../toolkit/echarts-gl/echarts-gl.min",
    'numberPrecision': '../../toolkit/number-precision',
    'ace': '../../bower_components/ace/lib/ace',
    'svgcharts': '../../toolkit/svgcharts/svgcharts',
    'd3': '../../bower_components/d3/d3.min',
    'spectrum': '../../bower_components/spectrum/spectrum',
    'jquery': '../../bower_components/jquery/dist/jquery.min',
    'bootstrap': '../../bower_components/bootstrap/dist/js/bootstrap.min',
    'moment': '../../bower_components/moment/min/moment.min',
    'locales': '../../bower_components/moment/min/locales.min',
    'bootstrap-dialog': '../../bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min',
    'ng-dialog': '../../bower_components/ng-dialog/js/ngDialog.min',
    'bootstrap-switch': '../../bower_components/bootstrap-switch/dist/js/bootstrap-switch.min',
    'bootstrap-daterangepicker': '../../bower_components/bootstrap-daterangepicker/daterangepicker',
    'bootstrap-treeview': '../../bower_components/bootstrap-treeview/dist/bootstrap-treeview.min',
    'bootstrap-multiselect': '../../bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect',
    'jquery-ui': '../../bower_components/jquery-ui/jquery-ui.min',
    'datatables.net': '../../bower_components/datatables.net/js/jquery.dataTables.min',
    'datatables.net-bs': '../../bower_components/datatables.net-bs/js/dataTables.bootstrap.min',
    'datatables.net-buttons': '../../bower_components/datatables.net-buttons/js/dataTables.buttons',
    'datatables.net-buttons-bs': '../../bower_components/datatables.net-buttons-bs/js/buttons.bootstrap',
    'datatables.buttons.html5': '../../bower_components/datatables.net-buttons/js/buttons.html5',
    'pdfmake': '../../bower_components/pdfmake/build/pdfmake.min',
    'vfs': '../../bower_components/pdfmake/build/vfs_fonts',
    'datatables.buttons.flash': '../../bower_components/datatables.net-buttons/js/buttons.flash',
    'datatables.net-select': '../../bower_components/datatables.net-select/js/dataTables.select.min',
    'clipboard': '../../bower_components/clipboard/dist/clipboard.min',
    'jwplayer': '../../toolkit/jwplayer',
    'cronGen': '../../toolkit/cronGen',
    'cronGen.min': '../../toolkit/cronGen.min',
    'ckplayer': '../../toolkit/ckplayer/ckplayer',
    'ezuikit': '../../toolkit/ezuikit',
    'jwplayer.html5': '../../toolkit/jwplayer.html5',
    'jszip': '../../bower_components/jszip/dist/jszip',
    'iCheck': '../../bower_components/iCheck/icheck.min',
    'fastclick': '../../bower_components/fastclick/lib/fastclick',
    'slimscroll': '../../bower_components/jquery-slimscroll/jquery.slimscroll.min',
    'fullcalendar': '../../bower_components/fullcalendar/dist/fullcalendar.min',
    'echarts': '../../bower_components/echarts/dist/echarts.min',
    'bmap': '../../bower_components/echarts/dist/extension/bmap.min',
    'dataTool': '../../bower_components/echarts/dist/extension/dataTool',
    'macarons': '../../bower_components/echarts/theme/macarons',
    'dark': '../../bower_components/echarts/theme/dark',
    'slick': '../../bower_components/slick-carousel/slick/slick.min',
    'ckeditor': '../../bower_components/ckeditor/ckeditor',
    'ckeditor-sample': "../../bower_components/ckeditor/samples/js/sample",
    'angular': '../../bower_components/angular/angular.min',
    //'angular' : '../../toolkit/angular_for_debug',
    'angular-route': '../../bower_components/angular-route/angular-route.min',
    'angular-resource': '../../bower_components/angular-resource/angular-resource.min',
    'angular-animate': '../../bower_components/angular-animate/angular-animate.min',
    //  'angular-translate': '../../bower_components/angular-translate/angular-translate.min',
    //  "angular-translate-loader-url": '../../bower_components/angular-translate-loader-url/angular-translate-loader-url.min',
    'angular-style': '../../toolkit/angular-custom/angular-style',
    'angular-dialogue': '../../toolkit/angular-custom/angular-dialogue',
    'angular-popup': '../../toolkit/angular-custom/angular-popup',
    'angular-growl': '../../bower_components/angular-growl-v2/build/angular-growl.min',
    'angular-file-upload': '../../bower_components/angular-file-upload/dist/angular-file-upload.min',
    'domReady': '../../bower_components/requirejs-domready/domReady',
    'qrcode': '../../bower_components/jquery-qrcode/jquery.qrcode.min',
    'multiselect': '../../bower_components/multiselect/js/jquery.multi-select',
    'underscore': '../../bower_components/underscore/underscore-min',
    'select2': '../../bower_components/select2/dist/js/select2.min',
    'xlsx': '../../bower_components/js-xlsx/dist/xlsx.min',
    'index-app': '../../toolkit/admin-lte/app',
    'Array': '../../toolkit/commonLib/js/lib/Array',
    'tools': '../../toolkit/tools',
    'configs': '../../toolkit/configs',
    'lodash': '../../bower_components/lodash/lodash.min',
    'backbone': '../../bower_components/backbone/backbone-min',
    'rappid-joint': '../../toolkit/rappid/dist/rappid',
    'ztree': '../../bower_components/ztree/js/jquery.ztree.core-3.5',
    'ztree-excheck': '../../bower_components/ztree/js/jquery.ztree.excheck-3.5',
    'sparkline': '../../toolkit/sparkline/dist/jquery.sparkline.min',
    'baiduMap': 'https://api.map.baidu.com/getscript?v=2.0&ak=eMekSXxqG1j2wLM57RFN61l8T6eB1EDx&services=',
    'BMapLib': '../../toolkit/component/BMapLib',
    'simulate': '../../toolkit/component/simulate',
    'simulate_time': '../../toolkit/component/simulate_time',
    'commonMethod': '../../toolkit/component/commonMethod',
    'dropdowntree': '../../toolkit/component/dropdowntree',
    'clock': '../../toolkit/component/explainer/clock',
    'scrollbar': '../../toolkit/component/explainer/scrollbar'
  },
  shim: {
    'angular': {
      deps: ['jquery'],
      exports: 'angular'
    },
    'angular-route': {
      deps: ['angular']
    },
    'angular-file-upload': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },
    //  'angular-translate': {
    //    deps: ['angular']
    //  },
    //  'angular-translate-loader-url': {
    //    deps: ['angular-translate']
    //  },
    'angular-growl': {
      deps: ['angular']
    },
    'jwplayer': {
      deps: ['jquery']
    },
    'bootstrap': {
      deps: ['jquery']
    },
    //  'datatables': {
    //    deps: ['jquery']
    //  },
    //  'datatables.net': {
    //    deps: ['jquery', 'datatables']
    //  },
    'ztree': {
      deps: ['jquery']
    },
    'ztree-excheck': {
      deps: ['jquery', 'ztree']
    },
    'datatables.net': {
      deps: ['jquery']
    },
    'datatables.net-buttons-bs': {
      deps: ['jszip']
    },
    'datatables.buttons.html5': {
      deps: ['datatables.net-buttons-bs']
    },
    'datatables.buttons.flash': {
      deps: ['datatables.net-buttons-bs', 'pdfmake', 'vfs']
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
      deps: ['jquery', 'moment']
    },
    'configs': {
      deps: ['jquery']
    },
    'bootstrap-dialog': {
      deps: ['jquery', 'bootstrap']
    },
    'ng-dialog': {
      deps: ['angular']
    },
    'ckeditor': {
      deps: ['jquery']
    },
    'ckeditor-sample': {
      deps: ['jquery', 'cheditor']
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
    'bootstrap-multiselect': {
      deps: ['jquery', 'bootstrap']
    },
    'index-app': {
      deps: ['slimscroll', 'bootstrap']
    },
    'angular-style': {
      deps: ['angular']
    },
    'angular-dialogue': {
      deps: ['angular']
    },
    'angular-popup': {
      deps: ['angular']
    },
    'underscore': {
      exports: 'underscore'
    },
    'select2': {
      deps: ['jquery', 'bootstrap']
    },
    'lodash': {
      exports: '_'
    }
  },
  deps: [
    //kick start application... see bootstrap.js
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
      function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider,
        $provide, $httpProvider, growlProvider) {
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
          success: 5000,
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