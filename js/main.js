//op1 - http://apiadvisor.climatempo.com.br/api/v1/weather/locale/3477/current?token=b44ef21d045c4b7885fadb9aba6f5796
//op2 - http://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=d6434d7681bf45d8f93d5ab8048c219f&units=metric

var map;
var flagClick = false;

/*
    Função que busca o clima na api do OpenWeatherMap
    Recebe como parâmetros:
        latitude (float)
        longitude (float)
        local (string)
    Não retorna nada, somente imprime na div content-response o resultado
    retornado pela API com a temperatura atual em graus celsius, as temperaturas
    mínima e máxima

*/
function getClima(lat, long, local){
	$.ajax({
	    url: "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long+"&appid=d6434d7681bf45d8f93d5ab8048c219f&units=metric",
	    type: "GET",
	    crossDomain: true,
	    dataType: "jsonp",
	    success: function (response) {
	        $('.content-response').html('<b>Temperatura atual: '+response.main.temp+' °C</b><br/><span class=\"min-max-span\">Mínima: '+response.main.temp_min+' °C<br/>Máxima: '+response.main.temp_max+' °C<br/><hr>'+local);
	    },
	    error: function (xhr, status) {
	        //alert("error");
	    }
	});
}



/*

    Função de callback utilizada para criar e configurar o mapa com a api do bing maps

*/
function loadMapScenario() {
    /*
        Configura o mapa padrão
    */

	map = new Microsoft.Maps.Map(document.getElementById('myMap'), {});
	map.setView({
        center: new Microsoft.Maps.Location(-18.708035, -39.878608),
        zoom: 15
    });


    /*
        Configura a caixa de sugestões de endereço do bing, bem como a
        funçao de callback e a função de erro
    */
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: onLoad,
        errorCallback: onError
    });


    /*
        Função de configuração e ligação da caixa de sugestões com o input com
        id searchBox e a div que o contém searchBoxContainer
    */
    function onLoad() {
        var options = { maxResults: 5 };
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#searchBox', '#searchBoxContainer', selectedSuggestion);
    }


    /*
        Função de retorno caso dê erro ao configurar as sugestões
    */
    function onError(message) {
        console.log(message);
    }


    /*
        Função chamada ao selecionar um elemento na caixa de seleção
    */
    function selectedSuggestion(suggestionResult) {
        flagClick = true; //flag utilizada para resetar o map caso a seleção não tenha sido clicada
        
        //pega os valores retornados na busca selecionada e atribui a essas variaveis
        var latitude, longitude, local;
        latitude = suggestionResult.location.latitude;
        longitude = suggestionResult.location.longitude;
        local = suggestionResult.formattedSuggestion;

        
        //remove as marcas
        for (var i = map.entities.getLength() - 1; i >= 0; i--) {
            var pushpin = map.entities.get(i);
            if (pushpin instanceof Microsoft.Maps.Pushpin) {
                map.entities.removeAt(i);
            }
        }
        
        //centraliza o mapa para o endereço selecionado
        map.setView({
            center: new Microsoft.Maps.Location(latitude, longitude),
            zoom: 15
        });

        //adiciona uma marca no endereço selecionado
        var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), null);
    	map.entities.push(pushpin);

        //chama a função para imprimir a temperatura do endereço selecionado
       	getClima(latitude, longitude, local);
    }    
}

$(document).ready(function(){
    /*
        quando apagar a caixa de texto, volta o mapa para a posição inicial
        apaga as marcas (pushpins) e apaga os resultados anteriores da div content-response
    */
    $('#searchBox').on('change', function(){
        flagClick = false;
        if($(this).val() == '' || !flagClick){
            //remove as marcas
            for (var i = map.entities.getLength() - 1; i >= 0; i--) {
                var pushpin = map.entities.get(i);
                if (pushpin instanceof Microsoft.Maps.Pushpin) {
                    map.entities.removeAt(i);
                }
            }

            map.setView({
                center: new Microsoft.Maps.Location(-18.708035, -39.878608),
                zoom: 15
            });

            $('.content-response').html('');
        }
    })
})