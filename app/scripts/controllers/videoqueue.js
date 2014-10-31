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
    $scope.queue = sync.$asArray();

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
  }]);
})();
