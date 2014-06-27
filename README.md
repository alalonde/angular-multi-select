angular-multi-select
========================

A multiple-select widget for AngularJS.

Mobile friendly: Uses checkboxes rather than &lt;input type="multiple"&gt; for each selection side. 

Features:
* Pass in an expression to represent the display of an item
* Column headers customizable
* (6/3/14) Supports a new attribute 'required-min' which adds form validation for a minimum number of selected values.
* (6/5/14) If a 'title' expression is provided, it is evaluated to show a tooltip for each item

Usage:
`angular.module('myApp', ['multi-select', ...]);`

Demo here: http://jsfiddle.net/alalonde/dzSLe/
Demo with Select All and None here: http://plnkr.co/edit/rt00RjVQ5pX1ZODJ4Ogr?p=preview

More infomation here: http://blog.boxelderweb.com/2013/08/22/angularjs-multi-select-widget/

License: MIT
