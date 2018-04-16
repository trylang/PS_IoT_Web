define(
  [
    "angular",
    "angular-route",
    "angular-resource",
    "angular-animate",
    'angular-growl'
  ],
  function(angular) {
    'use strict';
    var services = angular.module('myapp', ['ngAnimate', 'ngResource', 'ngRoute', 'services', 'angular-growl']);
    return services;
  }
)