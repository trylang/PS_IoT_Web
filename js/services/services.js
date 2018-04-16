define(['angular'], function (angular) {
  'use strict';
  var factory, services = angular.module('services', ['ngResource']);
  var injectParams = ['$http', '$rootScope', '$location', 'growl'];
  var authFactory = function ($http, $rootScope, $location, growl) {
    var params = getUrlParams();
    var token = params["token"];
    var version = params["version"] ? params["version"] : "V2";
    window.__LINKAGE__ = window.__LINKAGE__ || '159';
    switch (window.__LINKAGE__) {
      case '159' :
        factory = {version: version, protocol: "wss:", host: "180.76.147.159", origin: "http://180.76.147.159"};
        break;
      case '112' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.112", origin: "http://192.168.1.112"};
        break;
      case '116' :
        factory = {version:version,protocol:"wss:",host:"192.168.1.116",origin:"http://192.168.1.116"};
        break;
      case '117' :
        factory = {version:version,protocol:"wss:",host:"192.168.1.117",origin:"http://192.168.1.117"};
        break;
      case '11780' :
        factory = {version:version,protocol:"wss:",host:"36.110.36.118:11780",origin:"http://36.110.36.118:11780"};
        break;
      case 'yunneng' :
        factory = {version: version, protocol: "wss:", host: "39.108.59.125", origin: "http://39.108.59.125"};
        break;
      case '204' :
        factory = {version: version, protocol: "wss:", host: "180.76.166.204", origin: "http://180.76.166.204"};
        break;
      case 'raonecloud' :
        factory = {
          version: version,
          protocol: "wss:",
          host: "yzt.raonecloud.com",
          origin: "https://yzt.raonecloud.com"
        };
        break;
      case '135' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.135", origin: "http://192.168.1.135"};
        break;
      case '139' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.139", origin: "http://192.168.1.139"};
        break;
      case '121' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.121", origin: "http://192.168.1.121"};
        break;
      case '131' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.131", origin: "https://192.168.1.131"};
        break;
      case '133' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.133", origin: "http://192.168.1.133"};
        break;
      case '114' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.114", origin: "http://192.168.1.114"};
        break;
      case '116' :
        factory = {version: version, protocol: "wss:", host: "192.168.1.116", origin: "http://192.168.1.116"};
        break;
      case '118' :
        factory = {
          version: version,
          protocol: "wss:",
          host: "36.110.36.118:6443",
          origin: "https://36.110.36.118:6443"
        };
        break;
      case 'demo' :
        factory = {
          version: version,
          protocol: "wss:",
          host: "demo.proudsmart.com",
          origin: "http://demo.proudsmart.com"
        };
        break;
      case 'baidu' :
        factory = {
          version: version,
          protocol: "wss:",
          host: "iot.proudsmart.com",
          origin: "https://iot.proudsmart.com"
        };
        break;
      case 'ouke' :
        factory = {
          version: version,
          protocol: "wss:",
          host: "www.ek-cloud.net",
          origin: "http://www.ek-cloud.net"
        };
        break;
      case 'denuo' :
        factory = {
          version: version,
          protocol: "wss:",
          host: "http://36.110.36.118:8099",
          origin: "http://36.110.36.118:8099"
        };
        break;
      default :
        throw new Error('请选择一个访问链接');
        break;
    }
    if (window.location.host && window.location.host.search('localhost') == -1 && window.location.host.search('127.0.0.1') == -1 && window.location.host.search('192.168.199.223') == -1) {
      factory.host = window.location.host;
      if (window.location.origin != undefined) {
        factory.origin = window.location.origin;
      } else {
        factory.origin = "https://" + window.location.host;
      }
      if (window.location.protocol == "https:") {
        factory.protocol = "wss:";
      } else {
        factory.protocol = "ws:";
      }
    }
    var serviceBase = factory.origin + "/";
    factory.get = function (service, method, param, callBack, err) {
      if (typeof callBack != "function") {
        console.log(service, method, callBack);
      }
      if (!angular.isString(param)) {
        param = angular.copy(param);
        param = JSON.stringify(param);
      }
      var route = "api/rest/post/";
      var url = serviceBase + route + service + "/" + method;
      if (token != null) {
        url += "?token=" + token;
      }
      var callToken = $http.post(url, param);
      callToken.success(function (e) {
        if (callBack != null) {
          if (e.code == 0) {
            callBack(e);
          }
          else {
            if (e.message.search("需要用户登录才能使用") > -1) {
              location.href = e.data;
              callBack({
                code: 0,
                data: {}
              });
            } else if (e.code > 9999) {
              growl.info(e.message, {});
              callBack(e);
            } else {
              console.log(callBack);
              debugger;
              growl.error("错误编码" + e.code + ":" + e.message, {});
              callBack(e);
            }
          }
        }
      });
      callToken.error(function (data, status, headers, config) {
        var err = "";
        if (status == -1)
          err = "(HTTP status:" + status + ")服务器连接已中断，请刷新页面";
        else
          err = "网络链接异常，请刷新页面";
        growl.error(err, {});
      });
      return callToken;
    };
    var d = new Date();
    var gmtMilliseconds = d.getTimezoneOffset() * 60 * 1000;

    function convertDateToString(input) {
      // Ignore things that aren't objects.
      if (typeof input !== "object") return input;
      for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;
        var value = input[key];
        if (angular.isDate(value)) {
          value.setMilliseconds(value.getMilliseconds() - gmtMilliseconds);
          input[key] = value.toJSON();
        } else if (typeof value === "object") {
          convertDateToString(value);
        }
      }
    }

    function getUrlParams() {
      var url = location.search; //获取url中"?"符后的字串
      var theRequest = new Object();
      if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
          theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
      }
      return theRequest;
    }

    return factory;
  };
  authFactory.$inject = injectParams;
  services.factory('serviceProxy', authFactory);
  return services;
});