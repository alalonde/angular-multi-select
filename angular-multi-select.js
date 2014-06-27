/*
 Multiple-select directive for AngularJS
 (c) 2013 Alec LaLonde (https://github.com/alalonde/angular-multi-select)
 License: MIT
*/
(function(angular) {
  'use strict';
  angular.module('multi-select', [])

  .directive('multiSelect', ['$q', '$parse',
    function($q, $parse) {

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
          model: "=ngModel"
        },
        template: 
        '<div class="multiSelect">' +
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th>' +
                  '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
                    '({{ model.length }})</label>' +
                '</th>' +
                '<th>' +
                  '&nbsp;' +
                '</th>' +
                '<th>' +
                  '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
                    '({{ available.length }})</label>' +
                '</th>' +
              '</tr>' +
            '</thead>' +
            '<tr>' +
              '<td>' +
                '<ul>' + 
                '<li>' + 
                  '<input type="checkbox" ng-model="leftallchkd" ng-change="leftallnone(model)" title="Select None"> ' + 
                  '</li>' + 
                '</ul>' + 
              '</td>' +
              '<td>' +
                '&nbsp;' +
              '</td>' +
              '<td>' +
                '<ul>' + 
                '<li>' + 
                '<input type="checkbox" ng-model="rightallchkd" ng-change="rightallnone(available)" title="Check/Uncheck all"> ' + 
                '</li>' + 
                '</ul>' + 
              '</td>' +
            '</tr>' +            
            '<tr>' +
              '<td class="selectcell">' +
                '<div class="select">' + // select list on the left
                  '<ul>' +
                    '<li ng-repeat="entity in model">' +
                      '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
                        '<input type="checkbox" ng-model="selected.current[$index].selected"> ' +
                          '{{ renderItem(entity) }}' +
                      '</label>' +
                    '</li>' +
                  '</ul>' +
                '</div>' +
              '</td>' +
              '<td>' +
                '<div class="select buttons">' + // buttons to transfer between lists
                  '<button class="btn mover left" ng-click="add()" title="Add selected" ' +
                    'ng-disabled="!selected(selected.available).length">' +
                      '<i class="icon-arrow-left"></i>' +
                  '</button>' +
                  '<button class="btn mover right" ng-click="remove()" title="Remove selected" ' +
                    'ng-disabled="!selected(selected.current).length">' +
                    '<i class="icon-arrow-right"></i>' +
                  '</button>' +
                '</div>' +
              '</td>' +
              '<td  class="selectcell">' +
                '<div class="select">' + // select list on the right
                  '<ul>' +
                    '<li ng-repeat="entity in available">' +
                      '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
                        '<input type="checkbox" ng-model="selected.available[$index].selected"> ' +
                          '{{ renderItem(entity) }}' +
                        '</label>' +
                    '</li>' +
                  '</ul>' +
                '</div>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</div>',
        link: function(scope, elm, attrs) {
          
          scope.leftallchkd=false;
          scope.rightallchkd=false;
          
          scope.selected = {
            available: [],
            current: []
          };

          /* Handles cases where scope data hasn't been initialized yet */
          var dataLoading = function(scopeAttr) {
            var loading = $q.defer();
            if (scope[scopeAttr] && !scope[scopeAttr].hasOwnProperty('$promise')) {
              loading.resolve(scope[scopeAttr]);
            } else {
              scope.$watch(scopeAttr, function(newValue, oldValue) {
                if (newValue !== undefined && oldValue === undefined)
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
              for (var i = 0; i < toFilter.length; i++) {
                if (scope.renderItem(toFilter[i]) == scope.renderItem(entity)) {
                  match = true;
                  break;
                }
              }
              if (!match) {
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
            scope.leftallchkd = false;
            scope.rightallchkd = false;
          };
          scope.remove = function() {
            var selected = scope.selected(scope.selected.current);
            scope.available = scope.available.concat(selected);
            scope.model = filterOut(scope.model, selected);
            scope.leftallchkd = false;
            scope.rightallchkd = false;
          };
          scope.selected = function(list) {
            var found = [];
            angular.forEach(list, function(item) {
              if (item.selected === true) found.push(item);
            });
            return found;
          };


          scope.leftallnone  = function(list) {
            angular.forEach(list, function(item) {
              item.selected = scope.leftallchkd;
            });  
          };
          
            scope.rightallnone  = function(list) {
            angular.forEach(list, function(item) {
              item.selected = scope.rightallchkd;
            });  
          };

          scope.selnone = function(list) {
            angular.forEach(list, function(item) {
              item.selected = false
            });
          };

          scope.selall = function(list) {
            angular.forEach(list, function(item) {
              item.selected = true
            });
          };

          $q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
            scope.refreshAvailable();
            scope.$watch('model', scope.refreshAvailable);
          });

          function parseExpression(item, expr) {
            var displayComponents = expr.match(/(.+)\s+as\s+(.+)/);
            var ctx = {};
            ctx[displayComponents[1]] = item;
            return $parse(displayComponents[2])(ctx);
          }

          scope.renderItem = function(item) {
            return parseExpression(item, attrs.display);
          };

          scope.renderTitle = function(item) {
            if (attrs.title) {
              return parseExpression(item, attrs.title);
            }
            return "";
          };
        }
      };
    }
  ]);
})(angular);
