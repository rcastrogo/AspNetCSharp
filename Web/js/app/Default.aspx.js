
(function(){

  var MAPALayer = (window.parent != window) ? window.parent.MAPA.Layer : MAPA.Layer ;

  function __openFabricante(){              
    (function(nif){
      if(nif){
        MAPA.Layer.ShowInfo('Espere...');
        $Ajax.Post('JSon/Fabricante.ashx', 'accion=getitem&nif={0}'.format(nif), function(o){
          MAPA.Layer.Hide();
          var __response = MAPA.tryParse(o); 
          if (__response.Resultado != 'OK') {
            return MAPA.Layer.ShowError({ Message : __response.Mensaje, OnClose : MAPA.Layer.Hide});        
          }
          MAPA.Layer.ShowInfo('Abriendo la página...');
          setTimeout( function(){ window.location = 'Pages/Fabricante.aspx?nif={0}'.format(nif); }, 700);        
        });
      }
    }($('txt-id-fabricante').value)); 
  }

  function __openFertilizante(){              
    (function(codigo){
      if(codigo && codigo.toLowerCase().charAt(0) == 's'){
        window.location = 'Pages/Viewer.aspx?id_s={0}'.format(codigo.slice(1));
        return;
      }
      if(codigo){
        var __codigo = 'F{0}'.format(codigo.paddingLeft('0000000'));
        MAPA.Layer.ShowInfo('Espere...');
        $Ajax.Post('JSon/Fertilizante.ashx', 'accion=getitem&id={0}'.format(__codigo), function(o){
          MAPA.Layer.Hide();
          var __response = MAPA.tryParse(o); 
          if (__response.Resultado != 'OK') {
            return MAPA.Layer.ShowError({ Message : __response.Mensaje, OnClose : MAPA.Layer.Hide});        
          }
          MAPA.Layer.ShowInfo('Abriendo la página...');
          setTimeout( function(){ 
            window.location = 'Pages/ProductoRegistrado.aspx?codigo={0}'.format(__codigo); 
          }, 700);        
        });
      }
    }($('txt-id-fertilizante').value)); 
  }
    
  function __openRegistro(){              
    (function(codigo){
      if(codigo){
        MAPA.Layer.ShowInfo('Espere...');
        $Ajax.Post('JSon/RegistroElectronico/Registro.ashx', 'accion=getitem&codigo={0}'.format(codigo), function(o){
          MAPA.Layer.Hide();
          var __response = MAPA.tryParse(o); 
          if (__response.Resultado != 'OK') {
            return MAPA.Layer.ShowError({ Message : __response.Mensaje, OnClose : MAPA.Layer.Hide});        
          }
          MAPA.Layer.ShowInfo('Abriendo la página...');
          setTimeout( function(){ window.location = 'Pages/RegistroElectronico/Registro.aspx?codigo={0}'.format(codigo); }, 700);        
        });
      }
    }($('txt-id-registro').value)); 
  }

  function __searchNames(text){
    
    function __initHandlers(dlg){
      var __button = dlg.Element.querySelector('button');
      var __txt    = dlg.Element.querySelector('#txt-nombre-comercial');

      __button.onclick =
      __txt.onkeypress = function(e){ 
        if(e.target === __txt && e.keyCode != 13) return;
        (function(text){
          if(text && text.trim().length > 3) __buscar(text, dlg);          
        }(__txt.value));
      }
      __txt.value = text || '';
      __txt.focus();
      if(text) __button.click();
    }

    function __buscar(text, dlg){
      dlg.Body.innerHTML        = '';
      dlg.Body.style.background = 'white url(/{0}/img/loading3.gif) no-repeat center center'.format(MAPA.AppPath);
      $Ajax.Post('/{0}/Json/Fertilizante.ashx'.format(MAPA.AppPath), 'accion=nombres&text={0}'.format(text), function(o){          
        var __response = MAPA.tryParse(o); 
        if (__response.Resultado != 'OK') {
          dlg.Body.style.background = '';
          return MAPALayer.ShowError(__response.Mensaje);        
        }
        var __fertilizantes = MAPA.toDictionary(__response.Fertilizantes, '_idSolicitud');
        var __fabricantes   = MAPA.toDictionary(__response.Fabricantes, '_id');
        var __nombres       = __response.Nombres.groupBy('idSol');
        var __estados       = { A : 'Anulado',
                                C : 'Caducado',
                                P : 'Prorrogado' };
        var __tipos         = { I : "inscripción",
                                M : "modificación",
                                R : "renovación" };
        (function(html){
          dlg.Body.style.background = '';
          dlg.Body.innerHTML        = html;
        }(          
          __response.Solicitudes
                    .Where( function(s){
                      var __regexp   = new RegExp('({0})'.format(MAPA.escapeRe(text)), 'gim')
                      var __names    = __nombres[s._id];
                      s.fabricante   = __fabricantes[s._idFabricante]
                      s.fertilizante = __fertilizantes[s._id] || 
                                      { 
                                        _codigo  : 'S{_id}'.format(s), 
                                        _estado  : s._estado,
                                        _bgColor : 'whitesmoke'
                                      };
                      s.fertilizante._bgcolor = s.fertilizante._bgcolor || 'white';
                      s.fertilizante._estado  = __estados[s.fertilizante._estado] || 
                                               (s._fechaLimite == "01/01/2000 00:00:00 000" ? 'Desestimada' : '') ;
                      // Si hay cambios del nombre comercial puede que el establecido
                      // NO coincida con el almacenado en la solicitud
                      if(__names){
                        s._denominacion = __names.lastItem().d;
                        if(!__regexp.test(s._denominacion)) return false;
                      }
                      s._denominacion = s._denominacion.replace(__regexp, '<span class="match">$1</span>');
                      return true;
                    })
                    .OrderBy(function(s){
                      return s.fertilizante._codigo;
                    })
                    .reduce( function(html, s){                                            
                      var __link = s.fertilizante._id ? ('<a class="Normal" href="/{0}/pages/Viewer.aspx?id_f={_id}" target="_blank">' + 
                                                         '{_codigo}' + 
                                                         '</a>').format(MAPA.AppPath, s.fertilizante)
                                                      : ('Solicitud de {0}<br/><a class="Normal" href="/{1}/pages/Viewer.aspx?id_s={_id}" target="_blank">' + 
                                                         'S{_id}' + 
                                                         '</a>').format(__tipos[s._tipo], MAPA.AppPath, s);
                      html += ('<div style="padding:4px;border-bottom:solid 1px silver;position:relative;background-color:{fertilizante._bgColor};">' + 
                               '<div>{0} {_denominacion}</div>' + 
                               '<div style="color:gray">{fabricante._nif} {fabricante._nombre}</div>' + 
                               '<div style="position:absolute;right:0px;top:8px;padding:3px">{fertilizante._estado}</div>' +
                               '</div>').format(__link, s);

                      return html;
                    }, '')
        ));                                                        
      });
    }
    
    __ShowConfirmDialog('', 
                        function(dlg){ },
                        { Height     : 350, 
                          Width      : 500,                          
                          Title      : 'Búsqueda de nombres comerciales',
                          Selectable : true
                        },
                        function(dlg){                              
                          dlg.HideButton(dlg.BtnYes);
                          dlg.BtnNo.value          = 'Cerrar';
                          dlg.Body.style.top       = '6em';
                          dlg.Body.style.padding   = '3px 10px';
                          dlg.Body.style.borderTop = 'solid 1px silver';
                          dlg.Body.style.overflow  = 'auto';
                          dlg.Body.className       = "W1-Body";   
                          dlg.Element.insertBefore($.$('div', { innerHTML : '<input id="txt-nombre-comercial" ' + 
                                                                                   'placeholder="Nombre comercial" ' + 
                                                                                   'type="text" ' + 
                                                                                   'style="width: calc(100% - 8em)" /> ' +
                                                                            '<button type="button" style="width:7em">Buscar</button>',
                                                                style     : { 
                                                                  padding   : '12px',
                                                                  marginTop : '20px'
                                                                }}), dlg.Body);
                          __initHandlers(dlg);
                        });
  }
  
  MAPA.Search = { fabricanteByNif    : __openFabricante,
                  fertilizanteByCode : __openFertilizante,
                  registroByNumber   : __openRegistro,
                  nombresComerciales : __searchNames }
}())
