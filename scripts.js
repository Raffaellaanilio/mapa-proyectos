const map = new maplibregl.Map({
    container: "map",
    style:
        "https://api.maptiler.com/maps/basic-v2/style.json?key=LURvXrlYSjugh8dlAFR3",
    center: [-73, -42],
    minZoom: 2, // Establece el zoom máximo permitido
    maxZoom: 18, // Establece el zoom máximo permitido
    zoom: 6,
    pitch: 0, // Configuración del ángulo de inclinación (establecer en 0 para desactivar la inclinación)
    bearing: 0,
});


// Desactivar la función de inclinación
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

// Puedes también ocultar el control de navegación de norte
map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

/* map.addControl(new maplibregl.FullscreenControl()); */

function locateUser() {
    // Obtener la ubicación del usuario
    navigator.geolocation.getCurrentPosition(function (position) {
        const userLocation = [position.coords.longitude, position.coords.latitude];

        // Centrar el mapa en la ubicación del usuario
        map.flyTo({
            center: userLocation,
            zoom: 17
        });

        // Añadir un marcador en la ubicación del usuario
        new maplibregl.Marker()
            .setLngLat(userLocation)
            .addTo(map);
    }, function (error) {
        console.error('Error al obtener la ubicación', error);
        alert("Error al obtener tu ubicación. Habilita los permisos de ubicación para poder continuar.")
    });
}

//Esta funcion se usa para id=#flecha.
function togglePanel() {
    var panel = document.getElementById("contadores-container");
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
    console.log("togglePanel OK");
}


map.on('load', () => {
    // Agregar la fuente de datos WFS
    map.addSource('proyectos-source', {
        type: 'geojson',
        cluster: false,
        data: 'https://geoportal.cepal.org/geoserver/geonode/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geonode%3APuntos_Final&outputFormat=application%2Fjson',
    });

    // Intenta cargar la imagen directamente
    map.loadImage('/images/location.png', (error, image) => {
        if (error) {
            // Si hay un error, carga una imagen de respaldo o maneja el error según tus necesidades
            map.loadImage('/images/location.png', (backupError, backupImage) => {
                if (backupError) throw backupError;

                map.addImage('circle-15', backupImage);
            });
        } else {
            // Si la carga de la imagen tiene éxito, agrégala como 'circle-15'
            map.addImage('circle-15', image);
        }

        // Agregar la capa de puntos al mapa como símbolos
        map.addLayer({
            id: 'proyectos-layer',
            type: 'symbol',
            source: 'proyectos-source',
            layout: {
                'icon-image': 'circle-15',
                'icon-allow-overlap': true,
                'icon-size': 1,
   /*            'text-field': ['get', 'NOMBRE_SIT'],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-anchor': 'top',
                'text-allow-overlap': false,  */

            },
           
        });
    });

    // Actualizar el contenido del elemento con id 'nacional'
    document.getElementById('nacional').innerHTML = `<center>Total Nacional <br><b>83 proyectos</b></center>`;

});
    
/* 
    // Función para obtener el conteo total de features /////////////////////////// NO FUNCIONA
    function obtenerConteoTotal() {
        const features = map.getSource('proyectos-source').getFeatures();
        return features.length;
    }

    // Obtener el conteo total de features y actualizar el contenido del div
    const conteoNacional = obtenerConteoTotal();
    console.log(conteoNacional); */



// Evento 'moveend' para actualizar la información al mover el mapa
map.on('moveend', function () {
    // Obtén las features en la vista actual
    const features = map.queryRenderedFeatures({ layers: ['proyectos-layer'] });
  
    // Construye la tabla con la información de todas las geometrías en la vista actual
    let content = `<h4><i>Proyectos</h4></i>`;
  
    features.forEach((feature, index) => {
        const nombre = feature.properties.Nombre_Pro;
        const titular = feature.properties.Titular;
        const tipo = feature.properties.Publico_Pr;
        const sector = feature.properties.Sector;
        const region = feature.properties.REGION;
        const comuna = feature.properties.COMUNA;
        const provincia = feature.properties.PROVINCIA;
        const monto = feature.properties.Monto;
        const empleosConstruccion = feature.properties.Empleos_Co;
        const empleosOperacional = feature.properties.Empleos_Op;
        const estado = feature.properties.Estado;
        const nudo = feature.properties.nudo_crit;
        const descripcion = feature.properties.DESCRIPCION;
        const superficie = feature.properties.SUPERFICIE;

    
        content += `
            <div class="card ficha" onclick="centrarMapa(${index})">
                <p style="font-weight:bold;font-size:x-large">${nombre}</p>
                <p style="color: grey;font-style:italic">Comuna de ${comuna}, provincia de ${provincia},región de ${region}</p>
                <p style="color: grey;font-style:italic">${tipo}</p>
                <p>Titular: ${titular}</p>
                <p>Sector: ${sector}</p>
                <p>Estado: ${estado}</p>
                <p>Nudo crítico: ${nudo}</p>
                <p>Monto financiamiento $: ${monto} MM</p>
                <p>Generación de empleos en etapa de construcción: ${empleosConstruccion}</p>
                <p>Generación de empleos en etapa operacional: ${empleosOperacional}</p>
                <p>Superficie en hectáreas: ${superficie}</p>
            </div>
        `;
  
        // Puedes agregar más información aquí según tus necesidades
    });
  
    // Actualiza el contenido de la caja flotante
    document.getElementById('panel').innerHTML = content;
    document.getElementById('bottom-panel').innerHTML = content;
});

// Función para centrar el mapa en la feature seleccionada
function centrarMapa(index) {
    const feature = map.querySourceFeatures('proyectos-source')[index];

    if (feature) {
        const coordinates = feature.geometry.coordinates;
        // Centra el mapa en las coordenadas de la feature seleccionada
        map.flyTo({
            center: coordinates,
            zoom: 17, // Puedes ajustar el nivel de zoom según tus necesidades
        });
    }
}


// Función para centrar el mapa en la feature seleccionada
function centrarMapa(index) {
    const feature = map.querySourceFeatures('proyectos-source')[index];

    if (feature) {
        const coordinates = feature.geometry.coordinates;
        // Centra el mapa en las coordenadas de la feature seleccionada
        map.flyTo({
            center: coordinates,
            zoom: 14, // Puedes ajustar el nivel de zoom según tus necesidades
        });
    }
}

// Evento de clic en la capa de puntos
map.on('click', 'proyectos-layer', function (e) {
    // Obtén las coordenadas de la feature clicada
    const coordinates = e.features[0].geometry.coordinates;

    // Centra el mapa en las coordenadas de la feature clicada
    map.flyTo({
        center: coordinates,
        zoom: 17, // Puedes ajustar el nivel de zoom según tus necesidades
    });
});

// Cambia el cursor al pasar sobre las features
map.on('mouseenter', 'proyectos-layer', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Restaura el cursor al salir de las features
map.on('mouseleave', 'proyectos-layer', function () {
    map.getCanvas().style.cursor = '';
});

map.fire('moveend');
    // Actualizar contador al mover el mapa
    map.on('moveend', function () {
        const features = map.queryRenderedFeatures({ layers: ['proyectos-layer'] });
        const vistaActual = features.length;
        // Actualizar el contenido del div con el contador
        document.getElementById('extent').innerHTML = `<center>Vista actual <br><b>${vistaActual}</b></center>`;

    }); 

// Array de objetos para las opciones de la lista desplegable de la región ////ARREGLAR CODIGOS ******
var regionOptions = [
    {  value: "15",label: "Arica y Parinacota", center: [-70.3026, -18.4783],   zoom: 8, },
    { value: "01", label: "Tarapacá", center: [-69.3269, -19.9239], zoom: 7 },
    { value: "02", label: "Antofagasta", center: [-68.9554, -23.4226], zoom: 7 },
    { value: "03", label: "Atacama", center: [-70.9834, -27.4975], zoom: 7 },
    { value: "04", label: "Coquimbo", center: [-71.3375, -29.9711], zoom: 7 },
    { value: "05", label: "Valparaíso", center: [-71.6251, -32.7781], zoom: 8 },
    { value: "13", label: "Metropolitana", center: [-70.6058, -33.4378],zoom: 8,},
    { value: "06", label: "OHiggins", center: [-70.7152, -34.6354], zoom: 8 },
    { value: "07", label: "Maule", center: [-71.5744, -35.6654], zoom: 8 },
    { value: "16", label: "Ñuble", center: [-71.5374, -36.4966], zoom: 8 },
    { value: "08", label: "Biobío", center: [-72.2426, -37.4468], zoom: 8 },
    { value: "09", label: "La Araucanía", center: [-71.9996, -38.9489], zoom: 8 },
    { value: "14", label: "Los Ríos", center: [-72.1652, -39.6465], zoom: 8 },
    { value: "10", label: "Los Lagos", center: [-72.3147, -41.7492], zoom: 8 },
    { value: "11", label: "Aysén", center: [-73.2475, -45.9751], zoom: 6 },
    { value: "12", label: "Magallanes", center: [-73.0802, -52.8191], zoom: 6 },
];

// Array de objetos para las opciones de la lista desplegable de la región
var comunaOptions = [
    {
        cut_reg: "06",
        value: "06117",
        region: "Libertador General Bernardo Ohiggins",
        label: "San Vicente",
        center: [-71.115331125859001, -34.460149342504899],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06116",
        region: "Libertador General Bernardo Ohiggins",
        label: "Requínoa",
        center: [-70.665382524015271, -34.331725888899527],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06104",
        region: "Libertador General Bernardo Ohiggins",
        label: "Coltauco",
        center: [-71.06049752001411, -34.265451867187053],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12201",
        region: "Magallanes y de la Antártica Chilena",
        label: "Cabo de Hornos",
        center: [-69.657739623956715, -55.132924941147778],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05301",
        region: "Valparaíso",
        label: "Los Andes",
        center: [-70.361945281349179, -32.914594102674378],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06103",
        region: "Libertador General Bernardo Ohiggins",
        label: "Coinco",
        center: [-70.967189090176262, -34.271701979481932],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06102",
        region: "Libertador General Bernardo Ohiggins",
        label: "Codegua",
        center: [-70.547635098815022, -34.046115143802567],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07109",
        region: "Maule",
        label: "San Clemente",
        center: [-70.791272165288831, -35.704686887127401],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06101",
        region: "Libertador General Bernardo Ohiggins",
        label: "Rancagua",
        center: [-70.786037029914866, -34.132096820832174],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07108",
        region: "Maule",
        label: "Río Claro",
        center: [-71.268491863091782, -35.276744803612473],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07107",
        region: "Maule",
        label: "Pencahue",
        center: [-71.796873390173772, -35.316845302354587],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07106",
        region: "Maule",
        label: "Pelarco",
        center: [-71.342352373368058, -35.378557758666865],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09209",
        region: "La Araucanía",
        label: "Renaico",
        center: [-72.580645811481332, -37.712416904512757],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09208",
        region: "La Araucanía",
        label: "Purén",
        center: [-73.04194092810431, -37.992834080039891],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09118",
        region: "La Araucanía",
        label: "Toltén",
        center: [-73.057924464229387, -39.230829225143736],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09117",
        region: "La Araucanía",
        label: "Teodoro Schmidt",
        center: [-73.172602970356294, -39.023784192452027],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09207",
        region: "La Araucanía",
        label: "Lumaco",
        center: [-73.046738635871165, -38.330682449966964],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09116",
        region: "La Araucanía",
        label: "Saavedra",
        center: [-73.283441744317159, -38.857185586940155],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09115",
        region: "La Araucanía",
        label: "Pucón",
        center: [-71.768712516246538, -39.267848966146154],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09113",
        region: "La Araucanía",
        label: "Perquenco",
        center: [-72.466109039791945, -38.420455362401782],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09112",
        region: "La Araucanía",
        label: "Padre Las Casas",
        center: [-72.499501384340789, -38.815169347003582],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09111",
        region: "La Araucanía",
        label: "Nueva Imperial",
        center: [-72.995163448824087, -38.723720670332931],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09110",
        region: "La Araucanía",
        label: "Melipeuco",
        center: [-71.621727058050212, -38.837551957329737],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06109",
        region: "Libertador General Bernardo Ohiggins",
        label: "Malloa",
        center: [-70.908406678921395, -34.455196476091665],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06108",
        region: "Libertador General Bernardo Ohiggins",
        label: "Machalí",
        center: [-70.323527692159161, -34.350464286513301],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06107",
        region: "Libertador General Bernardo Ohiggins",
        label: "Las Cabras",
        center: [-71.309546731766815, -34.143375861341717],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05304",
        region: "Valparaíso",
        label: "San Esteban",
        center: [-70.376337359973036, -32.723930176474994],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06106",
        region: "Libertador General Bernardo Ohiggins",
        label: "Graneros",
        center: [-70.738395824071361, -34.078704930561763],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06105",
        region: "Libertador General Bernardo Ohiggins",
        label: "Doñihue",
        center: [-70.931977974761438, -34.214366123358694],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05303",
        region: "Valparaíso",
        label: "Rinconada",
        center: [-70.70910874900818, -32.884755852456124],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05302",
        region: "Valparaíso",
        label: "Calle Larga",
        center: [-70.554148442664413, -32.951936183391553],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10208",
        region: "Los Lagos",
        label: "Quellón",
        center: [-74.015232601029922, -43.278220630487105],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10207",
        region: "Los Lagos",
        label: "Queilén",
        center: [-73.564950312935181, -42.880006930483553],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10206",
        region: "Los Lagos",
        label: "Puqueldón",
        center: [-73.631527211404162, -42.634047532053827],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16301",
        region: "Ñuble",
        label: "San Carlos",
        center: [-72.042627094608193, -36.393733081576173],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10205",
        region: "Los Lagos",
        label: "Dalcahue",
        center: [-73.737849568060341, -42.321071809334491],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09119",
        region: "La Araucanía",
        label: "Vilcún",
        center: [-72.203365005423763, -38.733144114482371],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10204",
        region: "Los Lagos",
        label: "Curaco de Vélez",
        center: [-73.585414509043275, -42.425011093453527],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10203",
        region: "Los Lagos",
        label: "Chonchi",
        center: [-73.973152046708165, -42.716900809880066],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09107",
        region: "La Araucanía",
        label: "Gorbea",
        center: [-72.713107573321906, -39.170180920075801],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09106",
        region: "La Araucanía",
        label: "Galvarino",
        center: [-72.789954230135237, -38.447061521449974],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10202",
        region: "Los Lagos",
        label: "Ancud",
        center: [-73.893389324853558, -41.975788290760029],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09105",
        region: "La Araucanía",
        label: "Freire",
        center: [-72.571764403073956, -38.925553103035391],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10201",
        region: "Los Lagos",
        label: "Castro",
        center: [-73.719163642549006, -42.477007792849037],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09104",
        region: "La Araucanía",
        label: "Curarrehue",
        center: [-71.542402466748769, -39.330385275346515],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09103",
        region: "La Araucanía",
        label: "Cunco",
        center: [-72.009154131358159, -38.940500728043922],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09102",
        region: "La Araucanía",
        label: "Carahue",
        center: [-73.252132631513135, -38.547042626777518],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09101",
        region: "La Araucanía",
        label: "Temuco",
        center: [-72.665048981205715, -38.65827012399437],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02203",
        region: "Antofagasta",
        label: "San Pedro de Atacama",
        center: [-68.208267949106855, -22.885701830670353],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02202",
        region: "Antofagasta",
        label: "Ollagüe",
        center: [-68.234473229812849, -21.431375357960661],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02201",
        region: "Antofagasta",
        label: "Calama",
        center: [-68.308330443002035, -22.554956374907263],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11303",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Tortel",
        center: [-74.710154932020131, -47.976760569078301],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14204",
        region: "Los Ríos",
        label: "Río Bueno",
        center: [-72.509405243899593, -40.469052594401305],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11302",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Ohiggins",
        center: [-72.680314373023151, -48.299873534070237],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14203",
        region: "Los Ríos",
        label: "Lago Ranco",
        center: [-72.30552027069271, -40.372532806313643],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14202",
        region: "Los Ríos",
        label: "Futrono",
        center: [-72.163095603588118, -40.080988200189637],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11301",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Cochrane",
        center: [-72.616998605840763, -47.335435320532554],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14201",
        region: "Los Ríos",
        label: "La Unión",
        center: [-73.238661479830498, -40.155801183984245],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16305",
        region: "Ñuble",
        label: "San Nicolás",
        center: [-72.254867160388912, -36.477647708885186],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16304",
        region: "Ñuble",
        label: "San Fabián",
        center: [-71.290588754680272, -36.608124763493365],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16303",
        region: "Ñuble",
        label: "Ñiquén",
        center: [-71.938459559763885, -36.272263959387153],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16302",
        region: "Ñuble",
        label: "Coihueco",
        center: [-71.558023724936632, -36.737609463815133],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09109",
        region: "La Araucanía",
        label: "Loncoche",
        center: [-72.541819272821158, -39.362728497131691],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09108",
        region: "La Araucanía",
        label: "Lautaro",
        center: [-72.271701198907877, -38.544027984867334],
        zoom: 10,
    },
    {
        cut_reg: "15",
        value: "15102",
        region: "Arica y Parinacota",
        label: "Camarones",
        center: [-69.891028715180738, -19.032613738879352],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12303",
        region: "Magallanes y de la Antártica Chilena",
        label: "Timaukel",
        center: [-69.892334938804609, -54.403573994258679],
        zoom: 10,
    },
    {
        cut_reg: "15",
        value: "15101",
        region: "Arica y Parinacota",
        label: "Arica",
        center: [-70.125571095595774, -18.50927526137302],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12302",
        region: "Magallanes y de la Antártica Chilena",
        label: "Primavera",
        center: [-69.417646930442586, -52.630657407606371],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07402",
        region: "Maule",
        label: "Colbún",
        center: [-71.013159488101081, -36.055509317782239],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07401",
        region: "Maule",
        label: "Linares",
        center: [-71.314665727677138, -35.958303805239574],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10109",
        region: "Los Lagos",
        label: "Puerto Varas",
        center: [-72.598085522000062, -41.265596375158829],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16202",
        region: "Ñuble",
        label: "Cobquecura",
        center: [-72.715469091695468, -36.167306393299285],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10107",
        region: "Los Lagos",
        label: "Llanquihue",
        center: [-73.216086784934873, -41.219813698697052],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16201",
        region: "Ñuble",
        label: "Quirihue",
        center: [-72.553585656460783, -36.226388383155779],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10106",
        region: "Los Lagos",
        label: "Los Muermos",
        center: [-73.634932850032783, -41.377825282458467],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10105",
        region: "Los Lagos",
        label: "Frutillar",
        center: [-73.235831134511542, -41.047627677341929],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10104",
        region: "Los Lagos",
        label: "Fresia",
        center: [-73.623748281158427, -41.147333140223338],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10103",
        region: "Los Lagos",
        label: "Cochamó",
        center: [-72.326960985573947, -41.716714112752065],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05405",
        region: "Valparaíso",
        label: "Zapallar",
        center: [-71.391317631095546, -32.597097096345024],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05404",
        region: "Valparaíso",
        label: "Petorca",
        center: [-70.878896866009057, -32.219687818031339],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05403",
        region: "Valparaíso",
        label: "Papudo",
        center: [-71.395156965871607, -32.472402305214473],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07408",
        region: "Maule",
        label: "Yerbas Buenas",
        center: [-71.571913941493264, -35.720929979591439],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05402",
        region: "Valparaíso",
        label: "Cabildo",
        center: [-70.854736122674424, -32.421659669520317],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07407",
        region: "Maule",
        label: "Villa Alegre",
        center: [-71.698058960360868, -35.709276075671319],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07406",
        region: "Maule",
        label: "San Javier",
        center: [-71.916670735975345, -35.67941823498532],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05401",
        region: "Valparaíso",
        label: "La Ligua",
        center: [-71.276034035136007, -32.373147183371032],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07405",
        region: "Maule",
        label: "Retiro",
        center: [-71.841019338833007, -36.036764702371983],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07404",
        region: "Maule",
        label: "Parral",
        center: [-71.691930642305636, -36.236209652639218],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07403",
        region: "Maule",
        label: "Longaví",
        center: [-71.42184461529132, -36.106538512603841],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16207",
        region: "Ñuble",
        label: "Treguaco",
        center: [-72.668151878207681, -36.405574026439609],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16206",
        region: "Ñuble",
        label: "Ranquil",
        center: [-72.597026824560317, -36.663099206376565],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16205",
        region: "Ñuble",
        label: "Portezuelo",
        center: [-72.454869190234518, -36.534649795616254],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16204",
        region: "Ñuble",
        label: "Ninhue",
        center: [-72.390007834776299, -36.352116615392781],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16203",
        region: "Ñuble",
        label: "Coelemu",
        center: [-72.777901705132876, -36.514464776434977],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02302",
        region: "Antofagasta",
        label: "María Elena",
        center: [-69.759977353515126, -21.971907907892771],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02301",
        region: "Antofagasta",
        label: "Tocopilla",
        center: [-70.152464055590087, -22.047794450438612],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04305",
        region: "Coquimbo",
        label: "Río Hurtado",
        center: [-70.600831233334986, -30.449996230877257],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04304",
        region: "Coquimbo",
        label: "Punitaqui",
        center: [-71.309979987947088, -30.908417213203109],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04303",
        region: "Coquimbo",
        label: "Monte Patria",
        center: [-70.642023910595157, -30.881872992297161],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04302",
        region: "Coquimbo",
        label: "Combarbalá",
        center: [-70.953152237192668, -31.14284260429751],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04301",
        region: "Coquimbo",
        label: "Ovalle",
        center: [-71.544731286310096, -30.743615619498392],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11402",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Río Ibáñez",
        center: [-72.525083492128587, -46.21869878960959],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11401",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Chile Chico",
        center: [-72.51276203014055, -46.829184713262983],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08106",
        region: "Biobío",
        label: "Lota",
        center: [-73.124169601072694, -37.120023939527265],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08105",
        region: "Biobío",
        label: "Hualqui",
        center: [-72.824751125165776, -37.024807702416147],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08104",
        region: "Biobío",
        label: "Florida",
        center: [-72.705685543441632, -36.798705583339355],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08103",
        region: "Biobío",
        label: "Chiguayante",
        center: [-72.988489099161868, -36.897813239531089],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08101",
        region: "Biobío",
        label: "Concepción",
        center: [-72.957147812472002, -36.839436115137048],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11102",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Lago Verde",
        center: [-71.804710698421928, -44.475137480666106],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11101",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Coihaique",
        center: [-71.961582002375678, -45.524450750057014],
        zoom: 10,
    },
    {
        cut_reg: "15",
        value: "15201",
        region: "Arica y Parinacota",
        label: "Putre",
        center: [-69.293854710425435, -18.304206658688074],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01107",
        region: "Tarapacá",
        label: "Alto Hospicio",
        center: [-70.101147536219742, -20.246225549109845],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01101",
        region: "Tarapacá",
        label: "Iquique",
        center: [-70.148540210353119, -20.831677330665354],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08109",
        region: "Biobío",
        label: "Santa Juana",
        center: [-72.96825610725439, -37.312787303354781],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08108",
        region: "Biobío",
        label: "San Pedro de la Paz",
        center: [-73.12888339306528, -36.884808519987203],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08107",
        region: "Biobío",
        label: "Penco",
        center: [-72.946980968498877, -36.741729343988467],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13130",
        region: "Metropolitana de Santiago",
        label: "San Miguel",
        center: [-70.650587372033868, -33.501365217079062],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13131",
        region: "Metropolitana de Santiago",
        label: "San Ramón",
        center: [-70.642997442194201, -33.538027811525147],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13132",
        region: "Metropolitana de Santiago",
        label: "Vitacura",
        center: [-70.57279643684349, -33.380246428957015],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13122",
        region: "Metropolitana de Santiago",
        label: "Peñalolén",
        center: [-70.498511361343304, -33.494168974706149],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13121",
        region: "Metropolitana de Santiago",
        label: "Pedro Aguirre Cerda",
        center: [-70.676808713972832, -33.49185420114668],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13120",
        region: "Metropolitana de Santiago",
        label: "Ñuñoa",
        center: [-70.597070515718741, -33.455646116388337],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13129",
        region: "Metropolitana de Santiago",
        label: "San Joaquín",
        center: [-70.629375289810611, -33.499873813118306],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13128",
        region: "Metropolitana de Santiago",
        label: "Renca",
        center: [-70.724484618145951, -33.405985096547802],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13127",
        region: "Metropolitana de Santiago",
        label: "Recoleta",
        center: [-70.639481302356401, -33.405969709361344],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13126",
        region: "Metropolitana de Santiago",
        label: "Quinta Normal",
        center: [-70.699617024620892, -33.424015193317643],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13125",
        region: "Metropolitana de Santiago",
        label: "Quilicura",
        center: [-70.734840681279948, -33.355971100770617],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13124",
        region: "Metropolitana de Santiago",
        label: "Pudahuel",
        center: [-70.822828714522302, -33.407442121590691],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13123",
        region: "Metropolitana de Santiago",
        label: "Providencia",
        center: [-70.608078441457465, -33.432454866521219],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13111",
        region: "Metropolitana de Santiago",
        label: "La Granja",
        center: [-70.622279587884876, -33.531059603683417],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13110",
        region: "Metropolitana de Santiago",
        label: "La Florida",
        center: [-70.505354643785708, -33.509399272555186],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13119",
        region: "Metropolitana de Santiago",
        label: "Maipú",
        center: [-70.822179325833545, -33.503958261785741],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13118",
        region: "Metropolitana de Santiago",
        label: "Macul",
        center: [-70.599576638446763, -33.488668600276547],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13117",
        region: "Metropolitana de Santiago",
        label: "Lo Prado",
        center: [-70.724873230188763, -33.443450819314627],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13116",
        region: "Metropolitana de Santiago",
        label: "Lo Espejo",
        center: [-70.689498333325389, -33.519009799079321],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13115",
        region: "Metropolitana de Santiago",
        label: "Lo Barnechea",
        center: [-70.386575709261649, -33.300766731273811],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13114",
        region: "Metropolitana de Santiago",
        label: "Las Condes",
        center: [-70.499325124658611, -33.418198271635966],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13113",
        region: "Metropolitana de Santiago",
        label: "La Reina",
        center: [-70.540019899294094, -33.444969921895371],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13112",
        region: "Metropolitana de Santiago",
        label: "La Pintana",
        center: [-70.63783380662494, -33.587960711504408],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13109",
        region: "Metropolitana de Santiago",
        label: "La Cisterna",
        center: [-70.661086682769763, -33.529826491093466],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13108",
        region: "Metropolitana de Santiago",
        label: "Independencia",
        center: [-70.664386659187471, -33.415190031640584],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13107",
        region: "Metropolitana de Santiago",
        label: "Huechuraba",
        center: [-70.632558494165707, -33.359957742657564],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13106",
        region: "Metropolitana de Santiago",
        label: "Estación Central",
        center: [-70.702173488420812, -33.469055671899568],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13105",
        region: "Metropolitana de Santiago",
        label: "El Bosque",
        center: [-70.677111591254828, -33.561683887084925],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13104",
        region: "Metropolitana de Santiago",
        label: "Conchalí",
        center: [-70.674463509939102, -33.38463721001736],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13103",
        region: "Metropolitana de Santiago",
        label: "Cerro Navia",
        center: [-70.749862441669691, -33.422648761972155],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13102",
        region: "Metropolitana de Santiago",
        label: "Cerrillos",
        center: [-70.709479094556741, -33.49325992541484],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13101",
        region: "Metropolitana de Santiago",
        label: "Santiago",
        center: [-70.664059140542321, -33.451306529855863],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13404",
        region: "Metropolitana de Santiago",
        label: "Paine",
        center: [-70.754595539070337, -33.857668182938276],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13403",
        region: "Metropolitana de Santiago",
        label: "Calera de Tango",
        center: [-70.784115962268871, -33.633509048928104],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13402",
        region: "Metropolitana de Santiago",
        label: "Buin",
        center: [-70.738978431243865, -33.741176870202921],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13502",
        region: "Metropolitana de Santiago",
        label: "Alhué",
        center: [-71.062065577118091, -34.044682526621415],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13501",
        region: "Metropolitana de Santiago",
        label: "Melipilla",
        center: [-71.189884521913129, -33.741382231167094],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13505",
        region: "Metropolitana de Santiago",
        label: "San Pedro",
        center: [-71.503270723212069, -33.922880547210127],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13504",
        region: "Metropolitana de Santiago",
        label: "María Pinto",
        center: [-71.201215799037939, -33.499756886213724],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13503",
        region: "Metropolitana de Santiago",
        label: "Curacaví",
        center: [-71.086297121653715, -33.377277462473359],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13605",
        region: "Metropolitana de Santiago",
        label: "Peñaflor",
        center: [-70.90332903299992, -33.613506235512311],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13604",
        region: "Metropolitana de Santiago",
        label: "Padre Hurtado",
        center: [-70.87341983779848, -33.546136494931716],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13603",
        region: "Metropolitana de Santiago",
        label: "Isla de Maipo",
        center: [-70.946568133464567, -33.750245861778161],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13602",
        region: "Metropolitana de Santiago",
        label: "El Monte",
        center: [-71.020650868932918, -33.662172241371898],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13601",
        region: "Metropolitana de Santiago",
        label: "Talagante",
        center: [-70.902784281933577, -33.684358448858603],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13202",
        region: "Metropolitana de Santiago",
        label: "Pirque",
        center: [-70.512305664942375, -33.702607907047195],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13201",
        region: "Metropolitana de Santiago",
        label: "Puente Alto",
        center: [-70.553873376194176, -33.596718685977613],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13203",
        region: "Metropolitana de Santiago",
        label: "San José de Maipo",
        center: [-70.063610894522881, -33.776091113062982],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13401",
        region: "Metropolitana de Santiago",
        label: "San Bernardo",
        center: [-70.7187, -33.5922],
        zoom: 13,
    },
    {
        cut_reg: "13",
        value: "13302",
        region: "Metropolitana de Santiago",
        label: "Lampa",
        center: [-70.872580130118834, -33.291518341937937],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13303",
        region: "Metropolitana de Santiago",
        label: "Tiltil",
        center: [-70.857171445405228, -33.07443730090462],
        zoom: 10,
    },
    {
        cut_reg: "13",
        value: "13301",
        region: "Metropolitana de Santiago",
        label: "Colina",
        center: [-70.59213693179845, -33.099468987254113],
        zoom: 10,
    },
    {
        cut_reg: "15",
        value: "15202",
        region: "Arica y Parinacota",
        label: "General Lagos",
        center: [-69.524295037375438, -17.986048793843839],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08304",
        region: "Biobío",
        label: "Laja",
        center: [-72.557143910053966, -37.336885852505134],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08303",
        region: "Biobío",
        label: "Cabrero",
        center: [-72.433046825996314, -37.062346967784151],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08302",
        region: "Biobío",
        label: "Antuco",
        center: [-71.419044816988375, -37.271786125430715],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08301",
        region: "Biobío",
        label: "Los Angeles",
        center: [-72.293099384282158, -37.410966598073315],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12103",
        region: "Magallanes y de la Antártica Chilena",
        label: "Río Verde",
        center: [-72.941338113673424, -52.877225090020957],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12101",
        region: "Magallanes y de la Antártica Chilena",
        label: "Punta Arenas",
        center: [-72.895251130152985, -53.750603798153534],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05706",
        region: "Valparaíso",
        label: "Santa María",
        center: [-70.607125911679702, -32.692340428895626],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05705",
        region: "Valparaíso",
        label: "Putaendo",
        center: [-70.53377326114142, -32.496362628979362],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05704",
        region: "Valparaíso",
        label: "Panquehue",
        center: [-70.835693877925308, -32.791199196369654],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05703",
        region: "Valparaíso",
        label: "Llaillay",
        center: [-70.90703079443594, -32.884153225655865],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05702",
        region: "Valparaíso",
        label: "Catemu",
        center: [-70.970955660168045, -32.721305738837415],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05701",
        region: "Valparaíso",
        label: "San Felipe",
        center: [-70.728950214687202, -32.752454519586749],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02104",
        region: "Antofagasta",
        label: "Taltal",
        center: [-70.287048230778964, -25.436456624746032],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02103",
        region: "Antofagasta",
        label: "Sierra Gorda",
        center: [-68.96515982371416, -23.270098263624],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08309",
        region: "Biobío",
        label: "Quilleco",
        center: [-71.871712090142978, -37.464271490392761],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08305",
        region: "Biobío",
        label: "Mulchén",
        center: [-71.747519413102296, -37.950111680641598],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02101",
        region: "Antofagasta",
        label: "Antofagasta",
        center: [-70.029640062330614, -24.104429973074549],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08307",
        region: "Biobío",
        label: "Negrete",
        center: [-72.562180113558838, -37.622806526496746],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08306",
        region: "Biobío",
        label: "Nacimiento",
        center: [-72.862887394478221, -37.496783410818793],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08205",
        region: "Biobío",
        label: "Curanilahue",
        center: [-73.273720025141117, -37.471313502185843],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08204",
        region: "Biobío",
        label: "Contulmo",
        center: [-73.2081871071221, -38.045493794916794],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08203",
        region: "Biobío",
        label: "Cañete",
        center: [-73.363302943551403, -37.885875866469611],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08202",
        region: "Biobío",
        label: "Arauco",
        center: [-73.471180112791146, -37.275011838353493],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11202",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Cisnes",
        center: [-73.788183944289884, -44.485118097320694],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11201",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Aisén",
        center: [-74.280015726215353, -45.869324930300536],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09121",
        region: "La Araucanía",
        label: "Cholchol",
        center: [-72.925478098286064, -38.573505858253327],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12402",
        region: "Magallanes y de la Antártica Chilena",
        label: "Torres del Paine",
        center: [-72.819794419291853, -51.27684697801331],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09120",
        region: "La Araucanía",
        label: "Villarrica",
        center: [-72.225835964974422, -39.303185019938702],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08207",
        region: "Biobío",
        label: "Tirúa",
        center: [-73.418621587667204, -38.318525797479793],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03202",
        region: "Atacama",
        label: "Diego de Almagro",
        center: [-69.235813077441861, -26.095108277228594],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08206",
        region: "Biobío",
        label: "Los Alamos",
        center: [-73.409752596503594, -37.697889576686009],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03201",
        region: "Atacama",
        label: "Chañaral",
        center: [-70.478239251302426, -26.364451830975959],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16102",
        region: "Ñuble",
        label: "Bulnes",
        center: [-72.305818704042025, -36.758528416806762],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16103",
        region: "Ñuble",
        label: "Chillán Viejo",
        center: [-72.191559805274707, -36.638473025504489],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05804",
        region: "Valparaíso",
        label: "Villa Alemana",
        center: [-71.324980353802829, -33.05669480668832],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16109",
        region: "Ñuble",
        label: "Yungay",
        center: [-71.857561426572673, -37.092399040734271],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05803",
        region: "Valparaíso",
        label: "Olmué",
        center: [-71.122264177722428, -33.027327658933018],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16108",
        region: "Ñuble",
        label: "San Ignacio",
        center: [-71.989861237988947, -36.813396296095902],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05802",
        region: "Valparaíso",
        label: "Limache",
        center: [-71.307306881767985, -33.015946028506839],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16107",
        region: "Ñuble",
        label: "Quillón",
        center: [-72.528194503698288, -36.807049033752484],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16106",
        region: "Ñuble",
        label: "Pinto",
        center: [-71.560910527520846, -36.907648424659484],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05801",
        region: "Valparaíso",
        label: "Quilpué",
        center: [-71.281922974363809, -33.142455364395857],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16105",
        region: "Ñuble",
        label: "Pemuco",
        center: [-71.97039063820651, -36.997019817416074],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16104",
        region: "Ñuble",
        label: "El Carmen",
        center: [-71.87980503481856, -36.941508030815584],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07203",
        region: "Maule",
        label: "Pelluhue",
        center: [-72.633573168047647, -35.917089566630892],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07202",
        region: "Maule",
        label: "Chanco",
        center: [-72.492055460478397, -35.666414068794246],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07201",
        region: "Maule",
        label: "Cauquenes",
        center: [-72.299136600794995, -35.996133202630844],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03304",
        region: "Atacama",
        label: "Huasco",
        center: [-71.150679360476715, -28.287462969349004],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03303",
        region: "Atacama",
        label: "Freirina",
        center: [-71.310987328297102, -28.840435719850039],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03302",
        region: "Atacama",
        label: "Alto del Carmen",
        center: [-70.122564508327386, -28.974840253559933],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03301",
        region: "Atacama",
        label: "Vallenar",
        center: [-70.625583649898843, -28.660000721974622],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04102",
        region: "Coquimbo",
        label: "Coquimbo",
        center: [-71.431928474142055, -30.19232243828457],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04101",
        region: "Coquimbo",
        label: "La Serena",
        center: [-71.155116665013779, -29.782297695967966],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06203",
        region: "Libertador General Bernardo Ohiggins",
        label: "Litueche",
        center: [-71.745740448929794, -34.116750416717615],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06202",
        region: "Libertador General Bernardo Ohiggins",
        label: "La Estrella",
        center: [-71.636319386116682, -34.232534652154023],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06201",
        region: "Libertador General Bernardo Ohiggins",
        label: "Pichilemu",
        center: [-71.912481946181259, -34.369145690794788],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04106",
        region: "Coquimbo",
        label: "Vicuña",
        center: [-70.37448924952524, -29.951113787428994],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04105",
        region: "Coquimbo",
        label: "Paiguano",
        center: [-70.385672871734741, -30.232927359261392],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04104",
        region: "Coquimbo",
        label: "La Higuera",
        center: [-71.256034160291492, -29.41271815590823],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04103",
        region: "Coquimbo",
        label: "Andacollo",
        center: [-71.116599372021668, -30.238465049285207],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06206",
        region: "Libertador General Bernardo Ohiggins",
        label: "Paredones",
        center: [-71.91920187191333, -34.651253624639061],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08112",
        region: "Biobío",
        label: "Hualpén",
        center: [-73.182585022126972, -36.77725569769968],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08111",
        region: "Biobío",
        label: "Tomé",
        center: [-72.884877819246498, -36.589796014791112],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06205",
        region: "Libertador General Bernardo Ohiggins",
        label: "Navidad",
        center: [-71.8177500764385, -33.993874551806513],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08110",
        region: "Biobío",
        label: "Talcahuano",
        center: [-73.104452643512275, -36.679237784804897],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06204",
        region: "Libertador General Bernardo Ohiggins",
        label: "Marchihue",
        center: [-71.701791140497392, -34.33909239881342],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10307",
        region: "Los Lagos",
        label: "San Pablo",
        center: [-73.111718793720883, -40.456346739238143],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10306",
        region: "Los Lagos",
        label: "San Juan de la Costa",
        center: [-73.579856925966169, -40.539689633649914],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10305",
        region: "Los Lagos",
        label: "Río Negro",
        center: [-73.422674707583084, -40.773171268914581],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10304",
        region: "Los Lagos",
        label: "Puyehue",
        center: [-72.450620056198844, -40.666850569602722],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10303",
        region: "Los Lagos",
        label: "Purranque",
        center: [-73.493791823987323, -40.936349442902667],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10302",
        region: "Los Lagos",
        label: "Puerto Octay",
        center: [-72.616714969787651, -40.867737846341718],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10301",
        region: "Los Lagos",
        label: "Osorno",
        center: [-73.121926376341591, -40.608704026789169],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05606",
        region: "Valparaíso",
        label: "Santo Domingo",
        center: [-71.6947993274905, -33.834740030787422],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05605",
        region: "Valparaíso",
        label: "El Tabo",
        center: [-71.569825509704742, -33.483147844024934],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05604",
        region: "Valparaíso",
        label: "El Quisco",
        center: [-71.665729999813848, -33.412050509013184],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05603",
        region: "Valparaíso",
        label: "Cartagena",
        center: [-71.493932207714764, -33.52011163871056],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05601",
        region: "Valparaíso",
        label: "San Antonio",
        center: [-71.487570819678993, -33.65055557085816],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06310",
        region: "Libertador General Bernardo Ohiggins",
        label: "Santa Cruz",
        center: [-71.384928352470411, -34.638620016400353],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07309",
        region: "Maule",
        label: "Vichuquén",
        center: [-72.04824413900144, -34.955833559554016],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03101",
        region: "Atacama",
        label: "Copiapó",
        center: [-69.938196972717449, -27.514387236604424],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07301",
        region: "Maule",
        label: "Curicó",
        center: [-70.826170727256752, -35.226476487521552],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08314",
        region: "Biobío",
        label: "Alto Biobío",
        center: [-71.28646213312733, -37.893092469403264],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04201",
        region: "Coquimbo",
        label: "Illapel",
        center: [-71.00781036760182, -31.556273215400086],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08313",
        region: "Biobío",
        label: "Yumbel",
        center: [-72.630870521822743, -37.071292468686714],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08312",
        region: "Biobío",
        label: "Tucapel",
        center: [-71.740871737519768, -37.19740971145945],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08311",
        region: "Biobío",
        label: "Santa Bárbara",
        center: [-71.71434541100821, -37.598486810698695],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08310",
        region: "Biobío",
        label: "San Rosendo",
        center: [-72.731209966638943, -37.196740520960013],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06302",
        region: "Libertador General Bernardo Ohiggins",
        label: "Chépica",
        center: [-71.300291906069461, -34.779850075107746],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07309",
        region: "Maule",
        label: "Vichuquén",
        center: [-72.023570314319784, -34.82281489491502],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06301",
        region: "Libertador General Bernardo Ohiggins",
        label: "San Fernando",
        center: [-70.575014945156184, -34.74924654948687],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07308",
        region: "Maule",
        label: "Teno",
        center: [-71.08801436159186, -34.860519248989576],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07307",
        region: "Maule",
        label: "Sagrada Familia",
        center: [-71.493811631018275, -35.106220074180207],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07306",
        region: "Maule",
        label: "Romeral",
        center: [-70.708896732902602, -35.06781383046718],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07305",
        region: "Maule",
        label: "Rauco",
        center: [-71.426975458318452, -34.926686203818548],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03103",
        region: "Atacama",
        label: "Tierra Amarilla",
        center: [-69.632418592346539, -27.900069849000602],
        zoom: 10,
    },
    {
        cut_reg: "03",
        value: "03102",
        region: "Atacama",
        label: "Caldera",
        center: [-70.855640842690647, -27.200650369500231],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07304",
        region: "Maule",
        label: "Molina",
        center: [-70.916251350088373, -35.356600748377517],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06309",
        region: "Libertador General Bernardo Ohiggins",
        label: "Pumanque",
        center: [-71.714471655287468, -34.592201705526932],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04204",
        region: "Coquimbo",
        label: "Salamanca",
        center: [-70.669734381412837, -31.886228551762233],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06308",
        region: "Libertador General Bernardo Ohiggins",
        label: "Placilla",
        center: [-71.087629902131752, -34.612241453727776],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05506",
        region: "Valparaíso",
        label: "Nogales",
        center: [-71.153152353244494, -32.690552979573582],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04203",
        region: "Coquimbo",
        label: "Los Vilos",
        center: [-71.448202661106464, -31.934682692774192],
        zoom: 10,
    },
    {
        cut_reg: "04",
        value: "04202",
        region: "Coquimbo",
        label: "Canela",
        center: [-71.481767009132639, -31.460240657490814],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06307",
        region: "Libertador General Bernardo Ohiggins",
        label: "Peralillo",
        center: [-71.506325385358778, -34.464943247884094],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06306",
        region: "Libertador General Bernardo Ohiggins",
        label: "Palmilla",
        center: [-71.365234457465618, -34.521597682525076],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05504",
        region: "Valparaíso",
        label: "La Cruz",
        center: [-71.23743012082987, -32.832766528633279],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06305",
        region: "Libertador General Bernardo Ohiggins",
        label: "Nancagua",
        center: [-71.198431592282986, -34.674097827139605],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05503",
        region: "Valparaíso",
        label: "Hijuelas",
        center: [-71.073119162062952, -32.85976303319935],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06304",
        region: "Libertador General Bernardo Ohiggins",
        label: "Lolol",
        center: [-71.678360102821074, -34.75926806391508],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06303",
        region: "Libertador General Bernardo Ohiggins",
        label: "Chimbarongo",
        center: [-70.985046177863808, -34.769256457602545],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05501",
        region: "Valparaíso",
        label: "Quillota",
        center: [-71.274145557611462, -32.906900782963611],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10404",
        region: "Los Lagos",
        label: "Palena",
        center: [-71.948023963064216, -43.679106696424427],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10403",
        region: "Los Lagos",
        label: "Hualaihué",
        center: [-72.488541618553398, -42.083995850875816],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10402",
        region: "Los Lagos",
        label: "Futaleufú",
        center: [-71.973244590092918, -43.186519488630715],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07110",
        region: "Maule",
        label: "San Rafael",
        center: [-71.479509872192494, -35.287745607806627],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10401",
        region: "Los Lagos",
        label: "Chaitén",
        center: [-72.760101446404903, -42.98717472871563],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05103",
        region: "Valparaíso",
        label: "Concón",
        center: [-71.464263638034666, -32.947259012968459],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05602",
        region: "Valparaíso",
        label: "Algarrobo",
        center: [-71.550387802657383, -33.293073743363045],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05101",
        region: "Valparaíso",
        label: "Valparaíso",
        center: [-71.644744872116078, -33.100905287647542],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14101",
        region: "Los Ríos",
        label: "Valdivia",
        center: [-73.168561958584704, -39.827944930051942],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09211",
        region: "La Araucanía",
        label: "Victoria",
        center: [-72.242707683057262, -38.276981324318683],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09210",
        region: "La Araucanía",
        label: "Traiguén",
        center: [-72.710935295050405, -38.276451348399888],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06115",
        region: "Libertador General Bernardo Ohiggins",
        label: "Rengo",
        center: [-70.744198516076011, -34.443816519253964],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06114",
        region: "Libertador General Bernardo Ohiggins",
        label: "Quinta de Tilcoco",
        center: [-70.998925253197982, -34.365673272197846],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06113",
        region: "Libertador General Bernardo Ohiggins",
        label: "Pichidegua",
        center: [-71.342070014127245, -34.374824806759158],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06112",
        region: "Libertador General Bernardo Ohiggins",
        label: "Peumo",
        center: [-71.217099079028571, -34.339178649718889],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06111",
        region: "Libertador General Bernardo Ohiggins",
        label: "Olivar",
        center: [-70.822600212530645, -34.207275214469291],
        zoom: 10,
    },
    {
        cut_reg: "06",
        value: "06110",
        region: "Libertador General Bernardo Ohiggins",
        label: "Mostazal",
        center: [-70.567192120710828, -33.987267242213996],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07105",
        region: "Maule",
        label: "Maule",
        center: [-71.683071354624531, -35.517641778520137],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05109",
        region: "Valparaíso",
        label: "Viña del Mar",
        center: [-71.531609436714874, -33.024435034500833],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07104",
        region: "Maule",
        label: "Empedrado",
        center: [-72.26355955002991, -35.645362309384716],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14108",
        region: "Los Ríos",
        label: "Panguipulli",
        center: [-72.090695557085468, -39.704167139596301],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05107",
        region: "Valparaíso",
        label: "Quintero",
        center: [-71.482300773152502, -32.843543326951355],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07103",
        region: "Maule",
        label: "Curepto",
        center: [-71.956399638529732, -35.115021302759267],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07102",
        region: "Maule",
        label: "Constitución",
        center: [-72.378718122193675, -35.438062108509001],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14107",
        region: "Los Ríos",
        label: "Paillaco",
        center: [-72.884322460006672, -40.063828251390298],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01405",
        region: "Tarapacá",
        label: "Pica",
        center: [-68.808513355284731, -20.4384607030707],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14106",
        region: "Los Ríos",
        label: "Mariquina",
        center: [-73.013573782143737, -39.512005062039023],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01404",
        region: "Tarapacá",
        label: "Huara",
        center: [-69.949408293716147, -19.580585408808069],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09206",
        region: "La Araucanía",
        label: "Los Sauces",
        center: [-72.817428137528779, -37.978672172880565],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05105",
        region: "Valparaíso",
        label: "Puchuncaví",
        center: [-71.402277844130779, -32.71291319440936],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07101",
        region: "Maule",
        label: "Talca",
        center: [-71.598562773633446, -35.420670713159041],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14105",
        region: "Los Ríos",
        label: "Máfil",
        center: [-72.763839548437247, -39.681584265085313],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01403",
        region: "Tarapacá",
        label: "Colchane",
        center: [-68.870470515061186, -19.443660106408934],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09205",
        region: "La Araucanía",
        label: "Lonquimay",
        center: [-71.213539720466628, -38.515318971669046],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14104",
        region: "Los Ríos",
        label: "Los Lagos",
        center: [-72.579779285649792, -39.855843545570835],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01402",
        region: "Tarapacá",
        label: "Camiña",
        center: [-69.468799072000735, -19.41999306975077],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09204",
        region: "La Araucanía",
        label: "Ercilla",
        center: [-72.28396052550697, -38.108860949447191],
        zoom: 10,
    },
    {
        cut_reg: "01",
        value: "01401",
        region: "Tarapacá",
        label: "Pozo Almonte",
        center: [-69.311081900471592, -20.721836593436759],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09203",
        region: "La Araucanía",
        label: "Curacautín",
        center: [-71.823225717307025, -38.452533320335434],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14103",
        region: "Los Ríos",
        label: "Lanco",
        center: [-72.637122455353321, -39.519285377738242],
        zoom: 10,
    },
    {
        cut_reg: "14",
        value: "14102",
        region: "Los Ríos",
        label: "Corral",
        center: [-73.42744451912921, -39.967098456234893],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09202",
        region: "La Araucanía",
        label: "Collipulli",
        center: [-72.1215279608777, -38.002870702602621],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09201",
        region: "La Araucanía",
        label: "Angol",
        center: [-72.779400574683507, -37.770480269322078],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08308",
        region: "Biobío",
        label: "Quilaco",
        center: [-71.785, -37.9823],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12102",
        region: "Magallanes y de la Antártica Chilena",
        label: "Laguna Blanca",
        center: [-71.046, -52.3],
        zoom: 10,
    },
    {
        cut_reg: "16",
        value: "16101",
        region: "Ñuble",
        label: "Chillán",
        center: [-72.2845, -36.6282],
        zoom: 10,
    },
    {
        cut_reg: "02",
        value: "02102",
        region: "Antofagasta",
        label: "Mejillones",
        center: [-70.2501, -22.8938],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10108",
        region: "Los Lagos",
        label: "Maullín",
        center: [-73.5988, -41.6391],
        zoom: 10,
    },
    {
        cut_reg: "09",
        value: "09114",
        region: "La Araucanía",
        label: "Pitrufquén",
        center: [-72.632, -39.0251],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07302",
        region: "Maule",
        label: "Hualañé",
        center: [-72.9737, -34.9713],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05502",
        region: "Valparaíso",
        label: "Calera",
        center: [-71.2057, -32.7884],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08102",
        region: "Biobío",
        label: "Coronel",
        center: [-73.1579, -37.0166],
        zoom: 10,
    },
    {
        cut_reg: "07",
        value: "07303",
        region: "Maule",
        label: "Licantén",
        center: [-71.7431, -34.9674],
        zoom: 10,
    },
    {
        cut_reg: "11",
        value: "11203",
        region: "Aysén del General Carlos Ibáñez del Campo",
        label: "Guaitecas",
        center: [-73.3632, -43.9312],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12301",
        region: "Magallanes y de la Antártica Chilena",
        label: "Porvenir",
        center: [-70.4014, -53.3007],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05201",
        region: "Valparaíso",
        label: "Isla de Pascua",
        center: [-109.4213, -27.1127],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10102",
        region: "Los Lagos",
        label: "Calbuco",
        center: [-73.1316, -41.7683],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10101",
        region: "Los Lagos",
        label: "Puerto Montt",
        center: [-72.9402, -41.4718],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12401",
        region: "Magallanes y de la Antártica Chilena",
        label: "Natales",
        center: [-72.5043, -51.7287],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10209",
        region: "Los Lagos",
        label: "Quemchi",
        center: [-73.5172, -42.1374],
        zoom: 10,
    },
    {
        cut_reg: "08",
        value: "08201",
        region: "Biobío",
        label: "Lebu",
        center: [-73.6463, -37.6056],
        zoom: 10,
    },
    {
        cut_reg: "12",
        value: "12104",
        region: "Magallanes y de la Antártica Chilena",
        label: "San Gregorio",
        center: [-69.7929, -51.6242],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05102",
        region: "Valparaíso",
        label: "Casablanca",
        center: [-71.4172, -33.3251],
        zoom: 10,
    },
    {
        cut_reg: "10",
        value: "10210",
        region: "Los Lagos",
        label: "Quinchao",
        center: [-73.4492, -42.3708],
        zoom: 10,
    },
    {
        cut_reg: "05",
        value: "05104",
        region: "Valparaíso",
        label: "Juan Fernández",
        center: [-78.8368, -33.6366],
        zoom: 10,
    },
];

// Ordena el listado por la propiedad "label"
comunaOptions.sort(function (a, b) {
    var labelA = a.label.toUpperCase();
    var labelB = b.label.toUpperCase();
    return labelA.localeCompare(labelB, "es");
});

// Agrega la opción predeterminada "Seleccionar región"
$(".regionDropdown").append(
    $("<option>", {
        value: "",
        text: "Seleccionar región",
    })
);

// Llena la lista desplegable de regiones
regionOptions.forEach(function (option) {
    $(".regionDropdown").append(
        $("<option>", {
            value: option.value,
            text: option.label,
        })
    );
});

// Agrega la opción predeterminada "Seleccionar comuna"
$(".comunaDropdown").append(
    $("<option>", {
        value: "",
        text: "Seleccionar comuna",
    })
);


$(".regionDropdown").change(function () {
    // Obtiene la región seleccionada
    var selectedRegion = $(this).val();
    // Llena la lista desplegable de comunas
    fillCommunesDropdown(selectedRegion);
});

  /*     // Agrega la fuente raster solo si no existe
     map.addSource('comunasSource', {
         type: "raster",
         tiles: [
             "https://geoportal.cepal.org/geoserver/geonode/wms?service=WMS&version=1.1.0&request=GetMap&layers=geonode%3Acomunas_chile_3857_lineas&bbox={bbox-epsg-3857}&transparent=true&width=256&height=246&srs=EPSG%3A3857&styles=&format=image%2Fpng",
         ],
         tileSize: 256,
     });

     // Agrega la capa raster utilizando la fuente recién creada
     map.addLayer({
         id: 'comunas',
         type: "raster",
         source: 'comunasSource',
         paint: {},
         minzoom: 8, // Nivel de zoom mínimo para la capa raster
     }); */

// Llena las opciones de la lista desplegable de la comuna
function fillCommunesDropdown(selectedRegion) {
    // Filtra las comunas
    var filteredCommunes = comunaOptions.filter(
        (comuna) => comuna.cut_reg === selectedRegion
    );

    // Elimina todas las opciones existentes de la lista desplegable
    $(".comunaDropdown").empty();

    // Agrega la opción predeterminada "Seleccionar comuna"
    $(".comunaDropdown").append(
        $("<option>", {
            value: "",
            text: "Seleccionar comuna",
        })
    );

    // Agrega las nuevas opciones a la lista desplegable
    filteredCommunes.forEach(function (comuna) {
        $(".comunaDropdown").append(
            $("<option>", {
                value: comuna.value,
                text: comuna.label,
            })
        );
    });
}



// Actualiza el filtro del mapa y la extensión al cambiar la selección en la lista desplegable de la región
$(".regionDropdown").change(function () {
    var selectedRegion = $(this).val();
    var selectedOption = regionOptions.find(
        (option) => option.value === selectedRegion
    );

    // Centra el mapa en la región seleccionada
    map.flyTo({
        center: selectedOption.center,
        zoom: selectedOption.zoom,
    });

    // Filtra y cuenta las features según la región seleccionada
    const conteoRegion = map.queryRenderedFeatures({
        layers: ['proyectos-layer'],
        filter: ['==', 'CUT_REG', selectedRegion.toString()],
    }).length;

    // Actualiza el contenido del div con los resultados
    document.getElementById('regional').innerHTML = `<center>Región de ${selectedOption.label} <br> <b>${conteoRegion} proyectos</b></center>`;
});


// Actualiza el filtro del mapa y la extensión al cambiar la selección en la lista desplegable de la comuna
$(".comunaDropdown").change(function () {
    var selectedComuna = $(this).val();
    var selectedOption = comunaOptions.find(
        (option) => option.value === selectedComuna
    );

    // Centra el mapa en la comuna seleccionada
    map.flyTo({
        center: selectedOption.center,
        zoom: selectedOption.zoom,
    });

     // Filtra y cuenta las features según la región seleccionada
     const conteoComuna = map.queryRenderedFeatures({
        layers: ['proyectos-layer'],
        filter: ['==', 'CUT_COM', selectedComuna.toString()],
    }).length;

    // Actualiza el contenido del div con los resultados
    document.getElementById('comunal').innerHTML = `<center>Comuna de ${selectedOption.label} <br> <b>${conteoComuna} proyectos</b></center>`; 

});

map.on("error", function (e) {
    console.error("Error:", e.error);
});