window.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* global google */

  const initMap = () => {
    // https://developers.google.com/maps/documentation/javascript/reference

    const mapElem = document.getElementById('gmap');
    const latElem = document.getElementById('latitude');
    const longElem = document.getElementById('longitude');

    const defaultLocation = new google.maps.LatLng(50.2976100, 18.6765800);

    const mapOptions = {
      // REQUIRED
      center: defaultLocation,
      zoom: 14,
      // OPTIONAL
      clickableIcons: false,
      disableDoubleClickZoom: true,
      draggable: true,
      draggableCursor: 'default',
      fullscreenControl: false,
      keyboardShortcuts: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.DEFAULT,
        style: google.maps.MapTypeControlStyle.DEFAULT
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      noClear: true,
      rotateControl: false,
      scaleControl: false,
      scrollwheel: false,
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.DEFAULT
      }
    };

    const map = new google.maps.Map(mapElem, mapOptions);

    const marker = new google.maps.Marker({
      position: defaultLocation,
      animation: google.maps.Animation.BOUNCE,
      clickable: false,
      map
    });


    const displayLocation = (loc) => {
      // 7 decimal places gives a position to about 11 millimeters
      // 6 decimal places gives a position to about 11 centimeters
      latElem.textContent = loc.lat().toFixed(7);
      longElem.textContent = loc.lng().toFixed(7);
    };


    const resetLocation = (evt) => {
      evt.stopPropagation();
      map.setCenter(defaultLocation);
      marker.setPosition(defaultLocation);
      displayLocation(defaultLocation);
    };


    const centerLocation = (evt) => {
      evt.stopPropagation();
      map.setCenter(marker.position);
    };


    const toggleColor = (evt) => {
      evt.stopPropagation();
      mapElem.classList.toggle('monochrome');
    };


    // Add map control buttons
    (() => {

      const createMapControlButton = (args) => {

        const [index, title, text] = args;
        const btn = document.createElement('div');

        btn.role = 'button';
        btn.title = title;
        btn.classList.add('gmap-control-btn');
        btn.textContent = text;
        btn.index = index;

        return btn;
      };


      const buttons = [
        [1, 'Toggle color/monochromatic map', 'Color'],
        [2, 'Return to default location', 'Reset loc.'],
        [3, 'Center map to marker position', 'Center pos.']
      ].map(createMapControlButton);

      // Numeric key must match index attribute of the corresponding button
      const handlers = {
        1: toggleColor,
        2: resetLocation,
        3: centerLocation
      };

      const options = {
        capture: false,
        once: false,
        passive: true
      };

      for (const btn of buttons) {
        btn.addEventListener('click', handlers[btn.index], options);
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(btn);
      }

    })();


    // Move map marker to a click position
    google.maps.event.addListener(map, 'click', (evt) => {
      marker.setPosition(evt.latLng);
      displayLocation(evt.latLng);
    });

    displayLocation(defaultLocation);
  };


  google.maps.event.addDomListener(window, 'load', initMap);
}, {
  capture: false,
  once: true,
  passive: true
});
