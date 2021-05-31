navigator.geolocation.getCurrentPosition(function (position) {
    const CurrentLatitude = position.coords.latitude;
    const CurrentLongitude = position.coords.longitude;

    const pos = [CurrentLatitude, CurrentLongitude];

    const map = L.map('map').setView(pos, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // L.marker(pos).addTo(map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();

    map.on('click', function (e) {
        const Onlatitude = e.latlng.lat;
        const Onlongitude = e.latlng.lng;
        L.marker([Onlatitude, Onlongitude])
            .addTo(map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
                ClassName: 'mapPoint'
            }))
            .setPopupContent('<p style="color: blue; font-size:0.8rem;">New Marker</p>')
            .openPopup();
    })
}, function () {
    alert('not found position');
});

