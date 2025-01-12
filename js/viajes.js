"use strict"
class Viajes{

    constructor(){
        navigator.geolocation.getCurrentPosition(this.#recogePosicion.bind(this), this.#manejarErrores.bind(this));

        $(document).ready(this.#inicializaCarrusel.bind(this));

        // Esto es para que se puedan añadir más en diferentes momentos, pero no repetidos.
        this.svgs = [];
    }

    #inicializaCarrusel(){
        this.images = document.querySelectorAll('section[data-element="carrusel"] img');
        this.currentImagePosition = this.images.length - 1;
        this.maxImagePosition = this.images.length - 1;
    }

    #recogePosicion(posicion){
        
        this.longitud = posicion.coords.longitude;
        this.latitud = posicion.coords.latitude;  
        this.altitud = posicion.coords.altitude;

        this.#crearMapaEstatico();
        this.#crearMapaDinamico();
    }

    #manejarErrores(error){

        var mensaje = null;
        switch(error.code) {
            case error.PERMISSION_DENIED:
                mensaje = "Debe permitir la petición de geolocalización para mostrar todo el contenido de esta página"
                break;
            case error.POSITION_UNAVAILABLE:
                mensaje = "Información de geolocalización no disponible, no se puede mostrar todo el contenido de esta página"
                break;
            case error.TIMEOUT:
                mensaje = "La petición de geolocalización ha caducado, no se puede mostrar todo el contenido de esta página"
                break;
            case error.UNKNOWN_ERROR:
                mensaje = "Se ha producido un error desconocido al intentar reconocer su geolocalización, no se puede mostrar todo el contenido de esta página"
                break;
        }

        const h3 = $("<h3></h3>").text("Error al mostrar los mapas con su ubicación");
        const p = $("<p></p>").text(mensaje);
        const section = $("<section> </section>").append(h3).append(p);

        $('main section[data-element="xml"]').before(section);
    }

    #crearMapaEstatico(){

        //https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/pin-s+ff0000(-110.7947,37.6535)/-110.7929,37.6549,12,0/500x400?access_token=pk.eyJ1IjoidW8yODk5MzAiLCJhIjoiY2xwancwczF3MDRnMzJqbGI2bnhvaTB4bCJ9.mlFWQ0aSWshJN9dcEBTidg
        const mapBoxAPIUrl = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/"+
                        "pin-s+ff0000("+this.longitud+","+this.latitud+")/"+this.longitud+","+this.latitud+",15,0/500x400?"+
                        "access_token=pk.eyJ1IjoidW8yODk5MzAiLCJhIjoiY2xwancwczF3MDRnMzJqbGI2bnhvaTB4bCJ9.mlFWQ0aSWshJN9dcEBTidg";
        const img = $("<img></img>").attr("src", mapBoxAPIUrl).attr("alt", "Mapa estático de su geolocalización");

        const article = $("<article></article>").attr("data-element", "mapa_estatico");
        const h3 = $("<h3></h3>").text("Mapa estático con su posición actual");
        article.append(h3);
        article.append(img);
        $('main section[data-element="xml"]').before(article);

    }

    #crearMapaDinamico(){

        const containerMapa = $("<article></article>").attr("data-element", "mapa_dinamico");
        const h3 = $("<h3></h3>").text("Mapa dínamico con su posición actual");
        const figcaption = $("<figcaption></figcaption>").text("Mapa dinámico de su posición");
        const mapa = $("<figure></figure>").attr("id", "mapaPosicion").attr("data-element","mapaPosicion");

        containerMapa.append(h3);
        containerMapa.append(mapa);
        $('main section[data-element="xml"]').before(containerMapa);

        mapboxgl.accessToken = "pk.eyJ1IjoidW8yODk5MzAiLCJhIjoiY2xwancwczF3MDRnMzJqbGI2bnhvaTB4bCJ9.mlFWQ0aSWshJN9dcEBTidg";
        const map = new mapboxgl.Map({
            container: "mapaPosicion", // id
            style: "mapbox://styles/mapbox/satellite-v9", // estilo URL 
            center: [this.longitud, this.latitud], // coordenadas
            zoom: 15, // zoom inicial
        });

        new mapboxgl.Marker({
            color: "#FF0000" // Código de color hexadecimal para rojo
        })
        .setLngLat([this.longitud, this.latitud])
        .addTo(map);

        map.addControl(new mapboxgl.NavigationControl());

        mapa.append(figcaption);
    }

    parseInputFile(files){

        const archivo = files[0];
        const tipoTexto = "text/xml";

        if (archivo.type!=tipoTexto){
            window.alert("El archivo seleccionado debe ser un archivo de texto XML (.xml)");
            return;
        } 

        const lector = new FileReader();
        lector.onload = function (evento) {
            const xml = lector.result;

            $.each($("ruta", xml), (i,ruta)=>{

                // Sección
                const section = $("<section></section>").attr("data-element", "rutas");
                // Titulo
                const titulo = $("<h4></h4>").text( "Ruta Nº" + (i+1) + ": " +  $("nombreRuta",ruta).text() );
                
                const informacion = $("<ul></ul>");
                // Ruta
                informacion.append( $("<li></li>").text($("descripcionRuta",ruta).text()));
                informacion.append( $("<li></li>").text($("adecuado",ruta).text()) );
                informacion.append( $("<li></li>").text("Tipo de ruta: " + ruta.getAttribute("tipo")) );
                informacion.append( $("<li></li>").text("Medio de la ruta: " + ruta.getAttribute("medio")) );
                informacion.append( $("<li></li>").text("Lugar de inicio: " +  $("lugarInicio",ruta).text())
                                        .append( $("<ul></ul>")
                                            .append( $("<li></li>").text("Direccion del lugar de inicio: " + $("direccionInicio",ruta).text()) )
                                            .append( $("<li></li>").text("Coordenadas del lugar de inicio (latitud, longitud, altitud): " 
                                                                            + $("coordenadasRuta",ruta).attr("latitud") + ", "
                                                                            + $("coordenadasRuta",ruta).attr("longitud") + ", "
                                                                            + $("coordenadasRuta",ruta).attr("altitud")) ) ) );
                informacion.append( $("<li></li>").text("Recomendación: " + $("recomendacion",ruta).text()) );

                // Hitos de ruta
                $.each($("hito", ruta), (j,hito) =>{
                    const hitoJQ = $("<li></li>").text("Hito " +(j+1)+ ": " + $("nombreHito",hito).text());
                    const descrip = $("<ul></ul>")
                                        .append( $("<li></li>").text("Descripción del hito: " + $("descripcionHito",hito).text()) ) 
                                        .append( $("<li></li>").text("Coordenadas del hito (latitud, longitud, altitud): " 
                                                                        + $("coordenadasHito",hito).attr("latitud") + ", "
                                                                        + $("coordenadasHito",hito).attr("longitud") + ", "
                                                                        + $("coordenadasHito",hito).attr("altitud")) ) 
                                        .append(  $("<li></li>").text("Distancia a anterior hito: " + $("distanciaHitoAnterior ",hito).text() 
                                                                                            + $("distanciaHitoAnterior ",hito).attr("unidades")) );
                    hitoJQ.append(descrip);
                    informacion.append(hitoJQ);
                });

                // Referencias
                const referencias = $("<li></li>").text("Referencias")
                const referenciasLista = $("<ul></ul>");
                referencias.append(referenciasLista);
                $.each($("referencia", ruta), (j,ref) =>{
                    referenciasLista.append( $("<li></li>")
                                            .append( $("<a></a>").text(ref.innerHTML)
                                                        .attr("href", ref.innerHTML)
                                                        .attr("title", "Referencia " + (j+1) + " con información extra sobre la ruta" ) ) );
                });
                informacion.append(referencias)

                informacion.append($("<li></li>").text("Álbum de fotos"));

                // Añadir titulo y lista a sección
                section.append(titulo);
                section.append(informacion);

                // Fotos al final
                $.each($("foto", ruta), (j,foto) => {
                    section.append( $("<img></img>").attr("src", "../" + foto.innerHTML ).attr("alt", "Foto " + (j+1) + " relacionada con un hito de esta ruta") );
                });

                // A html   
                $('main section[data-element="xml"]').append(section);
            });
        }
        lector.readAsText(archivo);
    }

    parseInputKmlFiles(files){
        
        const final = ".kml";
        for(let i=0; i<files.length; i++){
            if(!files[i].name.endsWith(final)){
                window.alert("Todos los archivos deben ser de cartografía (.kml)");
                return;
            }
        }

        this.#crearMapaRutas(files);
    }

    #crearMapaRutas(files){

        const id = "mapaRutas";
        $('main section[data-element="kml"] article').remove();
        const mapa = $("<figure></figure>").attr("id", id).attr("data-element", id);
        $('main section[data-element="kml"]').append(mapa);
        const figcaption = $("<figcaption></figcaption>").text("Mapa de rutas");


        //Mapa
        mapboxgl.accessToken = "pk.eyJ1IjoidW8yODk5MzAiLCJhIjoiY2xwancwczF3MDRnMzJqbGI2bnhvaTB4bCJ9.mlFWQ0aSWshJN9dcEBTidg";
        const map = new mapboxgl.Map({
            container: id,                                  // id
            style: "mapbox://styles/mapbox/satellite-v9",   // estilo URL
            center : [114.900830,4.646971],                 // long,lat de un punto central a todas las rutas
            zoom: 9                                        // zoom inicial  
        });
        map.addControl(new mapboxgl.NavigationControl());

        var k = 0;
        // Rutas
        for(let i=0; i<files.length; i++){
            const lector = new FileReader();
            lector.onload = function (evento) {
                const kml = lector.result;
                const coordenadas = [];
                const lineas = $("coordinates",kml).text().trim().split("\n");

                for(let j=0; j<lineas.length; j++){
                    const coords = lineas[j].split(","); 
                    coordenadas.push([coords[0], coords[1]]); // Longitud y latitud (no hace falta altitud)
                }

                // Esperar a que el estilo este aplicado al mapa antes de añadirle capas
                map.on("idle", function(){  
                    map.addLayer({  
                        id: id + k++,       // Cada capa necesita un id diferente
                        type: "line",
                        source: {
                            type: "geojson",
                            data: {
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "LineString",
                                    coordinates: coordenadas,
                                },
                            },
                        },
                        layout: {
                            "line-join": "round",
                            "line-cap": "round",
                        },
                        paint: {
                            "line-color": "#FF0000",
                            "line-width": 4,
                        },
                    });
                });
            };
            lector.readAsText(files[i]);
        }

        mapa.append(figcaption);
    }

    parseInputSvgFiles(files){

        const final = ".svg";
        for(let i=0; i<files.length; i++){
            if(!files[i].name.endsWith(final)){
                window.alert("Todos los archivos deben ser gráficos vectoriales escalables (.svg)");
                return;
            }
            if(this.svgs.includes(files[i].name)){

                if(files.length==1){
                    window.alert("El archivo " + files[i].name + " ya ha sido añadido previamente y no se permiten archivos repetidos");
                } else{
                    window.alert("Al menos el archivo " + files[i].name + " ya ha sido añadido previamente y no se permiten archivos repetidos");
                }

                return;
            }
        }

        this.#creaSvgs(files);
    }

    #creaSvgs(files){

        for(let i=0; i<files.length; i++){
            const lector = new FileReader();

            lector.onload = function (evento) { 

                const svgTxt = lector.result;

                var svg = '<svg version="1.1"><polyline points="' + $("polyline", svgTxt).attr("points") + '"></polyline>';
                $.each($("text", svgTxt), (_,text) => {
                    svg += "<text ";
                    svg += 'x="' + text.getAttribute("x");
                    svg += '" y="' + text.getAttribute("y") + '">';
                    svg += text.innerHTML;
                    svg += "</text>";                            
                });

                svg += "</svg>";

                $('main section[data-element="svg"]').html( $('main section[data-element="svg"]').html() + svg );
            }

            lector.readAsText(files[i]);
            this.svgs.push(files[i].name);
        }

    }

    nextFoto(){

        // check if current slide is the last and reset current slide
        this.currentImagePosition = this.currentImagePosition === this.maxImagePosition ? 0 : this.currentImagePosition+1;
        let current = this.currentImagePosition;

        //   move slide by -100%
        this.images.forEach((image, indx) => {
            var trans = 100 * (indx - current);
            $(image).css('transform', 'translateX(' + trans + '%)')
        });

        
    }

    prevFoto(){
        // check if current slide is the first and reset current slide to last
        this.currentImagePosition = this.currentImagePosition === 0 ? this.maxImagePosition : this.currentImagePosition-1;
        let current = this.currentImagePosition;

        //   move slide by 100%
        this.images.forEach((image, indx) => {
            var trans = 100 * (indx - current);
            $(image).css('transform', 'translateX(' + trans + '%)')
        });
    }

}

const viajes = new Viajes();