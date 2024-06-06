import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
// const MAPTILER_KEY = "KydZlIiVFdYDFFfQ4QYq"

const supabaseUrl = 'https://baaspecsqpmgittvdian.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYXNwZWNzcXBtZ2l0dHZkaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUxNzE5NTEsImV4cCI6MjAyMDc0Nzk1MX0.yvkgXVATqe79CSZnKPWWIN83pHM3-Q5buZJrao5BCsc';
const supabase = createClient(supabaseUrl, supabaseKey);

const markers = {}
async function fetchData() {
	const { data, error } = await supabase.from('solidaritymap').select();
	if (error) {
		console.error(error);
	} else {
		data.forEach(item => {
			addMarker(item);
		});
	}
}

function updatePanel(item, removeId = null) {
    // Get the 'View' tab
    let viewTab = document.getElementById('View');

    // Create a new table if it doesn't exist
    let table = viewTab.querySelector('table');
    if (!table) {
        table = document.createElement('table');
        viewTab.appendChild(table);

        if (removeId) {
            // Remove the row for the marker with removeId
            let row = table.querySelector(`tr[data-id="${removeId}"]`);
            if (row) row.remove();
        } else {
            // Add table headers
            let thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Zoom</th>
                </tr>
            `;
            table.appendChild(thead);
        }
    }

    // Create a new row for this item
    let tr = document.createElement('tr');

    // Create a structured HTML layout for the item
    tr.innerHTML = `
        <td>${item.name || ''}</td>
        <td>${item.description || ''}</td>
        <td>${item.lat || ''}</td>
        <td>${item.lng || ''}</td>
        <td><button class="zoom-marker"><i class="fas fa-search-plus"></i></button></td>
    `;

    // Add the new row to the table
    table.appendChild(tr);

    // Add event listener to the table for Zoom to Marker button
    table.addEventListener('click', function(event) {
        let target = event.target;
        // Check if the clicked element or its parent is a zoom button
        while (target != this) {
            if (target.className == 'zoom-marker' || target.parentNode.className == 'zoom-marker') {
                zoomToMarker(item.id);
                return;
            }
            target = target.parentNode;
        }
    });
}

function zoomToMarker(id) {
	// Get the marker
	let marker = markers[id];
	// Check if the marker exists
	if (!marker) {
		console.error('Marker not found:', id);
		return;
	}

	// Get the marker's position
	let position = marker.getLngLat();

	// Set the map's view to the marker's position with a zoom level of 13
	map.flyTo({center: [position.lng, position.lat], zoom: 13});
}
fetchData();
const MAPTILER_KEY = 'z37jJYOIqWw3eBn8jUWN';
const map = new maplibregl.Map({
	style: `https://api.maptiler.com/maps/positron/style.json?key=${MAPTILER_KEY}`,

	center: [-118.25133692966446, 34.00095151499077],
    zoom: 2,
    pitch: 10,
    bearing: 0,
    container: 'map',
    antialias: true
});

// Add a click event to the map
map.on('click', (event) => {
    // Get the latitude and longitude of the clicked location
    const { lng, lat } = event.lngLat;

    // Find the form fields for longitude and latitude
    const longitudeField = document.querySelector('#longitude');
    const latitudeField = document.querySelector('#latitude');

    // Set the value of the form fields to the clicked location's coordinates
    longitudeField.value = lng;
    latitudeField.value = lat;
});
// The 'building' layer in the streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', () => {
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    map.loadImage('/icons/tent.png', function(error, image) {
        if (error) throw error;
        map.addImage('tent', image);
    });
	map.loadImage('/icons/peoples.png', function(error, image) {
		if (error) throw error;
		map.addImage('peoples', image);
	});
    map.addSource('openmaptiles', {
        url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
        type: 'vector',
    });

    map.addLayer(
        {
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
                ],
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    16,
                    ['get', 'render_height']
                ],
                'fill-extrusion-base': ['case',
                    ['>=', ['get', 'zoom'], 16],
                    ['get', 'render_min_height'], 0
                ]
            }
        },
        labelLayerId
    );
});


// Listen for the zoom event on the map

// Get the current hour
const currentHour = new Date().getHours();

// Define the light settings for day and night
const dayLight = {
    'light': {
        'anchor': 'viewport',
        'color': 'white',
        'intensity': 0.6
    }
};

const nightLight = {
    'light': {
        'anchor': 'viewport',
        'color': 'blue',
        'intensity': 0.3
    }
};

function init(){
	subscribeToTableChanges()
	console.log('subscribed to table changes')
}
init()

function addMarker(item) {
    const popupElement = document.createElement('div');
	popupElement.innerHTML = `
		<h3>${item.name}</h3>
		${item.start_date && item.start_date !== '<NA>' ? `<p>Start Date: ${item.start_date}</p>` : ''}
		${item.status && item.status !== '<NA>' ? `<p>Status: ${item.status}</p>` : ''}
		${item.category && item.category !== '<NA>' ? `<p>Category: ${item.category}</p>` : ''}
		${item.police_violence_status && item.police_violence_status !== '<NA>' ? `<p>Police Violence Status: ${item.police_violence_status}</p>` : ''}
		${item.number_of_arrests && item.number_of_arrests !== '<NA>' ? `<p>Number of Arrests: ${item.number_of_arrests}</p>` : ''}
		<img src="${item.image_url !== '<NA>' ? item.image_url : '/images/default.png'}" onerror="this.onerror=null; this.src='/images/default.png';" />

	`;


    const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupElement);

    // Create a custom marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'marker';
	markerElement.style.fontSize = '30px';  // adjust size as needed
	markerElement.textContent = item.category === 'Encampment' ? '🏕️' : '🇵🇸';

	const marker = new maplibregl.Marker(markerElement)
        .setLngLat(item.location_geometry.coordinates)
        .setPopup(popup)
        .addTo(map);

    markers[item.id] = marker;
    updatePanel(item);
}


function subscribeToTableChanges() {
	const subscription = supabase
		.channel('custom-all-channel')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'test' },
			(payload) => {
				switch (payload.eventType) {
					case 'INSERT':
						addMarker(payload.new);
						break;
					case 'UPDATE':
						const updatedMarker = markers[payload.new.id];
						if (updatedMarker) {
							updatedMarker.setLngLat(payload.new.location.coordinates);
							const popupContent = updatedMarker.getPopup().getElement();
							popupContent.querySelector('h3').textContent = payload.new.name;
							popupContent.querySelector('p').textContent = payload.new.details;
							popupContent.querySelector('.edit-marker').dataset.id = payload.new.id;
							popupContent.querySelector('.delete-marker').dataset.id = payload.new.id;
						}
						updatePanel(payload.new);
						break;
					case 'DELETE':
						const deletedMarker = markers[payload.old.id];
						if (deletedMarker) {
							deletedMarker.remove();
							delete markers[payload.old.id];
						}
						updatePanel(null, payload.old.id);
						break;
				}
			}
		)
		.subscribe();
}


document.addEventListener('DOMContentLoaded', (event) => {
	// Add geolocate control to the map

    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].addEventListener('click', function(event) {
            openTab(event, this.textContent);
        });
    }
});
