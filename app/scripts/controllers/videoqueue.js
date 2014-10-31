'use strict';

/**
 * @ngdoc function
 * @name jetgrizzlyApp.controller:VideoQueueController
 * @description
 * # VideoQueueController
 * Controller of the jetgrizzlyApp
 */
(function(){
angular.module('jetgrizzlyApp')
  .controller('VideoQueueController', [
    '$rootScope',
    '$scope',
    'userPresence',
    '$window',
    'config',
    '$firebase',
    'youtubeVideoApi',
    'lodash', function ($rootScope, $scope, SimpleLogin, userPresence, $window, config, $firebase, youtubeVideoApi, lodash) {
    // declare variables
    $scope.totalUsers = 0;

    var queueRef = new $window.Firebase(config.firebase.url+'/queue/');
    var sync = $firebase(queueRef);
    $scope.queue = sync.$asArray();

    var skipRef = new $window.Firebase(config.firebase.url+'/skip/');
    var skipSync = $firebase(skipRef);
    $scope.skipObject = skipSync.$asObject();
    
    var utRef = new $window.Firebase(config.firebase.url+'/youTube');
    var utSync = $firebase(utRef);
    var utObj = utSync.$asObject();

    // listen for new users to lobby (emitted from UserPresenceFactory)
    $scope.$on('onOnlineUser', function() {
      $scope.$apply(function() {
        $scope.totalUsers = userPresence.getOnlineUserCount();
      });
    });

    $scope.addToQueue = function(url) {
      var id = youtubeVideoApi.getIdFromUrl(url);
      if (id){
        if (!lodash.contains(lodash.pluck($scope.queue, 'id'), id)) {
          youtubeVideoApi.getVideoData(id).then(function (data) {
            return {
                url: url,
                id: id,
                upvotes: [],
                downvotes: [],
                info: lodash.cloneDeep(data.snippet)
              };
            }).then(function (item) {
              return $scope.queue.$add(item);
            }).then(function(ref) {
            return $firebase(ref).$asObject().$loaded();
          }).then(function(item){
            console.log(item.info.title, 'added to queue');
            $scope.item = '';
            $scope.queueForm.$setPristine();
          })
              .catch(function (err) {
              // do something fancy
              console.error(err);
            });
        } else {
          // do something fancy
          console.error('Video already in queue')
        }
      } else {
        // do something fancy
        console.error('Not a valid URL');
      }
    };

    // EL: once skip count is reached, change current vid's start time to -1, which should prompt index.js to handle next queue item
    $scope.$on('onSkipCountReached', function(){
      console.log('WE ARE IN THE skipCountReached E-L');
      utRef.on('value', function(snap){
        //var utObj = snap.val();
        console.log('utobj? - ', utObj);

        // change whatever needs to be changed in the youTube Firebase object in order to queue up next video (startTime?)
        utObj.startTime = -1;
        console.log('startTime is!!! - ', utObj.startTime);

        // upon saving the changes to firebase...
        utObj.$save().then(function(){
          // grab user id from Simple Login again
          var username = $scope.user.id;
          console.log('next vid loaded successfully / start time change saved successfully');
          // want to change skip obj - counter back to 0
          $scope.skipObject.counter = 0;
          $scope.skipObject[username] = false;
          $scope.skipObject.$save().then(console.log('counter reset correctly', $scope.skipObject.counter))
        });
      });
    });

    // add to skip counter when skip button is clicked
    $scope.skip = function(){
      // currently-logged-in user (using native AngularFire SimpleLogin)
      var username = $scope.user.id;
      console.log($scope.user.id);
      console.log('# of users is - ', userPresence.getOnlineUserCount());

      // if current user hasn't already voted, add to skip counter
      if ($scope.skipObject[username] !== true){
        ++$scope.skipObject.counter;
        // uncomment line below in order to prevent same user from voting on skipping more than once
        $scope.skipObject[username] = true;
      }
      // pushes changes made to the firebase-server
      $scope.skipObject.$save().then();
    };

  }]);
})();
