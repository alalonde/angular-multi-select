/*
 Multiple-select directive for AngularJS
 (c) 2014 Tyler Mendenhall (https://github.com/tmendenhall/angular-multi-select)
 License: MIT
    forked from
 (c) 2013 Alec LaLonde (https://github.com/alalonde/angular-multi-select)
 License: MIT
*/
(function(angular) {
  'use strict';

  angular.module('multi-select', ["template/multiSelect.html"])
  .directive('multiSelect', ['$q', '$parse', '$filter',function($q, $parse, $filter) {

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

        function removeMutallyExclusive(source,target){
            var toRemove = [];
            angular.forEach(source, function(item){

                for (var x = 0; x < item.mx.length; x++){
                    // mx loop for the incoming element
                    var id = item.mx[x];
                    for (var z = 0; z < target.length; z++){
                        if (target[z].roleId === id){
                            toRemove.push(target[z]);
                        }
                    }
                }
            });
            return toRemove;
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

        // call as a result of either load promise being fulfilled
        // as a watch on model
        scope.refreshAvailable = function() {
          scope.available = $filter('orderBy')(filterOut(scope.available, scope.model),'roleName');
          scope.selected.available = $filter('orderBy')(appendSelected(scope.available),'roleName');
          scope.selected.current = $filter('orderBy')(appendSelected(scope.model),'roleName');
        };

        scope.disableMXSelected = function(selectedElement){
            var mx = selectedElement.mx;
           angular.forEach(scope.selected.available, function(element){
               // this function needs to be patched for old IE8 browsers
                if (mx.indexOf(element.roleId) > -1 ){
                    element.selected = false;
                }
           });
        };

        scope.add = function() {
           var listToAdd = scope.selected(scope.selected.available);
            var mx = removeMutallyExclusive(listToAdd,scope.selected.current);
            scope.available = $filter('orderBy')(scope.available.concat(mx),'roleName');
            scope.model = filterOut(scope.model,mx);
            scope.model = $filter('orderBy')(scope.model.concat(listToAdd),'roleName');
        };
        scope.remove = function() {
          var selected = scope.selected(scope.selected.current);
          scope.available = $filter('orderBy')(scope.available.concat(selected),'roleName');
          scope.model = $filter('orderBy')(filterOut(scope.model, selected),'roleName');
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
          '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
          '({{ available.length }})</label>' +
          '<ul>' +
          '<li ng-repeat="entity in available | orderBy:\'roleName\'">' +
          '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
          '<input type="checkbox" ng-model="selected.available[$index].selected" ng-change="disableMXSelected(selected.available[$index])"> ' +
          '{{ renderItem(entity) }}' +
          '</label>' +
          '</li>' +
          '</ul>' +
          '</div>' +
        '<div class="select buttons">' + 
          '<button class="btn mover right" ng-click="add()" title="Add selected" ' +
              'ng-disabled="!selected(selected.available).length">' + 
            '<i class="icon-arrow-right"></i>' +
          '</button>' + 
          '<button class="btn mover left" ng-click="remove()" title="Remove selected" ' +
              'ng-disabled="!selected(selected.current).length">' + 
            '<i class="icon-arrow-left"></i>' +
          '</button>' +
        '</div>' +
          '<div class="select">' +
          '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
          '({{ model.length }})</label>' +
          '<ul>' +
          '<li ng-repeat="entity in model | orderBy:\'roleName\'">' +
          '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
          '<input type="checkbox" ng-model="selected.current[$index].selected"> ' +
          '{{ renderItem(entity) }}' +
          '</label>' +
          '</li>' +
          '</ul>' +
          '</div>' +

        '<input type="hidden" name="numSelected" ng-model="numSelected"/> '+
      '</div>');
  }])
  ;
})(angular);