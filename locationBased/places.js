// getting places from APIs
function loadPlaces(position) {
    const params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'CIXFGOPQXES1ZKKMRCX3LPY3VF0HGW3EYHKXFPAD0CVWAJXV',
        clientSecret: 'PNXETS3CCNWWL0XDKLOJW2ARZQCRLCQ1EKCKMBGLFP1EREAN',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API (limit param: number of maximum places to fetch)
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=30 
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};


window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {

        // than use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => {
                places.forEach((place) => {
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;

                    // add place model
                    const placeModel = document.createElement('a-entity');
                    placeModel.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    placeModel.setAttribute('gltf-model', "./assets/yashagaike.gltf");
                    placeModel.setAttribute('rotation', '0 180 0');
                    placeModel.setAttribute('scale', '0.15 0.15 0.15');
                    
                    placeModel.addEventListener('loaded', () => {
                        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    });

                    scene.appendChild(placeModel);
                });
            })
    },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};