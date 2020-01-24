/// <reference path="../MAPA.js" />
(function(){  
  var __template        = '';
  var __dsFertilizantes = '';
  var __container       = '';
  var __statusContainer = '';
  var __cmbEstado       = '';
  var __btnExpand       = '';
  var __btnOpen         = '';
  var __btnAddRenovacion   = '';
  var __btnAddModificacion = '';
  var __commands        = {};
  var __view            = '' 
  var __estados         = { A : "Anulado",
                            C : "Caducado",
                            P : "Prorrogado",
                            R : "" };
  
  var __url_fertilizante = '../JSon/Fertilizante.ashx';

  function __initModule(sender){
    __container = $('.FertilizantesContainer', sender.Body)[0];
    __statusContainer = $('.statusContainer', sender.Body)[0]; 
    __view      = $('ViewContent')
    __btnExpand = $('.toolsContainer .expandBtn', sender.Body)[0];
    __btnOpen   = $('.toolsContainer .openBtn', sender.Body)[0];
    __btnAddRenovacion   = $('.toolsContainer .addRenovacionBtn', sender.Body)[0];
    __btnAddModificacion = $('.toolsContainer .addModificaionBtn', sender.Body)[0];
    __cmbEstado = $('cmbEstadoFer');
    // ===========================================================
    // Expandir/contraer la lista
    // ===========================================================
    __btnExpand.onclick = function(){        
      if(__container.style.maxHeight == 'none'){
        __container.style.maxHeight = '';
        this.textContent = '🔽';
      }else{
        __container.style.maxHeight = 'none';
        this.textContent = '🔼';
      }        
    }
    // ====================================================================
    // Operaciones de los botones
    // ====================================================================
    __btnOpen.onclick = __openChecked;
    __btnAddModificacion.onclick  = __addSolicitud;  // Añadir modificación
    __btnAddRenovacion.onclick    = __addSolicitud;  // Añadir renovación
    // ====================================================================
    // Filtro de datos
    // ====================================================================
    __cmbEstado.onchange = __filterData;
    MAPA.Fertilizantes.onExpand = __loadData;
    MAPA.Fertilizantes.onExpand(sender);
  }  

  // =======================================================================================================
  // Inicialización de la tabla de fertilizantes
  // =======================================================================================================
  var __header     = '<table id="tabla-fertilizantes" class="silverTable">';
  var __row_header = '<tr class="theader">' + 
                     '  <td></td>' +
                     '  <td>Código</td>' + 
                     '  <td>Expediente</td>' +
                     '  <td>Nombre comercial</td>' + 
                     '  <td>Tipo de fertilizante</td>' + 
                     '  <td>Fecha de inscripción</td>' + 
                     '  <td>Fecha de renovación</td>' +
                     '  <td>Fecha de caducidad</td>' +
                     '  <td>Estado</td>' +
                     '</tr>';
  var __row_template = '<tr class="row_edit" id="row_f_{8}">' + 
                       '  <td class="left" style="width:1%"><input type=checkbox class="check"/></td>' +
                       '  <td class="center" style="min-width:10em">{0}</td>' + 
                       '  <td class="center" style="min-width:4em">{1}</td>' +
                       '  <td class="left" style="width:30%">{2}</td>' + 
                       '  <td class="left" style="width:40%">{3}</td>' + 
                       '  <td class="center">{4}</td>' + 
                       '  <td class="center">{5}</td>' +
                       '  <td class="center">{6}</td>' +
                       '  <td class="center">{7}</td>' +
                       '</tr>';
  function __sync_checked(){
    function __reducefn(array, e, i){
        if(e.checked) array.push({ fertilizante : __dsFertilizantes[i],
                                   row          : e.parentNode.parentNode }); 
        return array;
    }
    _$Fabricante.Checked_fer = $('.check', __container).reduce(__reducefn, []);
  }
  function __onCheck(){
    __sync_checked();
    this.parentNode.style.backgroundColor = this.checked ? 'lightgrey' : '';
    __btnOpen.disabled = true;
    __btnAddModificacion.disabled = true;
    __btnAddRenovacion.disabled    = true
    if(_$Fabricante.Checked_fer.length == 1){
      __btnOpen.disabled = false;
      __btnAddModificacion.disabled = false;
      __btnAddRenovacion.disabled   = false;
    }else if(_$Fabricante.Checked_fer.length > 1){            
      __btnOpen.disabled = false;
    }
    __updateStatus();
  }

  function __onRowClick(ev){
    var __ev = MAPA.MapaEvent(ev); 
    if(__ev.Target.tagName == 'INPUT' || __ev.Target.tagName == 'A'){
      MAPA.cancelEvent(__ev);
      return true;
    }
    __setFrameSource(__dsFertilizantes[this.rowIndex - 1]);
  }

  function __openChecked(){ 
    __setFrameSource(_$Fabricante.Checked_fer[0].fertilizante);
  }
  // =====================================================================================
  // Nuevas solicitudes de modificación o renovación
  // =====================================================================================
  function __addSolicitud(){
    var __modo = (this == __btnAddModificacion) ? 'M' : 'R';
    var __fertilizante = _$Fabricante.Checked_fer[0].fertilizante;
    _manager.setState('View', { target : __fertilizante,
                                url    : 'Viewer.aspx?reference={0}{_id}'.format(__modo, __fertilizante)});
  }
  
  function __setFrameSource(fertilizante){
    _manager.setState('View', { target : fertilizante, 
                                url    : 'Viewer.aspx?id_f={_id}'.format(fertilizante)});
  }

  function __updateStatus(){
    __statusContainer.innerHTML = _$Fabricante.Checked_fer.length ? '<div>{0} productos registrados. {1} seleccionados</div>'.format(__dsFertilizantes.length,
                                                                                                                             _$Fabricante.Checked_fer.length) 
                                                                  : '<div>{0} productos registrados'.format(__dsFertilizantes.length);
  }

  function __filterData(){
    var __idEstado = this.value || '';
    if(__idEstado){
      __idEstado        = __idEstado.replace('R', '');
      __dsFertilizantes = _$Fabricante.Fertilizantes.Where({ _estado : __idEstado });
    }else{
      __dsFertilizantes = _$Fabricante.Fertilizantes;
    }
    __initTable();
  }
  
  function __initTable(){
    function __resolve_nombre_comercial(f){
      if(f._nombresComerciales.length){
        var __last = f._nombresComerciales.lastItem();
        return '{0}<div class="fer-info"><b>M</b> {1}</div>'.format(__last.d, __last.f.fixDate());  
      }
      return f._denominacion;
    }
    __container.innerHTML = '{0}<tbody>{1}{2}</tbody></table>'.format(
                            __header, 
                            __row_header, 
                            __dsFertilizantes.reduce(function(s, f){
                              return s += __row_template.format(f._codigo,
                                                                f._expediente,
                                                                __resolve_nombre_comercial(f),
                                                                f._tipoDeFertilizante,
                                                                f._fechaDeInscripcion,
                                                                f._fechaDeRenovacion,
                                                                f._fechaDeCaducidad,
                                                                f._literalEstado ? '<div class="estado {0}">{0}</div>'.format(f._literalEstado) : '', 
                                                                f._id);                                                
                            }, ''));
    $('.check', __container).forEach( function(e){ e.onclick = __onCheck; });
    $('.row_edit', __container).forEach( function(e){ e.onclick = __onRowClick; });    
    __btnOpen.disabled            = true;
    __btnAddModificacion.disabled = true;
    __btnAddRenovacion.disabled   = true;
    _$Fabricante.Checked_fer = [];
    __updateStatus();
    MAPA.Fertilizantes.onListloaded.Dispatch('Loaded');
  }
  // ======================================================================================
  // Obtener los fertilizantes del fabricante
  // ======================================================================================
  function __loadData(sender){
    if(_$Fabricante.fertilizantes_loaded) return;
    __container.innerHTML = '{0}<tbody>{1}</tbody></table>'.format(__header, __row_header);
    __container.style.backgroundImage = 'url(../img/bg-wait.gif)';  
    setTimeout( function(){      
      var params = 'accion=getitems&Id={0}'.format(_$Fabricante._id);                      
      $Ajax.Post("../JSon/Fertilizante.ashx", params, function(o){                                                              
        __container.style.backgroundImage = '';
        var respuesta = MAPA.tryParse(o); 
        if (respuesta.Resultado != 'OK'){
          __container.innerHTML = respuesta.Mensaje;                          
        }else{             
          __handleResponse(respuesta);
        } 
      });
      }, 200);
    _$Fabricante.fertilizantes_loaded = true;
  }
  
  // ======================================================================================
  // Asociar a cada fertilizante los datos de su solicitud
  // ======================================================================================
  function __handleResponse(response){
    _$Fabricante.Expedientes_F = MAPA.toDictionary(response.Expedientes, 'id');
    _$Fabricante.MapInfo       = MAPA.toDictionary(response.Data, 'id');
    _$Fabricante.Fertilizantes = 
    __dsFertilizantes          = response.Fertilizantes                                          
                                         .SortBy('_codigo') 
                                         .map( function(f){                                          
                                           f._literalEstado      = __estados[f._estado || 'R'];
                                           f.mapInfo             = _$Fabricante.MapInfo[f._id];
                                           f._fechaDeInscripcion = f._fechaDeInscripcion.fixDate(),
                                           f._fechaDeRenovacion  = f._fechaDeRenovacion.fixDate(),                                           
                                           f._fechaDeCaducidad   = f.mapInfo.fechaDeCaducidad;
                                           f._denominacion       = f.mapInfo.solicitud._denominacion;
                                           f._nombresComerciales = response.Nombres.Where({idSol : f._idSolicitud});
                                           f._tipoDeFertilizante = '{_codigo} - {_descripcion}'.format(_tiposDeFertilizantes[f.mapInfo.solicitud._idAbono]);
                                           f._expediente         = _$Fabricante.Expedientes_F[f._idSolicitud].expediente;
                                           return f;
                                         });
    _$Fabricante.fertilizantes_loaded = true;
    __initTable();    
  }

  // ======================================================================================
  // Cambio de los datos del fertilizantes en Viewer.aspx
  // data -> datos de la solicitud
  // ======================================================================================
  function __onUpdateItem(cmd, data){

    function __getTargetRowData(){
      var __target    = __dsFertilizantes.Where({ _id : data.ProductoRegistrado._id})[0];
      var __rowIndex  = __dsFertilizantes.indexOf(__target);       
      var __cells     = $('.row_edit', __container)[__rowIndex].cells;
      return { fertilizante : __target,
               cells        : __cells };
    }
    
    function __setEstado(estado){
      return function(item){
        item.fertilizante._estado        = cmd.data[0];
        item.fertilizante._literalEstado = __estados[cmd.data[0] || 'R'];
        item.cells[8].textContent        = __estados[cmd.data[0] || 'R']; 
        return item;
      }( __getTargetRowData());
    }

    ({ 
      Inscribir : function(){        
        if(data._tipo == 'I'){          
          _$Fabricante.Fertilizantes
                      .push(function(f){
            f._literalEstado      = __estados[f._estado || 'R'];            
            f._fechaDeInscripcion = f._fechaDeInscripcion.fixDate(),
            f._fechaDeRenovacion  = '',                                           
            f._fechaDeCaducidad   = f._fechaDeCaducidad;
            f._denominacion       = data._denominacion;
            f._nombresComerciales = [];
            f._tipoDeFertilizante = '{_codigo} - {_descripcion}'.format(_tiposDeFertilizantes[data._idAbono]);
            f._expediente         = data._expediente;
            return f;                       
          }(data.ProductoRegistrado));
          __initTable();
          __updateStatus();
         return;   
        } 
        (function(fertilizante){
          // =================================================================================
          // Quitar el fertilizante si hay cambio de titular
          // =================================================================================
          if(_$Fabricante._id != data._idFabricante){
            var __row = $('#row_f_{_id}'.format(fertilizante), __container)[0];
            if(__row) __row.parentNode.removeChild(__row);       // Quitar la fila de la tabla                
            _$Fabricante.Fertilizantes.remove(fertilizante);     // Quitar del array
            if(__dsFertilizantes != _$Fabricante.Fertilizantes){ // Quitar de los filtrados
              __dsFertilizantes.remove(fertilizante);  
            }
            __sync_checked();
            __updateStatus();
            return;
          }
          // =================================================================================
          // Actualizar los nuevos datos del fertilizante
          // =================================================================================
          var __cells = $('#row_f_{_id} td'.format(fertilizante), __container);
          fertilizante._literalEstado      = __estados['R'];
          fertilizante._codigo             = data.ProductoRegistrado._codigo;
          fertilizante._fechaDeCaducidad   = data.ProductoRegistrado._fechaDeCaducidad;
          fertilizante._fechaDeInscripcion = data.ProductoRegistrado._fechaDeInscripcion;
          fertilizante._fechaDeRenovacion  = data.ProductoRegistrado._fechaDeRenovacion;          
          __cells[1].textContent = fertilizante._codigo;
          __cells[5].textContent = fertilizante._fechaDeInscripcion;
          __cells[6].textContent = fertilizante._fechaDeRenovacion;
          __cells[7].textContent = fertilizante._fechaDeCaducidad
          __cells[8].textContent = fertilizante._literalEstado;
        }(_$Fabricante.Fertilizantes
                      .Where({ _id : data.ProductoRegistrado._id})[0]));        
      
      },
      SaveFertilizante : function(){
        (function(item){
          var __f = JSON.parse(cmd.data[3]);
          item.fertilizante._codigo             = cmd.data[1];
          item.fertilizante._fechaDeCaducidad   = cmd.data[2];
          item.fertilizante._fechaDeInscripcion = __f._fechaDeInscripcion.fixDate();
          item.fertilizante._fechaDeRenovacion  = __f._fechaDeRenovacion.fixDate();        
          item.cells[1].textContent = item.fertilizante._codigo;
          item.cells[5].textContent = item.fertilizante._fechaDeInscripcion;
          item.cells[6].textContent = item.fertilizante._fechaDeRenovacion;
          item.cells[7].textContent = item.fertilizante._fechaDeCaducidad
        }(__setEstado()));        
      },
      HabilitarFertilizante    : function(){ __setEstado(); },
      DeshabilitarFertilizante : function(){ __setEstado(); },
      ProrrogarFertilizante    : function(){ __setEstado(); }
    })[cmd.name]();
  }

  // ==========================================================================================================
  // Cambio de titularidad del producto fertilizante
  // ==========================================================================================================
  __commands.CambioDeTitularidad = function(cmd){
    if(_$Fabricante.Checked_fer.length != 1) return;    
    (function(target){
      __ShowConfirmDialog('',
            function(dlg){ MAPA.Layer.Hide(); }, 
            {Height : 175, Width : 320, Title : '{_CONST.AppName}'.format(), 
                BeforeConfirm : function(dlg){
                  (function(){                                
                    var __txt = dlg.Body.querySelector('#txtNif');                                
                    if(!__txt.value){
                      return setTimeout(function(){ __txt.focus(); },100);
                    }
                    $Ajax.Post(__url_fertilizante, 
                               ('accion=cambio.titular&' + 
                                'id={0}&' + 
                                'nif={1}').format(target.fertilizante._id, 
                                                  __txt.value), function(o){            
                      var __response = MAPA.tryParse(o);
                      if (__response.Resultado && __response.Resultado != 'OK'){              
                        return MAPA.Layer.ShowError(__response.Mensaje)
                      }                                                      
                      target.row.parentNode.removeChild(target.row);         // Quitar la fila de la tabla           
                      _$Fabricante.Fertilizantes.remove(target.fertilizante);// Quitar del array
                      if(__dsFertilizantes != _$Fabricante.Fertilizantes){
                        __dsFertilizantes.remove(target.fertilizante);       // Quitar de los filtradas
                      }                                                    
                      _$Fabricante.Checked_fer = [];
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
              dlg.Body.innerHTML     = '<h4>Cambio de titularidad</h4>' +
                                        '<p>' + 
                                        'Introduzca el nif del nuevo titular del producto fertilizante ' + 
                                        'y pulse el botón aceptar.' +
                                        '</p>' +
                                        '<div class="fc" style="width:11em;">' +
                                        '<label class="fcap" for="txtNif">Nif del fabricante:</label>' + 
                                        '<input class="fc" type="text" id="txtNif" style="width: 100%">' +
                                        '</div>';
              dlg.Body.querySelector('#txtNif').focus();
            });
    }(_$Fabricante.Checked_fer[0]));
  }

  // ==========================================================================================================
  // Cambio del productor del producto fertilizante
  // ==========================================================================================================
  __commands.CambioDeProductor = function(cmd){
    if(_$Fabricante.Checked_fer.length != 1) return;    
    (function(item){
      __ShowConfirmDialog('',
            function(dlg){ MAPA.Layer.Hide(); }, 
            {Height : 175, Width : 320, Title : '{_CONST.AppName}'.format(), 
                BeforeConfirm : function(dlg){
                  (function(){                                
                    var __txt = dlg.Body.querySelector('#txtNif');                                
                    if(!__txt.value){
                      return setTimeout(function(){ __txt.focus(); },100);
                    }                    
                    $Ajax.Post(__url_fertilizante, 
                               ('accion=cambio.productor&' + 
                                'id={0}&' + 
                                'nif={1}').format(item.fertilizante._id, 
                                                  __txt.value), function(o){            
                      var __response = MAPA.tryParse(o);
                      if (__response.Resultado && __response.Resultado != 'OK'){              
                        return MAPA.Layer.ShowError(__response.Mensaje)
                      }                                                                            
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
              dlg.Body.innerHTML     = '<h4>Cambio de productor</h4>' +
                                        '<p>' +
                                        'Introduzca el nif del nuevo productor del producto fertilizante ' + 
                                        'y pulse el botón aceptar.' +
                                        '</p>' +
                                        '<div class="fc" style="width:11em;">' +
                                        '<label class="fcap" for="txtNif">Nif del productor:</label>' + 
                                        '<input class="fc" type="text" id="txtNif" style="width: 100%">' +
                                        '</div>';
              dlg.Body.querySelector('#txtNif').focus();
            });
    }(_$Fabricante.Checked_fer[0])); 
  }

  // ==========================================================================================================
  // Cambio del nombre comercial del producto fertilizante
  // ==========================================================================================================
  __commands.CambioDelNombreComercial = function(cmd){
    if(_$Fabricante.Checked_fer.length != 1) return;    
    (function(item){
      __ShowConfirmDialog('',
            function(dlg){ MAPA.Layer.Hide(); }, 
            {Height : 260, Width : 380, Title : '{_CONST.AppName}'.format(), 
                BeforeConfirm : function(dlg){
                  (function(){                                
                    var __txtNombre        = dlg.Body.querySelector('#txtNombre');
                    var __txtObservaciones = dlg.Body.querySelector('#txtObservaciones'); 
                    if(!__txtNombre.value){
                      return setTimeout(function(){ __txtNombre.focus(); },100);
                    }
                    $Ajax.Post(__url_fertilizante, 
                               ('accion=cambio.nombre&id={0}&' + 
                                'nombre={1}&' + 
                                'observaciones={2}').format(item.fertilizante._id, 
                                                            __txtNombre.value, 
                                                            __txtObservaciones.value), function(o){            
                      var __response = MAPA.tryParse(o);
                      if (__response.Resultado && __response.Resultado != 'OK'){              
                        return MAPA.Layer.ShowError(__response.Mensaje)
                      } 
                      // =============================================================================
                      // Añadir el nombre comercial al fertiilizante
                      // Actualizar la fila correspondiente de la lista
                      // =============================================================================
                      (function(data){
                        item.fertilizante._nombresComerciales.push(data)
                        item.row.cells[3].innerHTML = '{0}<div class="fer-info"><b>M</b> {1}</div>'
                                                      .format(data.d, data.f.fixDate());
                      }({ d     : __txtNombre.value, 
                          f     : __response.Data[1], 
                          id    : ~~__response.Data[0],
                          idSol : item.fertilizante._idSolicitud, 
                          o     : __txtObservaciones.value }));                     
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
              dlg.Body.innerHTML     = '<h4>Cambio del nombre comercial</h4>' +
                                        '<p>' +
                                        'Introduzca el nuevo valor para el nombre comercial del producto fertilizante ' + 
                                        'y pulse el botón aceptar.' +
                                        '</p>' +
                                        '<div class="fc" style="width:100%;">' +
                                        '<label class="fcap" for="txtNombre">Nombre comercial:</label>' + 
                                        '<input class="fc" type="text" id="txtNombre" style="width: 100%">' +
                                        '</div>'+
                                        '<div class="fc" style="width:100%;">' +
                                        '<label class="fcap" for="txtObservaciones">Observaciones:</label>' + 
                                        '<textarea class="fc" rows="6" id="txtObservaciones" style="width: 100%"></textarea>' +
                                        '</div>';
              dlg.Body.querySelector('#txtNombre').focus();
            });
    }(_$Fabricante.Checked_fer[0])); 
  }

  MAPA.Fertilizantes.onListloaded   = MAPA.core.Event('onListLoaded');
  MAPA.Fertilizantes.onExpand       = __initModule;
  MAPA.Fertilizantes.onUpdateItem   = __onUpdateItem;
  MAPA.Fertilizantes.ExecuteCommand = function(cmd){if(cmd && __commands[cmd.name||cmd]) return __commands[cmd.name||cmd](cmd); };

})();

