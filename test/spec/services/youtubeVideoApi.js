/**
 * Created by tom on 10/29/14.
 */
'use strict';

describe('Service: youtubeVideoApi', function () {
  var youtubeVideoApi, $httpBackend, getHandler, $q, $rootScope;
  beforeEach(module('jetgrizzlyApp'));
  beforeEach(inject(function($injector){
    $httpBackend = $injector.get('$httpBackend');
    youtubeVideoApi = $injector.get('youtubeVideoApi');
    $q = $injector.get('$q');
    $rootScope = $injector.get('$rootScope');
    jasmine.getJSONFixtures().fixturesPath='base/test/mock';
    getHandler = $httpBackend
      .whenGET('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=xepnIG1yQQ&maxResults=1&key=AIzaSyDcrxqaINGpjBDMhTxEq8hdJPEbSjnmc6Y')
      .respond(getJSONFixture('youtubeDummyResponse.json'));
  }));
  afterEach(function(){
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function(){
    expect(!!youtubeVideoApi).toBe(true);
  });

  it('should format requests correctly', function(){
    $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=xepnIG1yQQ&maxResults=1&key=AIzaSyDcrxqaINGpjBDMhTxEq8hdJPEbSjnmc6Y');
    youtubeVideoApi.getVideoData('xepnIG1yQQ');
    $httpBackend.flush();
  });

  it('should return data in expected format', function(){
    $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=xepnIG1yQQ&maxResults=1&key=AIzaSyDcrxqaINGpjBDMhTxEq8hdJPEbSjnmc6Y');
    var d = $q.defer();
    var p = d.promise;
    var data;
    p.then(function(response){
      data = response;
    });
    youtubeVideoApi.getVideoData('xepnIG1yQQ')
      .then(function(response){
        d.resolve(response);
      });
    $rootScope.$digest();
    $httpBackend.flush();
    expect(data.snippet.title).toBe('The Missing Scarf (feat. George Takei)');
  })



});
