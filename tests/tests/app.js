var app = angular.module('app', ['multi-select', 'ngResource']);

app.service('mockPromise', function($q){
  var pub = {};

  pub.getPromiseResolved = function(data){
    var deferred = $q.defer();

    deferred.resolve(data);

    return deferred.promise();
  }

  return pub;
});