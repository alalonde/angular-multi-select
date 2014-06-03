/*
 Multiple-select directive for AngularJS
 (c) 2013 Alec LaLonde (https://github.com/alalonde/angular-multi-select)
 License: MIT
*/
(function(angular) {
  'use strict';
  angular.module('multi-select', [])

  .directive('multiSelect', ['$q', '$compile', function($q, $compile) {

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
        display: "@",
        available: "=",
        model: "=ngModel"
      },
      template: '<div class="multiSelect">' + 
                  '<div class="select">' + 
                    '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
                        '({{ model.length }})</label>' +
                    '<ul>' + 
                      '<li ng-repeat="entity in model">' + 
                        '<label class="checkbox">' + 
                          '<input type="checkbox" ng-model="selected.current[$index].selected"> ' + 
                          '{{ renderItem(entity) }}' + 
                        '</label>' +
                      '</li>' +
                    '</ul>' +
                  '</div>' + 
                  '<div class="select buttons">' + 
                    '<button class="btn mover left" ng-click="add()" title="Add selected" ' + 
                        'ng-disabled="!selected(selected.available).length">' + 
                      '<i class="icon-arrow-left"></i>' + 
                    '</button>' + 
                    '<button class="btn mover right" ng-click="remove()" title="Remove selected" ' + 
                        'ng-disabled="!selected(selected.current).length">' + 
                      '<i class="icon-arrow-right"></i>' + 
                    '</button>' +
                  '</div>' + 
                  '<div class="select">' +
                    '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
                        '({{ available.length }})</label>' +
                    '<ul>' + 
                      '<li ng-repeat="entity in available">' + 
                        '<label class="checkbox">' + 
                          '<input type="checkbox" ng-model="selected.available[$index].selected"> ' + 
                          '{{ renderItem(entity) }}' + 
                        '</label>' +
                      '</li>' +
                    '</ul>' +
                  '</div>' +
                  '<input type="number" name="numSelected" ng-model="numSelected" ' +
                      'style="display: none">' +
                '</div>',
      link: function(scope, elm, attrs, controllers) {
        scope.selected = {
          available: [],
          current: []
        };

        /* Handles cases where scope data hasn't been initialized yet */
        var dataLoading = function(scopeAttr) {
          var loading = $q.defer();
          if((scope[scopeAttr] && !scope[scopeAttr].hasOwnProperty('$promise')) ||
              (scope[scopeAttr] && scope[scopeAttr].length > 0)) {
            loading.resolve(scope[scopeAttr]);
          } else {
            scope.$watch(scopeAttr, function(newValue, oldValue) {
              if(newValue && newValue.length > 0)
                loading.resolve(newValue);
            });  
          }
          return loading.promise;
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

        scope.refreshAvailable = function() {
          scope.available = filterOut(scope.available, scope.model);
          scope.selected.available = appendSelected(scope.available);
          scope.selected.current = appendSelected(scope.model);
        }; 

        scope.add = function() {
          scope.model = scope.model.concat(scope.selected(scope.selected.available));
        };
        scope.remove = function() {
          var selected = scope.selected(scope.selected.current);
          scope.available = scope.available.concat(selected);
          scope.model = filterOut(scope.model, selected);
        };
        scope.selected = function(list) {
          var found = [];
          angular.forEach(list, function(item) { if(item.selected === true) found.push(item); });
          return found;
        };

        $q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
          scope.refreshAvailable();
          scope.$watch('model', scope.refreshAvailable);
        });

        scope.renderItem = function(item) {
          var displayComponents = attrs.display.match(/(.+)\s+as\s+(.+)/);
          scope[displayComponents[1]] = item;
          return scope.$eval(displayComponents[2]);
        };

        scope.$watch('model', function(selected) {
          if(attrs.requiredMin && selected) {
            scope.numSelected = selected.length; 
            inputModel.$setValidity('min', scope.numSelected >= requiredMin);
          }
        });
        
        var requiredMin, inputModel;
        if(attrs.requiredMin) {
          requiredMin = parseInt(attrs.requiredMin, 10);
          var inputs = elm.find("input");
          var validationInput = angular.element(inputs[inputs.length - 1]);
          inputModel = validationInput.controller('ngModel');
        }
      }
    };
  }])
  ;
})(angular);