'use strict';

(function () {
  angular.module('hutmap.controllers').

  controller('HutImgCtrl', ['$scope', function($scope) {
    // Retrieve proper url to hut image
    $scope.getImgUrl = function(hut, width, height) {
      var url = '';
      if (hut) {
        if (hut.photo) {
          url = hut.photo;
        }
        else if (hut.photo_url) {
          url = hut.photo_url;
        } else if (hut.show_satellite) {
          url = 'http://maps.googleapis.com/maps/api/staticmap' + 
                '?center=' + hut.location.coordinates[1] + '%2C' + hut.location.coordinates[0] +
                '&zoom=19' +
                '&size=' + width + 'x' + height +
                '&maptype=satellite' +
                '&sensor=false' +
                '&key=' + hutmap.GOOGLE_API_KEY;
        } else {
          url = hutmap.STATIC_URL + 'hutmap/img/no-image-available.gif';
        }
      }
      return url;
    };

  }]);

})();
