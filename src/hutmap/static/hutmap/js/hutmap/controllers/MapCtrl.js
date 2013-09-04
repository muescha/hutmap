'use strict';

(function () {
  angular.module('hutmap.controllers').

  controller('MapCtrl',
    ['$scope', '$location', '$timeout', '$q', 'utils', 'MarkerTooltip',

    function ($scope, $location, $timeout, $q, utils, MarkerTooltip) {

    var scopeInitialized = $q.defer(); // for proper ordering of events
    var hutsInitialized = $q.defer();  // for proper ordering of events
    var markerTooltips = {}; // map from lat lon to MarkerTooltip instance, lazy loaded

    $scope.m = {
      center: null,          // google.maps.LatLng
      zoom: null,            // integer
      bounds: null,          // google.maps.LatLngBounds
      mapTypeId: null,       // google.maps.MapTypeId
      hutMarkerEvents: null, // see http://dylanfprice.github.io/angular-gm/docs/module-gmMarkers.html
    };

    // simulate a click on the selected hut
    var clickSelected = function() {
      $q.all([scopeInitialized.promise, hutsInitialized.promise]).then(function() {
        if ($scope.h.selectedHut) {
          $scope.m.hutMarkerEvents = [{
            event: 'click',
            locations: [utils.latLngFromHut($scope.h.selectedHut)]
          }];
        }
      });
    };

    $scope.$watch('m.center != null && m.zoom != null', function(v) { if (v) scopeInitialized.resolve(); });
    $scope.$watch('h.huts != null', function(v) { if (v) hutsInitialized.resolve(); });
    $scope.$watch('m.bounds', function(bounds) {
      if (bounds && $scope.ui.loadNewHuts) {
        $scope.h.query = { bounds: bounds };
      }
    });

    $scope.$on('gmMarkersUpdated', function(event, objects) {
      if (objects === 'h.huts') {
        clickSelected();
      }
    });

    $scope.$on('clickSelected', function() {
      clickSelected();
    });

    $scope.showMarkerTooltip = function(marker, hut) {
      var tooltip = markerTooltips[marker.getPosition().toUrlValue()];
      if (tooltip) {
        tooltip.show();
      } else {
        var tooltip = new MarkerTooltip({
          marker: marker,
          content: hut.name,
        });
        markerTooltips[marker.getPosition().toUrlValue()] = tooltip;
      }
    };

    $scope.hideMarkerTooltip = function(marker, hut) {
      angular.forEach(markerTooltips, function(tooltip) {
        tooltip.hide();
      });
    };
 
    // update browser url from scope
    $scope.$on('updateLocation', function() {
      if ($scope.m.center) {
        $location.search('m_center', $scope.m.center.toUrlValue());
      }
      if ($scope.m.zoom) {
        $location.search('m_zoom', $scope.m.zoom);
      }
      if ($scope.m.mapTypeId) {
        $location.search('m_maptypeid', $scope.m.mapTypeId);
      }
    });

    // update scope from browser url
    var updateScope = function() {
      // get values
      var center = $location.search().m_center;
      var zoom = $location.search().m_zoom;
      var bounds = $location.search().m_bounds;
      var mapTypeId = $location.search().m_maptypeid;
      
      // clear values
      $location.search('m_center', null);
      $location.search('m_zoom', null);
      $location.search('m_bounds', null);
      $location.search('m_maptypeid', null);

      scopeInitialized.promise.then(function() {
        var hasBounds = bounds != null;
        if (!hasBounds && center != null) {
          $scope.m.center = utils.latLngFromUrlValue(center);
        }
        if (!hasBounds && zoom != null) {
          $scope.m.zoom = Number(zoom);
        }
        if (hasBounds) {
          $scope.m.bounds = utils.boundsFromUrlValue(bounds);
        }
        var hasMapTypeId = mapTypeId != null;
        if (hasMapTypeId) {
          $scope.m.mapTypeId = mapTypeId;
        }
      });
    };

    // we update scope from browser url once, at beginning
    updateScope();

  }]);
})();
