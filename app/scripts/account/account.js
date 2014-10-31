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
module.controller('ChangePasswordController', function (SimpleLogin, userPresence, $state, $scope){
	console.log( $scope.user )
	// $scope.user = SimpleLogin.getUser();
	// console.log($scope.user);
	$scope.changePassword = function(){
		if($scope.newPass === $scope.newPassConfirm){
			console.log('new password ok');
			console.log($scope.user.email, $scope.oldPass, $scope.newPass);
			console.log('about to run SimpleLogin.changePassword($scope.user.email, $scope.oldPass, $scope.newPass)');
			debugger;
			SimpleLogin.changePassword($scope.user.email, $scope.oldPass, $scope.newPass);
		} else {
			console.log('Your new passwords do not match')
		}
	}
})
})();