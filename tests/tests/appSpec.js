// Tests here

describe('directive: multi-select', function() {
  var element, scope;
  var DOMgetAvailable, DOMgetSelected;

  //Common DOM selectors
  DOMgetAvailable = function(){
    return element.find("div .select:nth-of-type(3)").find("ul").find("li");
  };
  DOMgetSelected = function(){
    return element.find("div .select:nth-of-type(1)").find("ul").find("li");
  };   

  //Getting angular app
  beforeEach(module('app'));
  
  //Setting scope and compiling html directive
  beforeEach(inject(function($rootScope, $compile, $injector) {
    scope = $rootScope.$new();
    
    element ='<multi-select ng-model="selected" available="available" selected-label="Selected" available-label="Available" display="r as r.name" title="r as r.title" config="selectConfig"></multi-select>';
    
    element = $compile(element)(scope);
    scope.$digest();
  }));

  describe('when scope models is set at initialization', function() {
    
    beforeEach(function() {
      scope.selected = [{name: "name1", title: "title1"}];
      scope.available = [{name: "name1", title: "title1"}, {name: "name2", title: "title2"}, {name: "name3", title: "title3"}];
      scope.$digest();
    });
    
    it("should create list of available elements", function() {
      expect(DOMgetAvailable().length).toBe(2);
    });

    it("should create list of selected elements", function() {
      //First list
      expect(DOMgetSelected().length).toBe(1);
    });    
  });

  describe('when scope models is set after initalization', function() {
    
    beforeEach(function() {
      scope.selected = [];
      scope.available = [];
      scope.$digest();

      scope.selected = [{name: "name1", title: "title1"}];
      scope.available = [{name: "name1", title: "title1"}, {name: "name2", title: "title2"}, {name: "name3", title: "title3"}];

      scope.$digest();
    });
    
    it("should create list of available elements", function() {
      expect(DOMgetAvailable().length).toBe(2);
    });

    it("should create list of selected elements", function() { 
      expect(DOMgetSelected().length).toBe(1);
    });    
  });  

  describe('when scope models is set using a $ressource', function() {
    var UsersResource;

    beforeEach(inject(function($httpBackend, $resource) {
      httpBackend = $httpBackend;

      //Mock data
      var mockData = [{name: "name1", title: "title1"}, {name: "name2", title: "title2"}, {name: "name3", title: "title3"}];
      //Mock backend with one response
      httpBackend.whenGET('/users').respond(mockData);
      
      //Defining a simple mock $resource
      UsersResource = $resource('/users',null,{'query': { method:'GET', isArray: true }});
    }));

    beforeEach(function() {
      scope.selected = [{name: "name1", title: "title1"}];
      scope.available = [];

      scope.$digest();

      //Loading data from $resource
      scope.available = UsersResource.query();
      httpBackend.flush();    
    });

    it("should return a list of data from the $resource", function() {
      expect(scope.available.length).toBeGreaterThan(0);
    });

    it("should create list of available and selected elements", function() {
      expect(scope.available[0].name).toBe("name2");
      expect(DOMgetAvailable().length).toBe(2);   
    });    

    it("should updated the available and selected lists when an element is selected and added", function() { 
      //Available list should have two elements
      expect(DOMgetAvailable().length).toBe(2);

      //Selecting the first element on the list
      DOMgetAvailable().find("input:first")[0].click();

      //Expecting the checkbox to be selected
      expect(DOMgetAvailable().find("input:first").prop("checked")).toBe(true);

      //Clicking the add button
      element.find(".btn.mover.left")[0].click();

      //The added element should be moved to the selected elements, leaving just one element in the
      //available list
      expect(DOMgetAvailable().length).toBe(1);
      expect(DOMgetSelected().length).toBe(2);     
    });  

    it("should updated the available and selected lists when an element is selected and removed", function() {
      //Select list should have one element
      expect(DOMgetSelected().length).toBe(1);

      //Selecting the first element on the select list
      DOMgetSelected().find("input:first")[0].click();

      //Expecting the checkbox to be selected
      expect(DOMgetSelected().find("input:first").prop("checked")).toBe(true);

      //Clicking the remove button
      element.find(".btn.mover.right")[0].click();

      //The added element should be moved to the available elements, leaving three elements in the
      //available list
      expect(DOMgetAvailable().length).toBe(3);
      expect(DOMgetSelected().length).toBe(0);     
    });      
  });

  describe("should add and remove elements", function(){
    beforeEach(function(){
      scope.selected = [{name: "name1", title: "title1"}];
      scope.available = [{name: "name1", title: "title1"}, {name: "name2", title: "title2"}, {name: "name3", title: "title3"}];
      scope.$digest();
    });

    it("should be able to add and remove an element", function() {
      /*
        Adding an element from available list
      */
      //Available list should have two elements
      expect(DOMgetAvailable().length).toBe(2);

      //Selecting the first element on the list
      DOMgetAvailable().find("input:first")[0].click();

      //Expecting the checkbox to be selected
      expect(DOMgetAvailable().find("input:first").prop("checked")).toBe(true);

      //Clicking the add button
      element.find(".btn.mover.left")[0].click();

      //The added element should be moved to the selected elements, leaving just one element in the
      //available list
      expect(DOMgetAvailable().length).toBe(1);
      expect(DOMgetSelected().length).toBe(2);       

      /*
        Removing an element from selected list
      */
    
      //Selecting the first element on the select list
      DOMgetSelected().find("input:nth-of-type(1)")[0].click();

      //Expecting the checkbox to be selected
      expect(DOMgetSelected().find("input:nth-of-type(1)").prop("checked")).toBe(true);

      //Clicking the remove button
      element.find(".btn.mover.right")[0].click();

      //The added element should be moved to the available elements, leaving three elements in the
      //available list
      expect(DOMgetAvailable().length).toBe(2);
      expect(DOMgetSelected().length).toBe(1);         
    });
  })

});