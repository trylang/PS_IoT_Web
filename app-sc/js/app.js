define([
  'angular',
  'angular-route',
  'angular-resource',
  'angular-animate',
  'angular-growl',
  'angular-style',
  'angular-file-upload',
  'controllers/index',
  'directives/index',
  'filters/index',
  'services/index',
  'ng-dialog',
  'values/index'
], function(angular) {
  'use strict';
  return angular.module('app', [
    'controllers',
    'directives',
    'filters',
    'services',
    'values',
    'angular-growl',
    'ngAnimate',
    'ngDialog',
    'ngAngularStyle' ,
    'angularFileUpload',
    'ngRoute'
  ]);
});