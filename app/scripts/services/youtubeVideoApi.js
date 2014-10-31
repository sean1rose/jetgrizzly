/**
 * Created by tom on 10/29/14.
 */

angular.module('jetgrizzlyApp')

.factory('youtubeVideoApi', function ($http, lodash, apikeys) {

    var apiKey = apikeys.YOUTUBE_API_KEY || 'AIzaSyDcrxqaINGpjBDMhTxEq8hdJPEbSjnmc6Y';

    var youtube = {
      videos: {
        list: function(params){
          if (!params['part']){
            throw new Exception('Query must include the \'part\' parameter');
          }
          if (!params['key']){
            params['key'] = apiKey;
          }
          var url = 'https://www.googleapis.com/youtube/v3/videos?';
          url += lodash.map(params, function(v, k){
            return k + '=' + v.toString();
          }).join('&');
          return $http.get(url)
            .then(function(resp){
              return resp.data;
            });
        }
      }
    };


    var getIdFromUrl = function(url){
      var match = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/i.exec(url);
      if (match && match[7].length === 11) return match[7];
      else return null;
    };

    var getVideoData = function(id){
      return youtube.videos.list({
        part: 'snippet',
        id: id,
        maxResults: 1
      }).then(function(data){
        return data.items[0];
      }).catch(function(){
        return null;
      })
    };

    return {
      getIdFromUrl: getIdFromUrl,
      getVideoData: getVideoData
    };


});
