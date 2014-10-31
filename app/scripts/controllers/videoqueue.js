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
    'lodash', function ($rootScope, $scope, userPresence, $window, config, $firebase, youtubeVideoApi, lodash) {
    // declare variables
    $scope.totalUsers = 0;

    var queueRef = new $window.Firebase(config.firebase.url+'/queue/');
    var sync = $firebase(queueRef);


    var skipRef = new $window.Firebase(config.firebase.url+'/skip/');
    var skipSync = $firebase(skipRef);
    $scope.skipObject = skipSync.$asObject();
    
    // https://www.firebase.com/blog/2014-07-30-introducing-angularfire-08.html
    // create a read-only firebase array
    // $scope.queue = sync.$asArray();

    // creates a syncrhonized object (downloads the firebase data into a local object)
    //$scope.skip = skipSync.$asObject();
    // should i use the same name to refer to this object as one that's used in index.js? skipObject vs skipRef

    // synchronizes the object w/ 3-way data binding
    // skipObject.$bindTo($scope, 'data');



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

    $scope.skip = function(){
      // adds to the count (make changes to the data)
      // currently-logged-in user
      var username = $scope.user.id;
      console.log($scope.user.id);
      console.log('# of users is ', userPresence.getOnlineUserCount())

      // if current user hasn't already voted, add to skip counter
      if ($scope.skipObject[username] !== true){
        ++$scope.skipObject.counter;
        $scope.skipObject[username] = true;
      }
      // pushes changes made to the firebase-server
      $scope.skipObject.$save().then();


      // once skip count reaches a certain # --> want to play next video (handle that in index.js???)
      // when a new vid is played, want the counts (skip and userid) to start over
    };

  }]);
})();
