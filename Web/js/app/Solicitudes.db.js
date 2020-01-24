///<reference path="../MAPA.js" />
(function(module){

  var __url_fertilizante = '../JSon/Fertilizante.ashx';
  var __url_solicitud    = '../JSon/Solicitud.ashx';
  var __url_registro     = '../JSon/RegistroElectronico/Registro.ashx';
  var __tipos            = { I : "inscripción en el registro",
                             M : "modificación",
                             R : "renovación" };
  
  function __save(container, solicitud, layer, callback){  
    // ===============================================================================================================
    // Validación de datos
    // ===============================================================================================================
    var __helper = function(){      
      return { element : '',
               close   : function(){
                 layer.Hide();
                 this.element.focus();
                 this.element.scrollIntoView(false);
               },
               throwIfEmpty : function(e, msg){
                 this.element = $(e);
                 if(!this.element.value) throw new Error(msg);
               }
             }}();
    try { 
      __helper.throwIfEmpty('fer-s-txtTipoFertilizante', 'Falta el código del tipo de producto');
      __helper.throwIfEmpty('fer-s-txtDenominacion', 'Falta la denominación del producto');   
    }catch(er){ 
      layer.ShowError(er.message, function(){ __helper.close(); }); 
      return;
    }
    // ===============================================================================================================
    // Grabar la solicitud
    // ===============================================================================================================
    function __doSave(){
      // ===============================================================================================================
      // Parámetros de la petición
      // ===============================================================================================================
      var params = function(){
        return (solicitud._id != '-' ? 'accion=save&id={_id}'.format(solicitud)
                                     : ('accion=new' + 
                                        '&link={_link_id}' +
                                        '&tipo={_tipo}' + 
                                        '&idfabricante={_idFabricante}' + 
                                        '&idfertilizante={_idFertilizante}').format(solicitud)) +
                '&{0}'.format($Ajax.Serialize(container)) +
               ('&fer-s-mat={materias}' +
                '&fer-s-presentacion={idPresentacion}' + 
                '&fer-s-quelantes={quelantes}' +
                '&fer-s-complejantes={complejantes}' +
                '&fer-s-micro={micro}').format({ 
                  idPresentacion : $('[name=fer-s-fp]', container).Item('checked', true).id.replace('fer-s-fp-txt', ''),
                  quelantes      : encodeURIComponent(
                                    $('#list-quelantes input:checked', container)
                                    .reduce(function(s, check){
                                      return s.append(check.id.split('$')[1]);                                      
                                    }, []).join(';')),
                  complejantes   : encodeURIComponent(
                                    $('#list-complejantes input:checked', container)
                                    .reduce(function(s, check){
                                      return s.append(check.id.split('$')[1]);                                      
                                    }, []).join(';')),
                  materias       : (function(){
                                    return encodeURIComponent(
                                      $('[data-id-Agrupacion]', container)
                                      .reduce( function(a, tr){                                         
                                        return a.append('{0}#{1}'.format(tr.dataset.idAgrupacion.split('-')[2], 
                                                                          $('input', tr).Select('value')
                                                                                        .join('#')));                                      
                                      }, []).join('~'));
                                    }()),
                  micro          : (function(){ 
                                    return encodeURIComponent(
                                      $('#fer-micro-tbl-s input', container)
                                        .reduce( function(a, txt, i){                                         
                                          var row = ~~(i / 2);
                                          a[row] = a[row] || ['O'];
                                          a[row].push(txt.value);
                                          return a;                                      
                                      }, [])
                                      .concat($('#fer-micro-tbl-mico input', container)
                                        .reduce( function(a, txt, i){                                         
                                          var row = ~~(i / 5);
                                          a[row] = a[row] || ['S'];
                                          a[row].push(txt.value);
                                          return a;                                      
                                      }, []))
                                      .concat($('#fer-micro-tbl-no-mico input', container)
                                        .reduce( function(a, txt, i){                                         
                                          var row = ~~(i / 5);
                                          a[row] = a[row] || ['N'];
                                          a[row].push(txt.value);
                                          return a;
                                      }, []))
                                      .map(function(line){return line.join('#')})
                                      .join('~'));
                                    }()) 
                });    
      }();    
      // =======================================================================================================
      // Realizar la petición
      // =======================================================================================================
      layer.ShowInfo('Grabando datos...');    
      $Ajax.Post(__url_solicitud, params, function(o){                                                              
        layer.Hide();                                                             
        var respuesta = MAPA.tryParse(o); 
        if(respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);
        if(callback) callback(respuesta);      
      });           
    }
    // ============================================================================================================
    // Pedir conformidad para la inserción de solicitudes
    // ============================================================================================================
    if(solicitud._id != '-'){ 
      __doSave();     
    }else{
      __ShowConfirmDialog('Está a punto de grabar una nueva solicitud de {0}.'.format(__tipos[solicitud._tipo]) + 
                          '<br/><br/>¿Está seguro de continuar con la operación?',
                          __doSave, 
                          {Height : 160, Width: 400, Title : '{_CONST.AppName} - Solicitudes'.format()});
    }
  }

  function __validar(o, solicitud, layer, callback){
    layer.ShowInfo('Validando datos...');
    var __params = 'accion=validate&id={_id}'.format(solicitud);
    $Ajax.Post(__url_solicitud, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o);       
      if(respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);      
      if(callback) callback(respuesta);

      var __grupos = respuesta.mensajes
                              .Where(function(m){ return /^\d+\s/.test(m); })
                              .reduce( function(d, message){
                                d[message.split(' ')[0]] = message;
                                return d;
                              }, {});
      __ShowConfirmDialog('', 
                          function(dlg){ },
                          { Height     : 450, 
                            Width      : 470,
                            Selectable : true,
                            Title      : 'Validación de la ficha de características'},
                          function(dlg){                              
                            dlg.BtnNo.value        = 'Cerrar';
                            dlg.HideButton(dlg.BtnYes);
                            dlg.Body.style.top       = '6em';
                            dlg.Body.style.padding   = '3px 10px';
                            dlg.Body.style.borderTop = 'solid 1px silver';
                            dlg.Body.style.overflow  = 'auto';
                            dlg.Body.className       = "W1-Body";   
                            dlg.Body.innerHTML = '<h3 style="padding:0;margin:2px 0;">Avisos</h3>' + 
                                                  '<div style="padding:10px;background-color:#eeeeee;margin-bottom:7px;border:solid 1px silver;">' +
                                                  respuesta.avisos
                                                           .reduce( function(a, aviso, i){
                                                              if(i==0) a.html = '';
                                                              if(a.current != aviso.Grupo){
                                                                a.current = aviso.Grupo;
                                                                a.html += '<div class="bold" style="padding:4px 0;border-bottom:solid 1px silver;">';
                                                                a.html += __grupos[a.current];
                                                                a.html += '</div>';
                                                              }
                                                              a.html += '<div id="{ControlId}">- {Mensaje}</div>'.format(aviso);
                                                              return a;
                                                           }, { html : 'No hay avisos', current : '' }).html +
                                                  '</div>' + 
                                                  '<h3 style="padding:0;margin:2px 0;">Errores</h3>'                                   + 
                                                  '<div style="padding:10px;background-color:#eeeeee;margin-bottom:7px;border:solid 1px silver;">' +
                                                  respuesta.errores
                                                           .reduce( function(a, error, i){
                                                              if(i==0) a.html = '';
                                                              if(a.current != error.Grupo){
                                                                a.current = error.Grupo;
                                                                a.html += '<div class="bold" style="padding:4px 0;border-bottom:solid 1px silver;">';
                                                                a.html += __grupos[a.current];
                                                                a.html += '</div>';
                                                              }
                                                              a.html += '<div id="{ControlId}">- {Mensaje}</div>'.format(error);
                                                              return a;
                                                            }, { html : 'No hay errores', current : '' }).html +
                                                  '</div>' + 
                                                  '<h3 style="padding:0;margin:2px 0;">Reglas de validación</h3>' +
                                                  '<div style="padding:10px;background-color:#eeeeee;margin-bottom:7px;border:solid 1px silver;">' +
                                                  respuesta.mensajes
                                                           .reduce( function(html, message){
                                                              if(/^\d+\s/.test(message)){
                                                                html += '<div class="bold" style="padding:4px 0;border-bottom:solid 1px silver;">';
                                                                html += message;
                                                                html += '</div>';
                                                              }else{
                                                                html += '<div>- {0}</div>'.format(message);
                                                              }                                                             
                                                              return html;
                                                            }, '') +
                                                  '</div>';
                            dlg.Element.insertBefore($.$('div', { innerHTML : 'Resultado del proceso de validación de la ficha de características',
                                                                  style     : { 
                                                                    padding   : '12px',
                                                                    marginTop : '20px'
                                                                  }}), dlg.Body);
                            dlg.BtnNo.focus();
                          });
    });
  }

  function __reasignar(fabricante, dataset, layer, callback){    
    if(fabricante.Checked_sol.length == 0) return;
    __ShowConfirmDialog('',
                        function(dlg){ layer.Hide(); }, 
                        {Height : 210, Width : 320, Title : '{_CONST.AppName} - Solicitudes'.format(), 
                           BeforeConfirm : function(dlg){
                             (function(){                                
                                var __txt = dlg.Body.querySelector('#txtNif');                                
                                if(!__txt.value){
                                  return setTimeout(function(){ __txt.focus(); },100);
                                }
                                var __id  = fabricante.Checked_sol.Select('solicitud')[0]._id;
                                $Ajax.Post(__url_solicitud, 'accion=reasignar&id={0}&nif={1}'.format(__id, __txt.value), function(o){                                  
                                  var __response = MAPA.tryParse(o);
                                  if (__response.Resultado && __response.Resultado != 'OK'){              
                                    return layer.ShowError(__response.Mensaje)
                                  }                                
                                  fabricante.Checked_sol.forEach(function(o){ 
                                    o.row.parentNode.removeChild(o.row);        // Quitar la fila de la tabla                   
                                    fabricante.Solicitudes.remove(o.solicitud); // Quitar del array
                                    if(dataset != fabricante.Solicitudes){
                                      dataset.remove(o.solicitud);              // Quitar de las filtradas
                                    }                              
                                  }); 
                                  fabricante.Checked_sol = [];
                                  callback();
                                  dlg.BtnNo.click();
                                });                                
                              }());   
                            return true;
                          }
                        }, 
                        function(dlg){
                          dlg.BtnYes.value       = 'Aceptar';
                          dlg.BtnNo.value        = 'Cancelar';
                          dlg.BtnNo.style.width  = '6em';
                          dlg.BtnYes.style.width = '6em';
                          dlg.Body.style.padding = '3px 10px';
                          dlg.Body.className     = 'W1-Body';                          
                          dlg.Body.innerHTML     = '<h4>Reasignar solicitud</h4>' +
                                                   '<p>Introduzca el nif del fabricante al que quiere asignar la solicitud y pulse el botón aceptar.' +
                                                   '<div class="fc" style="width:11em;">' +
                                                   '<label class="fcap" for="txtNif">Nif del fabricante:</label>' + 
                                                   '<input class="fc" type="text" id="txtNif" style="width: 100%">' +
                                                   '</div>' + 
                                                   '<p style="float:left;color:red;">' + 
                                                   'Nota: Únicamente es posible reasignar solicitudes de inscripción que se encuentren en trámite' +
                                                   '</p>';
                        });
  }

  function __inscribir(data, dataset, layer, callback){   
    return data._nif ? __inscribir_from_fabricate(data, dataset, layer, callback)
                     : __inscribir_from_viewer(dataset, layer, callback);    
  }
  
  function __inscribir_from_fabricate(fabricante, dataset, layer, callback){

    if(fabricante.Checked_sol.length == 0) return;
    (function(solicitud){     
      // ============================================================================
      // Realizar la petición
      // ============================================================================
      function __makeRequest(){
        layer.ShowInfo('Grabando datos...');
        var __params = 'accion=inscribir&id={_id}'.format(solicitud);
        $Ajax.Post(__url_solicitud, __params, function(o){                                
          layer.Hide();                                                              
          (function(respuesta){

            function __updateUI(){
              layer.Hide(); 
              // ========================================================================
              // Sincronizar la lista de solicitudes
              // ========================================================================
              fabricante.Checked_sol.forEach(function(o){ 
                o.row.parentNode.removeChild(o.row);        // Quitar la fila de la tabla         
                fabricante.Solicitudes.remove(o.solicitud); // Quitar del array
                if(dataset != fabricante.Solicitudes){
                  dataset.remove(o.solicitud);              // Quitar de las filtradas
                }                              
              });          
              fabricante.Checked_sol = [];
              callback();                                   // Actualizar statusBar
              // ========================================================================
              // Sincronizar la lista de productos registrados (la forma + fácil)
              // ========================================================================
              fabricante.fertilizantes_loaded = false;
              if(!_boxes.BoxFertilizantes.Collapsed){            
                _boxes.BoxFertilizantes.Show().Expand();
                var __eventHandlerId = 
                MAPA.Fertilizantes.onListloaded.Add(function(){
                  MAPA.Fertilizantes.onListloaded.Remove(__eventHandlerId);
                  (function(element){
                    if(element){
                      element.scrollIntoView();
                      [0,1,2,3,4,5,6,7,8,9].forEach( function(t){
                        setTimeout(function(){ 
                          element.classList.toggle('flash');
                        }, 150 + t * 200);
                      });                 
                    }              
                  }(_boxes.BoxFertilizantes
                          .Body
                          .querySelector('#row_f_{_id}'.format(respuesta.Fertilizante))));              
                });           
              }
            }

            if(respuesta.Resultado != 'OK'){ 
              layer.ShowError(respuesta.Mensaje, layer.Hide);
            }else if(respuesta.Solicitud._idFabricante != solicitud._idFabricante){
              layer.ShowMessage({ Caption : '{_CONST.AppName}'.format(),
                                  Width   : 425, Height: 165,
                                  Message : 'La operación se ha realizado correctamente.' +
                                            '<br /><br />Se ha realizado el cambio de titularidad ' + 
                                            'según lo especificado en la solicitud', 
                                  OnClose : __updateUI
                                });          
            }else{
              layer.ShowMessage({ Caption : '{_CONST.AppName}'.format(),
                                  Width   : 400, Height: 130,
                                  Message : 'La operación se ha realizado correctamente.', 
                                  OnClose : __updateUI
                                }); 
            }                                        
          }(MAPA.tryParse(o)));
        }); 
      }
      // ============================================================================
      // Pedir conformidad para la inscripción de solicitudes
      // ============================================================================
      __ShowConfirmDialog(('Está a punto de confirmar la ' +
                           '<b>{0}</b> del producto fertilizante.' + 
                           '<br/><br/>¿Está seguro de continuar con la operación?')
                           .format( { 'I' : 'Inscripción',
                                      'R' : 'Renovación',
                                      'M' : 'Modificación' }[solicitud._tipo]),
                          __makeRequest, 
                          {Height : 160, 
                           Width  : 470, 
                           Title  : '{_CONST.AppName}'.format()});
    }(fabricante.Checked_sol.Select('solicitud')[0]));    
  }

  function __inscribir_from_viewer(solicitud, layer, callback){    
    // ============================================================================
    // Realizar la petición
    // ============================================================================
    function __makeRequest(){
      layer.ShowInfo('Grabando datos...');
      var __params = 'accion=inscribir&id={_id}'.format(solicitud);
      $Ajax.Post(__url_solicitud, __params, function(o){                                
        layer.Hide();                                                              
        (function(respuesta){

          function __updateUI(){
            layer.Hide();         
            callback(respuesta);            
          }

          if(respuesta.Resultado != 'OK'){ 
            layer.ShowError(respuesta.Mensaje, layer.Hide);
          }else if(respuesta.Solicitud._idFabricante != solicitud._idFabricante){
            layer.ShowMessage({ Caption : '{_CONST.AppName}'.format(),
                                Width   : 425, Height: 165,
                                Message : 'La operación se ha realizado correctamente.' +
                                          '<br /><br />Se ha realizado el cambio de titularidad ' + 
                                          'según lo especificado en la solicitud', 
                                OnClose : __updateUI
                              });          
          }else{
            layer.ShowMessage({ Caption : '{_CONST.AppName}'.format(),
                                Width   : 400, Height: 130,
                                Message : 'La operación se ha realizado correctamente.', 
                                OnClose : __updateUI
                              }); 
          }                                        
        }(MAPA.tryParse(o)));
      }); 
    }
    // ============================================================================
    // Pedir conformidad para la inscripción de solicitudes
    // ============================================================================
    __ShowConfirmDialog(('Está a punto de confirmar la ' +
                          '<b>{0}</b> del producto fertilizante.' + 
                          '<br/><br/>¿Está seguro de continuar con la operación?')
                          .format( { 'I' : 'Inscripción',
                                    'R' : 'Renovación',
                                    'M' : 'Modificación' }[solicitud._tipo]),
                        __makeRequest, 
                        {Height : 160, 
                         Width  : 470, 
                         Title  : '{_CONST.AppName}'.format()}); 
  }

  function __estimarSolicitud(o, solicitud, layer, callback){      
    layer.ShowInfo('Grabando datos...');
    var __params = 'accion=estado.estimar&id={_id}'.format(solicitud);
    $Ajax.Post(__url_solicitud, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o);       
      if(respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);      
      if(callback) callback(respuesta);
    });  
  }

  function __desestimarSolicitud(o, solicitud, layer, callback){      
    layer.ShowInfo('Grabando datos...');
    var __params = 'accion=estado.desestimar&id={_id}'.format(solicitud);
    $Ajax.Post(__url_solicitud, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o);       
      if(respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);      
      if(callback) callback(respuesta);
    });  
  }

  function __saveFertilizante(o, solicitud, layer, callback){
    // =================================================================================
    // Validación de datos
    // =================================================================================
    var __fechaInscripcion = o.container.querySelector('#txtFechaInscripcion').value;
    var __fechaRenovacion  = o.container.querySelector('#txtFechaRenovacion').value;
    function __validar(){
      Date.Assert(__fechaInscripcion)
          .IsValidOrEmpty('La fecha de inscripción del producto fertilizante no es válida')
          .HasValue('Debe introducir la fecha de inscripción del producto fertilizante');
      if(solicitud.ProductoRegistrado._fechaDeRenovacion){
        Date.Assert(__fechaRenovacion)
            .IsValidOrEmpty('La fecha de renovación del producto fertilizante no es válida')
            .HasValue('Debe introducir la fecha de renovación del producto fertilizante')      
      }
    }
    try { 
      __validar();
    }catch(er){ 
      layer.ShowError(er.message, layer.Hide); 
      return;
    }
    // ==============================================================================
    // Realizar la petición
    // ==============================================================================
    layer.ShowInfo('Grabando datos...');
    var __params = ('accion=save&id={0}&' + 
                    'fechaInscripcion={1}&' + 
                    'fechaRenovacion={2}'
                    ).format(solicitud.ProductoRegistrado._id,
                             __fechaInscripcion,
                             __fechaRenovacion);
    $Ajax.Post(__url_fertilizante, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o); 
      if (respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);      
      if(callback) callback(respuesta);
    });
  }
  
  function __habilitarFertilizante(o, solicitud, layer, callback){      
    layer.ShowInfo('Grabando datos...');
    var __params = 'accion=estado.habilitar&id={_id}'.format(solicitud.ProductoRegistrado);
    $Ajax.Post(__url_fertilizante, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o);       
      if (respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);      
      if(callback) callback(respuesta);
    });  
  }

  function __deshabilitarFertilizante(o, solicitud, layer, callback){      
    layer.ShowInfo('Grabando datos...');
    var __params = 'accion=estado.deshabilitar&id={_id}'.format(solicitud.ProductoRegistrado);
    $Ajax.Post(__url_fertilizante, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o);       
      if (respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);
      if(callback) callback(respuesta);
    });
  }

  function __prorrogarFertilizante(o, solicitud, layer, callback){      
    layer.ShowInfo('Grabando datos...');   
    var __params = 'accion=estado.prorrogar&id={_id}'.format(solicitud.ProductoRegistrado);
    $Ajax.Post(__url_fertilizante, __params, function(o){                                                              
      layer.Hide();                                                             
      var respuesta = MAPA.tryParse(o);       
      if (respuesta.Resultado != 'OK') return layer.ShowError(respuesta.Mensaje, layer.Hide);
      if(callback) callback(respuesta);      
    });
  }

  function __vincular(o, solicitud, layer, callback){
    if(solicitud._id == '-') return;
    // ========================================================================================
    // Desvincular
    // ========================================================================================
    if(solicitud.tables.registro._id){
      (function(dlg){
          dlg.RemoveOnclose = true;
          MAPA._KeyEvents.DisableEvents().EnableDialogEvents(dlg, { '27' : dlg.BtnNo.onclick, 
                                                                    '13' : MAPA.emptyFn });
        }(layer.ShowConfirm({ Title         : _CONST.AppName,
                              Height        : 140,
                              Width         : 430,
                              OnCancel      : layer.Hide,
                              Message       : '¿Está seguro de quitar el vínculo existente ' +
                                              'entre la solicitud y el registro electrónico?',                                              
                              OnConfirm     : function(dlg){
                                var params = 'accion=unlink&id={_id}&mode=s'.format(solicitud);       
                                $Ajax.Post(__url_registro, params, function(o){                                                                                
                                  var respuesta = MAPA.tryParse(o); 
                                  if (respuesta.Resultado != 'OK'){
                                    layer.ShowError(respuesta.Mensaje, layer.Hide);
                                    return;
                                  }
                                  layer.Hide();
                                  solicitud.tables.registro = {};
                                  callback();
                                });                                                                                     
                              }})));
      return;
    }
    // =================================================================================================
    // Vincular
    // =================================================================================================
    (function(dlg){
      if(MAPA.Solicitudes.Registro){
        MAPA.Solicitudes.Registro.InitDialog(dlg, solicitud, layer);
      }else{
        MAPA.Include('../js/app/historial.js', function(){
          MAPA.Solicitudes.Registro.InitDialog(dlg, solicitud, layer);
        });
      }               
    }(layer.ShowConfirm({ Title         : _CONST.AppName,
                          Height        : 350,
                          Width         : 400,
                          OnCancel      : layer.Hide, 
                          BeforeConfirm : function(dlg){
                            return !MAPA.Solicitudes.Registro.SelectedItem()._id;
                          },
                          OnConfirm     : function(dlg){
                            var __registro = MAPA.Solicitudes.Registro.SelectedItem();                             
                            var __id = __registro._id;
                            // ====================================================================================================
                            // Cargar los documentos del registro electrónico
                            // ====================================================================================================
                            function __loadDocuments(data){                     
                              $Ajax.Post(__url_registro, 'accion=documentos.getitems&IdRegistro={0}'.format(__id), function(o){                          
                                var respuesta = MAPA.tryParse(o);
                                if (respuesta.Resultado != 'OK'){
                                  layer.ShowError(respuesta.Mensaje, layer.Hide);
                                  return;
                                }
                                solicitud.tables.registro = __registro;
                                callback(respuesta);
                              });                                                                                     
                            }
                            // ====================================================================================================
                            // Vincular al registro electrónico
                            // ====================================================================================================                    
                            $Ajax.Post(__url_registro, 'accion=link&id={0}&idsolicitud={_id}'.format(__id, solicitud), function(o){                                                                                               
                              var respuesta = MAPA.tryParse(o); 
                              if (respuesta.Resultado != 'OK'){
                                layer.ShowError(respuesta.Mensaje, layer.Hide);
                                return;
                              }
                              layer.Hide();
                              __loadDocuments(respuesta);
                            });                            
                          }})));
  }

  function __print(o, solicitud, layer, callback){    
    //(function(w){
    //  $('.box_body', o).forEach(function(div){                        
    //    w.document.body.innerHTML += div.innerHTML;  
    //  });
    //}(window.open('')));
  }
  // =====================================================================================
  // Listas del apartado 5 - Materias primas utilizadas en la fabricación
  // =====================================================================================
  function __showList(o, solicitud, layer, callback){

    ({ '51' : __showList51,
       '52' : __showList52, 
       '53' : __showList53,
       '55' : __showList55}[o.id] || function(){})(o, solicitud, layer, callback); 
    
    function __commonInit(dlg){
      dlg.BtnYes.value       = 'Aceptar';
      dlg.BtnNo.value        = 'Cancelar';
      dlg.BtnNo.style.width  = '6em';
      dlg.BtnYes.style.width = '6em';
      dlg.Body.style.padding = '3px 10px';
      dlg.Body.className     = 'W1-Body';
      return dlg;
    }

    function __insetRow(o, text){
      var __row                  = o.row.parentNode.insertRow(o.row.rowIndex);
      __row.className            = 'row';
      __row.dataset.idAgrupacion = 'row-mat-{0}'.format(o.id); 
      __row.innerHTML            = o.row_template.format(text[0], text[1], text[2]);
      return __row 
    }

    function __showList51(o, solicitud, layer, callback){
      var __residuos = Object.keys(_residuos)
                             .reduce( function(a, k){return a.append(_residuos[k]);}, [])
                             .SortBy('id');
      __ShowConfirmDialog('', function(dlg){                              
                                $('input:checked', dlg.Body).forEach( function(checkbox){ 
                                  __insetRow(o, [checkbox.dataset.id, _residuos[checkbox.dataset.id].des, '']);
                                });
                                layer.Hide();
                              }, {Height : 350, Width: 470, Title : '{_CONST.AppName} - Materias de origen orgánico'.format()},
                              function(dlg){
                                __commonInit(dlg);
                                dlg.Body.innerHTML = '<p>Seleccione aquellos elementos que quiere agregar a la lista de materias de origen orgánico.</p>' + 
                                                     '<div class="code-container">' +
                                                       __residuos.reduce( function(a, r){                                                          
                                                         return a += r.id.length < 6 ? '' 
                                                                                     : ('<div>' + 
                                                                                        '<input id="checkResiduo-{id}" data-id="{id}" type="checkbox">' + 
                                                                                        '<label for="checkResiduo-{id}">{id} {des}</label>' +
                                                                                        '</div>').format(r);
                                                       }, '') + 
                                                     '</div>' ;
                              
                              });  
    }
  
    function __showList52(o, solicitud, layer, callback){ 
      $Ajax.Post('../JSon/Solicitud.ashx', 'accion=materias.distinct.52', function(response){
        var __res = MAPA.tryParse(response)
        __ShowConfirmDialog('', function(dlg){
                                layer.Hide();
                              }, {Height : 350, Width: 380, Title : '{_CONST.AppName} - Búsqueda de abonos minerales'.format()},
                              function(dlg){
                                __commonInit(dlg);
                                dlg.BtnYes.style.display = 'none';
                                dlg.Body.innerHTML = '<div class="fc" style="width:100%; margin-bottom: 3px;">' +
                                                     '<label class="fcap" for="txtSearch">Introduzca la descripción del abono</label>' +
                                                     '<input type="text" id="txtSearch" style="width: 100%" />' +
                                                     '</div>' + 
                                                     '<div class="code-container">' +
                                                     __res.reduce( function(a, item, i){                                                          
                                                       return a += '<div data-index="{0}" class="literal">{1}</div>'.format(i, item.d);
                                                     }, '') + 
                                                     '</div>';
                                var __items = $('.literal', dlg.Body);
                                dlg.Body.querySelector('#txtSearch').oninput = function(event){
                                  var __text    = event.target.value.toLowerCase();
                                  var __test_fn = __text.length < 4 ? String.prototype.startsWith : String.prototype.contains;
                                  var __regexp  = __text.length < 4 ? new RegExp('^({0})'.format(MAPA.escapeRe(__text)), 'gim') 
                                                                    : new RegExp('({0})'.format(MAPA.escapeRe(__text)), 'gim') 
                                  __items.forEach(function(e){
                                    var __html  = e.textContent;
                                    if(__text.trim() == ''){
                                      e.style.display = '';
                                      e.innerHTML     = __html;
                                     return;
                                    }
                                    var __match = __test_fn.call(e.textContent.toLowerCase(), __text);
                                    e.style.display = __match ? '' : 'none';
                                    e.innerHTML     = __match ? __html.replace(__regexp, '<span>$1</span>') : __html;
                                  }); 
                                }
                                dlg.Body.querySelector('.code-container').onclick = function(event){
                                  var __sender = event.target;
                                  if(__sender.className == 'literal' || __sender.parentNode.className == 'literal'){ 
                                    var __index = __sender.className == 'literal' ? __sender.dataset.index
                                                                                  : __sender.parentNode.dataset.index;                                
                                    var __row   = __insetRow(o, ['', __items[~~__index].textContent, '']);
                                    setTimeout(function(){ 
                                      __row.querySelector('input[data-format]').focus();
                                    }, 300);
                                    dlg.BtnYes.click();
                                  } 
                                }
                              });    
      });      
    }
  
    function __showList53(o, solicitud, layer, callback){
      var __enmiendas = Object.keys(_enmiendas)
                              .reduce( function(a, k){return a.append(_enmiendas[k]);}, [])
                              .SortBy('id');
      __ShowConfirmDialog('', function(dlg){
                                $('input:checked', dlg.Body).forEach( function(checkbox){ 
                                  __insetRow(o, [checkbox.dataset.id, _enmiendas[checkbox.dataset.id].des, '']);   
                                });
                                layer.Hide();
                              }, {Height : 350, Width: 380, Title : '{_CONST.AppName} - Enmiendas minerales'.format()},
                              function(dlg){
                                __commonInit(dlg);
                                dlg.Body.innerHTML = '<p>Seleccione aquellos elementos que quiere agregar a la lista de enmiendas minerales.</p>' + 
                                                     '<div class="code-container">' +
                                                     __enmiendas.reduce( function(a, e){                                                          
                                                        return a += ('<div>' + 
                                                                     '<input id="checkEnmienda-{id}" data-id="{id}" type="checkbox">' + 
                                                                     '<label for="checkEnmienda-{id}">{id} {des}</label>' +
                                                                     '</div>').format(e);
                                                        }, '') + 
                                                     '</div>' ;
                              
                              });  
    }

    function __showList55(o, solicitud, layer, callback){      
      $Ajax.Post('../JSon/Solicitud.ashx', 'accion=materias.distinct.55', function(response){
        var __res = MAPA.tryParse(response)
        __ShowConfirmDialog('', function(dlg){
                                layer.Hide();
                              }, {Height : 350, Width: 380, Title : '{_CONST.AppName} - Búsqueda de ingredientes'.format()},
                              function(dlg){
                                __commonInit(dlg);
                                dlg.BtnYes.style.display = 'none';
                                dlg.Body.innerHTML = '<div class="fc" style="width:100%; margin-bottom: 3px;">' +
                                                     '<label class="fcap" for="txtSearch">Introduzca la descripción del ingrediente</label>' +
                                                     '<input type="text" id="txtSearch" style="width: 100%" />' +
                                                     '</div>' + 
                                                     '<div class="code-container">' +
                                                     __res.reduce( function(a, item, i){                                                          
                                                       return a += '<div data-index="{0}" class="literal">{1}</div>'.format(i, item.d);
                                                     }, '') + 
                                                     '</div>';
                                var __items = $('.literal', dlg.Body);
                                dlg.Body.querySelector('#txtSearch').oninput = function(event){
                                  var __text    = event.target.value.toLowerCase();
                                  var __test_fn = __text.length < 4 ? String.prototype.startsWith : String.prototype.contains;
                                  var __regexp  = __text.length < 4 ? new RegExp('^({0})'.format(MAPA.escapeRe(__text)), 'gim') 
                                                                    : new RegExp('({0})'.format(MAPA.escapeRe(__text)), 'gim') 
                                  __items.forEach(function(e){
                                    var __html  = e.textContent;
                                    if(__text.trim() == ''){
                                      e.style.display = '';
                                      e.innerHTML     = __html;
                                     return;
                                    }
                                    var __match = __test_fn.call(e.textContent.toLowerCase(), __text);
                                    e.style.display = __match ? '' : 'none';
                                    e.innerHTML     = __match ? __html.replace(__regexp, '<span>$1</span>') : __html;
                                  }); 
                                }
                                dlg.Body.querySelector('.code-container').onclick = function(event){
                                  var __sender = event.target;
                                  if(__sender.className == 'literal' || __sender.parentNode.className == 'literal'){ 
                                    var __index = __sender.className == 'literal' ? __sender.dataset.index
                                                                                  : __sender.parentNode.dataset.index;                                
                                    var __row = __insetRow(o, ['', __items[~~__index].textContent, '']);
                                    setTimeout(function(){ 
                                      __row.querySelector('input[data-format]').focus();
                                    }, 300);
                                    dlg.BtnYes.click();
                                  } 
                                }
                              });    
      });      
    }

  }

  
  module.Solicitudes.DB = { save                     : __save,
                            validar                  : __validar,
                            reasignar                : __reasignar,
                            inscribir                : __inscribir,
                            print                    : __print,
                            estimarSolicitud         : __estimarSolicitud,
                            desestimarSolicitud      : __desestimarSolicitud,
                            vincular                 : __vincular,
                            saveFertilizante         : __saveFertilizante,
                            habilitarFertilizante    : __habilitarFertilizante,
                            deshabilitarFertilizante : __deshabilitarFertilizante,
                            prorrogarFertilizante    : __prorrogarFertilizante,
                            showList                 : __showList
                          }

}(MAPA));