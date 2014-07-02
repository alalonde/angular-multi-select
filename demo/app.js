/* global angular:false */
'use strict';

var myApp = angular.module('myApp',['multi-select'])
.controller('MyCtrl', function($scope) {
  $scope.roles = [
    {roleId: 1, roleName: "Administrator", roleDescription: "Can do a bunch of stuff"},
    {roleId: 2, roleName: "Super User", roleDescription: "Ultimate power!"}
  ];
  
  $scope.user = {
    userId: 1, 
    username: "JimBob",
    roles: [$scope.roles[0]]
  };

  $scope.selectConfig = {
    requiredMin: 1,
    selectAll: true
  };
})
;