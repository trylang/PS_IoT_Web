define(['../services/services.js'], function(services) {
	'use strict';
	services.factory('alertManageFlexService', ['serviceProxy',
		function(serviceProxy) {
			var service = {};
			var base = "alertManageFlexService";
			service.sendClaimAction = function(alertInfo, callBack) {
				serviceProxy.get(base, "sendClaimAction",alertInfo , callBack);
			};
			service.sendRecoverAction = function(alertInfo, callBack) {
				serviceProxy.get(base, "sendRecoverAction",alertInfo , callBack);
			};
			service.sendForwardAction = function(alertInfo, ticket, callBack) {
				serviceProxy.get(base, "sendForwardAction",[alertInfo , ticket], callBack);
			};
			return service;
		}
	]);
});