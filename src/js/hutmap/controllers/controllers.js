'use strict';

(function () {
  angular.module('hutmap').

  controller('HutmapCtrl', 
    ['$scope', '$route', function($scope, $route) {

    $scope.$route = $route;

  }]).

  controller('CarouselCtrl', ['$scope', '$route', '$http', '$q', function($scope, $route, $http, $q) {
    $scope.slides = [
      {
        title: 'Plummer Hut', 
        location: 'Waddington Range, British Columbia, Canada',
        hutLink: '/map/?m_selected=51.37361,-125.16458&m_center=51.388403,-125.062053&m_zoom=9',
        agency: {
          name: 'BC Mountaineering Club',
          url:  ''
        },
        thumbnail: '/static/img/no-image-available.gif',
        image: '/static/img/carousel/Plummer Hut.JPG'
      },
      {
        title: 'Joe River Chickee', 
        location: 'lorem ipsum dolor',
        hutLink: '',
        agency: {
          name: 'lorem ipsum dolor',
          url:  ''
        },
        thumbnail: '/static/img/no-image-available.gif',
        image: '/static/img/carousel/Joe River Chickee.JPG'
      },
      {
        title: 'John Muir Shelter', 
        location: 'lorem ipsum dolor',
        hutLink: '',
        agency: {
          name: 'lorem ipsum dolor',
          url:  ''
        },
        thumbnail: '/static/img/no-image-available.gif',
        image: '/static/img/carousel/John Muir Shelter.JPG'
      }
    ];
    $scope.imgStyle = function(imgUrl) {
      return {
        'background-image': 'url(\'' + imgUrl + '\')'
      }
    };

    // pre-load images
    $scope.carouselInterval = -1;
    var imgsLoaded = [];
    angular.forEach($scope.slides, function(slide, index) {
      imgsLoaded.push($http.get(slide.image));
    });
    $q.all(imgsLoaded).then(function() { $scope.carouselInterval = 8000; });
  }]).

  controller('AlertCtrl', ['$scope', function($scope) {
    // Of the form { type: 'error/warning/info', msg: 'message' }
    $scope.alerts = [
    ];

    $scope.addAlert = function(type, msg) {
      $scope.alerts.push({type:type,msg:msg});
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  }]).

  controller('HutInfoCtrl', ['$scope', function($scope) {
    $scope.accuracy_tooltip = [
      'Coordinates provided, but unverifiable.',
      'Wild ass guess.',
      'Slightly better than a wild ass guess.',
      'Found structure on satellite or topo map.',
      'Surveyed with GPS by the Hutmap team.',
      'Found on a map and surveyed by the Hutmap team.'  
    ];
  }]).

  controller('HutImgCtrl', ['$scope', function($scope) {
    $scope.getImgUrl = function(hut, width, height) {
      var url = '';
      if (hut) {
        if (hut.photo_url) {
          url = hut.photo_url;
        } else if (!hut.photo_url && hut.accuracy === 3 || hut.accuracy === 5) {
          url = 'http://maps.googleapis.com/maps/api/staticmap' + 
                '?center=' + hut.location.coordinates[1] + '%2C' + hut.location.coordinates[0] +
                '&zoom=19' +
                '&size=' + width + 'x' + height +
                '&maptype=satellite' +
                '&sensor=false' +
                '&key=' + $scope.GOOGLE_API_KEY;
        } else {
          url = $scope.STATIC_URL + 'img/no-image-available.gif';
        }
      }
      return url;
    };

  }]);

})();
