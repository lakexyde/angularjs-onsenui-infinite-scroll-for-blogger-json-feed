var app = angular.module('myApp', ['onsen']);

app.service('NewsService', function($http){
  var self = this;

  var results = [];

  this.listResults = function(data, append){
    if(!append){
        results.length = 0;
    }
    
    Array.prototype.map.call(data, function(item){
        var o = {};
        o['title'] = item.title.$t;
        o['image'] = item.media$thumbnail.url;
        o['published'] = item.published.$t;
        o['author'] = item.author[0].name.$t;
        o['content'] = item.content.$t;

        Array.prototype.map.call(item.link, function(i){
            if(i.rel == 'alternate'){
              o['link']= i.href;
            } else if(i.rel === 'replies'){
              o['comment_url']= i.href;
            }
        });
        results.push(o);
    });
    return results;
    
  }

  this.getResults = function(){
      return results;
  }

});

app.controller('AppController', function($scope, NewsService, $http){
    init();
    function init(){
        $scope.posts = NewsService.getResults();
    }
    
    $scope.link = 'http://www.juvelution.com/feeds/posts/default?alt=json&max-results=10';
    
    // Define the current index. Max results plus 1
    $scope.index = 11;
    
    // To be concatenated with the next $http request
    $scope.next = '&start-index='+$scope.index;
    
    // Function called on infinite scroll
    $scope.loadMore = function(done){
        $scope.go(false).then(done);
    }
    
    // Called on every scroll
    $scope.go = function(){
        // Shows the loading icon at the bottom
        $scope.i_loading = true;
        
        return $http.get($scope.link + $scope.next).success(function(res){
            $scope.index += 10; 
            $scope.next = '&start-index='+$scope.index;
            var data = res.feed.entry;
            NewsService.listResults(data, true);
            //Hides the loading icon
            $scope.i_loading = false;
        }).error(function(){
                $scope.i_loading = false;
                $scope.error = true;
        });
    }
    
});
