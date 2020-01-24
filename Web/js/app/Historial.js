(function(module){

  function __loadHistorial(idFertilizante, box){

    var __SVG_LINE      = '<svg height="20" width="150" class="line"><line x1="0" y1="10" x2="200" y2="10" style="stroke:gray;stroke-width:4" /></svg>';
    var __SVG_DOT       = '<svg height="20" width="20"><circle cx="10" cy="10" r="5" fill="#004165"></circle></svg>';
    var __SVG_BIG_DOT   = '<svg height="20" width="20"><circle cx="10" cy="10" r="7" fill="gray"></circle></svg>';
    var __NAME_TEMPLATE = '<div class="">' + 
                          '<div class="hist-item-t1">Cambios del nombre comercial</div>{0}</div>';
    var __PROD_TEMPLATE = '<div class="">' + 
                          '<div class="hist-item-t1">Cambios de productor</div>{0}</div>';
    var __TITU_TEMPLATE = '<div class="">' + 
                          '<div class="hist-item-t1">Cambios de titularidad</div>{0}</div>';
    var __ITEM_TEMPLATE = '<div class="hist-item### estado-{_estado}">' + 
                          '<div class="wrapper"><div class="hist-item-t1"><div>{_estado}</div> {0}</div>' +                                   
                          '<b>Id:</b> {_id}<br/>' + 
                          '<b>Nombre comercial:</b> {_denominacion}' + 
                          '</div></div>' + __SVG_DOT;  
    
    if(box.__loaded) return;

    box.Body.innerHTML        = '';
    box.Body.style.height     = '5em';
    box.Body.style.background = 'white url(../img/loading3.gif) no-repeat center center';
    $Ajax.Post(__url_fer, 'accion=historial&id={0}'.format(idFertilizante), function(o){

      (function(response){                    
        
        if(response.Resultado != 'OK'){
          box.Body.style.background = '';
          box.Body.innerHTML = '<div id="historial-container">{0}</div>'.format(response.Mensaje);
          initMapaScroll();
          return;
        }

        box.__loaded = true;

        box.Body.style.background = '';
        box.Body.style.height     = '';
        box.Body.innerHTML        = response.Solicitudes
                                            .SortBy('_id')
                                            .map( function(s, i){
                                              var __items = [];
                                              // =====================================================================================
                                              // Modificaciones del Producto fertilizante asociados a esta solicitud.
                                              // =====================================================================================
                                              if(s._estado != 'T'){
                                                // ===================================================================================
                                                // Histórico de fabricantes
                                                // ===================================================================================
                                                (function(fabricantes){
                                                  if(fabricantes.length > 1){
                                                    var __html = fabricantes.reduce( function(a, fabricante){
                                                                              a.push('{_nif} - {_nombre}'.format(fabricante))
                                                                              return a;  
                                                                            }, []).join('<br />');
                                                    __items.push(__TITU_TEMPLATE.format(__html));  
                                                  }
                                                }(response.DatosFabricante.Where({ _idSolicitud : s._id }))); 
                                                // ===================================================================================
                                                // Histórico de productores
                                                // ===================================================================================
                                                (function(productores){
                                                  if(productores.length > 1){
                                                    var __html = productores.reduce( function(a, productor){
                                                                              a.push('{_identificador} - {_nombre}'.format(productor))
                                                                              return a;  
                                                                            }, []).join('<br />');
                                                    __items.push(__PROD_TEMPLATE.format(__html));  
                                                  }
                                                }(response.DatosProductor.Where({ _idSolicitud : s._id }))); 
                                                // ===================================================================================
                                                // Histórico de cambios del nombre comercial
                                                // ===================================================================================
                                                (function(nombres){
                                                  if(nombres.length){
                                                    var __html = nombres.reduce( function(a, n){
                                                                              a.push('{0} - {1}'.format(n.f.fixDate(), n.d))
                                                                              return a;  
                                                                            }, []).join('<br />');
                                                    __items.push(__NAME_TEMPLATE.format(__html));  
                                                  }
                                                }(response.NombresComerciales.Where({ idSol : s._id })));                                                                                                                                                                              
                                              }
                                              // =====================================================================================
                                              // Si existen modificaciones se devuelve el html de la solicitud
                                              // y el de las modificaciones.
                                              // =====================================================================================
                                              if(__items.length){
                                                return [__ITEM_TEMPLATE.format(_tiposDeSolicitud[s._tipo], s),
                                                        ('<div class="hist-item###">' + 
                                                         '<div class="wrapper">{0}</div>' +
                                                         '</div>').format(__items.join('')) +
                                                        __SVG_DOT];
                                              }
                                              return [__ITEM_TEMPLATE.format(_tiposDeSolicitud[s._tipo], s)];
                                                          
                                            })
                                            .reduce(function(a, b){ return a.concat(b); }, [])
                                            .reduce(function(a, html, i){
                                              return a += __SVG_LINE + html.replace('###', (i % 2) ? '2' : '1');                                                           
                                            }, '<div id="historial-container">' + __SVG_BIG_DOT) + 
                                            __SVG_LINE + __SVG_BIG_DOT + '</div>';
        var __offset = 40;
        $('.hist-item1,.hist-item2', box.Body).forEach(function(e, i){
          e.style.left = '{0}px'.format(__offset);
          __offset += 170;
        });
        $('.line', box.Body).lastItem()
                            .setAttribute("width", "180px");        
        initMapaScroll();
        
      }(MAPA.tryParse(o)));

    })      
    
    initMapaScroll();  

  }

  module.Solicitudes.History = { Load : __loadHistorial };

}(MAPA));

(function(module){

  var __url_registro = '../JSon/RegistroElectronico/Registro.ashx';
  var __registros    = [];
  var __current      = '';

  function __initSelectionDialog(dlg, solicitud, layer){
    __registros    = [];
    __current      = '';
    dlg.Body.style.padding = '4px 15px';
    dlg.BtnYes.value = 'Vincular';
    dlg.BtnNo.value  = 'Cancelar';
    dlg.BtnYes.style.width = dlg.BtnNo.style.width = '7em';
    dlg.Body.innerHTML = '<b>Vincular registro electrónico</b>' + 
                          '<p>Seleccione el registro electrónico ' + 
                          'al que vincular la solicitud.</p>' +
                          '<div class="code-container"></div>'
    dlg.RemoveOnclose = true;
    MAPA._KeyEvents.DisableEvents().EnableDialogEvents(dlg, { '27' : dlg.BtnNo.onclick, 
                                                              '13' : dlg.BtnYes.onclick });
    // ===========================================================================
    // Cargar los registros electrónicos
    // ===========================================================================    
    $Ajax.Post(__url_registro, 'accion=getitems&' +
                               'txtSearchIdSolicitud=0&' +
                               'mode=allproperties', function(o){                                                                    
      var respuesta = MAPA.tryParse(o); 
      if (respuesta.Resultado != 'OK') {
        layer.ShowError({ Message : respuesta.Mensaje, OnClose : layer.Hide}); 
        return;          
      }
      var __names = { 'NIF/CIF'               : 'Nif', 
                      'Nombre o razón social' : 'Nombre',
                      'Codigo del Producto'   : 'Codigo',
                      'Nombre comercial'      : 'NombreComercial'};
      var __properties = respuesta.Data.reduce(function(a, d){              
        var __property_name = __names[d.Name] || d.Name;
        a[d.IdRegistro]    = a[d.IdRegistro] || {};
        a[d.IdRegistro][__property_name] = d.Value;
        return a;
      },{});
      __registros = respuesta.Registros.map(function(r){
                                          r._fecha    = r._fecha.replace(/ 000$/,'');
                                          r._nif      = __properties[r._id].Nif;
                                          r._nombre   = __properties[r._id].Nombre;
                                          r._codigo   = __properties[r._id].Codigo;
                                          r._producto = __properties[r._id].NombreComercial;                                          
                                          return r;
                                       })
                                       .SortBy('_id', true);  
      dlg.Body.querySelector('div').innerHTML = __registros.reduce(function(html, r){        
        html += ('<div class="item" id="registro-{_id}" style="padding:5px;">' +  
                 '<input type="checkbox" style="float:none;vertical-align: middle"/>' +
                 '<div class="d-wrapper">' + 
                 '<h4>{_numeroDeRegistro}<span style="float:right;font-size: 10px;font-weight:normal;">{_fecha}#{_id}</span></h4>' + 
                 '{_nombre} ({_nif})<br/>' +
                 '<span style="width:110px;display:inline-block;">Código del producto</span>: {_codigo}<br/>' + 
                 '<span style="width:110px;display:inline-block;">Nombre comercial</span>: {_producto}' +                 
                 '</div></div>'
                ).format(r);
        return html;
      }, '');

      var __onclick = function(){
        var __check = this.querySelector('input');
        if(__current === __check){
          __current.parentNode.classList.toggle('selected');
          __current.checked = false;
          __current = '';
          return
        }
        if(__current) {
          __current.checked = false;
          __current.parentNode.classList.toggle('selected');
        }
        __current = __check;
        __current.checked = true
        __current.parentNode.classList.toggle('selected');
      }
      $('.item', dlg.Body).forEach(function(e){ e.onclick = __onclick; });
    });
  }

  function __getSelectedItem(){
    return __current ? __registros.Where({ _id : __current.parentNode.id.split('-')[1]})[0] 
                     : '';
  }

  module.Solicitudes.Registro = { InitDialog   : __initSelectionDialog,
                                  SelectedItem : __getSelectedItem  }
}(MAPA));