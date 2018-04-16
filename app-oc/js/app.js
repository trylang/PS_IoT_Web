define([
  'angular',
  'angular-route',
  'angular-resource',
  'angular-animate',
  'angular-growl',
  'angular-file-upload',
  "angular-style",
  "angular-popup",
  "angular-dialogue",
  'ng-dialog',
  'controllers/index',
  'directives/index',
  'filters/index',
  'services/index',
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
    'ngRoute',
    'angularFileUpload',
    'ngAngularStyle' ,
    'ngAngularPopup',
    'ngAngularDialogue',
    'ngDialog'
  ]);
});