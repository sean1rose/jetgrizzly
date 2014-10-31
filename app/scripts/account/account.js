/*jshint -W020 */
'use strict';
// does not do much now, but provide a template/page for user account information
(function(){
var module = angular.module('jetgrizzlyApp.Account',['ui.router']);
module.config(function($stateProvider) {
  $stateProvider.state('account', {
    url:'/account',
    parent:'app',
    templateUrl:'views/account/account.html',
    controller:'ChangePasswordController'
  });
});
module.controller('ChangePasswordController', function (SimpleLogin, $location, userPresence, $state, $scope){
	$scope.changePassword = function(){
		if($scope.newPass === $scope.newPassConfirm){
			SimpleLogin.changePassword($scope.user.email, $scope.oldPass, $scope.newPass);
			$location.path('/');
		} else {
			alert('Your new passwords do not match')
			$scope.newPass = '';
			$scope.oldPass = '';
			$scope.newPassConfirm = '';
		}
	}
})
})();