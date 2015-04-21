/*
 Multiple-select directive for AngularJS
 (c) 2013 Alec LaLonde (https://github.com/alalonde/angular-multi-select)
 License: MIT
*/
(function(angular) {
  'use strict';

  angular.module('multi-select', ["template/multiSelect.html"])
  .directive('multiSelect', ['$q', '$parse', function($q, $parse) {

    function appendSelected(entities) {
      var newEntities = [];
      angular.forEach(entities, function(entity) {
        var appended = entity;
        appended.selected = false;
        newEntities.push(appended);
      });
      return newEntities;
    }

    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        selectedLabel: "@",
        availableLabel: "@",
        available: "=",
        model: "=ngModel",
        config: "="
      },
      templateUrl: "template/multiSelect.html",
      link: function(scope, elm, attrs, controllers) {
        scope.selected = {
          available: [],
          current: []
        };

        /* Filters out items in original that are also in toFilter. Compares by reference. */
        function filterOut(original, toFilter) {
          var filtered = [];
          angular.forEach(original, function(entity) {
            var match = false;
            for(var i = 0; i < toFilter.length; i++) {
              if(scope.renderItem(toFilter[i]) == scope.renderItem(entity)) {
                match = true;
                break;
              }
            }
            if(!match) {
              filtered.push(entity);
            }
          });
          return filtered;
        }

        function parseExpression(item, expr) {
          var displayComponents = expr.match(/(.+)\s+as\s+(.+)/);
          var ctx = {};
          ctx[displayComponents[1]] = item;
          return $parse(displayComponents[2])(ctx);
        }

        var requiredMin, inputModel;  
        function ensureMinSelected() {
          if(requiredMin && scope.model) {
            scope.numSelected = scope.model.length; 
            inputModel.$setValidity('min', scope.numSelected >= requiredMin);
          }
        }

        scope.refreshAvailable = function() {
          if(scope.model && scope.available){
            scope.available = filterOut(scope.available, scope.model);
            scope.selected.available = appendSelected(scope.available);         
            scope.selected.current = appendSelected(scope.model);
          }
        }; 

        scope.add = function() {
          if(!scope.model.length)
            scope.model = [];
          scope.model = scope.model.concat(scope.selected(scope.selected.available));         
        };
        scope.addAll = function(){
            if(!scope.model.length) {
                scope.model = [];
            }
          scope.model = scope.model.concat(scope.available);
        };
        scope.remove = function() {
          var selected = scope.selected(scope.selected.current);
          scope.available = scope.available.concat(selected);
          scope.model = filterOut(scope.model, selected);
        };
        scope.removeAll = function() {
          scope.available = scope.available.concat(scope.model);
          scope.model = filterOut(scope.model, scope.model);
        };
        scope.selected = function(list) {
          var found = [];
          angular.forEach(list, function(item) { if(item.selected === true) found.push(item); });
          return found;
        };  

        //Watching the model, updating if the model is a resolved promise
        scope.watchModel = function(){
          if(scope.model && scope.model.hasOwnProperty('$promise') && !scope.model.$resolved){
            scope.model.then(function(results) {
              scope.$watch('model', scope.watchModel);
            });
          }
          else{
            scope.refreshAvailable();
            scope.$watch('model', scope.refreshAvailable);  
          }
        };
        
        //Watching the list of available items. Updating if it is a resolved promise, and refreshing the 
        //available list if the list has changed
        var _oldAvailable = {};
        scope.watchAvailable = function(){
          if(scope.available && scope.available.hasOwnProperty('$promise') && !scope.available.$resolved){
            scope.available.$promise.then(function(results) {
              scope.$watch('available', scope.watchAvailable);
            });
          }
          else{
            //We only want to refresh the list if the list of available items has changed
            //and the variable is defined
            if(scope.available && scope.available != _oldAvailable){
              scope.refreshAvailable();
              _oldAvailable = scope.available; 
            }
          }
        };

        scope.$watch("available", scope.watchAvailable);
        scope.$watch("model", scope.watchModel);

        scope.renderItem = function(item) {
          return parseExpression(item, attrs.display);
        };

        scope.renderTitle = function(item) {
          if(attrs.title) {
            return parseExpression(item, attrs.title);
          }
          return "";
        };

        if(scope.config && angular.isDefined(scope.config.requiredMin)) {
          var inputs = elm.find("input");
          var validationInput = angular.element(inputs[inputs.length - 1]);
          inputModel = validationInput.controller('ngModel');
        }

        scope.$watch('config.requiredMin', function(value) {
          if(angular.isDefined(value)) {
            requiredMin = parseInt(value, 10);
            ensureMinSelected();
          }
        });

        scope.$watch('model', function(selected) {
          ensureMinSelected();
        });
      }
    };
  }]);

  angular.module("template/multiSelect.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/multiSelect.html",
      '<div class="multiSelect">' +
        '<div class="select">' +
          '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
              '{{selectedLabel==""?"":"("+model.length+")"}}</label>' +
        '<input ng-model="searchLeft" class="search">' +
        '<ul>' +
            '<li ng-repeat="entity in model | filter:searchLeft">' +
              '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
                '<input type="checkbox" ng-model="selected.current[$index].selected"> ' +
                '{{ renderItem(entity) }}' +
              '</label>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="select buttons">' +
          '<button class="btn mover left" ng-click="add()" title="Add selected" ' +
              'ng-disabled="!selected(selected.available).length">' +
            '<span class="icon-chevron-left"></span>' +
          '</button>' +
          '<button class="btn mover left-all" ng-click="addAll()" title="Add selected" ' +
              'ng-disabled="!available.length">' +
          '<span class="icon-chevron-left first"></span>' +
          '<span class="icon-chevron-left second"></span>' +
           '</button>' +
          '<button class="btn mover right" ng-click="remove()" title="Remove selected" ' +
              'ng-disabled="!selected(selected.current).length">' +
            '<span class="icon-chevron-right"></span>' +
          '</button>' +
          '<button class="btn mover right-all" ng-click="removeAll()" title="Remove selected" ' +
              'ng-disabled="!model.length">' +
             '<span class="icon-chevron-right first"></span>' +
             '<span class="icon-chevron-right second"></span>' +
           '</button>' +
        '</div>' +
        '<div class="select">' +
        '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
              '{{ availableLabel==""?"": "(" +available.length +")" }}</label>' +
        '<input ng-model="searchRight" class="search">'+
        '<ul>' +
            '<li ng-repeat="entity in available|filter:searchRight">' +
              '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
                '<input type="checkbox" ng-model="selected.available[$index].selected"> ' +
                '{{ renderItem(entity) }}' +
              '</label>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<input type="number" name="numSelected" ng-model="numSelected" ' +
            'style="display: none">' +
      '</div>');
  }])
  ;
})(angular);