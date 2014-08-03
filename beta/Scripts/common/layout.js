$.ajaxSetup({ cache: true })
angular.module('betaApp', ['ui.router', 'ui.bootstrap', 'bz.Directives'])
.config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /state1
   // $urlRouterProvider.otherwise(beta.global.isAuthenticated ? "/home" : "/index");
    //$urlRouterProvider.otherwise(function ($injector, $location) {
    //    return '/partials/contacts.' + '.html';
    //});
    // Now set up the states
    $stateProvider
      .state('index', {
          url: "/index",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, "Home", "Index")
      })
      .state('home', {
          url: "/home",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, "Home", "Home")
      })
      .state('register', {
          url: "/register",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'Account', 'Register'),
          controller: function ($scope, $http) {
              registerCtrl.call(this, $scope, $http);
          }
      })
      .state('login', {
          url: "/login",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'Account', 'Login'),
      })
      .state('roles', {
          url: "^/roles",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'RolesAdmin', 'Index'),
      })
    .state('users', {
        url: "/users",
        templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'UsersAdmin', 'List'),
        controller: function ($scope, $http) {
            usersCtrl.call(this, $scope, $http);
        }
    })
    .state('users.detail', {
        url: "/detail/:uid",
        templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'UsersAdmin', 'Details'),
        controller: function ($scope, $http, $stateParams) {
            userCtrl.call(this, $scope, $http, $stateParams.uid);
        }
    })
})
.controller("accountCtrl", function ($scope, $http) {
    $scope.getDealers = function (user) {
        $.getJSON(String.format("{0}Independent/GetUserDealers", beta.global.webroot), { user: user }).done(function (data) {
            $scope.$apply(function () {           
                $scope.data = { email: user, fullname: data.UserFullName, dealer: data.Dealers[0], dealers: data.Dealers };
            });
            beta.global.currentuser = $scope.data;
        })
    };
    $scope.change = function (dealer) {
        $scope.data.dealer = dealer;
        beta.global.currentuser.dealer = dealer;
    }
    $scope.getDealers(beta.global.currentuser.email);
   
        //$scope.$watch('beta.global.currentuser.email', function (newvalue, oldvalue) {

        //});
});
