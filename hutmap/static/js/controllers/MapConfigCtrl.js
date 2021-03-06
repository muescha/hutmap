(function () {
'use strict';

  angular.module('hutmap.controllers').

  /*
   * This controller does configuration of the google map, as well as provides
   * functions which aren't really 'clean' enough to be in MapCtrl, i.e.
   * involve dom manipulation or calling into google.maps.
   */
  controller('MapConfigCtrl', 
    
    ['$scope', '$http', 'hutmapMapId', 'mapOptions',
    'markerOptions',

    function ($scope, $http, hutmapMapId, mapOptions,
      markerOptions) {

    var prevSelectedMarker;
    var prevIcon;

    $scope.mc = {
      hutmapMapId: hutmapMapId,
      mapOptions: mapOptions.main
    };

    // return proper google.maps.MapOptions for the given hut
    $scope.getMarkerOptions = function(hut) {
      var opts = {};
      if ($scope.h.filteredHuts && hut.id in $scope.h.filteredHutIds) {
        return angular.extend(opts, markerOptions.filteredHuts);
      } else {
        return angular.extend(opts, markerOptions.huts);
      }
    };

    // called when hut marker is clicked or hut is otherwise selected
    $scope.selectHut = function(marker, hut) {
      if (prevSelectedMarker) {
        var opts = angular.extend({}, markerOptions.huts, {icon: prevIcon});
        prevSelectedMarker.setOptions(opts);
      }
      prevSelectedMarker = marker;
      prevIcon = marker.getIcon();
      marker.setOptions(markerOptions.selected);
      $scope.h.selectedHut = hut;
      if (!$scope.mapPage.showHutSidebar) {
        $scope.mapPage.showHutSidebar = true;
      }
      $scope.mapPage.loadNewHuts = false;
    };
    
    // called when map is clicked
    $scope.deselectHut = function() {
      if (prevSelectedMarker) {
        var opts = angular.extend({}, markerOptions.huts, {icon: prevIcon});
        prevSelectedMarker.setOptions(opts);
        if ($scope.mapPage.showHutSidebar) {
          $scope.mapPage.showHutSidebar = false;
        }
      }
    };
    
  }]);
})();
