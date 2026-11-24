var wms_layers = [];
var baseLayer = new ol.layer.Group({
    'title': '',
    layers: [
new ol.layer.Tile({
    'title': 'OSM DE',
    'type': 'base',
    source: new ol.source.XYZ({
        url: 'http://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
        attributions: [new ol.Attribution({html: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'})]
    })
})
]
});
var format_KotaSemarang_0 = new ol.format.GeoJSON();
var features_KotaSemarang_0 = format_KotaSemarang_0.readFeatures(json_KotaSemarang_0, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_KotaSemarang_0 = new ol.source.Vector({
    attributions: [new ol.Attribution({html: '<a href=""></a>'})],
});
jsonSource_KotaSemarang_0.addFeatures(features_KotaSemarang_0);var lyr_KotaSemarang_0 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_KotaSemarang_0, 
                style: style_KotaSemarang_0,
    title: 'Kota Semarang<br />\
    <img src="styles/legend/KotaSemarang_0_0.png" />  10 - 30 (Baik)<br />\
    <img src="styles/legend/KotaSemarang_0_1.png" />  30 - 50 (Sedang)<br />\
    <img src="styles/legend/KotaSemarang_0_2.png" />  50 - 98 (Buruk)<br />'
        });

lyr_KotaSemarang_0.setVisible(true);
var layersList = [baseLayer,lyr_KotaSemarang_0];
lyr_KotaSemarang_0.set('fieldAliases', {'Kecamatan': 'Kecamatan', 'kendaraan': 'kendaraan', 'Kualitas': 'Kualitas', });
lyr_KotaSemarang_0.set('fieldImages', {'Kecamatan': 'TextEdit', 'kendaraan': 'TextEdit', 'Kualitas': 'TextEdit', });
lyr_KotaSemarang_0.set('fieldLabels', {'Kecamatan': 'inline label', 'kendaraan': 'inline label', 'Kualitas': 'inline label', });
lyr_KotaSemarang_0.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});