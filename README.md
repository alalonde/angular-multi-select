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
  {roleId: 1, roleName: "Administrator", roleDescription: "Can do a bunch of stuff"},
  {roleId: 2, roleName: "Super User", roleDescription: "Ultimate power!"}
];

$scope.user = {
  roles: [$scope.roles[0]]
};
  
$scope.selectConfig = {
  requiredMin: 1
};
```

More information here: http://blog.boxelderweb.com/2013/08/22/angularjs-multi-select-widget/

License: MIT

## Updates
* 8/22/14: Merged tests, fixed bug where async init data was sometimes improperly handled
