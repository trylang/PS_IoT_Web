define(
	[
		"angular",
		"angular-route",
		"angular-resource",
		"angular-animate",
		'angular-growl'
	],function(angular){
		'use strict';
		var app = angular.module('myapp', ['ngAnimate', 'ngResource', 'ngRoute', 'services', 'angular-growl']);
		console.log('app');
		console.log(angular.module("myapp"));
	}
);