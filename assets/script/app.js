'use strict';
angular.module('profileApp', [
    'ngRoute',
    'ngResource',
    'profileApp.profileController',
    'profileApp.profileServices'
])

    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'view/profileTemplate.html',
                controller: 'ProfileController'
            });
        }])

    .directive("responsiveImage",
    ["$log", "$window",
        function ($log, $window) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    'respalt': '@imagealt',
                    'respsrc': '@imagesrc'
                },
                template: '<img class="profile-image"' +
                    'ng-src="{{modifiedsrc}}" alt="{{respalt}}"/>',
                link: function (scope, element, attribute) {
                    scope.$on("breakpointClassChange", function (event, argument) {
                        $log.log("responsiveImage receiving breakpointClassChange ", argument);
                        scope.$apply(function () {
                            if (angular.equals(argument.styleClass, "large-screen")) {
                                scope.modifiedsrc = scope.respsrc + "?s=250";
                            } else if (angular.equals(argument.styleClass, "medium-screen")) {
                                scope.modifiedsrc = scope.respsrc + "?s=150";
                            } else if (angular.equals(argument.styleClass, "small-screen")) {
                                scope.modifiedsrc = scope.respsrc + "?s=80";
                            }
                        })

                    });
                }};
        }])

    .directive("responsiveHeader",
    ["$log", "$window",
        function ($log, $window) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    'respText': '@targettext'
                },
                template: "<p class='header {{deviceSize}}'> {{respText}} </p>",
                link: function (scope, element, attribute) {
                    scope.$on("breakpointClassChange", function (event, argument) {
                        $log.log("responsiveHeader receiving breakpointClassChange ", argument);
                        scope.$apply(function () {
                            scope.deviceSize = argument.styleClass;
                        })
                    });
                }};
        }])

    .directive("responsiveParagraph",
    ["$log", "$window", "$rootScope",
        function ($log, $window, $rootScope) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    'respPara': '@targetpara'
                },
                template: "<p class='paragraph {{paragraphSize}}'> {{respPara}} </p>",
                link: function (scope, element, attribute) {
                    scope.$on("breakpointClassChange", function (event, argument) {
                        $log.log("responsiveParagraph receiving breakpointClassChange ", argument);
                        scope.$apply(function () {
                            scope.paragraphSize = argument.styleClass;
                        })
                    });
                }};
        }])

    .directive("breakpoint",
    ["$log", "$window", "$rootScope", "$timeout",
        function ($log, $window, $rootScope, $timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attributes) {
                    var breakpointString = attributes.breakpoint,
                        customBreakpoints = angular.fromJson(breakpointString);
                    scope.breakpoint = {windowSize: $window.outerWidth, styleClass: ''};
                    //Method for broadcast breakpointClassChange event
                    scope.broadcastBreakEvent = function () {
                        $log.log("Broadcasting breakpointClassChange...", scope.breakpoint);
                        $rootScope.$broadcast('breakpointClassChange', scope.breakpoint);
                    }
                    //Scope watcher for styleClass property to broadcast breakpointClassChange event
                    scope.$watch('breakpoint.styleClass', function (newStyleClass, oldStyleClass) {
                        if (newStyleClass.length > 0 && newStyleClass != oldStyleClass) {
                            $timeout(function () {
                                scope.broadcastBreakEvent();
                            });
                        }
                    });
                    //Scope watcher for windowSize property to update the new style class
                    scope.$watch('breakpoint.windowSize', function (newSize, oldSize) {
                        var className = 'small-screen';
                        for (var customPointKey in customBreakpoints) {
                            var breakSize = parseInt(customPointKey, 10);
                            if ( breakSize < newSize) {
                                className = customBreakpoints[breakSize];
                            }
                        }
                        scope.breakpoint.styleClass = className;
                    });
                    //Window resize event updates the windowSize property
                    angular.element($window).bind('resize', function () {
                        scope.$apply(function () {
                            scope.breakpoint.windowSize = $window.outerWidth;
                        });
                    });
                    //For first time page load
                    angular.element(document).ready(function () {
                        $timeout(function () {
                            scope.broadcastBreakEvent();
                        },100);
                    });
                }
            };
        }])

    .directive("responsiveText",
    ["$log", "$window",
        function ($log, $window) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    'respText': '@targettext'
                },
                template: "<p class='text {{deviceSize}}'> {{respText}} </p>",
                link: function (scope, element, attribute) {
                    scope.$on("breakpointClassChange", function (event, argument) {
                        $log.log("responsiveText receiving breakpointClassChange ", argument);
                        scope.$apply(function () {
                            scope.deviceSize = argument.styleClass;
                        })
                    });
                }};
        }])

    .directive("responsiveList",
    ["$log", "$window",
        function ($log, $window) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    'itemList': '=targetlist'
                },
                template: '<div class="item-list-container">' +
                    '<ol class="{{deviceSize}}">' +
                    '<li ng-class="{smallText:isMorePresent}" ng-repeat="item in itemDisplayList">{{item}}</li>' +
                    '</ol>' +
                    '<button class="show-more" ng-show="isMorePresent" ' +
                    'ng-click="showMore(itemDisplayList)"><span>More...</span></button>' +
                    '</div>',
                link: function (scope, element, attribute) {
                    scope.isMorePresent = false;
                    scope.$watch("itemList", function (newItemList, oldItemList) {
                        scope.itemList = newItemList;
                        scope.height = $window.outerHeight;
                        scope.itemDisplayList = scope.itemList;
                    }, true);
                    scope.$watch("height", function (newHeight, oldHeight) {
                        var listLength = angular.isDefined(scope.itemList) ?
                            scope.itemList.length : 0;
                        if (newHeight < 400 && listLength > 2) {
                            scope.isMorePresent = true;
                            scope.itemDisplayList = scope.itemList.slice(0, 2);
                        } else if (newHeight >= 400 && newHeight < 700 && listLength > 3) {
                            scope.isMorePresent = true;
                            scope.itemDisplayList = scope.itemList.slice(0, 3);
                        } else {
                            scope.isMorePresent = false;
                            scope.itemDisplayList = scope.itemList;
                        }
                    });
                    scope.$on("breakpointClassChange", function (event, argument) {
                        $log.log("responsiveHeader receiving breakpointClassChange ", argument);
                        scope.$apply(function () {
                            scope.deviceSize = argument.styleClass;
                        })
                    });
                    angular.element($window).bind('resize', function () {
                        scope.$apply(function () {
                            scope.height = $window.outerHeight;
                        });
                    });
                    scope.showMore = function (initalList) {
                        scope.itemDisplayList = scope.itemList;
                        scope.isMorePresent = false;
                    }
                }};
        }]);


