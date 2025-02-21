const map = new maplibregl.Map({
    container: "map",
    style: "https://api.maptiler.com/maps/basic-v2/style.json?key=LURvXrlYSjugh8dlAFR3",
    center: [-73, -40],
    minZoom: 1, // Establece el zoom máximo permitido
    maxZoom: 18, // Establece el zoom máximo permitido
    zoom: 3,
    pitch: 0, // Configuración del ángulo de inclinación (establecer en 0 para desactivar la inclinación)
    bearing: 0,
});

function locateUser() {
    var defaultLocation = [-70.669265, -33.448333]; // Ejemplo para Santiago, Chile

    // Retorna una promesa para la ubicación del usuario
    return new Promise(function (resolve, reject) {
        // Obtener la ubicación del usuario
        navigator.geolocation.getCurrentPosition(function (position) {
            // Asigna los valores a las variables globales
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
            userLocation = [userLongitude, userLatitude]; // Almacena la ubicación del usuario en la variable global

            // Centrar el mapa en la ubicación del usuario
            map.setCenter(userLocation);
            map.setZoom(10); // Ajusta el nivel de zoom según tus necesidades

            // Añadir un marcador en la ubicación del usuario
            new maplibregl.Marker()
                .setLngLat(userLocation)
                .addTo(map);

            // Resolver la promesa con la ubicación del usuario
            resolve(userLocation);
        }, function (error) {
            // Manejar la denegación de geolocalización
            console.log('Ubicación denegada. Usando ubicación predeterminada.');

            // Centrar el mapa en la ubicación predeterminada
            map.setCenter(defaultLocation);
            map.setZoom(10); // Ajusta el nivel de zoom según tus necesidades
            // Habilitar la interacción del mapa
            map.setInteractive(true);

            // Resolver la promesa con la ubicación predeterminada
            resolve(defaultLocation);
        });
    });
}

// Desactivar la función de inclinación
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

// Puedes también ocultar el control de navegación de norte
map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

/* map.addControl(new maplibregl.FullscreenControl()); */


//Esta funcion se usa para id=#flecha.
function togglePanel() {
    var panel = document.getElementById("estadisticas");
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
    console.log("togglePanel OK");
}


map.on('load', () => {
    // Agrega la fuente raster solo si no existe

    map.setLayoutProperty('Country labels', 'text-field', ['get', 'name:es']);

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
    });

    // Realizar la solicitud fetch para obtener los datos de la fuente WFS
    fetch('https://geoportal.cepal.org/geoserver/geonode/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geonode%3Aproyectosmayo2024&outputFormat=application%2Fjson')
        .then(response => response.json())
        .then(data => {
            // Agregar la fuente de datos GeoJSON al mapa con los datos obtenidos
            map.addSource('proyectos-source', {
                type: 'geojson',
                cluster: false,
                data: data,
            });

            // Agregar la capa de puntos al mapa como círculos
            map.addLayer({
                id: 'proyectos-layer',
                type: 'circle', // Cambiado a 'circle'
                source: 'proyectos-source',
                paint: {
                    'circle-radius': 6, // Radio del círculo
                    'circle-color': [
                        'case',
                        ['==', ['get', 'dipres'], 'Sí'], // Condición para "Sí"
                        '#006FB3', // Color azul para "Sí"
                        ['==', ['get', 'dipres'], 'No'], // Condición para "No"
                        '#FE6565', // Color rojo para "No"
                        'gray' // Color por defecto (si no es ni "Sí" ni "No")
                    ],
                    'circle-stroke-color': 'white', // Color del borde
                    'circle-stroke-width': 1 // Ancho del borde
                }
            });

            // Agregar la capa de texto al mapa
            map.addLayer({
                id: 'proyectos-text-layer',
                type: 'symbol',
                source: 'proyectos-source',
                layout: {
                    'text-field': [
                        'coalesce', // Utiliza coalesce para obtener el primer valor no nulo
                        ['get', 'nombre'], // Intenta obtener el valor de 'NOMBRE_PRO'
                    ],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 0.5,
                    'text-justify': 'auto',
                    "text-size": {
                        "stops": [
                            [0, 0],
                            [4, 0],
                            [6, 0],
                            [8, 0],
                            [9, 0],
                            [10, 12],
                            [12, 14],
                        ]
                    },
                    'text-allow-overlap': false,
                    'text-optional': true
                },
                paint: {
                    'text-color': 'black', // Color del texto
                    'text-halo-color': 'white', // Color del buffer blanco
                    'text-halo-width': 2, // Ancho del buffer
                }
            });


            // Actualizar el contenido del elemento con id 'nacional'
            document.getElementById('nacional').innerHTML = `
                         <div class="container-fluid estadisticas">
                         <div class="row">
                         <p style="background-color:#0A132D;color:white; border-radius:0.3rem" class="col-12 text-center mb-1">Total Nacional</p>                           
                           <div class="col-12">  
                             <div class="row">
                             <div class="col-sm-6 m-0 p-0">
                             <div class="card m-0 p-0 text-center">
                             <p style="font-size:1rem;font-weight:bold;color:#FE6565" class="mb-2">Todos los proyectos</p>
                             <p style="font-size:2rem;font-weight:bold;color:#FE6565"class="mb-0">1538</p>
                                 </div>
                               </div>
                               
                               <div class="col-sm-6 m-0 p-0">
                               <div class="card m-0 p-0 text-center">
                               <p style="font-size:1rem;font-weight:bold;color:#0A132D" class="mb-2">Inversión</p>
                               <p style="font-size:1rem;font-weight:bold;color:#0A132D"class="mb-0">7.574.761.407 MM</p>
                                 </div>
                               </div>
                           
                             </div>
                           </div>
                         </div>
                       </div>                                 
                         `
                ;

            // Función para filtrar las opciones del dropdown según la palabra clave ingresada
            function filtrarDropdown(dropdown, keyword) {
                const options = dropdown.children('option'); // Obtener todas las opciones del dropdown
                options.each(function () {
                    const optionText = $(this).text().toLowerCase(); // Obtener el texto de la opción y convertirlo a minúsculas
                    const isVisible = optionText.includes(keyword); // Verificar si la palabra clave está incluida en el texto de la opción
                    $(this).toggle(isVisible); // Mostrar u ocultar la opción según si coincide con la palabra clave
                });
            }

            // Evento de escucha para el campo de búsqueda
            $('.search-input').on('input', function () {
                const keyword = $(this).val().toLowerCase(); // Obtener la palabra clave ingresada por el usuario y convertirla a minúsculas
                const dropdown = $(this).closest('.dropdown').find('select'); // Obtener el dropdown asociado al campo de búsqueda
                if (keyword === '') {
                    // Mostrar todas las opciones si el campo de búsqueda está vacío
                    dropdown.children('option').show();
                } else {
                    // Filtrar las opciones del dropdown según la palabra clave
                    filtrarDropdown(dropdown, keyword);
                }
            });

            // Actualizar contador al mover el mapa
            map.on('idle', function () {
                // SUMAR POR RENDERIZADOS FILTRANDO POR CODIGO DE REGION SELECCIONADA:
                const features = map.queryRenderedFeatures({ layers: ['proyectos-layer'] });

                const vistaActual = features.length;

                // SUMAR PLATA
                let sumaMonto = 0;

                // Iterar sobre las características y sumar los montos
                features.forEach(function (feature) {
                    // Verificar si la característica tiene la propiedad 'CTOTAL'
                    if (feature.properties && feature.properties.ctotal) {
                        // Obtener el monto de la característica y verificar que no sea "-"
                        const monto = feature.properties.ctotal;
                        if (monto !== '-') {
                            // Sumar el monto convertido a número
                            sumaMonto += parseFloat(monto);
                        }
                    }
                });

                // Ahora `sumaMonto` contiene la suma total de los montos válidos
                console.log('Suma total del monto:', sumaMonto);


                // Transformar el número de la suma de montos con puntos cada tres dígitos y reemplazar puntos y comas
                const sumaMontoFormateada = sumaMonto.toLocaleString('es-ES', { maximumFractionDigits: 0 });

                // Mostrar la suma de montos formateada
                console.log('Suma de Montos:', sumaMontoFormateada);

                // SUMAR EMPLEOS
                let sumaEmpleosConstruccion = 0;

                // Iterar sobre las características y sumar los empleos
                features.forEach(function (feature) {
                    // Verificar si la característica tiene las propiedades 'Empleos_Op' y 'Empleos_Co'
                    if (feature.properties && feature.properties.Empleos_Op && feature.properties.Empleos_Co) {
                        // Obtener los empleos de la característica y sumarlos
                        sumaEmpleosConstruccion += parseFloat(feature.properties.Empleos_Op) + parseFloat(feature.properties.Empleos_Co);
                    }
                });

                // Mostrar la suma de montos
                console.log('Suma de Montos:', sumaEmpleosConstruccion);

                // Actualizar el contenido del div con el contador
                document.getElementById('extent').innerHTML = `
                    <div class="container-fluid estadisticas">
                    <div class="row">
                    <p style="background-color:#0A132D;color:white; border-radius:0.3rem" class="col-12 text-center mb-1">Vista actual</p>
                        <div class="col-12">
                            <div class="row">
                                <div class="col-sm-6 m-0 p-0">
                                    <div class="card m-0 p-0 text-center">
                                    <p style="font-size:1rem;font-weight:bold;color:#FE6565" class="mb-2">Proyectos</p>
                                    <p style="font-size:2rem;font-weight:bold;color:#FE6565"class="mb-0">${vistaActual}</p>                                                         
                                    </div>
                                </div>

                                <div class="col-sm-6 m-0 p-0">
                                    <div class="card m-0 p-0 text-center">
                                    <p style="font-size:1rem;font-weight:bold;color:#0A132D" class="mb-2">Inversión</p>
                                    <p style="font-size:1rem;font-weight:bold;color:#0A132D"class="mb-0">${sumaMontoFormateada} MM</p>
                                    </div>
                                </div>

                             
                            </div>
                        </div>
                    </div>
                </div>                    
        `;
            });
        });

    // Evento de clic en la capa de puntos
    map.on('click', 'proyectos-layer', function (e) {
        // Obtén las coordenadas de la feature clicada
        const coordinates = e.features[0].geometry.coordinates;

        // Centra el mapa en las coordenadas de la feature clicada
        map.flyTo({
            center: coordinates,
            zoom: 17, // Puedes ajustar el nivel de zoom según tus necesidades
            speed: 2
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
})


map.on('idle', function () {
    // Obtén las features en la vista actual
    const features = map.queryRenderedFeatures({ layers: ['proyectos-layer'] });

    // Construye la lista de nombres de proyectos visibles en la vista actual
    const nombreProyectos = features.map(feature => ({
        nombre: feature.properties.nombre,
        coordenadas: feature.geometry.coordinates
    }));

    // Llenar el dropdown con los nombres de los proyectos
    const dropdownProyectos = $(".nombreProyectoDropdown");
    dropdownProyectos.empty(); // Vaciar el dropdown antes de llenarlo nuevamente
    dropdownProyectos.append(
        $("<option>", {
            value: "",
            text: "Proyecto",
        })
    );

    nombreProyectos.forEach(proyecto => {
        if (proyecto.nombre) {
            dropdownProyectos.append(
                $("<option>", {
                    value: proyecto.nombre,
                    text: proyecto.nombre,
                })
            );
        }
    });

    // Evitar agregar múltiples eventos 'change'
    dropdownProyectos.off('change'); // Elimina cualquier evento 'change' anterior

    // Evento que se activa al cambiar la selección en la lista desplegable del proyecto
    dropdownProyectos.on('change', function () {
        const selectedProjectName = $(this).val();
        const selectedProject = nombreProyectos.find(
            proyecto => proyecto.nombre === selectedProjectName
        );

        if (selectedProject) {
            // Centrar el mapa en la ubicación del proyecto seleccionado
            map.flyTo({
                center: selectedProject.coordenadas,
                zoom: 14 // Ajusta el nivel de zoom según sea necesario
            });
        }
    });
    // Construye la lista de códigos BIP visibles en la vista actual
    const codigoBIP = features
    .map(feature => ({
        BIP: feature.properties.cod || "Sin código", // Manejo de valores vacíos
        coordenadas: feature.geometry.coordinates
    }))
    .filter(BIP => BIP.BIP !== "Sin código"); // Filtrar elementos sin código

// Llenar el dropdown con los códigos BIP de los proyectos
const dropdownCodigoBIP = $(".codigoBIPDropdown");
dropdownCodigoBIP.empty(); // Vaciar antes de llenarlo nuevamente

// Agregar la opción predeterminada
dropdownCodigoBIP.append(
    $("<option>", {
        value: "",
        text: "Código BIP"
    })
);

// Agregar los códigos BIP
codigoBIP.forEach(BIP => {
    dropdownCodigoBIP.append(
        $("<option>", {
            value: BIP.BIP,
            text: BIP.BIP,
        })
    );
});

// Evitar agregar múltiples eventos 'change'
dropdownCodigoBIP.off('change');

// Evento que se activa al cambiar la selección en la lista desplegable de código BIP
dropdownCodigoBIP.on('change', function () {
    const selectedCodigoBIPname = $(this).val();
    const selectedCodigoBIP = codigoBIP.find(
        BIP => BIP.BIP === selectedCodigoBIPname
    );

    if (selectedCodigoBIP) {
        map.flyTo({
            center: selectedCodigoBIP.coordenadas,
            zoom: 14
        });
    }
});

    // Construye la tabla con la información de todas las geometrías en la vista actual
    let content = `<h6><i>Proyectos <b>(${features.length})</b></h6></i>`;

    features.forEach((feature, index) => {
        const featureId = feature.properties.id; // Extrae el ID de la característica
        const codigo = feature.properties.cod;
        const nombre = feature.properties.nombre;
        const tipo = feature.properties.publico_pr;
        const sector = feature.properties.sector; // Si se encuentra identificado por un Sector
        const region = feature.properties.region;
        const comuna = feature.properties.comuna;
        const provincia = feature.properties.provincia;
        const estado = feature.properties.e_mdsf;
        const nudo = feature.properties.nudo_crit;
        const superficie = feature.properties.superficie;
        const formuladora = feature.properties.unidad_for;
        const finalizadora = feature.properties.unidad_fin;
        const tecnica = feature.properties.unidad_te;
        const costoTotal = feature.properties.ctotal;
        const ejecutado2023 = feature.properties.ej2023;
        const ejecutado2024 = feature.properties.ej2024;
        const dipres = feature.properties.dipres; //Si se encuentra con identificación en DIPRES
        const sin = feature.properties.sin; //Si se encuentra en sistema nacional de inversiones
        const compromisoDCI = feature.properties.compr_dci;
        const comentarioDCI = feature.properties.com_dci;
        const medidaDCI = feature.properties.med_dci;
        const RATE = feature.properties.rate;
        const comentarioRATE = feature.properties.com_rate;
        const responsable = feature.properties.responsabl;
        const fuente = feature.properties.fuente;
        const fechaCompromiso = feature.properties.compromiso;


        // Verificar si hay suficiente información para agregar la tarjeta
        if (nombre || titular || tipo || sector || region || comuna || provincia || monto || estado || nudo || superficie || formuladora || finalizadora || tecnica) {
            // Determinar si este es el primer elemento en la iteración
            const isFirstElement = index === 0;

            // Construir el contenido de la tarjeta
            let cardContent = `
                <div class="card ficha${isFirstElement ? ' first-element' : ''}" onclick="centrarMapa('${featureId}')">
                    ${nombre ? `<p class="nombre">${nombre} (BIP: ${codigo})</p>` : ''}
                    ${comuna && region ? `<p class="ubicacion">Comuna de ${comuna}, región de ${region}</p>` : ''}
                    ${sector ? `<p><span class="etiqueta">Sector:</span> ${sector}</p>` : ''}
                    ${estado ? `<p><span class="etiqueta">Estado:</span> ${estado}</p>` : ''}
                    ${costoTotal ? `<p><span class="etiqueta">Costo total del proyecto:</span> ${costoTotal} ($M) </p>` : ''}
                    ${ejecutado2023 ? `<p><span class="etiqueta">Ejecutado acumulado al 2023:</span> ${ejecutado2023} ($M)</p>` : ''}
                    ${ejecutado2024 ? `<p><span class="etiqueta">Ejecutado 2024:</span> ${ejecutado2024} ($M)</p>` : ''}
                    ${formuladora ? `<p><span class="etiqueta">Unidad Formuladora:</span> ${formuladora}</p>` : ''}
                    ${finalizadora ? `<p><span class="etiqueta">Unidad Financiadora:</span> ${finalizadora}</p>` : ''}
                    ${tecnica ? `<p><span class="etiqueta">Unidad Técnica:</span> ${tecnica}</p>` : ''}
                    ${dipres ? `<p><span class="etiqueta">Identificado por DIPRES</span> ${dipres}</p>` : ''}
                    ${sin ? `<p><span class="etiqueta">Se encuentra en Sistema Nacional de Inversiones:</span> ${sin}</p>` : ''}
                    ${compromisoDCI ? `<p><span class="etiqueta">Compromiso por la DCI:</span> ${compromisoDCI}</p>` : ''}
                    ${RATE ? `<p><span class="etiqueta">RATE MDS:</span> ${RATE}</p>` : ''}
                    ${comentarioRATE ? `<p><span class="etiqueta">Comentario RATE:</span> ${comentarioRATE}</p>` : ''}
                    ${estado ? `<p><span class="etiqueta">Etapa MDSF:</span> ${estado}</p>` : ''}
                    ${comentarioDCI ? `<p><span class="etiqueta">Comentario DCI:</span> ${comentarioDCI}</p>` : ''}
                    ${medidaDCI ? `<p><span class="etiqueta">Medida DCI:</span> ${medidaDCI}</p>` : ''}
                    ${fuente ? `<p><span class="etiqueta">Fuente - Cita Medida DCI:</span> ${fuente}</p>` : ''}
                    ${responsable ? `<p><span class="etiqueta">Ministerio Responsable:</span> ${responsable}</p>` : ''}
                    ${fechaCompromiso ? `<p><span class="etiqueta">Fecha Compromiso</span> ${fechaCompromiso}</p>` : ''}



                    <p><span style="font-size:1.5vh;float:right"class="etiqueta"><i>Última fecha de actualización: Mayo 2024</i></span></p>
                </div>
            `;
            // Agregar la tarjeta al contenido
            content += cardContent;
        }
    });

    // Actualiza el contenido de la caja flotante
    document.getElementById('panel').innerHTML = content;
    document.getElementById('bottom-panel').innerHTML = content;
});


// Función para centrar el mapa en la feature seleccionada por su ID
function centrarMapa(featureId) {
    console.log('Feature ID a buscar:', featureId); // Verifica si el ID de la característica se pasa correctamente

    var features = map.querySourceFeatures('proyectos-source', {
        filter: ['==', 'id', featureId]
    });
    console.log('Características encontradas:', features); // Verifica las características encontradas

    if (features.length > 0) {
        var coordinates = features[0].geometry.coordinates;
        // Centra el mapa en las coordenadas de la feature seleccionada
        map.jumpTo({
            center: coordinates,
            zoom: 17, // Puedes ajustar el nivel de zoom según tus necesidades
        });
    } else {
        console.log('No se encontraron características con el ID proporcionado.');
    }
}

// Array de objetos para las opciones de la lista desplegable de la región ////ARREGLAR CODIGOS ******
var regionOptions = [
    { value: "15", label: "Arica y Parinacota", bounds: [[-70.3776176504258,-19.22905000099996],[-68.91131273799994,-17.49839933599998]] },
    { value: "01", label: "Tarapacá", bounds: [[-70.28664999999995,-21.627740000999943],[-68.40487066999998,-18.936775026772835]] },
    { value: "02", label: "Antofagasta", bounds: [[-70.74304000099994,-26.062272625999984],[-66.99050347199994,-20.934544566999925]] },
    { value: "03", label: "Atacama", bounds: [[-71.59191000099997,-29.53500000199994],[-68.26308429999995,-25.28583968499992]] },
    { value: "04", label: "Coquimbo", bounds: [[-71.71781999799998,-32.28247000099997],[-69.80908203099995,-29.036599774999964]] },
    { value: "05", label: "Valparaíso", bounds: [[-109.45491615599997,-33.97420000099993],[-69.98923310599997,-26.273140141999928]] },
    { value: "13", label: "Metropolitana", bounds: [[-71.71547979899998,-34.29102327999993],[-69.76975011099995,-32.92192455199995]] },
    { value: "06", label: "OHiggins", bounds: [[-72.05754075199997,-35.00519857245869],[-70.00924489699997,-33.85068588199993]] },
    { value: "07", label: "Maule", bounds: [[-72.78572999999994,-36.54381834199996],[-70.31174712199999,-34.68437372499994]] },
    { value: "16", label: "Ñuble", bounds: [[-72.88470334599998,-37.19846992899995],[-71.00700729999994,-36.005384084999946]] },
    { value: "08", label: "Biobío", bounds: [[-73.97358999999994,-38.49244739099998],[-70.98297989199995,-36.443240000999936]] },
    { value: "09", label: "La Araucanía", bounds: [[-73.52025999999995,-39.63723989299995],[-70.82645737199994,-37.58172591199996]] },
    { value: "14", label: "Los Ríos", bounds: [[-73.72527999899995,-40.680939548999945],[-71.59228686699998,-39.287472342999926]] },
    { value: "10", label: "Los Lagos", bounds: [[-74.84848000099998,-44.067119497485976],[-71.58100815399996,-40.236070437999956]] },
    { value: "11", label: "Aysén", bounds: [[-75.67792079699996,-49.15877555912798],[-71.09130859399994,-43.63799097799995]] },
    { value: "12", label: "Magallanes", bounds: [[-75.72316309799999,-56.53776581899995],[-66.41559401099994,-48.594091396999936]] },
];


// Array de objetos para las opciones de la lista desplegable de la región

var comunaOptions = [
    {cut_reg:"05",cut_prov:"051",value:"05104",region:"Valparaíso",provincia:"Valparaíso",label:"Juan Fernández",bounds:[[-80.83777197699999,-33.816328640999984],[-78.76959453299997,-26.273140141999928]]},
    {cut_reg:"12",cut_prov:"124",value:"12401",region:"Magallanes y de la Antártica Chilena",provincia:"Última Esperanza",label:"Natales",bounds:[[-75.72316309799999,-52.83158203899995],[-71.64588798899996,-48.594091396999936]]},
    {cut_reg:"11",cut_prov:"113",value:"11303",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Capitán Prat",label:"Tortel",bounds:[[-75.67792079699996,-48.98680425799995],[-73.04008435099996,-46.96231000199997]]},
    {cut_reg:"11",cut_prov:"112",value:"11201",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Aisén",label:"Aisén",bounds:[[-75.65355000099999,-47.07263985599996],[-71.96162215099999,-44.958040000999965]]},
    {cut_reg:"11",cut_prov:"112",value:"11202",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Aisén",label:"Cisnes",bounds:[[-75.20512999999994,-45.10993028899998],[-72.05081054399994,-43.63799097799995]]},
    {cut_reg:"10",cut_prov:"102",value:"10208",region:"Los Lagos",provincia:"Chiloé",label:"Quellón",bounds:[[-74.84848000099998,-43.68214000099993],[-73.43479000099995,-42.81988000099994]]},
    {cut_reg:"12",cut_prov:"121",value:"12101",region:"Magallanes y de la Antártica Chilena",provincia:"Magallanes",label:"Punta Arenas",bounds:[[-74.74804712599996,-54.581501137999965],[-70.21506474799999,-52.70791224499993]]},
    {cut_reg:"10",cut_prov:"102",value:"10203",region:"Los Lagos",provincia:"Chiloé",label:"Chonchi",bounds:[[-74.19893999999994,-42.883990001999955],[-73.61438000099997,-42.484770001999955]]},
    {cut_reg:"10",cut_prov:"102",value:"10201",region:"Los Lagos",provincia:"Chiloé",label:"Castro",bounds:[[-74.19290999999998,-42.64839000099994],[-73.40176999999994,-42.35193555999996]]},
    {cut_reg:"10",cut_prov:"102",value:"10205",region:"Los Lagos",provincia:"Chiloé",label:"Dalcahue",bounds:[[-74.19100999999995,-42.47264044999997],[-73.35314999999997,-42.15202489999996]]},
    {cut_reg:"11",cut_prov:"112",value:"11203",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Aisén",label:"Guaitecas",bounds:[[-74.17499999899997,-44.180220000999945],[-73.44378000099994,-43.70980000099996]]},
    {cut_reg:"10",cut_prov:"102",value:"10202",region:"Los Lagos",provincia:"Chiloé",label:"Ancud",bounds:[[-74.16144000099996,-42.25432000199992],[-73.47007999999994,-41.76652000099995]]},
    {cut_reg:"08",cut_prov:"082",value:"08201",region:"Biobío",provincia:"Arauco",label:"Lebu",bounds:[[-73.97358999999994,-38.44925000099993],[-73.41895999999997,-37.42135000199994]]},
    {cut_reg:"10",cut_prov:"103",value:"10303",region:"Los Lagos",provincia:"Osorno",label:"Purranque",bounds:[[-73.94531999999998,-41.06393684899995],[-72.92967991099994,-40.80353000199994]]},
    {cut_reg:"10",cut_prov:"101",value:"10104",region:"Los Lagos",provincia:"Llanquihue",label:"Fresia",bounds:[[-73.93346739299994,-41.31277181299999],[-73.28496000099994,-40.99271348199994]]},
    {cut_reg:"10",cut_prov:"103",value:"10305",region:"Los Lagos",provincia:"Osorno",label:"Río Negro",bounds:[[-73.87513750099998,-40.903540001999936],[-72.98056805599998,-40.63064000199995]]},
    {cut_reg:"10",cut_prov:"101",value:"10106",region:"Los Lagos",provincia:"Llanquihue",label:"Los Muermos",bounds:[[-73.86263484099999,-41.563721580999974],[-73.24714805999997,-41.209922193999944]]},
    {cut_reg:"12",cut_prov:"121",value:"12103",region:"Magallanes y de la Antártica Chilena",provincia:"Magallanes",label:"Río Verde",bounds:[[-73.84802867999997,-53.54086577399995],[-71.29275083799996,-52.33898612299999]]},
    {cut_reg:"10",cut_prov:"101",value:"10108",region:"Los Lagos",provincia:"Llanquihue",label:"Maullín",bounds:[[-73.84154000099994,-41.773500332999966],[-73.19409597699996,-41.49418000199995]]},
    {cut_reg:"10",cut_prov:"103",value:"10306",region:"Los Lagos",provincia:"Osorno",label:"San Juan de la Costa",bounds:[[-73.80464000199999,-40.74878755699996],[-73.30620999999996,-40.236070437999956]]},
    {cut_reg:"10",cut_prov:"102",value:"10207",region:"Los Lagos",provincia:"Chiloé",label:"Queilén",bounds:[[-73.75173000099994,-43.01561000199996],[-73.32447999999994,-42.74475000199993]]},
    {cut_reg:"10",cut_prov:"102",value:"10206",region:"Los Lagos",provincia:"Chiloé",label:"Puqueldón",bounds:[[-73.74477999999993,-42.708710000999986],[-73.51937999999996,-42.56832000099996]]},
    {cut_reg:"14",cut_prov:"142",value:"14201",region:"Los Ríos",provincia:"Ranco",label:"La Unión",bounds:[[-73.72527999899995,-40.36056393799999],[-72.511190001,-39.98006972699996]]},
    {cut_reg:"14",cut_prov:"141",value:"14102",region:"Los Ríos",provincia:"Valdivia",label:"Corral",bounds:[[-73.70757655599994,-40.11632000199996],[-73.13862834599996,-39.851080000999964]]},
    {cut_reg:"08",cut_prov:"082",value:"08202",region:"Biobío",provincia:"Arauco",label:"Arauco",bounds:[[-73.68718000099994,-37.451060001999956],[-73.06565753199999,-37.14367000199996]]},
    {cut_reg:"10",cut_prov:"102",value:"10204",region:"Los Lagos",provincia:"Chiloé",label:"Curaco de Vélez",bounds:[[-73.65907999999996,-42.47309000099995],[-73.50807999999995,-42.381740000999955]]},
    {cut_reg:"08",cut_prov:"081",value:"08102",region:"Biobío",provincia:"Concepción",label:"Coronel",bounds:[[-73.58944000099996,-37.10301000199996],[-72.95201826599998,-36.90435612999994]]},
    {cut_reg:"10",cut_prov:"102",value:"10209",region:"Los Lagos",provincia:"Chiloé",label:"Quemchi",bounds:[[-73.58770000099997,-42.39761000099998],[-73.05398000099997,-41.97206000099992]]},
    {cut_reg:"08",cut_prov:"082",value:"08206",region:"Biobío",provincia:"Arauco",label:"Los Alamos",bounds:[[-73.58288545299996,-37.866245418999924],[-73.11306636999996,-37.54325000199997]]},
    {cut_reg:"08",cut_prov:"082",value:"08203",region:"Biobío",provincia:"Arauco",label:"Cañete",bounds:[[-73.54755681499995,-38.130580001999924],[-73.01569647999997,-37.69163000199995]]},
    {cut_reg:"10",cut_prov:"101",value:"10102",region:"Los Lagos",provincia:"Llanquihue",label:"Calbuco",bounds:[[-73.54025270899996,-41.913500000999925],[-72.87956999999994,-41.57197126399996]]},
    {cut_reg:"10",cut_prov:"102",value:"10210",region:"Los Lagos",provincia:"Chiloé",label:"Quinchao",bounds:[[-73.53957999999994,-42.66300000199994],[-73.19738999999998,-42.36476000099998]]},
    {cut_reg:"08",cut_prov:"082",value:"08207",region:"Biobío",provincia:"Arauco",label:"Tirúa",bounds:[[-73.53113999999994,-38.49244739099998],[-73.23447999999996,-38.112860000999945]]},
    {cut_reg:"09",cut_prov:"091",value:"09102",region:"La Araucanía",provincia:"Cautín",label:"Carahue",bounds:[[-73.52025999999995,-38.90182004499997],[-73.04970999999995,-38.39426830999996]]},
    {cut_reg:"11",cut_prov:"113",value:"11302",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Capitán Prat",label:"O'Higgins",bounds:[[-73.51740919299993,-49.15877555912798],[-72.22638454599998,-47.73351565199994]]},
    {cut_reg:"11",cut_prov:"113",value:"11301",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Capitán Prat",label:"Cochrane",bounds:[[-73.50777914399998,-47.93593169799993],[-71.85032105599998,-46.85966805699995]]},
    {cut_reg:"08",cut_prov:"082",value:"08205",region:"Biobío",provincia:"Arauco",label:"Curanilahue",bounds:[[-73.50563000099999,-37.687616883999965],[-72.98110395499998,-37.32833000199998]]},
    {cut_reg:"12",cut_prov:"124",value:"12402",region:"Magallanes y de la Antártica Chilena",provincia:"Última Esperanza",label:"Torres del Paine",bounds:[[-73.46780411599997,-51.56396958399994],[-72.24594204399995,-50.60069139199993]]},
    {cut_reg:"10",cut_prov:"103",value:"10307",region:"Los Lagos",provincia:"Osorno",label:"San Pablo",bounds:[[-73.45267999999999,-40.541207331999935],[-72.85509650599994,-40.30457385799996]]},
    {cut_reg:"09",cut_prov:"091",value:"09116",region:"La Araucanía",provincia:"Cautín",label:"Saavedra",bounds:[[-73.42525128799998,-38.96624875199996],[-73.17146999999994,-38.69407000199994]]},
    {cut_reg:"10",cut_prov:"103",value:"10301",region:"Los Lagos",provincia:"Osorno",label:"Osorno",bounds:[[-73.41815999999994,-40.78796247199995],[-72.76836502699996,-40.41960369299994]]},
    {cut_reg:"11",cut_prov:"114",value:"11401",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"General Carrera",label:"Chile Chico",bounds:[[-73.41214855699997,-47.09459857999996],[-71.64353637299996,-46.43645041499997]]},
    {cut_reg:"14",cut_prov:"141",value:"14101",region:"Los Ríos",provincia:"Valdivia",label:"Valdivia",bounds:[[-73.41136999999998,-40.03175000199996],[-72.92016621599998,-39.63638138099998]]},
    {cut_reg:"10",cut_prov:"101",value:"10105",region:"Los Lagos",provincia:"Llanquihue",label:"Frutillar",bounds:[[-73.39662987199995,-41.203370001999986],[-72.79809246499997,-40.97692725699994]]},
    {cut_reg:"10",cut_prov:"101",value:"10109",region:"Los Lagos",provincia:"Llanquihue",label:"Puerto Varas",bounds:[[-73.35693000099997,-41.459630002999965],[-71.81793034999998,-40.800030000999975]]},
    {cut_reg:"08",cut_prov:"082",value:"08204",region:"Biobío",provincia:"Arauco",label:"Contulmo",bounds:[[-73.35234999999994,-38.29652409699998],[-73.07252018399998,-37.83867584799998]]},
    {cut_reg:"10",cut_prov:"101",value:"10101",region:"Los Lagos",provincia:"Llanquihue",label:"Puerto Montt",bounds:[[-73.34084435899997,-41.69740757599993],[-72.37412000099994,-41.329740000999955]]},
    {cut_reg:"09",cut_prov:"092",value:"09207",region:"La Araucanía",provincia:"Malleco",label:"Lumaco",bounds:[[-73.34005440699997,-38.480309675999926],[-72.78742999899998,-38.07010000199993]]},
    {cut_reg:"09",cut_prov:"091",value:"09117",region:"La Araucanía",provincia:"Cautín",label:"Teodoro Schmidt",bounds:[[-73.33121625299998,-39.25197626999994],[-72.87270999999998,-38.888833027999965]]},
    {cut_reg:"10",cut_prov:"101",value:"10107",region:"Los Lagos",provincia:"Llanquihue",label:"Llanquihue",bounds:[[-73.32820389899996,-41.31255502599998],[-72.88966999999997,-41.129410001999936]]},
    {cut_reg:"14",cut_prov:"141",value:"14106",region:"Los Ríos",provincia:"Valdivia",label:"Mariquina",bounds:[[-73.32408000099997,-39.72275000199994],[-72.6013,-39.287472342999926]]},
    {cut_reg:"09",cut_prov:"091",value:"09118",region:"La Araucanía",provincia:"Cautín",label:"Toltén",bounds:[[-73.24280004099995,-39.41827270699997],[-72.85201999999998,-39.01079626199998]]},
    {cut_reg:"08",cut_prov:"081",value:"08112",region:"Biobío",provincia:"Concepción",label:"Hualpén",bounds:[[-73.22090000099996,-36.82367271799996],[-73.06615142099997,-36.74296000099998]]},
    {cut_reg:"09",cut_prov:"092",value:"09208",region:"La Araucanía",provincia:"Malleco",label:"Purén",bounds:[[-73.20592675499995,-38.15615000199995],[-72.89000999999996,-37.83804000199996]]},
    {cut_reg:"08",cut_prov:"081",value:"08106",region:"Biobío",provincia:"Concepción",label:"Lota",bounds:[[-73.18570330699998,-37.20201036499997],[-73.04161999999997,-37.049998928999955]]},
    {cut_reg:"14",cut_prov:"141",value:"14107",region:"Los Ríos",provincia:"Valdivia",label:"Paillaco",bounds:[[-73.17308029599997,-40.20076226499999],[-72.54083077799999,-39.92336706999998]]},
    {cut_reg:"08",cut_prov:"081",value:"08108",region:"Biobío",provincia:"Concepción",label:"San Pedro de la Paz",bounds:[[-73.16571999999996,-36.977034283999956],[-73.02762643499995,-36.81206773299993]]},
    {cut_reg:"08",cut_prov:"081",value:"08110",region:"Biobío",provincia:"Concepción",label:"Talcahuano",bounds:[[-73.16270999999995,-36.795578072999945],[-73.01394281799998,-36.601770000999984]]},
    {cut_reg:"11",cut_prov:"114",value:"11402",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"General Carrera",label:"Río Ibáñez",bounds:[[-73.137817892,-46.685285974999935],[-71.71282726770826,-45.916825186999965]]},
    {cut_reg:"08",cut_prov:"081",value:"08109",region:"Biobío",provincia:"Concepción",label:"Santa Juana",bounds:[[-73.13428717599999,-37.45104325899995],[-72.72695177199995,-37.06772000199992]]},
    {cut_reg:"14",cut_prov:"142",value:"14204",region:"Los Ríos",provincia:"Ranco",label:"Río Bueno",bounds:[[-73.13406845999998,-40.680939548999945],[-71.87569493701186,-40.256639132999965]]},
    {cut_reg:"09",cut_prov:"091",value:"09111",region:"La Araucanía",provincia:"Cautín",label:"Nueva Imperial",bounds:[[-73.12689999999998,-38.91269000099993],[-72.79925000099996,-38.49612504599998]]},
    {cut_reg:"09",cut_prov:"092",value:"09201",region:"La Araucanía",provincia:"Malleco",label:"Angol",bounds:[[-73.12441224999998,-38.02371410899996],[-72.48366566999994,-37.58172591199996]]},
    {cut_reg:"10",cut_prov:"104",value:"10401",region:"Los Lagos",provincia:"Palena",label:"Chaitén",bounds:[[-73.10480000099994,-43.79749402099996],[-72.11849823999995,-42.187990000999946]]},
    {cut_reg:"14",cut_prov:"141",value:"14105",region:"Los Ríos",provincia:"Valdivia",label:"Máfil",bounds:[[-73.10290999999995,-39.819080001999964],[-72.59244498899994,-39.591130001999936]]},
    {cut_reg:"08",cut_prov:"081",value:"08101",region:"Biobío",provincia:"Concepción",label:"Concepción",bounds:[[-73.09146304599994,-36.92711000099996],[-72.84465783299999,-36.76436342499994]]},
    {cut_reg:"08",cut_prov:"083",value:"08306",region:"Biobío",provincia:"Biobío",label:"Nacimiento",bounds:[[-73.07094638699994,-37.62982336699997],[-72.59275832999998,-37.27684798099994]]},
    {cut_reg:"09",cut_prov:"091",value:"09121",region:"La Araucanía",provincia:"Cautín",label:"Cholchol",bounds:[[-73.06240999999994,-38.71386000099994],[-72.75734999999997,-38.45726000099995]]},
    {cut_reg:"08",cut_prov:"081",value:"08103",region:"Biobío",provincia:"Concepción",label:"Chiguayante",bounds:[[-73.05986703299999,-36.96233428699997],[-72.94267000299999,-36.854476009999985]]},
    {cut_reg:"08",cut_prov:"081",value:"08107",region:"Biobío",provincia:"Concepción",label:"Penco",bounds:[[-73.04756141399997,-36.79822491599998],[-72.85125999999997,-36.69006000199994]]},
    {cut_reg:"09",cut_prov:"092",value:"09206",region:"La Araucanía",provincia:"Malleco",label:"Los Sauces",bounds:[[-73.03285999999997,-38.13471000099997],[-72.56098999899996,-37.83763000199997]]},
    {cut_reg:"08",cut_prov:"081",value:"08105",region:"Biobío",provincia:"Concepción",label:"Hualqui",bounds:[[-73.01488927099996,-37.20145149199993],[-72.72314063899995,-36.89083300999994]]},
    {cut_reg:"10",cut_prov:"103",value:"10302",region:"Los Lagos",provincia:"Osorno",label:"Puerto Octay",bounds:[[-73.01167,-41.119375671999926],[-72.03763756999996,-40.72388000199994]]},
    {cut_reg:"09",cut_prov:"091",value:"09106",region:"La Araucanía",provincia:"Cautín",label:"Galvarino",bounds:[[-73.00542173699995,-38.59375000199997],[-72.60946331299994,-38.32026900599993]]},
    {cut_reg:"08",cut_prov:"081",value:"08111",region:"Biobío",provincia:"Concepción",label:"Tomé",bounds:[[-73.00222999999994,-36.75120000099997],[-72.70552914299998,-36.443240000999936]]},
    {cut_reg:"09",cut_prov:"091",value:"09114",region:"La Araucanía",provincia:"Cautín",label:"Pitrufquén",bounds:[[-72.99459040299996,-39.23801000099996],[-72.31079722199996,-38.97177075599996]]},
    {cut_reg:"14",cut_prov:"141",value:"14104",region:"Los Ríos",provincia:"Valdivia",label:"Los Lagos",bounds:[[-72.98203999999998,-40.04220820499995],[-72.02585999999997,-39.659450001999964]]},
    {cut_reg:"09",cut_prov:"091",value:"09107",region:"La Araucanía",provincia:"Cautín",label:"Gorbea",bounds:[[-72.92859478499997,-39.29026103799999],[-72.40254640999996,-39.03063615499997]]},
    {cut_reg:"11",cut_prov:"111",value:"11101",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Coihaique",label:"Coihaique",bounds:[[-72.92785797099998,-46.13963908198466],[-71.31985000299994,-44.83081285799993]]},
    {cut_reg:"09",cut_prov:"091",value:"09105",region:"La Araucanía",provincia:"Cautín",label:"Freire",bounds:[[-72.91456000599999,-39.11933110999996],[-72.30029045299995,-38.825683424999966]]},
    {cut_reg:"09",cut_prov:"091",value:"09109",region:"La Araucanía",provincia:"Cautín",label:"Loncoche",bounds:[[-72.90193485499998,-39.50999299599993],[-72.30221999999998,-39.21457999999996]]},
    {cut_reg:"09",cut_prov:"092",value:"09210",region:"La Araucanía",provincia:"Malleco",label:"Traiguén",bounds:[[-72.90026192799996,-38.427120836999954],[-72.44330999999994,-38.06975000199997]]},
    {cut_reg:"10",cut_prov:"103",value:"10304",region:"Los Lagos",provincia:"Osorno",label:"Puyehue",bounds:[[-72.89664175099995,-40.885120001999944],[-71.82514451399999,-40.53492077299996]]},
    {cut_reg:"16",cut_prov:"162",value:"16203",region:"Ñuble",provincia:"Itata",label:"Coelemu",bounds:[[-72.88470334599998,-36.62502367299992],[-72.60664302899994,-36.38325431699998]]},
    {cut_reg:"10",cut_prov:"104",value:"10403",region:"Los Lagos",provincia:"Palena",label:"Hualaihué",bounds:[[-72.87695000099995,-42.68127095899996],[-72.01166808799996,-41.71376000199996]]},
    {cut_reg:"08",cut_prov:"081",value:"08104",region:"Biobío",provincia:"Concepción",label:"Florida",bounds:[[-72.87082999999996,-36.96363000099994],[-72.53848647499996,-36.65241363399998]]},
    {cut_reg:"16",cut_prov:"162",value:"16207",region:"Ñuble",provincia:"Itata",label:"Treguaco",bounds:[[-72.87003999999996,-36.53708000199999],[-72.50452999999999,-36.326920000999955]]},
    {cut_reg:"16",cut_prov:"162",value:"16202",region:"Ñuble",provincia:"Itata",label:"Cobquecura",bounds:[[-72.85139800599995,-36.35871000199995],[-72.55257999999998,-36.005384084999946]]},
    {cut_reg:"14",cut_prov:"141",value:"14103",region:"Los Ríos",provincia:"Valdivia",label:"Lanco",bounds:[[-72.84886999899999,-39.64582000199994],[-72.32615999999996,-39.40484546699997]]},
    {cut_reg:"09",cut_prov:"091",value:"09112",region:"La Araucanía",provincia:"Cautín",label:"Padre Las Casas",bounds:[[-72.83960549199998,-38.90822496399995],[-72.32247335399995,-38.68427195999993]]},
    {cut_reg:"09",cut_prov:"091",value:"09101",region:"La Araucanía",provincia:"Cautín",label:"Temuco",bounds:[[-72.83453538499998,-38.78147573499996],[-72.46944999999994,-38.54952000099997]]},
    {cut_reg:"08",cut_prov:"083",value:"08310",region:"Biobío",provincia:"Biobío",label:"San Rosendo",bounds:[[-72.82350058399999,-37.273436578999956],[-72.63377999999994,-37.16575095999997]]},
    {cut_reg:"08",cut_prov:"083",value:"08313",region:"Biobío",provincia:"Biobío",label:"Yumbel",bounds:[[-72.79295862199996,-37.24900890799995],[-72.42247573299994,-36.91826000299995]]},
    {cut_reg:"07",cut_prov:"072",value:"07203",region:"Maule",provincia:"Cauquenes",label:"Pelluhue",bounds:[[-72.78572999999994,-36.04659063699995],[-72.42736000099995,-35.753590001999946]]},
    {cut_reg:"16",cut_prov:"162",value:"16206",region:"Ñuble",provincia:"Itata",label:"Ranquil",bounds:[[-72.73522163999996,-36.733357256999966],[-72.44855706399994,-36.54492037699998]]},
    {cut_reg:"08",cut_prov:"083",value:"08304",region:"Biobío",provincia:"Biobío",label:"Laja",bounds:[[-72.73069267199998,-37.395881073999924],[-72.43194873799996,-37.22755790299993]]},
    {cut_reg:"09",cut_prov:"092",value:"09209",region:"La Araucanía",provincia:"Malleco",label:"Renaico",bounds:[[-72.71015999999997,-37.83780000199993],[-72.45954999999998,-37.61730916399995]]},
    {cut_reg:"16",cut_prov:"162",value:"16201",region:"Ñuble",provincia:"Itata",label:"Quirihue",bounds:[[-72.70675999999997,-36.426262563999956],[-72.33549114099998,-36.06454423599996]]},
    {cut_reg:"14",cut_prov:"142",value:"14203",region:"Los Ríos",provincia:"Ranco",label:"Lago Ranco",bounds:[[-72.68347571099997,-40.58389436799996],[-71.65587160899997,-40.18601000199993]]},
    {cut_reg:"08",cut_prov:"083",value:"08301",region:"Biobío",provincia:"Biobío",label:"Los Angeles",bounds:[[-72.68344400799998,-37.66184123299995],[-72.03851313899997,-37.178586373999956]]},
    {cut_reg:"16",cut_prov:"161",value:"16107",region:"Ñuble",provincia:"Diguillín",label:"Quillón",bounds:[[-72.65773469999993,-36.93954951199998],[-72.37608999999998,-36.67788000199994]]},
    {cut_reg:"08",cut_prov:"083",value:"08307",region:"Biobío",provincia:"Biobío",label:"Negrete",bounds:[[-72.65339056999994,-37.67138223199999],[-72.47636382299999,-37.51884620799995]]},
    {cut_reg:"10",cut_prov:"101",value:"10103",region:"Los Lagos",provincia:"Llanquihue",label:"Cochamó",bounds:[[-72.64889004099996,-42.19028396699998],[-71.72447122799997,-41.31488000199994]]},
    {cut_reg:"07",cut_prov:"072",value:"07201",region:"Maule",provincia:"Cauquenes",label:"Cauquenes",bounds:[[-72.64807999999994,-36.26105909399996],[-71.97749996599998,-35.67436675699997]]},
    {cut_reg:"09",cut_prov:"091",value:"09113",region:"La Araucanía",provincia:"Cautín",label:"Perquenco",bounds:[[-72.63976516799994,-38.513590001999944],[-72.23452664599995,-38.35086533999999]]},
    {cut_reg:"09",cut_prov:"091",value:"09108",region:"La Araucanía",provincia:"Cautín",label:"Lautaro",bounds:[[-72.63944999899996,-38.670120002999965],[-71.85228999999998,-38.41937956899994]]},
    {cut_reg:"07",cut_prov:"072",value:"07202",region:"Maule",provincia:"Cauquenes",label:"Chanco",bounds:[[-72.63843999999995,-35.88109000199996],[-72.32352999999996,-35.54117221499997]]},
    {cut_reg:"14",cut_prov:"142",value:"14202",region:"Los Ríos",provincia:"Ranco",label:"Futrono",bounds:[[-72.63722122399999,-40.35473999999992],[-71.65730718501986,-39.89610740199998]]},
    {cut_reg:"16",cut_prov:"162",value:"16205",region:"Ñuble",provincia:"Itata",label:"Portezuelo",bounds:[[-72.62510999999995,-36.64042452099994],[-72.35292999999996,-36.43549000199994]]},
    {cut_reg:"07",cut_prov:"071",value:"07102",region:"Maule",provincia:"Talca",label:"Constitución",bounds:[[-72.61905696999997,-35.594380069999936],[-71.99580590899996,-35.10356350499995]]},
    {cut_reg:"14",cut_prov:"141",value:"14108",region:"Los Ríos",provincia:"Valdivia",label:"Panguipulli",bounds:[[-72.60377050699998,-40.11745499999994],[-71.59228686699998,-39.41965930899994]]},
    {cut_reg:"09",cut_prov:"092",value:"09204",region:"La Araucanía",provincia:"Malleco",label:"Ercilla",bounds:[[-72.57733999999994,-38.18828531699996],[-71.98446204799997,-37.93445000099995]]},
    {cut_reg:"16",cut_prov:"162",value:"16204",region:"Ñuble",provincia:"Itata",label:"Ninhue",bounds:[[-72.55185000099993,-36.483970001999985],[-72.27726189799995,-36.222885918999964]]},
    {cut_reg:"09",cut_prov:"092",value:"09211",region:"La Araucanía",provincia:"Malleco",label:"Victoria",bounds:[[-72.53976999999998,-38.45522714299994],[-71.92598999999996,-38.142898973999934]]},
    {cut_reg:"09",cut_prov:"092",value:"09202",region:"La Araucanía",provincia:"Malleco",label:"Collipulli",bounds:[[-72.53718999999995,-38.21036139899996],[-71.69363807199994,-37.766230642]]},
    {cut_reg:"08",cut_prov:"083",value:"08303",region:"Biobío",provincia:"Biobío",label:"Cabrero",bounds:[[-72.53234000099997,-37.22051873599997],[-72.18236891199996,-36.89615272699995]]},
    {cut_reg:"09",cut_prov:"091",value:"09119",region:"La Araucanía",provincia:"Cautín",label:"Vilcún",bounds:[[-72.52021883699996,-38.855770604999954],[-71.68206999999995,-38.556260001999924]]},
    {cut_reg:"08",cut_prov:"083",value:"08305",region:"Biobío",provincia:"Biobío",label:"Mulchén",bounds:[[-72.50645804499999,-38.18872399399992],[-71.61253510699999,-37.557540001999946]]},
    {cut_reg:"16",cut_prov:"161",value:"16101",region:"Ñuble",provincia:"Diguillín",label:"Chillán",bounds:[[-72.47248576899995,-36.75052000199997],[-71.85590103999994,-36.50806115999995]]},
    {cut_reg:"07",cut_prov:"071",value:"07104",region:"Maule",provincia:"Talca",label:"Empedrado",bounds:[[-72.45938673599994,-35.73468699999996],[-72.03654324699994,-35.47761000199995]]},
    {cut_reg:"16",cut_prov:"161",value:"16102",region:"Ñuble",provincia:"Diguillín",label:"Bulnes",bounds:[[-72.45225999999997,-36.90126000099997],[-72.10818999899993,-36.68798288599992]]},
    {cut_reg:"09",cut_prov:"091",value:"09120",region:"La Araucanía",provincia:"Cautín",label:"Villarrica",bounds:[[-72.43614181699996,-39.53106829699992],[-71.90940335299997,-39.059714166999974]]},
    {cut_reg:"11",cut_prov:"111",value:"11102",region:"Aysén del General Carlos Ibáñez del Campo",provincia:"Coihaique",label:"Lago Verde",bounds:[[-72.39583873199996,-44.88023417099998],[-71.09130859399994,-43.925271974999916]]},
    {cut_reg:"16",cut_prov:"163",value:"16305",region:"Ñuble",provincia:"Punilla",label:"San Nicolás",bounds:[[-72.39556999999996,-36.62257761699993],[-72.04904220799995,-36.349203925999966]]},
    {cut_reg:"16",cut_prov:"161",value:"16105",region:"Ñuble",provincia:"Diguillín",label:"Pemuco",bounds:[[-72.38576999999998,-37.06632000199994],[-71.59367108699996,-36.86368000199997]]},
    {cut_reg:"16",cut_prov:"161",value:"16103",region:"Ñuble",provincia:"Diguillín",label:"Chillán Viejo",bounds:[[-72.35905304299996,-36.748018050999974],[-72.05751000099997,-36.61399999999997]]},
    {cut_reg:"09",cut_prov:"091",value:"09103",region:"La Araucanía",provincia:"Cautín",label:"Cunco",bounds:[[-72.35636220599999,-39.185660001999956],[-71.53404999999998,-38.725824369999934]]},
    {cut_reg:"16",cut_prov:"163",value:"16301",region:"Ñuble",provincia:"Punilla",label:"San Carlos",bounds:[[-72.33424999999994,-36.551961158999966],[-71.66584999999998,-36.206922395999996]]},
    {cut_reg:"12",cut_prov:"122",value:"12201",region:"Magallanes y de la Antártica Chilena",provincia:"Antártica Chilena",label:"Cabo de Hornos",bounds:[[-72.32989319499997,-56.53776581899995],[-66.41559401099994,-54.361971909999966]]},
    {cut_reg:"10",cut_prov:"104",value:"10404",region:"Los Lagos",provincia:"Palena",label:"Palena",bounds:[[-72.32297052999996,-44.067119497485976],[-71.58100815399996,-43.23727000099995]]},
    {cut_reg:"16",cut_prov:"161",value:"16109",region:"Ñuble",provincia:"Diguillín",label:"Yungay",bounds:[[-72.27992935199995,-37.19846992899995],[-71.54055599599997,-36.99705179899997]]},
    {cut_reg:"10",cut_prov:"104",value:"10402",region:"Los Lagos",provincia:"Palena",label:"Futaleufú",bounds:[[-72.24177999999995,-43.43821498543565],[-71.72934584899997,-42.88701128499997]]},
    {cut_reg:"16",cut_prov:"161",value:"16104",region:"Ñuble",provincia:"Diguillín",label:"El Carmen",bounds:[[-72.21635999999995,-37.014451178999934],[-71.58693999999997,-36.82609211399995]]},
    {cut_reg:"07",cut_prov:"071",value:"07103",region:"Maule",provincia:"Talca",label:"Curepto",bounds:[[-72.21091999999999,-35.34685000199993],[-71.67107992999996,-34.96946005399996]]},
    {cut_reg:"16",cut_prov:"161",value:"16108",region:"Ñuble",provincia:"Diguillín",label:"San Ignacio",bounds:[[-72.20277999999996,-36.90300000199994],[-71.75639000099994,-36.728878197999954]]},
    {cut_reg:"07",cut_prov:"074",value:"07406",region:"Maule",provincia:"Linares",label:"San Javier",bounds:[[-72.18775293099998,-35.85714000199994],[-71.57892399799994,-35.41774829899999]]},
    {cut_reg:"07",cut_prov:"073",value:"07303",region:"Maule",provincia:"Curicó",label:"Licantén",bounds:[[-72.18770999999998,-35.05911853499997],[-71.83220946699998,-34.87814175099994]]},
    {cut_reg:"08",cut_prov:"083",value:"08309",region:"Biobío",provincia:"Biobío",label:"Quilleco",bounds:[[-72.17752999999993,-37.58600000199994],[-71.46273754799995,-37.20473812199997]]},
    {cut_reg:"08",cut_prov:"083",value:"08311",region:"Biobío",provincia:"Biobío",label:"Santa Bárbara",bounds:[[-72.17476181499995,-37.80771234299994],[-71.35185999999999,-37.46030000099996]]},
    {cut_reg:"07",cut_prov:"073",value:"07309",region:"Maule",provincia:"Curicó",label:"Vichuquén",bounds:[[-72.15871802999999,-34.97425839999994],[-71.86814000099997,-34.68437372499994]]},
    {cut_reg:"08",cut_prov:"083",value:"08308",region:"Biobío",provincia:"Biobío",label:"Quilaco",bounds:[[-72.15442999999993,-38.314590826999954],[-71.41066468799994,-37.647586617999934]]},
    {cut_reg:"16",cut_prov:"163",value:"16303",region:"Ñuble",provincia:"Punilla",label:"Ñiquén",bounds:[[-72.13907856599997,-36.440670000999944],[-71.62929999999994,-36.125482372999954]]},
    {cut_reg:"09",cut_prov:"092",value:"09203",region:"La Araucanía",provincia:"Malleco",label:"Curacautín",bounds:[[-72.11118446999996,-38.668370000999964],[-71.44919999999996,-38.195200001999964]]},
    {cut_reg:"07",cut_prov:"074",value:"07404",region:"Maule",provincia:"Linares",label:"Parral",bounds:[[-72.10720767499998,-36.54381834199996],[-71.10783126499996,-35.915024711999926]]},
    {cut_reg:"07",cut_prov:"071",value:"07107",region:"Maule",provincia:"Talca",label:"Pencahue",bounds:[[-72.10498000099994,-35.47378234699994],[-71.55675376399995,-35.14527212399998]]},
    {cut_reg:"09",cut_prov:"091",value:"09115",region:"La Araucanía",provincia:"Cautín",label:"Pucón",bounds:[[-72.06924897999994,-39.50857720299996],[-71.50182268699996,-39.06618351799995]]},
    {cut_reg:"08",cut_prov:"083",value:"08312",region:"Biobío",provincia:"Biobío",label:"Tucapel",bounds:[[-72.06535976599997,-37.35467857399993],[-71.48443912499994,-37.06209916699993]]},
    {cut_reg:"06",cut_prov:"062",value:"06206",region:"Libertador General Bernardo O'Higgins",provincia:"Cardenal Caro",label:"Paredones",bounds:[[-72.05754075199997,-34.84093605799994],[-71.78054374099997,-34.507653776999966]]},
    {cut_reg:"06",cut_prov:"062",value:"06201",region:"Libertador General Bernardo O'Higgins",provincia:"Cardenal Caro",label:"Pichilemu",bounds:[[-72.05181999999996,-34.57320193199996],[-71.74662896099994,-34.162680796999936]]},
    {cut_reg:"07",cut_prov:"074",value:"07405",region:"Maule",provincia:"Linares",label:"Retiro",bounds:[[-72.03825622499994,-36.21783062199996],[-71.56417075199994,-35.818100001999944]]},
    {cut_reg:"16",cut_prov:"163",value:"16302",region:"Ñuble",provincia:"Punilla",label:"Coihueco",bounds:[[-72.03670373099999,-36.98110573499998],[-71.08746103630679,-36.477926539999935]]},
    {cut_reg:"06",cut_prov:"062",value:"06203",region:"Libertador General Bernardo O'Higgins",provincia:"Cardenal Caro",label:"Litueche",bounds:[[-72.01152999999994,-34.244365038999945],[-71.46155012699997,-33.968049346999976]]},
    {cut_reg:"16",cut_prov:"161",value:"16106",region:"Ñuble",provincia:"Diguillín",label:"Pinto",bounds:[[-72.00430148999999,-37.11578031799996],[-71.0961847231267,-36.66611765999994]]},
    {cut_reg:"07",cut_prov:"073",value:"07302",region:"Maule",provincia:"Curicó",label:"Hualañé",bounds:[[-71.94820999999996,-35.102482883999976],[-71.45771853399998,-34.81766367299996]]},
    {cut_reg:"06",cut_prov:"062",value:"06205",region:"Libertador General Bernardo O'Higgins",provincia:"Cardenal Caro",label:"Navidad",bounds:[[-71.94444999999996,-34.110960029999944],[-71.69219437499999,-33.90215856299994]]},
    {cut_reg:"08",cut_prov:"083",value:"08302",region:"Biobío",provincia:"Biobío",label:"Antuco",bounds:[[-71.89848560699994,-37.65889174599993],[-71.09199002199995,-37.00454147099998]]},
    {cut_reg:"05",cut_prov:"056",value:"05606",region:"Valparaíso",provincia:"San Antonio",label:"Santo Domingo",bounds:[[-71.89574999999996,-33.97420000099993],[-71.53491694899998,-33.613617698999974]]},
    {cut_reg:"07",cut_prov:"071",value:"07105",region:"Maule",provincia:"Talca",label:"Maule",bounds:[[-71.88292091899996,-35.58678944599994],[-71.57024381699995,-35.444020001999945]]},
    {cut_reg:"06",cut_prov:"062",value:"06204",region:"Libertador General Bernardo O'Higgins",provincia:"Cardenal Caro",label:"Marchihue",bounds:[[-71.87881375699999,-34.52797531499994],[-71.45436746399997,-34.205896501999966]]},
    {cut_reg:"06",cut_prov:"063",value:"06309",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Pumanque",bounds:[[-71.86019758999998,-34.70095336899994],[-71.53426316699995,-34.48623346199997]]},
    {cut_reg:"09",cut_prov:"091",value:"09110",region:"La Araucanía",provincia:"Cautín",label:"Melipeuco",bounds:[[-71.85272671699994,-39.014103711999944],[-71.38886912899994,-38.59312154299994]]},
    {cut_reg:"07",cut_prov:"074",value:"07403",region:"Maule",provincia:"Linares",label:"Longaví",bounds:[[-71.82869442599997,-36.38835000199997],[-71.06148000099995,-35.78006000099999]]},
    {cut_reg:"06",cut_prov:"063",value:"06304",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Lolol",bounds:[[-71.82631275399996,-34.93718534499993],[-71.47813442799998,-34.63177821399996]]},
    {cut_reg:"07",cut_prov:"074",value:"07401",region:"Maule",provincia:"Linares",label:"Linares",bounds:[[-71.79645999999997,-36.22579240899995],[-71.00591999999995,-35.70395000199994]]},
    {cut_reg:"06",cut_prov:"062",value:"06202",region:"Libertador General Bernardo O'Higgins",provincia:"Cardenal Caro",label:"La Estrella",bounds:[[-71.79239292499994,-34.318400216999976],[-71.45225752299996,-34.08983019799995]]},
    {cut_reg:"07",cut_prov:"074",value:"07407",region:"Maule",provincia:"Linares",label:"Villa Alegre",bounds:[[-71.77364999999998,-35.77900809199996],[-71.57182999999998,-35.60922641199994]]},
    {cut_reg:"09",cut_prov:"091",value:"09104",region:"La Araucanía",provincia:"Cautín",label:"Curarrehue",bounds:[[-71.74608961299998,-39.63723989299995],[-71.37407171499996,-38.97125692799995]]},
    {cut_reg:"05",cut_prov:"051",value:"05101",region:"Valparaíso",provincia:"Valparaíso",label:"Valparaíso",bounds:[[-71.745,-33.212],[-71.383,-33.0179]]},
    {cut_reg:"07",cut_prov:"071",value:"07101",region:"Maule",provincia:"Talca",label:"Talca",bounds:[[-71.72274504899997,-35.531014607999964],[-71.49251700099995,-35.31156176799992]]},
    {cut_reg:"04",cut_prov:"043",value:"04301",region:"Coquimbo",provincia:"Limarí",label:"Ovalle",bounds:[[-71.71781999799998,-31.21618347399994],[-70.85289661699994,-30.31063025699995]]},
    {cut_reg:"13",cut_prov:"135",value:"13505",region:"Metropolitana de Santiago",provincia:"Melipilla",label:"San Pedro",bounds:[[-71.71547979899998,-34.07599442499998],[-71.20709321099997,-33.76372933099997]]},
    {cut_reg:"05",cut_prov:"056",value:"05604",region:"Valparaíso",provincia:"San Antonio",label:"El Quisco",bounds:[[-71.71005000099996,-33.44764000099996],[-71.58860730199996,-33.37188713799996]]},
    {cut_reg:"05",cut_prov:"051",value:"05102",region:"Valparaíso",provincia:"Valparaíso",label:"Casablanca",bounds:[[-71.70775000099997,-33.48910050699993],[-71.19560243599996,-33.15489000099995]]},
    {cut_reg:"07",cut_prov:"073",value:"07307",region:"Maule",provincia:"Curicó",label:"Sagrada Familia",bounds:[[-71.70226931099995,-35.24524195599998],[-71.24864569299996,-34.97863738099995]]},
    {cut_reg:"05",cut_prov:"056",value:"05602",region:"Valparaíso",provincia:"San Antonio",label:"Algarrobo",bounds:[[-71.69778000099996,-33.402847237999936],[-71.52342393799995,-33.251589269999954]]},
    {cut_reg:"08",cut_prov:"083",value:"08314",region:"Biobío",provincia:"Biobío",label:"Alto Biobío",bounds:[[-71.69134999899995,-38.124032678873355],[-70.98297989199995,-37.547950001999936]]},
    {cut_reg:"16",cut_prov:"163",value:"16304",region:"Ñuble",provincia:"Punilla",label:"San Fabián",bounds:[[-71.68874999999997,-36.946873473999965],[-71.00700729999994,-36.36114814399996]]},
    {cut_reg:"12",cut_prov:"121",value:"12102",region:"Magallanes y de la Antártica Chilena",provincia:"Magallanes",label:"Laguna Blanca",bounds:[[-71.68172900299999,-52.814785506999954],[-70.86068894299996,-51.99983469399996]]},
    {cut_reg:"05",cut_prov:"056",value:"05605",region:"Valparaíso",provincia:"San Antonio",label:"El Tabo",bounds:[[-71.68103999999995,-33.531856259999984],[-71.47747614499997,-33.42846125999995]]},
    {cut_reg:"04",cut_prov:"041",value:"04102",region:"Coquimbo",provincia:"Elqui",label:"Coquimbo",bounds:[[-71.67134999699994,-30.50997505999993],[-71.11016120299996,-29.92080000099997]]},
    {cut_reg:"07",cut_prov:"074",value:"07408",region:"Maule",provincia:"Linares",label:"Yerbas Buenas",bounds:[[-71.66652999999997,-35.789330001999936],[-71.42853852099995,-35.584309991999945]]},
    {cut_reg:"04",cut_prov:"042",value:"04202",region:"Coquimbo",provincia:"Choapa",label:"Canela",bounds:[[-71.64745999999997,-31.787607710999964],[-71.08605589199993,-31.141499055999933]]},
    {cut_reg:"07",cut_prov:"071",value:"07110",region:"Maule",provincia:"Talca",label:"San Rafael",bounds:[[-71.64343083699998,-35.37179000199995],[-71.36161320599996,-35.21310618199993]]},
    {cut_reg:"09",cut_prov:"092",value:"09205",region:"La Araucanía",provincia:"Malleco",label:"Lonquimay",bounds:[[-71.64314709399997,-38.9095549209567],[-70.82645737199994,-38.08454818199993]]},
    {cut_reg:"06",cut_prov:"063",value:"06307",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Peralillo",bounds:[[-71.64268999999996,-34.56714479599998],[-71.37342170999995,-34.35838383299995]]},
    {cut_reg:"05",cut_prov:"056",value:"05601",region:"Valparaíso",provincia:"San Antonio",label:"San Antonio",bounds:[[-71.63063135699997,-33.79008454499995],[-71.32821282999998,-33.55214097499993]]},
    {cut_reg:"05",cut_prov:"056",value:"05603",region:"Valparaíso",provincia:"San Antonio",label:"Cartagena",bounds:[[-71.62754836999994,-33.61001793799994],[-71.32791403199997,-33.45126505699994]]},
    {cut_reg:"07",cut_prov:"073",value:"07305",region:"Maule",provincia:"Curicó",label:"Rauco",bounds:[[-71.59871531599998,-35.053570614999956],[-71.25981150299998,-34.83208378499994]]},
    {cut_reg:"03",cut_prov:"033",value:"03303",region:"Atacama",provincia:"Huasco",label:"Freirina",bounds:[[-71.59191000099997,-29.190720226999915],[-70.81281452799993,-28.279575433999977]]},
    {cut_reg:"05",cut_prov:"051",value:"05109",region:"Valparaíso",provincia:"Valparaíso",label:"Viña del Mar",bounds:[[-71.58711999999997,-33.10458210899997],[-71.44275999899997,-32.94472202399993]]},
    {cut_reg:"07",cut_prov:"071",value:"07109",region:"Maule",provincia:"Talca",label:"San Clemente",bounds:[[-71.58516999999995,-36.17951826399996],[-70.31174712199999,-35.37144175499997]]},
    {cut_reg:"06",cut_prov:"061",value:"06107",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Las Cabras",bounds:[[-71.57641623499995,-34.32719149399997],[-71.07160236499993,-34.01396022899996]]},
    {cut_reg:"04",cut_prov:"042",value:"04203",region:"Coquimbo",provincia:"Choapa",label:"Los Vilos",bounds:[[-71.57432999999997,-32.20319369699996],[-70.96519534199996,-31.67435944099998]]},
    {cut_reg:"06",cut_prov:"063",value:"06302",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Chépica",bounds:[[-71.57224189599998,-34.913424747999954],[-71.12008754199996,-34.67057094999996]]},
    {cut_reg:"04",cut_prov:"041",value:"04104",region:"Coquimbo",provincia:"Elqui",label:"La Higuera",bounds:[[-71.56070999999997,-29.71782011699998],[-70.44414519899993,-29.036599774999964]]},
    {cut_reg:"07",cut_prov:"071",value:"07106",region:"Maule",provincia:"Talca",label:"Pelarco",bounds:[[-71.55552362299994,-35.46894000199995],[-71.14529000099998,-35.30615000199998]]},
    {cut_reg:"05",cut_prov:"051",value:"05103",region:"Valparaíso",provincia:"Valparaíso",label:"Concón",bounds:[[-71.55453999999997,-33.00214266699992],[-71.38518890499995,-32.91381629599993]]},
    {cut_reg:"04",cut_prov:"043",value:"04304",region:"Coquimbo",provincia:"Limarí",label:"Punitaqui",bounds:[[-71.55205381299999,-31.176836739999935],[-71.01931693299997,-30.70892607399997]]},
    {cut_reg:"05",cut_prov:"051",value:"05107",region:"Valparaíso",provincia:"Valparaíso",label:"Quintero",bounds:[[-71.54795999899994,-32.923539655999946],[-71.38818645699996,-32.762825988999964]]},
    {cut_reg:"06",cut_prov:"063",value:"06310",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Santa Cruz",bounds:[[-71.54736796299994,-34.75524231099996],[-71.20473169199994,-34.52782109799995]]},
    {cut_reg:"05",cut_prov:"054",value:"05401",region:"Valparaíso",provincia:"Petorca",label:"La Ligua",bounds:[[-71.54228793299995,-32.621512400999954],[-71.04603101899995,-32.12795392199996]]},
    {cut_reg:"07",cut_prov:"074",value:"07402",region:"Maule",provincia:"Linares",label:"Colbún",bounds:[[-71.51855999999998,-36.50427780899997],[-70.56991012099996,-35.60757042999995]]},
    {cut_reg:"05",cut_prov:"051",value:"05105",region:"Valparaíso",provincia:"Valparaíso",label:"Puchuncaví",bounds:[[-71.50867999999997,-32.862918360999984],[-71.27739480199995,-32.626407749999935]]},
    {cut_reg:"07",cut_prov:"073",value:"07304",region:"Maule",provincia:"Curicó",label:"Molina",bounds:[[-71.50425518699996,-35.63001478799998],[-70.38465704099997,-35.02691046399996]]},
    {cut_reg:"05",cut_prov:"058",value:"05801",region:"Valparaíso",provincia:"Marga Marga",label:"Quilpué",bounds:[[-71.49400047699999,-33.24643000099998],[-70.98952019899997,-33.000093232999966]]},
    {cut_reg:"06",cut_prov:"063",value:"06306",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Palmilla",bounds:[[-71.48360436399997,-34.62179372599996],[-71.25162059099995,-34.42915913199993]]},
    {cut_reg:"05",cut_prov:"054",value:"05405",region:"Valparaíso",provincia:"Petorca",label:"Zapallar",bounds:[[-71.47636999999997,-32.68370400699995],[-71.20076999999998,-32.49600000099997]]},
    {cut_reg:"06",cut_prov:"061",value:"06113",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Pichidegua",bounds:[[-71.47213346999996,-34.48528503999996],[-71.18190581799996,-34.23753586299995]]},
    {cut_reg:"05",cut_prov:"054",value:"05403",region:"Valparaíso",provincia:"Petorca",label:"Papudo",bounds:[[-71.46308999999997,-32.55323425099992],[-71.28369232499995,-32.40245282899997]]},
    {cut_reg:"07",cut_prov:"071",value:"07108",region:"Maule",provincia:"Talca",label:"Río Claro",bounds:[[-71.46224723699999,-35.45629784799997],[-71.03797379399998,-35.130951223999936]]},
    {cut_reg:"05",cut_prov:"055",value:"05501",region:"Valparaíso",provincia:"Quillota",label:"Quillota",bounds:[[-71.45237330599997,-32.97360588899994],[-71.11992498799998,-32.830224127999934]]},
    {cut_reg:"05",cut_prov:"058",value:"05802",region:"Valparaíso",provincia:"Marga Marga",label:"Limache",bounds:[[-71.44293557599997,-33.16173747999994],[-71.13386999999994,-32.91688829599996]]},
    {cut_reg:"13",cut_prov:"135",value:"13501",region:"Metropolitana de Santiago",provincia:"Melipilla",label:"Melipilla",bounds:[[-71.44009785099996,-33.96411406099997],[-70.93524540399996,-33.539000674999954]]},
    {cut_reg:"05",cut_prov:"058",value:"05804",region:"Valparaíso",provincia:"Marga Marga",label:"Villa Alemana",bounds:[[-71.40108086799995,-33.12126321099997],[-71.25684829499994,-33.01152314399996]]},
    {cut_reg:"04",cut_prov:"042",value:"04201",region:"Coquimbo",provincia:"Choapa",label:"Illapel",bounds:[[-71.39699827899994,-31.90096566899997],[-70.52728486799998,-31.278483557999945]]},
    {cut_reg:"07",cut_prov:"073",value:"07301",region:"Maule",provincia:"Curicó",label:"Curicó",bounds:[[-71.38380742999993,-35.56010957909354],[-70.36796512999996,-34.88796000199994]]},
    {cut_reg:"07",cut_prov:"073",value:"07308",region:"Maule",provincia:"Curicó",label:"Teno",bounds:[[-71.36608886699997,-35.00327546699999],[-70.74652515599996,-34.78677906899997]]},
    {cut_reg:"13",cut_prov:"135",value:"13504",region:"Metropolitana de Santiago",provincia:"Melipilla",label:"María Pinto",bounds:[[-71.35324283399996,-33.58857637299997],[-71.01274719099996,-33.404090000999936]]},
    {cut_reg:"04",cut_prov:"041",value:"04101",region:"Coquimbo",provincia:"Elqui",label:"La Serena",bounds:[[-71.34498000099995,-30.137316731999928],[-70.68509188499996,-29.53623615399994]]},
    {cut_reg:"05",cut_prov:"055",value:"05504",region:"Valparaíso",provincia:"Quillota",label:"La Cruz",bounds:[[-71.33037372999996,-32.869599386999944],[-71.156354186,-32.77906081799995]]},
    {cut_reg:"05",cut_prov:"055",value:"05506",region:"Valparaíso",provincia:"Quillota",label:"Nogales",bounds:[[-71.31910999999997,-32.80944873699996],[-71.03370023999997,-32.59051154799994]]},
    {cut_reg:"06",cut_prov:"063",value:"06305",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Nancagua",bounds:[[-71.31882574399998,-34.761510165999944],[-71.10840350399997,-34.58587176799995]]},
    {cut_reg:"03",cut_prov:"033",value:"03304",region:"Atacama",provincia:"Huasco",label:"Huasco",bounds:[[-71.31464783099995,-28.61759484499992],[-70.77035843299996,-27.963370000999927]]},
    {cut_reg:"06",cut_prov:"061",value:"06112",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Peumo",bounds:[[-71.30543053199995,-34.418078331999936],[-71.13659865899996,-34.24626849399994]]},
    {cut_reg:"13",cut_prov:"135",value:"13502",region:"Metropolitana de Santiago",provincia:"Melipilla",label:"Alhué",bounds:[[-71.30172059999995,-34.183957930999966],[-70.79177312699994,-33.88877977099997]]},
    {cut_reg:"04",cut_prov:"043",value:"04302",region:"Coquimbo",provincia:"Limarí",label:"Combarbalá",bounds:[[-71.29253503399997,-31.43654000199996],[-70.59528746999996,-30.84228515799999]]},
    {cut_reg:"06",cut_prov:"061",value:"06117",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"San Vicente",bounds:[[-71.29213726999996,-34.59513860599998],[-70.96322916899999,-34.31331119399994]]},
    {cut_reg:"13",cut_prov:"135",value:"13503",region:"Metropolitana de Santiago",provincia:"Melipilla",label:"Curacaví",bounds:[[-71.27786686799993,-33.55994967399994],[-70.92038720199997,-33.19775356199994]]},
    {cut_reg:"05",cut_prov:"055",value:"05502",region:"Valparaíso",provincia:"Quillota",label:"Calera",bounds:[[-71.23247760299996,-32.867260000999984],[-71.08445761899998,-32.748872961999936]]},
    {cut_reg:"05",cut_prov:"058",value:"05803",region:"Valparaíso",provincia:"Marga Marga",label:"Olmué",bounds:[[-71.22281949799998,-33.12124144899996],[-71.00139020499995,-32.953597979999984]]},
    {cut_reg:"04",cut_prov:"041",value:"04103",region:"Coquimbo",provincia:"Elqui",label:"Andacollo",bounds:[[-71.22119951399998,-30.404043165999955],[-70.90621475499995,-30.10984909599995]]},
    {cut_reg:"07",cut_prov:"073",value:"07306",region:"Maule",provincia:"Curicó",label:"Romeral",bounds:[[-71.21536120699996,-35.272635460913854],[-70.35763994499996,-34.884576451999976]]},
    {cut_reg:"03",cut_prov:"033",value:"03301",region:"Atacama",provincia:"Huasco",label:"Vallenar",bounds:[[-71.20008999999999,-29.35664232499993],[-70.00291551399994,-28.01004387499995]]},
    {cut_reg:"06",cut_prov:"061",value:"06104",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Coltauco",bounds:[[-71.18986496899998,-34.409991973999965],[-70.96435190499994,-34.16511320099995]]},
    {cut_reg:"06",cut_prov:"063",value:"06303",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Chimbarongo",bounds:[[-71.18530683699998,-34.871788712999944],[-70.81213467499998,-34.607279241999954]]},
    {cut_reg:"05",cut_prov:"054",value:"05404",region:"Valparaíso",provincia:"Petorca",label:"Petorca",bounds:[[-71.18275707799997,-32.385815377999954],[-70.44481615999996,-32.02054079499993]]},
    {cut_reg:"05",cut_prov:"055",value:"05503",region:"Valparaíso",provincia:"Quillota",label:"Hijuelas",bounds:[[-71.17963717599997,-32.990357824999926],[-71.00349237899997,-32.735133801999936]]},
    {cut_reg:"06",cut_prov:"063",value:"06308",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"Placilla",bounds:[[-71.15864067599995,-34.69485299799994],[-71.00884860699995,-34.54373362599994]]},
    {cut_reg:"03",cut_prov:"031",value:"03101",region:"Atacama",provincia:"Copiapó",label:"Copiapó",bounds:[[-71.14452417399997,-28.18271636799994],[-68.26308429999995,-26.66248055299997]]},
    {cut_reg:"05",cut_prov:"054",value:"05402",region:"Valparaíso",provincia:"Petorca",label:"Cabildo",bounds:[[-71.14338189099993,-32.63462999999995],[-70.41033560699998,-32.212368267999985]]},
    {cut_reg:"04",cut_prov:"043",value:"04303",region:"Coquimbo",provincia:"Limarí",label:"Monte Patria",bounds:[[-71.12161662599993,-31.307555692470352],[-70.24602844299994,-30.491290001999968]]},
    {cut_reg:"13",cut_prov:"136",value:"13603",region:"Metropolitana de Santiago",provincia:"Talagante",label:"Isla de Maipo",bounds:[[-71.11988523599996,-33.80556187699994],[-70.81977781599994,-33.69633358899994]]},
    {cut_reg:"12",cut_prov:"123",value:"12303",region:"Magallanes y de la Antártica Chilena",provincia:"Tierra del Fuego",label:"Timaukel",bounds:[[-71.11770585599999,-54.78956080199998],[-68.60270184405272,-53.61505872499998]]},
    {cut_reg:"13",cut_prov:"136",value:"13602",region:"Metropolitana de Santiago",provincia:"Talagante",label:"El Monte",bounds:[[-71.11512514599997,-33.718311067999934],[-70.93639486399996,-33.61310322799994]]},
    {cut_reg:"04",cut_prov:"042",value:"04204",region:"Coquimbo",provincia:"Choapa",label:"Salamanca",bounds:[[-71.10161636999999,-32.28247000099997],[-70.20849396399996,-31.53559546499997]]},
    {cut_reg:"06",cut_prov:"061",value:"06103",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Coinco",bounds:[[-71.08750265499998,-34.337042111999935],[-70.87068159199998,-34.21671931499997]]},
    {cut_reg:"04",cut_prov:"043",value:"04305",region:"Coquimbo",provincia:"Limarí",label:"Río Hurtado",bounds:[[-71.07977849999997,-30.69494484799998],[-70.17949554499995,-30.208354987999932]]},
    {cut_reg:"04",cut_prov:"041",value:"04106",region:"Coquimbo",provincia:"Elqui",label:"Vicuña",bounds:[[-71.07484000099998,-30.39733528699997],[-69.80908203099995,-29.35644430899998]]},
    {cut_reg:"06",cut_prov:"061",value:"06114",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Quinta de Tilcoco",bounds:[[-71.07457354699994,-34.40596175099995],[-70.92859203399996,-34.31010450199995]]},
    {cut_reg:"05",cut_prov:"057",value:"05702",region:"Valparaíso",provincia:"San Felipe de Aconcagua",label:"Catemu",bounds:[[-71.05538232999999,-32.825994266999935],[-70.81968210699995,-32.60744507799995]]},
    {cut_reg:"06",cut_prov:"061",value:"06109",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Malloa",bounds:[[-71.04770431799994,-34.578053801999936],[-70.70649126799998,-34.38589861299994]]},
    {cut_reg:"06",cut_prov:"063",value:"06301",region:"Libertador General Bernardo O'Higgins",provincia:"Colchagua",label:"San Fernando",bounds:[[-71.04719384699996,-35.00519857245869],[-70.24825498899997,-34.47722707099995]]},
    {cut_reg:"05",cut_prov:"057",value:"05703",region:"Valparaíso",provincia:"San Felipe de Aconcagua",label:"Llaillay",bounds:[[-71.04062625299997,-32.98012105099996],[-70.72774058599998,-32.79844665899997]]},
    {cut_reg:"13",cut_prov:"133",value:"13303",region:"Metropolitana de Santiago",provincia:"Chacabuco",label:"Tiltil",bounds:[[-71.02946999999995,-33.22803057599998],[-70.71967403199994,-32.92192455199995]]},
    {cut_reg:"13",cut_prov:"136",value:"13601",region:"Metropolitana de Santiago",provincia:"Talagante",label:"Talagante",bounds:[[-71.02004205699996,-33.72310903299995],[-70.79177281099999,-33.631203038999956]]},
    {cut_reg:"13",cut_prov:"133",value:"13302",region:"Metropolitana de Santiago",provincia:"Chacabuco",label:"Lampa",bounds:[[-71.00406498399997,-33.386110549999955],[-70.71896330799996,-33.169914044999985]]},
    {cut_reg:"06",cut_prov:"061",value:"06105",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Doñihue",bounds:[[-70.99509646999996,-34.257693587999945],[-70.84218815899999,-34.14454000099994]]},
    {cut_reg:"13",cut_prov:"134",value:"13404",region:"Metropolitana de Santiago",provincia:"Maipo",label:"Paine",bounds:[[-70.98892715899996,-33.98891573099996],[-70.47404999999998,-33.736739179999965]]},
    {cut_reg:"03",cut_prov:"031",value:"03102",region:"Atacama",provincia:"Copiapó",label:"Caldera",bounds:[[-70.98160999999993,-27.833528342999955],[-70.24478999999997,-26.64461000099993]]},
    {cut_reg:"13",cut_prov:"136",value:"13605",region:"Metropolitana de Santiago",provincia:"Talagante",label:"Peñaflor",bounds:[[-70.96789999999999,-33.64811930999998],[-70.81897583299997,-33.575303663999925]]},
    {cut_reg:"06",cut_prov:"061",value:"06115",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Rengo",bounds:[[-70.95893710699994,-34.608588331999954],[-70.46743999999995,-34.28064293299996]]},
    {cut_reg:"13",cut_prov:"131",value:"13124",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Pudahuel",bounds:[[-70.95522358399995,-33.48873657899998],[-70.73126860999997,-33.350722606999966]]},
    {cut_reg:"13",cut_prov:"136",value:"13604",region:"Metropolitana de Santiago",provincia:"Talagante",label:"Padre Hurtado",bounds:[[-70.94864000999996,-33.59802618999998],[-70.77842521699995,-33.508620977999946]]},
    {cut_reg:"05",cut_prov:"057",value:"05704",region:"Valparaíso",provincia:"San Felipe de Aconcagua",label:"Panquehue",bounds:[[-70.94818130699997,-32.83456794099993],[-70.73707031599997,-32.731686052386934]]},
    {cut_reg:"06",cut_prov:"061",value:"06101",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Rancagua",bounds:[[-70.94150416499997,-34.21608187999993],[-70.67659025599994,-34.02871214299994]]},
    {cut_reg:"13",cut_prov:"131",value:"13119",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Maipú",bounds:[[-70.92996878599996,-33.57179557399997],[-70.71836475499998,-33.45818438999992]]},
    {cut_reg:"06",cut_prov:"061",value:"06116",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Requínoa",bounds:[[-70.92253945199997,-34.49762995899993],[-70.45390167199997,-34.20856000199995]]},
    {cut_reg:"12",cut_prov:"121",value:"12104",region:"Magallanes y de la Antártica Chilena",provincia:"Magallanes",label:"San Gregorio",bounds:[[-70.91617190999995,-52.76067632299998],[-68.41840244499997,-51.99983080599998]]},
    {cut_reg:"06",cut_prov:"061",value:"06111",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Olivar",bounds:[[-70.90130131499996,-34.24326635899996],[-70.73032351399996,-34.18677128299998]]},
    {cut_reg:"13",cut_prov:"134",value:"13402",region:"Metropolitana de Santiago",provincia:"Maipo",label:"Buin",bounds:[[-70.89769058199994,-33.83434000099993],[-70.61209033399996,-33.64365453299996]]},
    {cut_reg:"05",cut_prov:"057",value:"05701",region:"Valparaíso",provincia:"San Felipe de Aconcagua",label:"San Felipe",bounds:[[-70.87104557399994,-32.825330589999965],[-70.63400905599997,-32.64505999999994]]},
    {cut_reg:"13",cut_prov:"134",value:"13403",region:"Metropolitana de Santiago",provincia:"Maipo",label:"Calera de Tango",bounds:[[-70.86724055199994,-33.666056166999965],[-70.73538320299997,-33.569073628999945]]},
    {cut_reg:"05",cut_prov:"057",value:"05705",region:"Valparaíso",provincia:"San Felipe de Aconcagua",label:"Putaendo",bounds:[[-70.84299569199999,-32.71526258899996],[-70.21754557199995,-32.25416369799996]]},
    {cut_reg:"13",cut_prov:"134",value:"13401",region:"Metropolitana de Santiago",provincia:"Maipo",label:"San Bernardo",bounds:[[-70.82644879999998,-33.75486219699996],[-70.62862740399999,-33.52397724399998]]},
    {cut_reg:"06",cut_prov:"061",value:"06110",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Mostazal",bounds:[[-70.82482972799994,-34.04217363099997],[-70.36846159199996,-33.85068588199993]]},
    {cut_reg:"06",cut_prov:"061",value:"06106",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Graneros",bounds:[[-70.81873721099998,-34.138163709999944],[-70.67039510699993,-33.99652526499994]]},
    {cut_reg:"13",cut_prov:"131",value:"13125",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Quilicura",bounds:[[-70.80369471699998,-33.39364523299997],[-70.67995917499996,-33.31797000099994]]},
    {cut_reg:"13",cut_prov:"133",value:"13301",region:"Metropolitana de Santiago",provincia:"Chacabuco",label:"Colina",bounds:[[-70.79201402899997,-33.34261999999993],[-70.37254000099995,-32.94206561699997]]},
    {cut_reg:"13",cut_prov:"131",value:"13128",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Renca",bounds:[[-70.78253609399997,-33.42646412399994],[-70.67114118599994,-33.38129220899999]]},
    {cut_reg:"13",cut_prov:"131",value:"13103",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Cerro Navia",bounds:[[-70.78227139199998,-33.438792243999956],[-70.71585609799996,-33.41167798499998]]},
    {cut_reg:"05",cut_prov:"053",value:"05303",region:"Valparaíso",provincia:"Los Andes",label:"Rinconada",bounds:[[-70.76697786599993,-32.95961445299996],[-70.64848636899995,-32.78744241099996]]},
    {cut_reg:"02",cut_prov:"021",value:"02104",region:"Antofagasta",provincia:"Antofagasta",label:"Taltal",bounds:[[-70.74304000099994,-26.062272625999984],[-68.98563369999994,-24.555678292999968]]},
    {cut_reg:"13",cut_prov:"131",value:"13117",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Lo Prado",bounds:[[-70.74088335699997,-33.45841339699996],[-70.70557247999994,-33.43626390999998]]},
    {cut_reg:"13",cut_prov:"131",value:"13102",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Cerrillos",bounds:[[-70.73985428999998,-33.531412343999925],[-70.68550421799995,-33.47321036099992]]},
    {cut_reg:"13",cut_prov:"131",value:"13106",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Estación Central",bounds:[[-70.73362798099998,-33.481355937999986],[-70.67173296299995,-33.443840000999955]]},
    {cut_reg:"06",cut_prov:"061",value:"06102",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Codegua",bounds:[[-70.72702260199998,-34.154669641999924],[-70.32144182199994,-33.91906221199997]]},
    {cut_reg:"03",cut_prov:"032",value:"03201",region:"Atacama",provincia:"Chañaral",label:"Chañaral",bounds:[[-70.72609000099999,-26.943030001999947],[-69.88152002899994,-25.894657664999947]]},
    {cut_reg:"06",cut_prov:"061",value:"06108",region:"Libertador General Bernardo O'Higgins",provincia:"Cachapoal",label:"Machalí",bounds:[[-70.72425999899997,-34.70345075201239],[-70.00924489699997,-34.009012575999975]]},
    {cut_reg:"13",cut_prov:"131",value:"13126",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Quinta Normal",bounds:[[-70.72240769499996,-33.44878647899997],[-70.67141426999996,-33.40769705999997]]},
    {cut_reg:"13",cut_prov:"131",value:"13116",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Lo Espejo",bounds:[[-70.70638401399998,-33.53913040399993],[-70.67102962199993,-33.501996862999924]]},
    {cut_reg:"13",cut_prov:"131",value:"13105",region:"Metropolitana de Santiago",provincia:"Santiago",label:"El Bosque",bounds:[[-70.70080373299999,-33.58519718799994],[-70.65349877799997,-33.53913040399993]]},
    {cut_reg:"13",cut_prov:"131",value:"13104",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Conchalí",bounds:[[-70.70025777899997,-33.403030893999976],[-70.65676033499994,-33.36586718999996]]},
    {cut_reg:"13",cut_prov:"131",value:"13121",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Pedro Aguirre Cerda",bounds:[[-70.69537842199998,-33.510750345999945],[-70.65492178599999,-33.47579762999993]]},
    {cut_reg:"13",cut_prov:"131",value:"13107",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Huechuraba",bounds:[[-70.69273806099994,-33.40571441099997],[-70.58232999999996,-33.327849999999955]]},
    {cut_reg:"13",cut_prov:"131",value:"13101",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Santiago",bounds:[[-70.69203903999994,-33.47852001699994],[-70.62510664599995,-33.426004104999954]]},
    {cut_reg:"13",cut_prov:"131",value:"13109",region:"Metropolitana de Santiago",provincia:"Santiago",label:"La Cisterna",bounds:[[-70.68540430399997,-33.54876048599992],[-70.64462277299998,-33.510750345999945]]},
    {cut_reg:"05",cut_prov:"057",value:"05706",region:"Valparaíso",provincia:"San Felipe de Aconcagua",label:"Santa María",bounds:[[-70.68345030399996,-32.81363792499998],[-70.51253446599998,-32.56931316099997]]},
    {cut_reg:"13",cut_prov:"131",value:"13108",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Independencia",bounds:[[-70.68187285799998,-33.43193120699993],[-70.65011283799998,-33.39895290699995]]},
    {cut_reg:"05",cut_prov:"053",value:"05302",region:"Valparaíso",provincia:"Los Andes",label:"Calle Larga",bounds:[[-70.67645383799999,-33.08851275699993],[-70.40709930699995,-32.82531000099993]]},
    {cut_reg:"13",cut_prov:"131",value:"13130",region:"Metropolitana de Santiago",provincia:"Santiago",label:"San Miguel",bounds:[[-70.67102962199993,-33.518781991999965],[-70.63660464299994,-33.476437425999954]]},
    {cut_reg:"13",cut_prov:"131",value:"13112",region:"Metropolitana de Santiago",provincia:"Santiago",label:"La Pintana",bounds:[[-70.67064414599997,-33.62738756199996],[-70.60513312599994,-33.55496923599998]]},
    {cut_reg:"05",cut_prov:"053",value:"05301",region:"Valparaíso",provincia:"Los Andes",label:"Los Andes",bounds:[[-70.65894301999998,-33.18694832999994],[-69.98923310599997,-32.728057656045614]]},
    {cut_reg:"13",cut_prov:"131",value:"13127",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Recoleta",bounds:[[-70.65827129199994,-33.43569533599999],[-70.61034891299994,-33.376408943999934]]},
    {cut_reg:"13",cut_prov:"132",value:"13202",region:"Metropolitana de Santiago",provincia:"Cordillera",label:"Pirque",bounds:[[-70.65565848699998,-33.86240000099997],[-70.39962000099996,-33.57916651899995]]},
    {cut_reg:"13",cut_prov:"131",value:"13131",region:"Metropolitana de Santiago",provincia:"Santiago",label:"San Ramón",bounds:[[-70.65495069799994,-33.55817341099999],[-70.63100757899997,-33.51736589399996]]},
    {cut_reg:"13",cut_prov:"131",value:"13129",region:"Metropolitana de Santiago",provincia:"Santiago",label:"San Joaquín",bounds:[[-70.64197401399997,-33.51872977199998],[-70.61127594299995,-33.46956118399992]]},
    {cut_reg:"13",cut_prov:"131",value:"13111",region:"Metropolitana de Santiago",provincia:"Santiago",label:"La Granja",bounds:[[-70.63660464299994,-33.55981504399993],[-70.60974141799994,-33.51306294099994]]},
    {cut_reg:"13",cut_prov:"131",value:"13123",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Providencia",bounds:[[-70.63623470199997,-33.44983042199992],[-70.58226004899996,-33.40894000099996]]},
    {cut_reg:"13",cut_prov:"131",value:"13120",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Ñuñoa",bounds:[[-70.63155535899995,-33.47492625899996],[-70.57076363299996,-33.433795387999965]]},
    {cut_reg:"13",cut_prov:"132",value:"13201",region:"Metropolitana de Santiago",provincia:"Cordillera",label:"Puente Alto",bounds:[[-70.63126616199997,-33.64368677799996],[-70.48616164199996,-33.54241738699994]]},
    {cut_reg:"02",cut_prov:"021",value:"02101",region:"Antofagasta",provincia:"Antofagasta",label:"Antofagasta",bounds:[[-70.62886000099996,-25.402962183999936],[-68.06853426894057,-23.05792792699998]]},
    {cut_reg:"13",cut_prov:"131",value:"13118",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Macul",bounds:[[-70.62304918799998,-33.510351620999984],[-70.57645439999999,-33.469403456999935]]},
    {cut_reg:"03",cut_prov:"033",value:"03302",region:"Atacama",provincia:"Huasco",label:"Alto del Carmen",bounds:[[-70.61984999999999,-29.53500000199994],[-69.68690689199997,-28.57231511499998]]},
    {cut_reg:"13",cut_prov:"131",value:"13110",region:"Metropolitana de Santiago",provincia:"Santiago",label:"La Florida",bounds:[[-70.61499793999997,-33.57031269499998],[-70.43641874199994,-33.49193549999994]]},
    {cut_reg:"13",cut_prov:"131",value:"13132",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Vitacura",bounds:[[-70.61396999999994,-33.409257631999935],[-70.51763178399995,-33.35068999999992]]},
    {cut_reg:"05",cut_prov:"053",value:"05304",region:"Valparaíso",provincia:"Los Andes",label:"San Esteban",bounds:[[-70.61344698599999,-32.90987655999993],[-70.12322921999998,-32.42905985899996]]},
    {cut_reg:"13",cut_prov:"131",value:"13114",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Las Condes",bounds:[[-70.60771940399997,-33.48597000199993],[-70.42731740899995,-33.364211489999946]]},
    {cut_reg:"02",cut_prov:"021",value:"02102",region:"Antofagasta",provincia:"Antofagasta",label:"Mejillones",bounds:[[-70.60668999999996,-23.360959864999927],[-69.89372694599996,-22.42540000699995]]},
    {cut_reg:"13",cut_prov:"131",value:"13115",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Lo Barnechea",bounds:[[-70.60456064799996,-33.490973336999964],[-70.17557105199995,-33.096705114999956]]},
    {cut_reg:"13",cut_prov:"131",value:"13122",region:"Metropolitana de Santiago",provincia:"Santiago",label:"Peñalolén",bounds:[[-70.59021366599995,-33.51250326499996],[-70.43699287899994,-33.459013692999974]]},
    {cut_reg:"13",cut_prov:"131",value:"13113",region:"Metropolitana de Santiago",provincia:"Santiago",label:"La Reina",bounds:[[-70.58449346699996,-33.465471296999965],[-70.48638828199995,-33.42883680499993]]},
    {cut_reg:"04",cut_prov:"041",value:"04105",region:"Coquimbo",provincia:"Elqui",label:"Paiguano",bounds:[[-70.57682839599994,-30.491534031429193],[-70.11747727399995,-29.963874638999975]]},
    {cut_reg:"13",cut_prov:"132",value:"13203",region:"Metropolitana de Santiago",provincia:"Cordillera",label:"San José de Maipo",bounds:[[-70.50071907999995,-34.29102327999993],[-69.76975011099995,-33.051709570385704]]},
    {cut_reg:"12",cut_prov:"123",value:"12301",region:"Magallanes y de la Antártica Chilena",provincia:"Tierra del Fuego",label:"Porvenir",bounds:[[-70.46752769099999,-53.79970783399994],[-68.60637611799996,-52.936224694999964]]},
    {cut_reg:"12",cut_prov:"123",value:"12302",region:"Magallanes y de la Antártica Chilena",provincia:"Tierra del Fuego",label:"Primavera",bounds:[[-70.43796183399998,-53.05671495699993],[-68.60620008314764,-52.44029998899997]]},
    {cut_reg:"03",cut_prov:"031",value:"03103",region:"Atacama",provincia:"Copiapó",label:"Tierra Amarilla",bounds:[[-70.38161039199997,-28.641872967999973],[-68.97265402499994,-27.15412647599993]]},
    {cut_reg:"15",cut_prov:"151",value:"15101",region:"Arica y Parinacota",provincia:"Arica",label:"Arica",bounds:[[-70.3776176504258,-18.903669453999953],[-69.49032000099999,-18.048123839999956]]},
    {cut_reg:"15",cut_prov:"151",value:"15102",region:"Arica y Parinacota",provincia:"Arica",label:"Camarones",bounds:[[-70.35102190899994,-19.22905000099996],[-69.07086301799995,-18.697456541999937]]},
    {cut_reg:"02",cut_prov:"023",value:"02301",region:"Antofagasta",provincia:"Tocopilla",label:"Tocopilla",bounds:[[-70.29240999999996,-22.63516000099997],[-69.74199107799996,-21.422980001999978]]},
    {cut_reg:"01",cut_prov:"014",value:"01404",region:"Tarapacá",provincia:"Tamarugal",label:"Huara",bounds:[[-70.28664999999995,-20.10232347499993],[-68.90863999999995,-19.021084111999986]]},
    {cut_reg:"03",cut_prov:"032",value:"03202",region:"Atacama",provincia:"Chañaral",label:"Diego de Almagro",bounds:[[-70.21098395799999,-26.92149000199993],[-68.36693237378503,-25.28583968499992]]},
    {cut_reg:"01",cut_prov:"011",value:"01101",region:"Tarapacá",provincia:"Iquique",label:"Iquique",bounds:[[-70.21086999999996,-21.43890000099997],[-69.81983896399998,-20.063880000999973]]},
    {cut_reg:"01",cut_prov:"011",value:"01107",region:"Tarapacá",provincia:"Iquique",label:"Alto Hospicio",bounds:[[-70.12438000099996,-20.35131000099994],[-69.89304999999996,-20.048540000999942]]},
    {cut_reg:"01",cut_prov:"014",value:"01401",region:"Tarapacá",provincia:"Tamarugal",label:"Pozo Almonte",bounds:[[-70.10949999999997,-21.627740000999943],[-68.86080999999996,-19.914323092999943]]},
    {cut_reg:"02",cut_prov:"021",value:"02103",region:"Antofagasta",provincia:"Antofagasta",label:"Sierra Gorda",bounds:[[-70.04770955999999,-23.923130205999943],[-68.61916799199997,-22.575997081999958]]},
    {cut_reg:"02",cut_prov:"023",value:"02302",region:"Antofagasta",provincia:"Tocopilla",label:"María Elena",bounds:[[-69.98280798299999,-22.880720427999957],[-68.86080999999996,-21.28512000099994]]},
    {cut_reg:"15",cut_prov:"152",value:"15202",region:"Arica y Parinacota",provincia:"Parinacota",label:"General Lagos",bounds:[[-69.82605727799995,-18.16523478499994],[-69.28213037325244,-17.49839933599998]]},
    {cut_reg:"01",cut_prov:"014",value:"01402",region:"Tarapacá",provincia:"Tamarugal",label:"Camiña",bounds:[[-69.75161208499998,-19.695784363999955],[-69.14290999999999,-19.06125014799994]]},
    {cut_reg:"15",cut_prov:"152",value:"15201",region:"Arica y Parinacota",provincia:"Parinacota",label:"Putre",bounds:[[-69.69588572799995,-19.033811237999938],[-68.91131273799994,-17.95407793999993]]},
    {cut_reg:"01",cut_prov:"014",value:"01405",region:"Tarapacá",provincia:"Tamarugal",label:"Pica",bounds:[[-69.47499177699996,-21.28512000099994],[-68.43876862999998,-19.599700000999974]]},
    {cut_reg:"01",cut_prov:"014",value:"01403",region:"Tarapacá",provincia:"Tamarugal",label:"Colchane",bounds:[[-69.31788999999998,-19.771808169151136],[-68.40487066999998,-18.936775026772835]]},
    {cut_reg:"02",cut_prov:"022",value:"02201",region:"Antofagasta",provincia:"El Loa",label:"Calama",bounds:[[-69.19267993699998,-23.14123169199996],[-67.91543050299998,-21.064680000999946]]},
    {cut_reg:"02",cut_prov:"022",value:"02203",region:"Antofagasta",provincia:"El Loa",label:"San Pedro de Atacama",bounds:[[-68.71779595399994,-24.32707491660219],[-66.99050347199994,-22.381749221325254]]},
    {cut_reg:"02",cut_prov:"022",value:"02202",region:"Antofagasta",provincia:"El Loa",label:"Ollagüe",bounds:[[-68.53575999899994,-21.981653157661484],[-68.05962986599997,-20.934544566999925]]},
    {cut_reg:"05",cut_prov:"052",value:"05201",region:"Valparaíso",provincia:"Isla de Pascua",label:"Isla de Pascua",bounds:[[-109.45491615599997,-27.202300086999955],[-105.35941168999993,-26.469790575999973]]},
    ]


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
        text: "Región",
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

$(".regionDropdown").change(function () {
    // Obtiene la región seleccionada
    var selectedRegion = $(this).val();
    // Llena la lista desplegable de comunas
    fillCommunesDropdown(selectedRegion);
});

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
            text: "Seleccionar Comuna",
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

$(".regionDropdown").change(function () {
    var selectedRegion = $(this).val();
    var selectedOption = regionOptions.find(
        (option) => option.value === selectedRegion
    );
    console.log(selectedRegion, selectedRegion)

    // Centra el mapa en la región seleccionada y espera a que la animación termine
    map.once('idle', function () {

        //SUMAR POR POR RENDERIZADOS FILTRANDO POR CODIGO DE REGION SELECCIONADA: 
        const features = map.queryRenderedFeatures({ layers: ['proyectos-layer'] });

        // CONTAR PROYECTOS DE LA REGIÓN SELECCIONADA
        let totalProyectosRegion = 0;

        // Iterar sobre las características y contar los proyectos de la región seleccionada
        features.forEach(function (feature) {
            // Verificar si la característica tiene las propiedades necesarias y si pertenece a la región seleccionada
            if (feature.properties && feature.properties.join_count && feature.properties.cut_reg === selectedRegion) {
                // Incrementar el contador de proyectos de la región seleccionada
                totalProyectosRegion += parseFloat(feature.properties.join_count);
            }
        });
// SUMAR MONTOS DE PROYECTOS DE LA REGIÓN SELECCIONADA
let sumaMontoRegion = 0;

// Iterar sobre las características y sumar los montos de los proyectos de la región seleccionada
features.forEach(function (feature) {
    // Verificar si la característica tiene las propiedades necesarias y si pertenece a la región seleccionada
    if (feature.properties && feature.properties.ctotal && feature.properties.cut_reg === selectedRegion) {
        // Obtener el monto de la característica y verificar que no sea "-"
        const monto = feature.properties.ctotal;
        if (monto !== '-') {
            // Sumar el monto convertido a número
            sumaMontoRegion += parseFloat(monto);
        }
    }
});

// Ahora `sumaMontoRegion` contiene la suma total de los montos válidos
console.log('Suma total del monto en la región seleccionada:', sumaMontoRegion);


        // SUMAR EMPLEOS DE LA REGIÓN SELECCIONADA
        let sumaEmpleosRegion = 0;

        // Iterar sobre las características y sumar los empleos de los proyectos de la región seleccionada
        features.forEach(function (feature) {
            // Verificar si la característica tiene las propiedades necesarias y si pertenece a la región seleccionada
            if (feature.properties && feature.properties.Empleos_Op && feature.properties.Empleos_Co && feature.properties.cut_reg === selectedRegion) {
                // Obtener la cantidad de empleos de la característica y sumarlos
                sumaEmpleosRegion += parseFloat(feature.properties.Empleos_Op) + parseFloat(feature.properties.Empleos_Co);
            }
        });

        // Transformar el número de la suma de montos con puntos cada tres dígitos y reemplazar puntos y comas
        const sumaMontoRegionFormateada = sumaMontoRegion.toLocaleString('es-ES', { maximumFractionDigits: 0 });

        // Actualiza el contenido del div con los resultados REGIONALES
        document.getElementById('regional').innerHTML = `
        <div class="container-fluid estadisticas">
            <div class="row">
            <p style="background-color:#0A132D;color:white; border-radius:0.3rem" class="col-12 text-center mb-1">Región de ${selectedOption.label}</p>
                <div class="col-12">
                    <div class="row">
                        <div class="col-sm-6 m-0 p-0">
                            <div class="card m-0 p-0 text-center">
                            <p style="font-size:1rem;font-weight:bold;color:#FE6565" class="mb-2">Proyectos</p>
                            <p style="font-size:2rem;font-weight:bold;color:#FE6565"class="mb-0">${totalProyectosRegion}</p>
                            </div>
                        </div>

                        <div class="col-sm-6 m-0 p-0">
                            <div class="card m-0 p-0 text-center">
                            <p style="font-size:1rem;font-weight:bold;color:#0A132D" class="mb-2">Inversión</p>                               
                                <p style="font-size:1rem;font-weight:bold;color:#0A132D"class="mb-0">${sumaMontoRegionFormateada} MM</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>`;
    });

    // Centra el mapa en la región seleccionada
    map.fitBounds(selectedOption.bounds, {
        padding: 10,
        maxZoom: 10,
        duration: 1000
    });
});


// Agrega la opción predeterminada "Seleccionar comuna"
$(".comunaDropdown").append(
    $("<option>", {
        value: "",
        text: "Comuna",
    })
);

// Evento que se activa al cambiar la selección en la lista desplegable de la comuna
$(".comunaDropdown").change(function () {
    var selectedComuna = $(this).val();
    var selectedOption = comunaOptions.find(
        (option) => option.value === selectedComuna
    );

    // Centra el mapa en la comuna seleccionada y espera a que la animación termine
    map.once('idle', function () {

        // Realiza el conteo de proyectos, sumas de monto y empleos
        let totalProyectosComuna = 0;
        let sumaMontoComuna = 0;
        const features = map.queryRenderedFeatures({ layers: ['proyectos-layer'] });
        features.forEach(function (feature) {
            if (feature.properties && feature.properties.join_count && feature.properties.cut_com === selectedComuna) {
                totalProyectosComuna += parseFloat(feature.properties.join_count);
              // Verificar si CTOTAL no es "-"
        if (feature.properties.ctotal && feature.properties.ctotal !== "-") {
            sumaMontoComuna += parseFloat(feature.properties.ctotal);
        }
            }
        });

        // Actualiza el contenido del div con los resultados
        document.getElementById('comunal').innerHTML = `
        <div class="container-fluid estadisticas">
            <div class="row">
            <p style="background-color:#0A132D;color:white; border-radius:0.3rem" class="col-12 text-center mb-1">Comuna de ${selectedOption.label}</p>
                <div class="col-12">
                    <div class="row">
                        <div class="col-sm-6 m-0 p-0">
                            <div class="card m-0 p-0 text-center">
                            <p style="font-size:1rem;font-weight:bold;color:#FE6565" class="mb-2">Proyectos</p>
                            <p style="font-size:2rem;font-weight:bold;color:#FE6565"class="mb-0">${totalProyectosComuna}</p>
                            </div>
                        </div>
                        <div class="col-sm-6 m-0 p-0">
                            <div class="card m-0 p-0 text-center">
                            <p style="font-size:1rem;font-weight:bold;color:#0A132D" class="mb-2">Inversión</p>
                            <p style="font-size:1rem;font-weight:bold;color:#0A132D"class="mb-0">${sumaMontoComuna.toLocaleString('es-ES', { maximumFractionDigits: 0 })} MM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        // Actualiza el número total de proyectos en la opción "Seleccionar comuna" del dropdown
        $(".comunaDropdown option[value='']").text("Seleccionar comuna (" + totalProyectosComuna + " proyectos)");
    });

    // Centra el mapa en la comuna seleccionada
    map.fitBounds(selectedOption.bounds, {
        padding: 10,
        maxZoom: 10,
        duration: 1000
    });
});

map.on("error", function (e) {
    console.error("Error:", e.error);
});
