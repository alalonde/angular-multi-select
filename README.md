angular-multi-select
========================

A multiple-select widget for AngularJS.

Mobile friendly: Uses checkboxes rather than &lt;input type="multiple"&gt; for each selection side. 

Features:
* Pass in an expression to represent the display of an item
* Column headers customizable
* (6/3/14) Supports a new attribute 'required-min' which adds form validation for a minimum number of selected values.
* (6/5/14) If a 'title' expression is provided, it is evaluated to show a tooltip for each item
* (7/2/14) Templates have been extracted so they can be easily overridden, a la angular-ui-bootstrap.
* (8/21/14) Order has been changed to go left to right for assignment. Lists are kept in order via 'roleName' ordering
            Also you can set mutually exclusive selections where adding of one removes all the others. This is handled on adding one
            at a time or on selections (which behave a little like radio buttons)

Usage:
`angular.module('myApp', ['multi-select', ...]);`

Example:

```
<multi-select ng-model="user.roles" available="roles" selected-label="Current roles" 
    available-label="Available roles" display="r as r.roleName"
    title="r as r.roleDescription" config="selectConfig"></multi-select>
```
    

where the controller contains

```
$scope.roles = [
  {roleId: 1, roleName: "Administrator", roleDescription: "Can do a bunch of stuff",mx:[]},
  {roleId: 2, roleName: "Super User", roleDescription: "Ultimate power!",mx:[]},
  {roleId: 3, roleName:"Unlimited Cosmic Power", roleDescription:"Ultimate power",mx:[2]},
];

$scope.user = {
  roles: [$scope.roles[0]]
};
  
$scope.selectConfig = {
  requiredMin: 1
};
```

More information on the original implementation here: http://blog.boxelderweb.com/2013/08/22/angularjs-multi-select-widget/

License: MIT
