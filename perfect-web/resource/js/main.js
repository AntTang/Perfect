export var myApp = angular.module("myApp", []);

myApp.service('server', function ($http) {
  this.ajax = function (type, url, data, callback) {
    $http({
      method: type,
      url: url,
      data: data
    }).success(function (data, status) {
      if (data.status) {
        callback(data);
      }
      else {
        callback(null, data);
      }
    }).error(function (data, status) {
      callback(status);
    });
  };
  this.post = function (url, data, callback) {
    this.ajax('post', url, data, callback);
  };
  this.get = function (url, data, callback) {
    this.ajax('get', url, data, callback);
  }
});