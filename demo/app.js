/* global angular:false */
'use strict';

var myApp = angular.module('myApp',['multi-select'])
.controller('MyCtrl', function($scope) {
  $scope.roles = [
    {roleId: 1, roleName: "Administrator", roleDescription: "Can do a bunch of stuff",mx:[]},
    {roleId: 2, roleName: "Super User", roleDescription: "Ultimate power!",mx:[]},
    {roleId:3, roleName:"Unlimited Cosmic Power", roleDescription:"Ultimate power",mx:[4,5]},
    {roleId:4, roleName:"Itty Bitty Living Space", roleDescription:"a tiny bottle",mx:[3,5]},
    {roleId:5, roleName:"Normal User", roleDescription:"a normal user",mx:[3,4]}
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