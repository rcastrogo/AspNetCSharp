/// <reference path="../MAPA.js" />
(function(){

  var __url = '../../JSon/RegistroElectronico/Registro.ashx';
  var __dlg = $('dlg-fabricante');
  function __unlink(sender, callback){
    (function(dlg){
      dlg.RemoveOnclose = true;
      MAPA._KeyEvents.DisableEvents().EnableDialogEvents(dlg, { '27' : dlg.BtnNo.onclick, 
                                                                '13' : MAPA.emptyFn });
    }(MAPA.Layer.ShowConfirm({ Title         : _CONST.AppName,
                               Height        : 140,
                               Width         : 430,
                               OnCancel      : MAPA.Layer.Hide,
                               Message       : '¿Está seguro de quitar el vínculo existente entre el ' + 
                                               'registro electrónico y los datos de la solicitud?',                                                                  
                               OnConfirm     : function(dlg){
                                 var params = 'accion=unlink&id={_id}'.format(sender);                      
                                 $Ajax.Post(__url, params, function(o){                                                                                                    
                                   var respuesta = MAPA.tryParse(o); 
                                   if (respuesta.Resultado != 'OK'){
                                     MAPA.Layer.ShowError(respuesta.Mensaje, MAPA.Layer.Hide);
                                     return;
                                   }
                                   MAPA.Layer.Hide();
                                   callback();
                                 });                                                                                                         
                               }}))); 
  }

  function __link(sender, data, callback){

    var __infoSolicitante = data;    
    var __fabricantes     = {};
    var __expedientes     = {};
    var __fertilizantes   = {};
    var __solicitudes     = {};

    function __initDictionaries(){
      __fabricantes   = MAPA.toDictionary(__infoSolicitante.Fabricantes   || [], '_id');
      __expedientes   = MAPA.toDictionary(__infoSolicitante.Expedientes   || [], 'id');
      __fertilizantes = MAPA.toDictionary(__infoSolicitante.Fertilizantes || [], '_id');
      __solicitudes   = MAPA.toDictionary(__infoSolicitante.Solicitudes   || [], '_id');
    }
    __initDictionaries();

    // ==============================================================================================
    // Grabación de un fabricante nuevo
    // ==============================================================================================
    function __initDlgFabricante(callback){

      function __validateData(){      
        MAPA.ThrowIfEmpty('txtNif', 'Falta el Nif del fabricante.');
        MAPA.ThrowIfEmpty('txtNombre', 'Falta el nombre o razón social del fabricante.');
        MAPA.ThrowIfEmpty('txtIdTipo', 'Falta el tipo del fabricante.');
        MAPA.ThrowIfEmpty('txtIdProvincia', 'Falta la provincia del fabricante.');      
      }  
      $('input[type=text], select', __dlg).forEach( function(e){ e.value = ''; });
      __dlg.querySelector('#txtNif').value     = sender._sol_nif;
      __dlg.querySelector('#txtNombre').value  = sender._sol_nombre;    
      __dlg.querySelector('#btn-save').onclick = function(){
        try      { __validateData(); }
        catch(er){ return MAPA.Layer.ShowError(er.message); }
        __dlg.style.opacity = '.4';
        setTimeout(function(){
          $Ajax.Post('../../JSon/Fabricante.ashx', 
                     'accion=new&{0}'.format($Ajax.Serialize(__dlg)), function(o){                                                  
            __dlg.style.opacity = '1';
            (function(response){
              if (response.Resultado != 'OK'){ 
                return MAPA.Layer.ShowError(response.Mensaje);
              }
              callback(response.Fabricante);            
            })(MAPA.tryParse(o));        
          });         
        }, 500) 
      }
    }    

    // ===========================================================================================
    // Cargar de los fertilizantes
    // ===========================================================================================          
    function __load_s(data){
      var __solicitudes = data.Solicitudes
                              .Where(function(s){ return s._estado == 'T'; })
                              .map( function(s){
                                s._codigo        = s._tipo == 'I' 
                                                    ? '' 
                                                    : __fertilizantes[s._idFertilizante]._codigo;
                                s._producto      = _tiposDeFertilizantes[s._idAbono];
                                s._literalTipo   = _tiposDeSolicitud[s._tipo];
                                s._expediente    = __expedientes[s._id].expediente;
                                return s;
                              })
                              .SortBy('_tipo,_codigo');
      if(__solicitudes.length){
        var __template  = $('template-s').innerHTML;
        return '<h3 style="margin:0 0 3px 0">Solicitudes en trámite</h3>' +                          
              __solicitudes.reduce(function(html, s){                 
                return html += __template.format(s);
              },'');
      }
      return '';
    }

    // ===========================================================================================
    // Cargar las solicitudes en trámite
    // ===========================================================================================
    function __load_f(data){
      if(data.Fertilizantes.length){
        var __template = $('template-f').innerHTML;
        return '<h3 style="margin:0 0 3px 0">Productos registrados</h3>' +
              data.Fertilizantes
                  .SortBy('_codigo')
                  .reduce(function(html, f){                
                    f._solicitud   = __solicitudes[f._idSolicitud];
                    f._expediente  = __expedientes[f._idSolicitud].expediente;
                    f._producto    = _tiposDeFertilizantes[f._solicitud._idAbono];
                    f._literalTipo = _tiposDeSolicitud[f._solicitud._tipo];
                    return html += __template.format(f); 
                  },'');                                
      }
      return '';
    }


    function __addEventHandlers(dlg){ 
          
      function __linkToId(idSolicitud){
        var params = 'accion=link&id={0}&idsolicitud={1}'.format(sender._id, idSolicitud);             
        $Ajax.Post(__url, params, function(o){                                                                                                    
          var respuesta = MAPA.tryParse(o); 
          if (respuesta.Resultado != 'OK'){
            MAPA.Layer.ShowError(respuesta.Mensaje);
            return;
          }
          MAPA.Layer.Hide();
          callback(idSolicitud);
        });          
      }

      dlg.Body.onclick = function(ev){
        var __target = ev.target;
        // ===============================================================================================================
        // Vinculación directa a una solicitud
        // ===============================================================================================================
        if(__target.className == 'js-link' || __target.className == 'js-link-sol'){
          var __idSolicitud = __target.className == 'js-link' ? dlg.Body.querySelector('#txtLinkId').value 
                                                              : __target.parentNode.id.split('#')[1]; 
          if(__idSolicitud){
            __linkToId(__idSolicitud);                              
          }else{
            setTimeout( function(){ dlg.Body.querySelector('#txtLinkId').focus(); }, 150);
          }
          return;
        }
        // ===============================================================================================================
        // Vinculación a la solicitud actual de un fertilizante
        // ===============================================================================================================
        if(__target.className == 'js-link-fer') return __linkToId(__target.parentNode.id.split('#')[1]);              
        // ===============================================================================================================
        // Creación de solicitudes
        // ===============================================================================================================
        if(__target.className == 'js-new-sol' || __target.className == 'js-link-M'  || __target.className == 'js-link-R'){                   
          MAPA.Layer.Hide();             
          (function(mode, idFertilizante){                       
            var __src          = '../Viewer.aspx?reference={0}{1}&link={2}';
            var __idRegistro   = _$Registro._id;
            var __idFabricante = __infoSolicitante.Fabricante._id;
            if(mode == 'sol'){
              _manager.setState('Link', { src : __src.format('I', __idFabricante, __idRegistro) });        
            }else{
              _manager.setState('Link', { src : __src.format(mode, idFertilizante, __idRegistro) });          
            }                                
            MAPA.Solicitudes.onUpdateItem = function(o, target){
              if(o.name == 'Insert'){
                callback(o.Solicitud._id);
                MAPA.Solicitudes.onUpdateItem = MAPA.emptyFn;                  
              }            
            };
          }(__target.className.split('-')[2],       // Modo: sol, M, R
            __target.parentNode.id.split('#')[2])); // IdFertilizante             
        }            
      }     
        
    }

    (function(dlg){
      dlg.Body.style           = 'padding:10px;';
      dlg.BtnNo.value          = 'Cancelar';
      dlg.BtnYes.style.display = 'none'; 
      dlg.BtnNo.style.width    = '7em';
      
      // ============================================================================================
      // Nueva solicitud de inscripción
      // ============================================================================================
      var NEW_SOL ='<h3 style="margin:0 0 3px 0">Nueva solicitud de inscripción</h3>' + 
                    '<div class="item clearFix" style="text-align:center">' +
                    '<input type="button"' + 
                    ' value="Crear solicitud"' + 
                    ' style="font-size:10px;width:100%"' + 
                    ' class="js-new-sol"' +
                    '/>' +
                    '</div>';

      function __init(){
        var __container = dlg.Body.querySelector('#f-container');
        // ==========================================================================================================================================
        // No hay fabricante relacionado con el solicitante
        // ==========================================================================================================================================
        if(!__infoSolicitante.Fabricante && 
           !__infoSolicitante.Fabricantes){
          
          var __h3 = $.$('h3', { innerHTML : 'Nuevo fabricante', 
                                 style     : { margin : '0 0 3px 0'} });
          __container.parentNode.insertBefore(__h3, __container);          
          __container.appendChild(__dlg);
          __initDlgFabricante(function(fabricante){
            __infoSolicitante.Fabricante    = fabricante;
            __infoSolicitante.Solicitudes   = [];
            __infoSolicitante.Fertilizantes = [];
            __container.parentNode.removeChild(__h3);
            __init();
          });
          return;
        }        
        // ==========================================================================================================================================
        // Un solo fabricante relacionado con el solicitante
        // ==========================================================================================================================================
        if(__infoSolicitante.Fabricante){
          __container.innerHTML = '<div id="fabricante-container">{_nif} {_nombre}</div>'.format(__infoSolicitante.Fabricante) +
                                  NEW_SOL +
                                  __load_s(__infoSolicitante) +
                                  __load_f(__infoSolicitante);
          __addEventHandlers(dlg);
          return;
        }
        // ==========================================================================================================================================
        // Más de un fabricante relacionado con el solicitante
        // ==========================================================================================================================================
        if(__infoSolicitante.Fabricantes){
          __container.innerHTML = '<div id="fabricante-container">' + 
                                  '<label for="jj5" style="width:100%;font-size:10px;margin-bottom:4px;display:inline-block">Fabricante: </label>' + 
                                  '<select id="jj5" style="width:100%;font-size:10px; padding:4px;">' + 
                                    __infoSolicitante.Fabricantes
                                                     .reduce( function(html, f){
                                                       html += '<option value="{_id}">{_nif} {_nombre}</option>'.format(f);
                                                       return html;
                                                     }, '') +  
                                  '</select>' +
                                  '<div class="progress-bar"></div>' +
                                  '</div><div id="f-wrapper"></div>';
          var __combo   = __container.querySelector('select');
          var __wrapper = __container.querySelector('#f-wrapper');
          // ======================================================================
          // Obtener los datos del fabricante seleccionado
          // ======================================================================
          __combo.onchange = function(){
            var __work_in_progress = true;
            __infoSolicitante.Fabricante = __fabricantes[this.value];
            __wrapper.innerHTML = '';
            // ====================================================================
            // Indicador de progreso
            // ====================================================================
            (function(){
              var __bar   = __container.querySelector('.progress-bar');
              var __value = 0;
              function __step(){
                __value += 10;
                __bar.style.width = '{0}%'.format(__value % 100);
                if(__work_in_progress){
                  setTimeout( __step, 100);
                  return;
                }
                __bar.style.width = '0';
              }
              __step();
            })();
            setTimeout( function(){
              $Ajax.Post(__url,
                         ('accion=info' + 
                          '&id={_id}' + 
                          '&mode=fabricante').format(__infoSolicitante.Fabricante),
                         function(o){
                (function(response){    
                  if (response.Resultado == 'OK'){
                    __infoSolicitante.Expedientes   = response.Expedientes;
                    __infoSolicitante.Fertilizantes = response.Fertilizantes;
                    __infoSolicitante.Solicitudes   = response.Solicitudes;
                    __initDictionaries();
                    __wrapper.innerHTML = NEW_SOL +
                                          __load_s(__infoSolicitante) +
                                          __load_f(__infoSolicitante);
                    __addEventHandlers(dlg);                  
                  }
                }(MAPA.tryParse(o)));
                __work_in_progress = false;           
              });                        
            }, 300);
          }
          __combo.onchange();
          return;
        }            
      }

      dlg.Body.innerHTML = '<h3 style="margin:0 0 3px 0">Vinculación de registro electrónico</h3>' + 
                           '<p>Seleccione el método que va a utilizar para vincular el registro electrónico ' +
                            'a una solicitud o ficha de características en la que introducir la información del producto ' +
                            'fertilizante.' +
                            '</p>' + 
                            '<div style="padding:10px;overflow:auto;border-top:solid 1px silver;top:7.5em;bottom:0;left:4px;right:4px;position:absolute">' +
                            // ============================================================================================
                            // Vinculación directa a una solicitud ya creada
                            // ============================================================================================
                            '<h3 style="margin:0 0 3px 0">Vinculación directa</h3>' +                               
                            '<div class="item clearFix" style="" >' + 
                            '<label for="txtLinkId">Identificador de la solicitud: <label>' + 
                            '<input id="txtLinkId" type="text" class="center" style="width:8em;font-size:10px"/>' +
                            '<input type="button" value="Vincular" style="float:right; font-size:10px" class="js-link"/>' +
                            '</div>' + 
                            '<div style="height:1px;width:100%;margin-bottom:10px;"></div>' +
                            '<div id="f-container" class="item clearFix"></div>';
      __init();          
      dlg.RemoveOnclose = true;
      MAPA._KeyEvents.DisableEvents().EnableDialogEvents(dlg, { '27' : dlg.BtnNo.onclick });                   
    }(MAPA.Layer.ShowConfirm({ Title         : _CONST.AppName,
                               Height        : 480,
                               Width         : 450,
                               OnCancel      : MAPA.Layer.Hide,
                               OnTerminate   : function(dlg){
                                 if(__infoSolicitante.Fabricantes){
                                   __infoSolicitante.Fabricante = '';
                                 }
                               }})));
  }  

  MAPA.RegistroElectronico = { Link   : __link,
                               Unlink : __unlink };
  
  
})();

