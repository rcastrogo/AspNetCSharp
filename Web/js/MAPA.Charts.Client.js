

var __graph;
  var __ui     = function(container){
    var __date = ($('txtFecha') && $('txtFecha').value) || '';
    container.innerHTML = '<label for="txtFecha">Fecha :</label> <input type="text" id="txtFecha" value="{0}" />'.format(__date);
    MAPA.DateTextBox($('txtFecha'));
  }
  var __params = function(){
    return '&fecha={0}'.format($('txtFecha').value);
  }
  var __charts = [
    { id : 1, style : 1, series : true, panel : false, title : 'Inicios de sesión - Resumen', ui : __ui, getParams : __params },
    { id : 2, style : 2, series : true, panel : false, title : 'Inicios de sesión - Por hora', ui : __ui, getParams : __params },
    { id : 3, style : 0, series : true, panel : false, title : 'Inicios de sesión - Por hora (%)', ui : __ui, getParams : __params },
    { id : 4, style : 4, series : true, panel : true, title : 'Inicios de sesión - Por usuario', ui : __ui, getParams : __params },
    { id : 5, style : 1, series : false,panel : true , title : 'Número de accesos - Por página', ui : __ui, getParams : __params },
    { id : 6, style : 1, series : true, panel : true , title : 'Número de accesos - Por IP', ui : __ui, getParams : __params }
  ];

  var __init = function(){
    __graph = MAPA.Charts({ Style   : 1, 
                            Width   : $('ChartContainer').clientWidth * .99, 
                            Height  : $('ChartContainer').clientHeight * .99,
                            Padding : [10, 20, 35, 35],                                   
                            Title   : 'Gráfico',
                            LegendBox   : false,
                            LegendWidth : 0.33,
                            Colors  : MAPA.Serie(MAPA.Charts.prototype.createColors(30))
    });
    $('ChartContainer').appendChild(__graph.Canvas);
    var __cmb = $('cmbChartType');
    __charts.forEach( function(c){
      MAPA.AppendOption(__cmb, c.id, c.title);
    });
    $('btnAceptar').onclick = __DrawChart;  
    __cmb.onchange = function(){  
      MAPA.Graphics.Clear(__graph.Context,'white');       
      if(__cmb.value==0){
        $('paramsContainer').innerHTML = '';
        return;
      }
      var __current = __charts.Item('id', __cmb.value);
      if(__current.ui) __current.ui($('paramsContainer'));
    }; 
  }
       
  var __DrawChart = function(){
    var __cmb = $('cmbChartType');
    $('ChartContainer').style.display = __cmb.value ? 'block' : 'none' ;
    if(__cmb.value==0) return;
    MAPA.Graphics.Clear(__graph.Context,'white');
    var __current = __charts.Item('id', __cmb.value);            
    $Ajax.Get('json/trace.aspx?action=charts.data&queryId={0}{1}'.format(__cmb.value, __current.getParams() ), function(result){
    //$Ajax.Get('json/admin.ashx?accion=charts.data&queryId={0}{1}'.format(__cmb.value, __current.getParams() ), function(result){
      var __response = MAPA.tryParse(result);
      if(__response.Resultado != 'OK') {
        __graph.Title = 'Error al obtener los datos.';
        __graph.dataSource = [];
        __graph.ChangeStyle(__current.style);          
        return;
      }        
      __graph.Title      = __current.title;
      __graph.LegendBox  = __current.panel;
      __graph.SeriesEnabled = __current.series;
      __graph.Width  = $('ChartContainer').clientWidth * .99;
      __graph.Height = $('ChartContainer').clientHeight * .99;
      __graph.dataSource = __response.Data;
      __graph.ChangeStyle(__current.style);        
    });
  }      
  __init();