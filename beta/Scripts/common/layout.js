$.ajaxSetup({ cache: true })
angular.module('betaApp', ['ui.router', 'ui.bootstrap', 'bz.Directives'])
.config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise(beta.global.isAuthenticated ? "/home" : "/index");
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
          controller: function($scope,$http){
              registerCtrl.call(this,$scope,$http);
          }
      })
      .state('login', {
          url: "/login",
          templateUrl: String.format("{0}{1}/GetView/{2}", beta.global.webroot, 'Account', 'Login'),
      })
});


function getUserDealers(user) {
    $.getJSON(String.format("{0}Independent/GetUserDealers", beta.global.webroot), { user: user }).done(function (data) {
        var _uobj = { email: user, fullname: data.UserFullName };
        _uobj.dealer = ko.observable(data.Dealers[0]);
        _uobj.dealers = data.Dealers;
        beta.global.currentuser = _uobj;
        beta.global.currentuser.change = function (dealer) {
            beta.global.currentuser.dealer(dealer);
        };
        ko.applyBindings(beta.global.currentuser, $('#currentuser')[0]);
    });

}