/// <reference path="../MAPA.js" />
(function(){
  var MAPALayer         = (window.parent != window) ? window.parent.MAPA.Layer : MAPA.Layer ;
  var __template        = '';
  var __dsSolicitudes   = '';  
  var __container       = ''; 
  var __statusContainer = '';
  var __cmbTipo         = '';
  var __cmbEstado       = '';
  var __btnExpand       = '';
  var __btnReassign     = '';
  var __btnCommit       = '';
  var __btnOpen         = '';
  var __btnAdd          = '';
  var __btnDelete       = '';
  var __tipos           = { I : "Inscripción",
                            M : "Modificación",
                            R : "Renovación" };
  var __url             = '../JSon/RegistroElectronico/Registro.ashx';
  var __url_solicitud   = '../JSon/Solicitud.ashx';

  var __commands        = {};
  
  function __initModule(sender){
    __container       = $('.SolicitudesContainer', sender.Body)[0];
    __statusContainer = $('.statusContainer', sender.Body)[0]; 
    __btnExpand   = $('.toolsContainer .expandBtn', sender.Body)[0];
    __btnOpen     = $('.toolsContainer .openBtn', sender.Body)[0];
    __btnAdd      = $('.toolsContainer .addBtn', sender.Body)[0];
    __btnDelete   = $('.toolsContainer .deleteBtn', sender.Body)[0];
    __btnReassign = $('.toolsContainer .reassignBtn', sender.Body)[0];
    __btnCommit = $('.toolsContainer .commitBtn', sender.Body)[0];

    __cmbTipo   = $('cmbTipoSol');
    __cmbEstado = $('cmbEstadoSol');
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

    __btnOpen.onclick     = __openChecked;   // Abrir solicitud
    __btnAdd.onclick      = __addSolicitud;  // Añadir solicitud
    __btnDelete.onclick   = __deleteChecked; // borrar solicitud
    __btnReassign.onclick = __reassign;      // Reasignar solicitud
    __btnCommit.onclick   = __commit;        // Reasignar solicitud
    // ===========================================================
    // Filtro de datos
    // ===========================================================
    __cmbTipo.onchange   =
    __cmbEstado.onchange = __filterData;
    MAPA.Solicitudes.onUpdateItem = __onUpdateItem;
    MAPA.Solicitudes.onExpand     = __loadData;
    MAPA.Solicitudes.onExpand(sender);    
  }  

  // =======================================================================================================
  // Inicialización de la tabla de Solicitudes
  // =======================================================================================================
  var __header     = '<table id="tabla-solicitudes" class="silverTable">';
  var __row_header = '<tr class="theader">' + 
                     '  <td></td>' +
                     '  <td>Identificador</td>' + 
                     '  <td>Expediente</td>' +
                     '  <td>Fertilizante</td>' + 
                     '  <td>Nombre comercial</td>' + 
                     '  <td>Tipo de fertilizante</td>' + 
                     '  <td>Fecha de solicitud</td>' + 
                     '  <td>Fecha de registro</td>' +
                     '  <td>Tipo</td>' +
                     '  <td>Estado</td>' +
                     '</tr>';
  var __row_template = '<tr class="row_edit" id="row_{0}">' + 
                       '  <td class="left" style="width:1%"><input type=checkbox class="check"/></td>' +
                       '  <td class="center" style="width:3em">{0}</td>' + 
                       '  <td class="center" style="min-width:4em">{1}</td>' +
                       '  <td class="center" style="min-width:10em">{2}</td>' + 
                       '  <td class="left" style="width:20%">{3}</td>' + 
                       '  <td class="left" style="width:30%">{4}</td>' + 
                       '  <td class="center">{5}</td>' + 
                       '  <td class="center">{6}</td>' +
                       '  <td class="center">{7}</td>' +
                       '  <td class="center">{8}</td>' +
                       '</tr>';

  function __sync_checked(){
    function __reducefn(array, e, i){
        if(e.checked) array.push({ solicitud : __dsSolicitudes[i],
                                   row       : e.parentNode.parentNode }); 
        return array;
    }
    _$Fabricante.Checked_sol = $('.check', __container).reduce(__reducefn, []); 
  }

  function __onCheck(){
    __sync_checked();    
    this.parentNode.style.backgroundColor = this.checked ? 'lightgrey' : '';
    __btnReassign.disabled = true;
    __btnCommit.disabled   = true;
    __btnOpen.disabled     = true;
    __btnDelete.disabled   = true;
    if(_$Fabricante.Checked_sol.length == 1){
      __btnReassign.disabled = false;
      __btnCommit.disabled   = false;
      __btnOpen.disabled     = false;
      __btnDelete.disabled   = false;
    }else if(_$Fabricante.Checked_sol.length > 1){            
      __btnDelete.disabled = false;
    }
    __updateStatus();
  }

  function __onRowClick(ev){
    var __ev = MAPA.MapaEvent(ev); 
    if(__ev.Target.tagName == 'INPUT' || __ev.Target.tagName == 'A'){
      MAPA.cancelEvent(__ev);
      return true;
    }
    __setFrameSource(__dsSolicitudes[this.rowIndex - 1]); 
  }

  function __openChecked(){ __setFrameSource(_$Fabricante.Checked_sol[0].solicitud); }
  // =======================================================================================================
  // Borrar solicitudes
  // =======================================================================================================
  function __deleteChecked(){      
    __ShowConfirmDialog('<h4>Eliminar solicitudes</h4>' +
                        '¿Está seguro de eliminar permanentemente las solicitudes seleccionadas?',
                        function(){                          
                          var __ids = _$Fabricante.Checked_sol.Select('solicitud').Select('_id').join('-'); 
                          MAPALayer.ShowInfo('Espere un momento');
                          $Ajax.Post(__url_solicitud, 'accion=delete&ids={0}'.format(__ids), function(o){
                            MAPALayer.Hide();
                            var __response = MAPA.tryParse(o);
                            if (__response.Resultado && __response.Resultado != 'OK'){              
                              return MAPALayer.ShowError(__response.Mensaje, MAPALayer.Hide)
                            }                                
                            _$Fabricante.Checked_sol.forEach(function(o){ 
                              o.row.parentNode.removeChild(o.row);          // Quitar la fila de la tabla                   
                              _$Fabricante.Solicitudes.remove(o.solicitud); // Quitar del array
                              if(__dsSolicitudes != _$Fabricante.Solicitudes){
                                __dsSolicitudes.remove(o.solicitud); // Quitar de las filtradas
                              }                              
                            }); 
                            _$Fabricante.Checked_sol = [];
                            __updateStatus();
                          }); 
                        }, {Height : 155, Width: 420, Title : '{_CONST.AppName} - Solicitudes'.format()});
  }
  // =========================================================================
  // Nueva solicitud de inscripción
  // =========================================================================
  function __addSolicitud(){
    _manager.setState('View', { target : _$Fabricante,
                                url    : 'Viewer.aspx?reference=I{_id}'.format(_$Fabricante)});
  }
  // =========================================================================
  // Reasignar solicitud a otro fabricante
  // =========================================================================
  function __reassign(){
    if(MAPA.Solicitudes.DB){
      return MAPA.Solicitudes.DB.reasignar(_$Fabricante, __dsSolicitudes, MAPALayer, __updateStatus);
    }else{
      MAPA.Include('../js/app/solicitudes.db.js', function(){         
        MAPA.Solicitudes.DB.reasignar(_$Fabricante, __dsSolicitudes, MAPALayer, __updateStatus)
      });
    }
  }
  // =================================================================================================
  // Inscribir solicitud
  // =================================================================================================
  function __commit(){
    if(MAPA.Solicitudes.DB){
      return MAPA.Solicitudes.DB.inscribir(_$Fabricante, __dsSolicitudes, MAPALayer, __updateStatus);
    }else{
      MAPA.Include('../js/app/solicitudes.db.js', function(){         
        MAPA.Solicitudes.DB.inscribir(_$Fabricante, __dsSolicitudes, MAPALayer, __updateStatus)
      });
    }
  }

  function __setFrameSource(solicitud){
    _manager.setState('View', { target : solicitud, 
                                url    : 'Viewer.aspx?id_s={_id}'.format(solicitud)});
  }
  
  // ======================================================================================
  // Cambio de los datos de la solicitud en Viewer.aspx
  // data -> datos de la solicitud
  // ======================================================================================
  function __onUpdateItem(cmd, data){
    function __getTarget(){
      var __solicitud = __dsSolicitudes.Where({ _id : data._id})[0];
      var __rowIndex  = __dsSolicitudes.indexOf(__solicitud);
      if(__rowIndex > -1){
        var __cells     = $('.row_edit', __container)[__rowIndex].cells;
        return { sol : __solicitud, cells : __cells, row : __cells[0].parentNode };  
      }
      return { sol : __solicitud };
    }
    ({
      Inscribir : function(){                
        (function(o){
          if(o.row){
            // ===================================================================================
            // Quitar la solicitud de la lista
            // ===================================================================================
            o.row.parentNode.removeChild(o.row);             // Quitar la fila de la tabla
            _$Fabricante.Solicitudes.remove(o.sol);          // Quitar del array
            if(__dsSolicitudes != _$Fabricante.Solicitudes){ // Quitar de las filtradas
              __dsSolicitudes.remove(o.sol);            
            }
            // ===================================================================================
            // Sincronizar datos de solicitudes en trámite del mismo producto
            // ===================================================================================         
            var __rows = $('.row_edit', __container);
            _$Fabricante.Solicitudes.forEach(function(s){            
              if(s._idFertilizante == data.ProductoRegistrado._id){              
                s._codigo = data.ProductoRegistrado._codigo;
                var __row = __rows.Where({ id : 'row_{_id}'.format(s) })[0];
                if(__row) __row.cells[3].textContent = s._codigo;                
              }
            });
            __sync_checked();
            __updateStatus();
          }                   
        }(__getTarget()));                 
      },
      SaveFertilizante : function(){       
        if(__dsSolicitudes){  // Actualizar posibles solicitudes en trámite del fertilizante
          var __rows = $('.row_edit', __container);
          if(__rows.length){
            __dsSolicitudes.map( function(sol, i){
              if(sol._idFertilizante == data.ProductoRegistrado._id){
                sol._codigo = cmd.data[1];                           
                __rows[i].cells[3].textContent = cmd.data[1];                                                      
              }                                      
            });
          }        
        }       
      },
      Insert : function(){ 
        if(_$Fabricante.Solicitudes){
          _$Fabricante.Solicitudes.push( function(s){  
            s._expediente         = s._tipo == 'I' ? cmd.Expediente : data._expediente;           
            s._literalTipo        = __tipos[s._tipo];                                                                                 
            s._tipoDeFertilizante = '{_codigo} - {_descripcion}'.format(_tiposDeFertilizantes[s._idAbono]);
            s._codigo             = s._tipo == 'I' ? '' : data.ProductoRegistrado._codigo;
            s._state              = ''          
            s.ProductoRegistrado  = {};
            _$Fabricante.Expedientes[s._id] = { expediente: s._expediente, id: s._id};
            MAPA.Solicitudes.LastInsertId = s._id;
            return s;
          }(cmd.Solicitud));
          __filterData();         
        }       
      },
      Save : function(){
        if(__dsSolicitudes && data._estado != 'F'){ // __dsSolicitudes SOLO tiene solicitudes en tramite
          (function(o){
            o.sol._denominacion       = data._denominacion;
            o.sol._tipoDeFertilizante = '{_codigo} - {_descripcion}'.format(_tiposDeFertilizantes[data._idAbono]);
            o.sol._fechaDeRegistro    = data._fechaDeRegistro;
            o.sol._fechaEntrada       = data._fechaEntrada;
            o.cells[4].textContent    = o.sol._denominacion;
            o.cells[5].textContent    = o.sol._tipoDeFertilizante;
            o.cells[6].textContent    = o.sol._fechaDeRegistro;
            o.cells[7].textContent    = o.sol._fechaEntrada;
          }(__getTarget()));
        }
      },
      Estimar    : function(){
        if(__dsSolicitudes && data._estado != 'F'){ // __dsSolicitudes SOLO tiene solicitudes en tramite
          (function(o){
            o.sol._fechaLimite       = 
            o.sol._state             = 
            o.cells[9].textContent   = '';
          }(__getTarget()));
        }
      },
      Desestimar : function(){ 
        if(__dsSolicitudes && data._estado != 'F'){ // __dsSolicitudes SOLO tiene solicitudes en tramite
          (function(o){
            o.sol._fechaLimite = '01/01/2000 00:00:00 000';
            o.sol._state       = 'D';
            o.cells[9].textContent   = 'Desestimada';
          }(__getTarget()));
        }
      },
      DoNothing  : function(){}
    })[cmd.name || 'DoNothing']();
  }
  // ===============================================================
  // Abrir una solicitud para mostrar sus datos
  // ===============================================================
  function __open(target){  
    
    var __boxes      = {};
    var __txt_backup = {};
    
    MAPA.Solicitudes.LastInsertId = 0;
    MAPA.Solicitudes.Mode         = function(){     
      if(target._ref_id) return 'solicitud';      
      if(target._id == target.ProductoRegistrado._idSolicitud) return 'producto';
      return 'solicitud';
    }();    
    
    function __formatValues(values){
      return values.map(function(v){ return v.toFloat(); })
                    .map(function(s){ return (+s).toFixed(3).replace('.', ','); })
                    .join(' - ');
    }
    // ===============================================================================================
    // Incializar la gestión de los datos de la Sede
    // ===============================================================================================   
    (function(){
      var __tables  = '';
      var __estados = '';

      function __addRoute(){
        if(!__estados) return;
        if(this.dataset.tipo == 'E') return __addEstado();
        if(this.dataset.tipo == 'S') return __addSubsanacion();
        if(this.dataset.tipo == 'N') return __addNotificacion();
      }

      function __addEstado(){
        (function ___onInitDlg(dlg){
          dlg.BtnYes.value       = 'Aceptar';
          dlg.BtnNo.value        = 'Cancelar';
          dlg.BtnNo.style.width  = '6em';
          dlg.BtnYes.style.width = '6em';
          dlg.Body.style.padding = '3px 10px';
          dlg.Body.className     = "W1-Body";
          dlg.Body.innerHTML     = '<h4>Cambio de estado</h4>' +
                                    '<p>Seleccione el nuevo estado de la solicitud y pulse el botón aceptar</p>' +
                                    '<div class="fc fcr" style="width:16em">' +
                                    '<label class="fcap" for="txtEstado">Estado</label>' +
                                    '<select id="txtEstado" style="width: 100%;padding:1px" >' +
                                    '</select>' +
                                    '</div>' +
                                    '<div class="fc" style="width:15em">' +
                                    '<label class="fcap" for="txtFecha">Fecha</label>' +
                                    '<input type="text" class="txtCalendar" id="txtFecha" style="width: 100%;" />' +
                                    '</div>' +
                                    '<div class="fc" style="calc(width:100% - 1px)">' +
                                    '<label class="fcap" for="txtObservaciones">Observaciones</label>' +
                                    '<input type="text" id="txtObservaciones" value="" style="width: 100%;" />' +
                                    '</div>';
          var __txt = dlg.Body.querySelector('#txtFecha');
          var __cmb = dlg.Body.querySelector('#txtEstado');
          MAPA.AppendOption(__cmb, '', '');
          MAPA.AppendOption(__cmb, Object.keys(__estados), '', '', function(k){return __estados[k].DescripcionEspecifico;});            
          MAPA.DateTextBox(__txt);
          __txt.setHour = function(txt){ return ' 00:00:00'; };

        }( __ShowConfirmDialog('', 
            function ___onConfirm(dlg){ },
            {Height : 210,
              Width  : 333,
              Title  : '{_CONST.AppName} - Solicitudes'.format(),
              BeforeConfirm : function(dlg){
              if(!dlg.Body.querySelector('#txtEstado').value) return true;             
              // =================================================================================
              // Realizar el cambio de estado
              // =================================================================================
              var __txt_estado = dlg.Body.querySelector('#txtEstado').value;
              var __txt_fecha  = dlg.Body.querySelector('#txtFecha').value;
              var __txt_obs    = dlg.Body.querySelector('#txtObservaciones').value;
              $Ajax.sendFormData(__url)
                    .add('accion', 'estados.add')
                    .add('id', target.tables.registro._id)
                    .add('estado', __txt_estado)
                    .add('fecha', __txt_fecha)
                    .add('observaciones', __txt_obs)
                    .send({onSuccess : function (XMLHttpRequest) {
                            dlg.Element.style.zIndex = '10000';
                            var __response = MAPA.tryParse(XMLHttpRequest.response);
                            if (__response.Resultado && __response.Resultado != 'OK'){
                              MAPALayer.ShowError(__response.Mensaje); return;
                            }
                            // =========================================================================
                            // Actualizar la lista de estados
                            // =========================================================================
                            __tables.estados
                                    .insertRow(1)
                                    .innerHTML = ('<td>{0}</td>' +
                                                  '<td class="left">{1}</td>' + 
                                                  '<td class="left">{2}</td>'
                                                  ).format(__txt_fecha,
                                                          __estados[__txt_estado].DescripcionEspecifico,
                                                          MAPA.SafeTags(__txt_obs));
                            // =========================================================================
                            // Estado (virtual) de la solicitud a desestimado
                            // =========================================================================
                            if(__txt_estado == '6'){
                              target._fechaLimite = '01/01/2000 00:00:00 000';
                            }
                            MAPALayer.Hide();
                          }, onError : function (XMLHttpRequest) {
                            dlg.Element.style.zIndex = '10000';
                            MAPALayer.ShowError('{status} - {statusText}'.format(XMLHttpRequest));
                          }, onStart : function(){ 
                            dlg.Element.style.zIndex = '9999';
                          }
                    }); 
              return true;
            }})));             
      }
        
      function __addSubsanacion(){
        (function ___onInitDlg(dlg){
          dlg.BtnYes.value       = 'Aceptar';
          dlg.BtnNo.value        = 'Cancelar';
          dlg.BtnNo.style.width  = '6em';
          dlg.BtnYes.style.width = '6em';
          dlg.Body.style.padding = '3px 10px';
          dlg.Body.className     = "W1-Body";
          dlg.Body.innerHTML     = '<h4>Petición de subsanación</h4>' +
                                    '<div class="fc fcr" style="width:10em">' +
                                    '<label class="fcap" for="txtApertura">Plazo de apertura<br/>(<i>Días hábiles</i>)</label>' +
                                    '<input type="text" id="txtApertura" value="10" style="width: 100%; text-align:center" />' +
                                    '</div>' +
                                    '<div class="fc" style="width:10em">' +
                                    '<label class="fcap" for="txtRespuesta">Plazo de respuesta<br/>(<i>Días hábiles</i>)</label>' +
                                    '<input type="text" id="txtRespuesta" value="14" style="width: 100%; text-align:center" />' +
                                    '</div>' +
                                    '<div class="fc" style="width:100%">' +
                                    '<label class="fcap" for="txtDoc">Documento</label>' +
                                    '<input type="file" id="txtDoc" style="width: 100%" />' +
                                    '</div>';          
        }( __ShowConfirmDialog('', 
            function ___onConfirm(dlg){ },
            {Height : 195,
              Width  : 380,
              Title  : '{_CONST.AppName} - Solicitudes'.format(),
              BeforeConfirm : function(dlg){
                if(!dlg.Body.querySelector('#txtDoc').value) return true; 
                if(!dlg.Body.querySelector('#txtApertura').value) return true; 
                if(!dlg.Body.querySelector('#txtRespuesta').value) return true;                                  
                // =================================================================================
                // Realizar la petición de subsanación
                // =================================================================================
                $Ajax.sendFormData(__url)
                     .add('accion', 'subsanacion.add')
                     .add('id', target.tables.registro._id)
                     .add('apertura', dlg.Body.querySelector('#txtApertura').value)
                     .add('respuesta', dlg.Body.querySelector('#txtRespuesta').value)
                     .add('file',
                          dlg.Body.querySelector('#txtDoc').files[0],
                          dlg.Body.querySelector('#txtDoc').files[0].name)
                     .send({onSuccess : function (XMLHttpRequest) {
                              dlg.Element.style.zIndex = '10000';
                              var __response = MAPA.tryParse(XMLHttpRequest.response);
                              if (__response.Resultado && __response.Resultado != 'OK') {
                                MAPALayer.ShowError(__response.Mensaje); return;
                              }
                              // ===================================================================
                              // Actualizar la tabla de subsanaciones
                              // =================================================================== 
                              __tables.subsanaciones
                                      .insertRow(1)
                                      .innerHTML = ('<td>{_idSubsanacionSEDE}</td>' +
                                                    '<td>{_fechaDeCreacion}</td>' + 
                                                    '<td>{_fechaDeSubsanacion}</td>' + 
                                                    '<td class="center">{_numberoDeRegistro}</td>' + 
                                                    '<td class="center">{_plazoDeApertura}</td>' + 
                                                    '<td class="center">{_plazoDeRespuesta}</td>' + 
                                                    '<td class="center">{_fechaDeApertura}</td>'
                                                    ).format(__response.Subsanacion);                              
                              MAPALayer.Hide();
                            }, onError : function (XMLHttpRequest) {
                              dlg.Element.style.zIndex = '10000';
                              MAPALayer.ShowError('{status} - {statusText}'.format(XMLHttpRequest));
                            }, onStart : function(){ 
                              dlg.Element.style.zIndex = '9999';
                            }
                     }); 
                return true;
            }}))); 
      }

      function __addNotificacion(){
        (function ___onInitDlg(dlg){
          dlg.BtnYes.value       = 'Aceptar';
          dlg.BtnNo.value        = 'Cancelar';
          dlg.BtnNo.style.width  = '6em';
          dlg.BtnYes.style.width = '6em';
          dlg.Body.style.padding = '3px 10px';
          dlg.Body.className     = "W1-Body";
          dlg.Body.innerHTML     = '<h4>Nueva notificación</h4>' +
                                    '<div class="fc fcr" style="width:10em">' +
                                    '<label class="fcap" for="txtApertura">Plazo de apertura<br/>(<i>Días hábiles</i>)</label>' +
                                    '<input type="text" id="txtApertura" value="10" style="width: 100%; text-align:center" />' +
                                    '</div>' +
                                    '<div class="fc" style="width:100%">' +
                                    '<label class="fcap" for="txtDoc">Documento</label>' +
                                    '<input type="file" id="txtDoc" style="width: 100%" />' +
                                    '</div>';          
          }( __ShowConfirmDialog('', 
            function ___onConfirm(dlg){ },
            {Height : 195,
              Width  : 380,
              Title  : '{_CONST.AppName} - Solicitudes'.format(),
              BeforeConfirm : function(dlg){
              if(!dlg.Body.querySelector('#txtDoc').value) return true; 
              if(!dlg.Body.querySelector('#txtApertura').value) return true;                                  
              // =================================================================================
              // Realizar la notificación
              // =================================================================================
              $Ajax.sendFormData(__url)
                    .add('accion', 'notificacion.sede.add')
                    .add('id', target.tables.registro._id)
                    .add('apertura', dlg.Body.querySelector('#txtApertura').value)
                    .add('file',
                        dlg.Body.querySelector('#txtDoc').files[0],
                        dlg.Body.querySelector('#txtDoc').files[0].name)
                    .send({onSuccess : function (XMLHttpRequest) {
                            dlg.Element.style.zIndex = '10000';
                            var __response = MAPA.tryParse(XMLHttpRequest.response);
                            if (__response.Resultado && __response.Resultado != 'OK') {
                              MAPALayer.ShowError(__response.Mensaje); return;
                            }
                            // ===================================================================
                            // Actualizar la tabla de notificaciones
                            // =================================================================== 
                            __tables.notificaciones
                                    .insertRow(1)
                                    .innerHTML = ('<td>{_idSubsanacionSEDE}</td>' +
                                                  '<td>{_fechaDeCreacion}</td>' + 
                                                  '<td>{_fechaDeSubsanacion}</td>' + 
                                                  '<td class="center">{_numberoDeRegistro}</td>' + 
                                                  '<td class="center">{_plazoDeApertura}</td>' + 
                                                  '<td class="center">{_plazoDeRespuesta}</td>' + 
                                                  '<td class="center">{_fechaDeApertura}</td>'
                                                  ).format(__response.Notificacion);                             
                            MAPALayer.Hide();
                          }, onError : function (XMLHttpRequest) {
                            dlg.Element.style.zIndex = '10000';
                            MAPALayer.ShowError('{status} - {statusText}'.format(XMLHttpRequest));
                          }, onStart : function(){ 
                            dlg.Element.style.zIndex = '9999';
                          }
                    }); 
              return true;
            }}))); 
      }        

      MAPA.Solicitudes.SedeLoader = function(solicitud){
        if(!__tables){
          __tables = { estados        : __template.querySelector('#fer-sede-table-estados'), 
                        subsanaciones  : __template.querySelector('#fer-sede-table-subsanaciones'),
                        notificaciones : __template.querySelector('#fer-sede-table-notificaciones')};
          // ==================================================================================
          // Botones para expandir lista
          // ==================================================================================
          (function __addEventHandlers(container){
            var __btn = $('.toolsContainer .expandBtn', container.parentNode)[0];
            __btn.onclick = function(){        
              if(container.style.maxHeight == 'none'){
                container.style.maxHeight = '10em';
                this.textContent = '🔽';
              }else{
                container.style.maxHeight = 'none';
                this.textContent = '🔼';
              }        
            }
            return __addEventHandlers;
          }(__tables.estados.parentNode)
            (__tables.subsanaciones.parentNode)
            (__tables.notificaciones.parentNode));
          // ==================================================================================
          // Botones para añadir elementos: Estados, Subsanaciones y Notificaciones
          // ==================================================================================
          $('#fer-sede .addBtn', __template).forEach( function(b){ 
            b.onclick = __addRoute;
          });
        }else{
          // =======================================================================================
          // Limpiar las tablas 
          // =======================================================================================
          while (__tables.estados.rows.length > 1)        __tables.estados.deleteRow(1);
          while (__tables.subsanaciones.rows.length > 1)  __tables.subsanaciones.deleteRow(1);
          while (__tables.notificaciones.rows.length > 1) __tables.notificaciones.deleteRow(1);        
        }
        if(!solicitud.tables.registro._id) return;
        // =======================================================================================================
        // Obtener los datos relativos al registro en la sede electrónica
        // =======================================================================================================
        $Ajax.Post(__url_solicitud, 'accion=sede.getdata&id={_id}'.format(solicitud.tables.registro), function(o){
          var respuesta = MAPA.tryParse(o);
          if (respuesta.Resultado != 'OK') { 
            MAPALayer.ShowError({ Message : respuesta.Mensaje, OnClose : MAPALayer.Hide});
            return;
          }
          // ========================================================================================
          // Tabla de estados
          // ========================================================================================
            __estados = MAPA.toDictionary(respuesta.Estados, 'CodigoEspecifico');
          respuesta.Historico.forEach( function(e){
            var __estado =  __estados[e.CodigoEspecifico];
            e.CodigoEspecifico = (__estado &&  __estado.DescripcionEspecifico) || e.CodigoEspecifico;
            MAPA.apply(__tables.estados.insertRow(-1),
                        { innerHTML : ('<td>{Fecha}</td>' +
                                      '<td class="left">{CodigoEspecifico}</td>' + 
                                      '<td class="left">{Observaciones}</td>').format(e)});
          });
          // ========================================================================================
          // Tablas de subsanaciones y notificaciones
          // ========================================================================================
          respuesta.Subsanaciones
                    .map( function(s){
                      s._fechaDeCreacion    = s._fechaDeCreacion.replace(/ 000$/,'');
                      s._fechaDeSubsanacion = s._fechaDeSubsanacion.replace(/ 000$/,'');
                      s._fechaDeApertura    = s._fechaDeApertura.replace(/ 00:00:00 000$/,'');
                      return s;
                    })
                    .SortBy('_id', true)
                    .forEach( function(s){
            var __table = s._tipo == 1 ? __tables.subsanaciones 
                                        : __tables.notificaciones;
            MAPA.apply(__table.insertRow(-1),
                        { innerHTML : ('<td>{_idSubsanacionSEDE}</td>' +
                                      '<td>{_fechaDeCreacion}</td>' + 
                                      '<td>{_fechaDeSubsanacion}</td>' + 
                                      '<td class="center">{_numberoDeRegistro}</td>' + 
                                      '<td class="center">{_plazoDeApertura}</td>' + 
                                      '<td class="center">{_plazoDeRespuesta}</td>' + 
                                      '<td class="center">{_fechaDeApertura}</td>').format(s)});  
                     
          });
        });
      }

      MAPA.pubsub.subscribe('/sede/reload', function(a, b){        
        __boxes.sede.Show();
        MAPA.Solicitudes.SedeLoader(target);   
      });              
      
    }());
    // ==========================================================
    // Incializar la gestión de materias primas
    // ==========================================================
    var __onBlurCodeTxt;
    (function(){

      var __table          = '';
      var __materias       = [];
      var __group_template = '<td colspan="3" style="text-align: left;padding: 3px;">{0}</td>';
      var __valor          = '<td style="width:30px"><input type="text" value="{2}" data-format="R3" /></td>';
      var __row_templates  = { 
        '51' : '<td><input type="text" class="txt51" value="{0}" /></td><td style="text-align: left;padding-left: 3px;">{1}</td>' + __valor,
        '52' : '<td colspan="2"><input style="width:calc(100% - 4px);text-align: left;" type="text" value="{1}" /></td>' + __valor,
        '53' : '<td><input type="text" class="txt53" value="{0}" /></td><td style="text-align: left;padding-left: 3px;">{1}</td>' + __valor,
        '54' : '<td colspan="2" style="text-align: left;padding-left: 3px;">{1}</td>' + __valor,
        '55' : '<td colspan="2"><input style="width:calc(100% - 4px);text-align: left;" type="text" value="{1}" /></td>' + __valor,
        '56' : '<td><input type="text" value="{0}" /></td><td><input style="width:calc(100% - 4px);text-align: left;" type="text" value="{1}" /></td>' + __valor
      }
      var __CODE_ERROR_MSG = '<span class="code-error">Código incorrecto</span>';

      function __appendRow(o){
        if(o.idAgrupacion){
          var __id           = o.idAgrupacion;
          var __row_template = __row_templates[__id];
          var __row_id       = 'row-mat-{0}'.format(__id);
          if(__id == 54){
            var __agua = _$fn.formatRange(__materias.Item('_idAgrupacion', 54, { _valor : '' })._valor);
            return __appendRow({ className : 'row', id : __row_id, innerHTML : __row_template.format('H2O', 'Agua', __agua)}); 
          }
          __materias.Where({ _idAgrupacion : __id })
                    .forEach( function(o){
                      __appendRow({ className : 'row', id : __row_id, 
                                    innerHTML : __row_template.format(o._codigo || '',
                                                                      o._descripcion,
                                                                      o._valor ? __formatValues(o._valor.split('-')) : '' )});  
          });
          __appendRow({ className : 'row', 
                        ref_id    : __id, 
                        innerHTML : ('<td colspan="3">' + 
                                     '<button class="row-button" title="Añadir una fila">+</button>' + 
                                     (/5[1235]/.test(__id) ? '<button id="btnList-{0}" title="Mostrar lista de valores" ' + 
                                                             'class="row-button">?</button>' : '') + 
                                     '</td>').format(__id)
                      });
          return __appendRow;
        }
        var __row = __table.insertRow(-1);
        if(o.id) __row.dataset.idAgrupacion = o.id; 
        if(o.ref_id) __row.dataset.refId    = o.ref_id;
        __row.innerHTML = o.innerHTML;
        __row.className = o.className;        
        return __appendRow;
      }

      function __insertRow(){
        var __row = this.parentNode.parentNode;
        var __id  = __row.dataset.refId;
        var __new = __table.insertRow(__row.rowIndex);
        __new.className            = 'row';
        __new.dataset.idAgrupacion = 'row-mat-{0}'.format(__id);; 
        __new.innerHTML            = __row_templates[__id].format('','','');
        setTimeout(function(){ __new.querySelector('input').focus(); }, 300);
      }
      
      function __showList(){
        var __button = this;
        var __refId  = __button.parentNode.parentNode.dataset.refId;
        var __params = { row          : __button.parentNode.parentNode,
                         id           : __refId,
                         row_template : __row_templates[__refId]};
        __executeDbAction('showList', __params, function(codigo){ });
      }

      __onBlurCodeTxt = function(sender){
        var __id = sender.value;
        var __td = sender.parentNode.nextSibling;        
        if(sender.className == 'txt51'){
          var __residuo = _residuos[__id] || {};
          if(__id.length > 4 && __residuo.des) {
            __td.innerHTML = __residuo.des;
          }else{
            __td.innerHTML = __id ? __CODE_ERROR_MSG : '';
          }                    
        }
        if(sender.className == 'txt53'){
          var _enmienda = _enmiendas[__id] || { };                 
          __td.innerHTML = _enmienda.des || (__id ? __CODE_ERROR_MSG : ''); 
        }        
      }

      __onInputCodeTxt = function(event){
        var __id       = event.target.value;
        var __td       = event.target.parentNode.nextSibling;        
        var __setFocus = function(){ __td.nextSibling.children[0].focus(); }
        
        if(event.target.className == 'txt51'){
          var __residuo = _residuos[__id] || {};
          if(__residuo.des) {
            __td.innerHTML = __residuo.des;
            if(__id.length == 6) __setFocus();
            return;
          }
          __td.innerHTML = __id.length > 5 ? __CODE_ERROR_MSG : '';                              
        }
        if(event.target.className == 'txt53'){
          var _enmienda = _enmiendas[__id] || { };
          if(_enmienda.des) {
            __td.innerHTML = _enmienda.des;
            __setFocus();
            return;
          }
          __td.innerHTML = __id.length > 2 ? __CODE_ERROR_MSG : '';  
        }
      }

      MAPA.Solicitudes.MateriasPrimasLoader = function(dataset, a, solicitud, element){
        __table = element;
        // ===================================================================================
        // Normalización de las materias
        // ===================================================================================
        __materias = Array.prototype
                          .concat
                          .apply([],[ dataset.residuos
                                             .map(function(r){
                                                r._idAgrupacion = 51;
                                                r._codigo       = r._idResiduo;
                                                r._descripcion  = _residuos[r._idResiduo].des;          
                                                return r;        
                                              }),
                                      dataset.fertilizantes
                                             .map(function(f){
                                                f._idAgrupacion = 56;
                                                f._codigo       = f._codigoDeFertilizante;
                                                f._descripcion  = f._denominacion;              
                                                return f;
                                              }),
                                      dataset.materias
                                             .map(function(m){ 
                                               if(m._idAgrupacion == 53){
                                                m._descripcion = _enmiendas[m._codigo].des;
                                               }
                                               return m;
                                             })
                          ])
                          .SortBy('_idAgrupacion,_codigo,_descripcion');
        // ==================================================================================================================
        // Carga de la tabla
        // ==================================================================================================================
        (function(){
          __appendRow
          ({ className : 'row-header', innerHTML : '<td class="mat-code">Código</td>' +
                                                   '<td class="mat-description">Descripción</td>' +
                                                   '<td class="mat-value">% p/p</td>'})
          ({ className : 'row-group', innerHTML : __group_template.format('5.1 Materias de origen orgánico')})
          ({ idAgrupacion : 51 })
          ({ className : 'row-group', innerHTML : __group_template.format('5.2 Abonos minerales')})
          ({ idAgrupacion : 52 })
          ({ className : 'row-group', innerHTML : __group_template.format('5.3 Enmiendas minerales')})
          ({ idAgrupacion : 53 })
          ({ className : 'row-group', innerHTML : __group_template.format('5.4 Agua')})
          ({ idAgrupacion : 54 })
          ({ className : 'row-group', innerHTML : __group_template.format('5.5 Otros ingredientes')})
          ({ idAgrupacion : 55 })
          ({ className : 'row-group', innerHTML : __group_template.format('5.6 Productos inscritos')})
          ({ idAgrupacion : 56 });       
        }());
        $('.row-button', __table).forEach(function(b){ 
          b.onclick = b.id ? __showList
                           : __insertRow;
        });
        __table.addEventListener("input", __onInputCodeTxt, true);
        return 'mp-table';
      }
    }());
    // ==========================================================
    // Incializar la gestión del apartado 12 - Micorrizas
    // ==========================================================
    (function(){
      
      MAPA.Solicitudes.MicorrizasLoader = function(dataset, a, solicitud, element){
        if(a == 'O'){
          (function(){
            function __addRow(data){
              data = data || {};
              var row       = element.insertRow(-1);
              row.className = 'row';
              row.innerHTML = ('<td style="text-align:left;">' + 
                                 '<input type="text" style="text-align:left;width:100%" value="{0}"/>' + 
                               '</td>' +
                               '<td style="width:30px">' + 
                                 '<input type="text" id="fer-s-micro-txt{2}" data-format="R3" style="width:100px" value="{1}"/>' + 
                               '</td>').format(data._descripcion || '',
                                               data._valor ? __formatValues(data._valor.split('-')) 
                                                           : '',
                                               row.rowIndex);  
            }
            dataset.microS.forEach(__addRow);
            __addRow();
            __addRow();
          }());
        }else{
          (function(){            
            function __addRow(data){
              data = data || {};
              var row       = element.insertRow(-1);
              row.className = 'row';
              row.innerHTML = ('<td style="background-color:gray;color:white">Cepa {0}</td>' +
                               '<td><input type="text" value="{1}" style="text-align:left;width:100%"/></td>' +
                               '<td><input type="text" value="{2}" style="text-align:left;width:100%"/></td>' +
                               '<td><input type="text" value="{3}" style="text-align:left;width:100px"/></td>' +
                               '<td><input type="text" value="{4}" style="width:100px"/></td>' +
                               '<td><input type="text" value="{5}" style="width:100px"/></td>'
                              ).format(a == 'S' ? row.rowIndex -1
                                                : String.fromCharCode(63 + row.rowIndex),
                                       data._genero  || '',
                                       data._especie || '',
                                       data._cepa    || '',
                                       data._valorMg || '',
                                       data._valorMl || '');    
            }
            dataset.microO.Where({ _microrriza : a }).forEach(__addRow);
            __addRow();
            __addRow();
          }());
        }
        return element.id;
      };

    }());    
    // ==========================================================
    // Incializar la gestión de los documentos 
    // ==========================================================
    (function(){
      var __documents       = '';
      var __checkedObjects  = [];
      var __solicitud       = '';
      var __container       = '';      var __statusContainer = '';      var __btnOpen         = '';
      var __btnEdit         = '';
      var __btnDelete       = '';
      var __btnAdd          = '';

      function __onCheck(){ 
        this.parentNode.style.backgroundColor = this.checked ? 'lightgrey' : '';  
        __checkedObjects = $('.check', __container).reduce( function(array, e, i){
          if(e.checked) array.push({ document  : __documents[i],
                                     row       : e.parentNode.parentNode
                                    }); 
          return array;
        }, []);
        __btnDelete.disabled = 
        __btnEdit.disabled   = 
        __btnOpen.disabled   = true;        
        if(__checkedObjects.length == 1){
          __btnDelete.disabled = !(__checkedObjects[0].document._doc._docId === undefined);
          __btnEdit.disabled   = !(__checkedObjects[0].document._doc._docId === undefined);
          __btnOpen.disabled = false;
        }else if(__checkedObjects.length > 1){            
          __btnOpen.disabled = false;
          __btnDelete.disabled = !(__checkedObjects.every( function(d){ return d.document._tipo == 'U'; })); 
        }
        __updateStatus();
      }

      function __onRowClick(ev){
        var __ev = MAPA.MapaEvent(ev); 
        if(__ev.Target.tagName == 'INPUT' || __ev.Target.tagName == 'A'){
          MAPA.cancelEvent(__ev);
          return true;
        }
        __openDocument(null, __documents[this.rowIndex - 1]);          
      }
      
      function __openDocument(ev, target){

        function __requestXmlDocument(doc){                  
          $Ajax.Post(__url, 'accion=documentos.getitem&id={_id}&tipo={_tipo}&format=1'.format(doc), function(o){
            $('PdfDocumentContainer').innerHTML = '<pre class="xml-viewer"><code></code></pre>'; 
            $('PdfDocumentContainer').querySelector('code').textContent = o;
          });
        }
          
        function __requestDocument(doc){
          var __name = doc._docName.toLowerCase();             
          if(__name.endsWith('.xml') || __name.endsWith('.txt')){                    
            $Ajax.Post(__url, 'accion=documentos.getitem&id={_id}&tipo={_tipo}'.format(doc), function(o){
              $('PdfDocumentContainer').innerHTML = '<pre class="xml-viewer"><code></code>' + 
                                                    '<input type="button" value="Formatear" style="margin: 3em 45%;" />' +
                                                    '</pre>'; 
              $('PdfDocumentContainer').querySelector('code').textContent = o;
              $('PdfDocumentContainer').querySelector('input').onclick = function(){ __requestXmlDocument(doc); };
            });                           
          }else if(__name.endsWith('.jpg') || __name.endsWith('.png')){
            $('PdfDocumentContainer').innerHTML = '<div class="img-wrapper"><img src="{0}?accion=documentos.getitem&id={_id}&tipo={_tipo}" /></div>'.format(__url, doc);                                                        
          }else if(__name.endsWith('.pdf')){
            $('PdfDocumentContainer').innerHTML = '<object width="100%" height="100%" type="application/pdf" data="{0}?accion=documentos.getitem&id={_id}&tipo={_tipo}#zoom=85&scrollbar=1&toolbar=1&navpanes=0" id="pdf_content"></object>'.format(__url, doc);                                                        
          }else{
            $('PdfDocumentContainer').innerHTML = '<div class="img-wrapper"><h3>No se puede visualizar el contenido de este tipo de archivos</h3></div>';
          } 
        }
            
        var __documents = __checkedObjects.map( function(d){ return d.document; });        
        if(target || __documents.length) _manager.setState('ViewDocument', 'Edición de solicitudes');                             
        if(target || (__documents.length == 1)){ 
          var __doc = (target || __documents[0]); 
          $('PdfDocumentInfo').innerHTML     = __doc._docName;
          $('PdfDocumentInfo').style.padding = '10px';
          __requestDocument(__doc);           
        }
        if(__documents.length > 1){          
          $('PdfDocumentInfo').innerHTML  = 'Documento <select style="width: calc(100% - 80px); padding: 4px 1px;"></select>';
          var __combo = $('PdfDocumentInfo').querySelector('select');
          MAPA.AppendOption(__combo, __documents, '_docName', '_id');
          __combo.onchange = function(){ __requestDocument(__documents.Item('_id', __combo.value)); };
          __combo.onchange();
        }
      }

      function __deleteDocument(){
        __ShowConfirmDialog('<h4>Eliminar documentos</h4>' +
                            '¿Está seguro de eliminar permanentemente los documentos seleccionados?',
                            function(){
                              var __ids = MAPA.Join(__checkedObjects.Select('document'), '_id', '-'); 
                              MAPALayer.ShowInfo('Espere un momento');
                              $Ajax.Post(__url_solicitud, 'accion=documentos.delete&ids={0}'.format(__ids), function(o){
                                MAPALayer.Hide();
                                var __response = MAPA.tryParse(o);
                                if (__response.Resultado && __response.Resultado!='OK'){              
                                  MAPALayer.ShowError(__response.Mensaje, MAPALayer.Hide); return;
                                }                                
                                __checkedObjects.forEach(function(o){ 
                                  o.row.parentNode.removeChild(o.row); // Quitar la fila de la tabla
                                  __documents.remove(o.document);      // Quitar el documento del array
                                }); 
                                __checkedObjects = [];
                                __updateStatus();
                              }); 
                            }, {Height : 155, Width: 420, Title : '{_CONST.AppName} - Solicitudes'.format()}); 
      }
      
      function __addDocument(){

        function __appendTableRow(document){          
          var __row       = __container.querySelector('tbody').insertRow(-1);
          __row.id        = 'doc-row_{_id}'.format(document);
          __row.className = 'row_edit';
          __row.innerHTML = ('<td class="left" style="width:1%"><input type=checkbox class="check"/></td>' + 
                              '<td class="center" style="min-width:12em">{_fecha}</td>' + 
                              '<td class="left" style="min-width:12em">{_origen}</td>' + 
                              '<td class="left" style="width:80%">{_referencia}</td>' + 
                              '<td class="left" style="min-width:220px"><a class="button-download" target="_blank" ' +
                              'title="Descargar {_docName}" ' +
                              'href="{0}?accion=documentos.getitem&id={_id}&tipo={_tipo}&attachment=1">▼ {_docName}</a>' + 
                              '</td></tr>').format(__url, document);           
         __row.querySelector('.check').onclick = __onCheck;
          __row.onclick = __onRowClick; 
          __row.scrollIntoView();
        }
        __ShowConfirmDialog('', 
                            function ___onConfirm(dlg){  
                            }, {
                            Height : 190,
                            Width  : 450,
                            Title  : '{_CONST.AppName} - Solicitudes'.format(),
                            BeforeConfirm : function(dlg){
                              if(!dlg.Body.querySelector('#txtUserDoc').value) return true;
                              // ========================================================================
                              // Procesar la respuesta
                              // ========================================================================                              
                              var __controller = { 
                                onSuccess : function(XMLHttpRequest){
                                  dlg.Element.style.zIndex = '10000';
                                  var __response = MAPA.tryParse(XMLHttpRequest.response);
                                  if (__response.Resultado && __response.Resultado!='OK'){              
                                    MAPALayer.ShowError(__response.Mensaje); return;
                                  } 
                                  // =======================================================================
                                  // Añadir el documento (normalizado) al array y una fila a la tabla
                                  // =======================================================================
                                  var __doc =  { _doc        : __response.Documento,
                                                 _id         : __response.Documento._id,
                                                 _referencia : __response.Documento._descripcion, 
                                                 _docName    : __response.Documento._nombre,
                                                 _origen     : 'Usuario', _tipo : 'U', _fecha : ''};                                  
                                  __documents.add(__doc);
                                  __appendTableRow(__doc)                                 
                                  __updateStatus();
                                  MAPA._KeyEvents.DisableDialogEvents().EnableEvents();
                                  MAPALayer.Hide();
                                },
                                onError : function(XMLHttpRequest){
                                  dlg.Element.style.zIndex = '10000';
                                  MAPALayer.ShowError('{status} - {statusText}'.format(XMLHttpRequest));
                                },
                                onStart : function(){
                                  dlg.Element.style.zIndex = '9999';
                                }                              
                              };
                              // ========================================================================
                              // Enviar los datos documento
                              // ========================================================================
                              $Ajax.sendFormData(__url_solicitud)
                                    .add('accion', 'documentos.add')
                                    .add('id', __solicitud._id)
                                    .add('descripcion', dlg.Body.querySelector('#txtDesUserDoc').value)
                                    .add('file',
                                        dlg.Body.querySelector('#txtUserDoc').files[0], 
                                        dlg.Body.querySelector('#txtUserDoc').files[0].name)
                                    .send(__controller); 
                              return true;
                            }
                        },
                        function ___onInitDlg(dlg){
                          dlg.BtnYes.value       = 'Aceptar';
                          dlg.BtnNo.value        = 'Cancelar';
                          dlg.BtnNo.style.width  = '6em';
                          dlg.BtnYes.style.width = '6em';
                          dlg.Body.style.padding = '3px 10px';
                          dlg.Body.className     = "W1-Body";
                          dlg.Body.innerHTML     = '<h4>Añadir documento</h4>' +
                                                    '<div class="fc" style="width:100%">' +
                                                    '<label class="fcap" for="txtDesUserDoc">Descripción o referencia</label>' +
                                                    '<input type="text" id="txtDesUserDoc" value="" style="width: 100%" />' +
                                                    '</div>' +
                                                    '<div class="fc" style="width:100%">' +
                                                    '<label class="fcap" for="txtUserDoc">Documento</label>' +
                                                    '<input type="file" id="txtUserDoc" style="width: 100%" />' +
                                                    '</div>'; 

                        });      
      }
      
      function __changeDescription(){
        var __current = __checkedObjects[0].document._referencia;
        var __docId   = __checkedObjects[0].document._id;
        __ShowConfirmDialog('', function(dlg){
                                  var __text = dlg.Body.querySelector('#txtDesDoc').value;
                                  if(__current == __text){
                                    MAPALayer.Hide();
                                    return;
                                  }
                                  MAPALayer.ShowInfo('Espere un momento');
                                  $Ajax.Post(__url_solicitud, 'accion=documentos.change&id={0}&text={1}'.format(__docId, __text), function(o){
                                    MAPALayer.Hide();
                                    var __response = MAPA.tryParse(o);
                                    if (__response.Resultado && __response.Resultado!='OK'){              
                                      MAPALayer.ShowError(__response.Mensaje, MAPALayer.Hide); return;
                                    }
                                    __checkedObjects[0].row.cells[3].textContent = __text;
                                    __checkedObjects[0].document._referencia     = __text;
                                  }); 
                                }, {Height : 150, Width: 450, Title : '{_CONST.AppName} - Solicitudes'.format()},
                                function(dlg){
                                  dlg.BtnYes.value       = 'Aceptar';
                                  dlg.BtnNo.value        = 'Cancelar';
                                  dlg.BtnNo.style.width  = '6em';
                                  dlg.BtnYes.style.width = '6em';
                                  dlg.Body.style.padding = '3px 10px';
                                  dlg.Body.className     = "W1-Body";
                                  dlg.Body.innerHTML     = '<h4>Cambio de descripción</h4>' +
                                                           '<div class="fc" style="width:100%">' +
                                                           '<label class="fcap" for="txtDesDoc">Nueva descripción para documento</label>' +
                                                           '<input type="text" id="txtDesDoc" value="{0}" style="width: 100%" />'.format(__current) +
                                                           '</div>'                                                   
                                });        
      }

      function __updateStatus(){
        __statusContainer.innerHTML = __checkedObjects.length ? '<div>{0} documentos. {1} seleccionados</div>'.format(__documents.length,
                                                                                                                      __checkedObjects.length) 
                                                              : '<div>{0} documentos'.format(__documents.length);
      }

      function __initUI(container){
        __container       = container;
        __statusContainer = $('.statusContainer', container.parentNode)[0]
        var __btnExpand   = $('.toolsContainer .expandBtn', container.parentNode)[0];
        __btnExpand.onclick = function(){        
          if(container.style.maxHeight == 'none'){
            container.style.maxHeight = '';
            this.textContent = '🔽';
          }else{
            container.style.maxHeight = 'none';
            this.textContent = '🔼';
          }        
        }
        __btnOpen   = $('.toolsContainer .openBtn', container.parentNode)[0];
        __btnDelete = $('.toolsContainer .deleteBtn', container.parentNode)[0];
        __btnAdd    = $('.toolsContainer .addBtn', container.parentNode)[0];
        __btnEdit   = $('.toolsContainer .editBtn', container.parentNode)[0];
        __btnOpen.onclick   = __openDocument;        
        __btnDelete.onclick = __deleteDocument;        
        __btnAdd.onclick    = __addDocument;
        __btnEdit.onclick   = __changeDescription;        
      }
            
      MAPA.Solicitudes.DocumentsLoader = function(documents, a, solicitud, element){
        __documents      = documents;
        __checkedObjects = [];
        __solicitud      = solicitud;
        __initUI(element);
        element.innerHTML = documents.reduce(function(sb, d){
                                               return sb.append(('<tr id="doc-row_{_id}" class="row_edit">' +
                                                                 '<td class="left" style="width:1%"><input type=checkbox class="check"/></td>' + 
                                                                 '<td class="center" style="min-width:12em">{_fecha}</td>' + 
                                                                 '<td class="left" style="min-width:12em">{_origen}</td>' + 
                                                                 '<td class="left" style="width:80%">{_referencia}</td>' + 
                                                                 '<td class="left" style="min-width:220px"><a class="button-download" target="_blank" ' +
                                                                     'title="Descargar {_docName}" ' +
                                                                     'href="{0}?accion=documentos.getitem&id={_id}&tipo={_tipo}&attachment=1">▼ {_docName}</a>' + 
                                                                 '</td></tr>'
                                                                ).format(__url, d));                                                
                                              }, MAPA.CreateStringBuilder()
                                                      .append('<table id="tabla-documentos-sol" class="silverTable"><tbody>')
                                                      .append('<tr class="theader"><td></td><td>Fecha</td><td>Origen</td><td>Descripción o referencia</td><td>Documento</td></tr>')
                                            ).append('</tbody></table>').toString();
          __updateStatus();
          __btnDelete.disabled = 
          __btnEdit.disabled   = 
          __btnOpen.disabled   = true;
          $('.check', element).forEach( function(e){ e.onclick = __onCheck; });
          $('.row_edit', element).forEach( function(e){ e.onclick = __onRowClick; });     
        return 'docs-s-{_id}'.format(solicitud);
      }

      MAPA.pubsub.subscribe('/documents/reload', function(a, response){
        target.tables.documentos = MAPA.Solicitudes.NormalizeDocuments(response); 
        MAPA.Solicitudes.DocumentsLoader(target.tables.documentos, undefined, target, __container)
      });

      MAPA.pubsub.subscribe('/documents/clear/registro', function(a, b){        
        __documents = __documents.Where( function(d){
          if(d._tipo != 'U'){
            var __row = __container.querySelector('#doc-row_{_id}'.format(d));
            if(__row){
              __row.parentNode.deleteRow(__row.rowIndex);
            }
            return false;
          }
          return true;  
        });
        __updateStatus();
      });

    }());
    // ==========================================================
    // Incializar la gestión de los quelantes y complejantes
    // ==========================================================
    (function(){

      MAPA.Solicitudes.QuelantesListLoader = function(quelantes, a, solicitud, element){
        var __values = quelantes.split(';');
        $('input[type="checkbox"]', element).forEach( function(check){
          var __id = check.id.split('$')[1];
          check.checked = __values.indexOf(__id) > -1;
        });
        return '';
      }

      MAPA.Solicitudes.ComplejantesListLoader = function(complejantes, a, solicitud, element){
        var __values = complejantes.split(';');
        $('input[type="checkbox"]', element).forEach( function(check){
          var __id = check.id.split('$')[1];
          check.checked = __values.indexOf(__id) > -1;
        });
        return '';
      }  
      
    }())
    // ===============================================================================
    // Inicializar los controles del elemento DOM que sirve de plantilla de los datos
    // ===============================================================================
    function __initTemplate(template, solicitud){
      var __tiposDeAbono = Object.keys(_tiposDeFertilizantes)
                                 .map(function(k){ return _tiposDeFertilizantes[k]; })
                                 .SortBy('_codigo')
      // ==========================================================
      // Incializar campos de fecha
      // ==========================================================
      $('.txtCalendar', template).forEach(MAPA.DateTextBox);
      // ==================================================================================================================
      // Incializar combos
      // ==================================================================================================================
      var cmbF_Tipo             = template.querySelector('#fer-f-txtIdTipo');
      var cmbF_Provincia        = template.querySelector('#fer-f-txtIdProvincia');
      var cmbP_Provincia        = template.querySelector('#fer-p-txtIdProvincia');
      var cmbP_Pais             = template.querySelector('#fer-p-txtIdPais');     
      var cmbS_TipoFertilizante = template.querySelector('#fer-s-txtTipoFertilizante');           
      MAPA.AppendOption(cmbF_Tipo, '', '')
                       (cmbF_Provincia, '', '')
                       (cmbP_Provincia, '', '')
                       (cmbP_Pais, '', '')
                       (cmbF_Tipo, Object.keys(_tiposDeFabricante), '', '', function(id){ return _tiposDeFabricante[id]; })
                       (cmbF_Provincia, _provincias, 'd', 'c')
                       (cmbP_Provincia, _provincias, 'd', 'c')
                       (cmbP_Pais, Object.keys(_paises), '', '', function(id){ return _paises[id].d; })
                       (cmbS_TipoFertilizante, __tiposDeAbono, '', '_id', function(tipo){ 
                         return '{0} - {1}'.format( tipo._codigo.toString().replace('600', '60'),
                                                    tipo._descripcion);});
      // ================================================================================
      // Quelantes y complejantes
      // ================================================================================
      var __list_C =  template.querySelector('#list-complejantes');
      __list_C.innerHTML = Object.keys(_complejantes).reduce( function(html, key){
        var __complejante = _complejantes[key];
        return html += ('<div id="compl-{_id}" class="qc">' +
                         '<input type="checkbox" id="checkCompl${_id}"/>' + 
                         '<label for="checkCompl${_id}" title="{_descripcion}">{_id}</label>' + 
                        '</div>').format(__complejante);
      }, '');
      var __list_Q =  template.querySelector('#list-quelantes');      
      __list_Q.innerHTML = Object.keys(_quelantes).reduce( function(html, key){
        var __quelante = _quelantes[key];
        return html += ('<div id="quelante-{_id}" class="qc">' + 
                         '<input type="checkbox" id="checkQuelante${_id}" />' +
                         '<label for="checkQuelante${_id}" title="{_descripcion}">{_id}</label>' + 
                        '</div>').format(__quelante);
      }, '');
      // ================================================================================
      // Incializar paneles contenedores de las secciones
      // ================================================================================
      (function(){
        function __init(factory){
          [ ['1, 2 - Denominación y tipo de producto','solicitud'],
            ['3 - Datos del fabricante','fabricante'],
            ['4 - Datos del productor','productor'],
            ['5 - Materias primas utilizadas en su fabricación','materias'],
            ['6 - Formas de presentación, modo de empleo y envasado','presentacion'],
            ['7 - Contenido en nutrientes','nutrientes'],
            ['8 - Otras características','caracteristicas'],
            ['9 - Contenido en metales pesados','metales'],
            ['10 - Presencia de microorganismos (Patógenos)','patogenos'],
            ['11 - Clasificación de peligrosidad','peligrosidad'],
            ['12 - Declaración de microorganismos (Productos grupo 4.4)','micro'],
            ['13 - Variaciones/Equilibrios  (Productos grupo 4.4)','variaciones-equlibrios'],
            ['14 - Grupos de cultivos','cultivos'],
            ['Documentos','documentos'],
            ['Sede electrónica','sede']]
          .forEach( function(d){ 
            var __id = d[1];
            __boxes[__id] = factory.CreateBox({ Id : __id, Title  : d[0], Height : '-'});
            __boxes[__id].appendTo(template);       
            __boxes[__id].Body.appendChild(template.querySelector('#fer-' + __id));    
          });            
          if((solicitud.tables.registro._id || 0) == 0 ){
            __boxes.sede.Hide();
          }
          if(solicitud._id == '-' ){
            __boxes.documentos.Hide();
			      __boxes.solicitud.Expand();			  
          }
          if(solicitud.onResolveData) solicitud.onResolveData(solicitud);
        }
        if(!!window.BoxFactory) return __init(window.BoxFactory);
        if(window.parent && window.parent.BoxFactory) return __init(window.parent.BoxFactory);
        MAPA.Include('/{0}/js/app/BoxFactory.js'.format(MAPA.AppPath), function(){__init(BoxFactory);});
      }());
      // =====================================================================================
      // Modo edición 
      // ===================================================================================== 
      if(solicitud._insertMode){
        template.querySelector('#fer-f-txtNombre').disabled = true;
        template.querySelector('#fer-s-txtTipoFertilizante').disabled = solicitud._tipo != 'I';
        template.querySelector('#fer-f-txtNif').disabled              = solicitud._tipo == 'I';
        $('btnInscribir').style.display = 'none';
      }else{        
        template.querySelector('#fer-f-txtNif').disabled    = solicitud._tipo   == 'I' || 
                                                              solicitud._estado != 'T' ;
        template.querySelector('#fer-f-txtNombre').disabled = true;
        $('btnInscribir').style.display = solicitud._estado == 'T' ? '' :'none';
      }
      return template;
    }
    // ===========================================================================
    // Obtener el html de la plantilla y rellenar los datos
    // ===========================================================================
    function __populateFields(solicitud){
      $Ajax.Get("Html/__Solicitud.html", function(o){
        __template = __initTemplate($.$('div', { innerHTML : o }), solicitud);
        $('ViewContent').innerHTML = '';
        $('ViewContent').appendChild( MAPA.templates.fill(__template, solicitud));
        // =======================================================================
        // Cargar las tablas de estados, subsanaciones y notificaciones
        // =======================================================================
        setTimeout(function(){ MAPA.Solicitudes.SedeLoader(solicitud); }, 250); 
        // =======================================================================
        // Controlar cambios realizados en los campos con decimales
        // =======================================================================
        __template.addEventListener("blur", __onBlurEventHandler, true);
        __txt_backup = $('[data-format]', __template).reduce(function(a, txt){
          a[txt.id] = txt.value;
          return a;
        },{});
		    if(solicitud._insertMode){
		      if(solicitud._tipo == 'I'){		  
		        __template.querySelector('#fer-s-txtTipoFertilizante').focus();
		      }else{		  
		        __template.querySelector('#fer-s-txtDenominacion').focus();
		      }			
		    }
        __template.querySelector('#searchNombresBtn').onclick = function(){
          MAPA.Include('../js/app/default.aspx.js', function(){ 
            MAPA.Search.nombresComerciales(__template.querySelector('#fer-s-txtDenominacion').value);
          }); 
        }
      }); 
    }
    // ===============================================================================
    // Obtener los datos de la solicitud
    // ===============================================================================
    (function(solicitud){

      function __translateTipo(key){ 
        return {'SUB' : 'Subsanación',                'DOC' : 'Documentación',                'NOT' : 'Petición de subsanación',                'INF' : 'Notificación'}[key] || key;
      } 

      function __normalizeDocuments(dataset){
        dataset.DocumentosUsuario = dataset.DocumentosUsuario || [];
        dataset.DocumentosSede    = dataset.DocumentosSede || [];
        dataset.InfoAnexos        = dataset.InfoAnexos     || [];
        var __registro = (dataset.Registro && dataset.Registro[0]) || {};
        var __info     = MAPA.toDictionary(dataset.InfoAnexos, 'IdDoc');
        return dataset.DocumentosSede
                      .Where( function(d){
                        if(_showAll) return true;
                        if(d._docIdRepositorio == "Hidden" || d._esJustificante) return false;
                        return true;
                      })  
                      .concat(dataset.DocumentosUsuario)
                      .map( function(d){                   
                          return { _doc        : d,
                                   _id         : d._id,
                                   _origen     : __info[d._id] ? __translateTipo(__info[d._id].Tipo) : (d._idSolicitud ? 'Usuario' : 'Registro electrónico'),
                                   _fecha      :(__info[d._id] ? __info[d._id].Fecha : d._idSolicitud ? '' : __registro._fecha || '').replace(/ 000$/,''),
                                   _referencia : __info[d._id] ? __info[d._id].RefId                     : d._descripcion || (__registro._numeroDeRegistro || ''), 
                                   _docName    : d._docName || d._nombre,
                                   _tipo       : d._idSolicitud ? 'U' : ''};
                      });
      }
      MAPA.Solicitudes.NormalizeDocuments = __normalizeDocuments;

      var params = solicitud._id ? 'accion=getdata&id={_id}'.format(solicitud)
                                 : ('accion=getdata&' + 
                                    'mode={_tipo}&' + 
                                    'ref_id={_ref_id}&' + 
                                    'link_id={_link_id}').format(solicitud)
      $Ajax.Post('../Json/Solicitud.ashx', params, function(o){

        var respuesta = MAPA.tryParse(o);
        if(respuesta.Resultado && respuesta.Resultado == 'Error'){
          return _manager.setState('Error', respuesta.Mensaje);  
        }
        // =================================================================================================
        // Inserción de solicitudes.        
        // =================================================================================================
        if(respuesta.Solicitud){
          var __tipoSolicitud  = solicitud._tipo;
          var __ref_id         = solicitud._ref_id;
          // ===============================================================================================
          // El producto ha experimentado cambios del nombre comercial
          // ===============================================================================================
          if(__tipoSolicitud != 'I' && respuesta.Reference[3].length){
            respuesta.Solicitud._denominacion = respuesta.Reference[3].lastItem().d;
          }
          // ===============================================================================================
          // Se copian los datos de la solicitud actual del fertilizante para facilitar la entrada de datos 
          // ===============================================================================================
          MAPA.apply(solicitud, respuesta.Solicitud);
          MAPA.apply(solicitud, { _id                    : '-',
                                  _insertMode            : true,
                                  _expediente            : respuesta.Expediente || '-', 
                                  _estado                : 'T', 
                                  _idPresentacion        : 1,
                                  _modoDeEmpleo          : 1,
                                  _tipo                  : __tipoSolicitud,
                                  _idFertilizante        : __ref_id, // inserción de solicitudes tipo: M, R
                                  _idFabricante          : __ref_id, // inserción de solicitudes tipo: I
                                  _fechaDeRegistro       : '', 
                                  _fechaEntrada          : '',
                                  _fechaEnvioSanidad     : '',
                                  _fechaLimite           : '',
                                  _fechaPeticionTitular  : '',
                                  _fechaRecepcionSanidad : '',
                                  _fechaRespuestaTitular : '' });
        }
        solicitud.tables = { fabricante      : respuesta.Fabricante.lastItem(),
                             history         : { titularidad : respuesta.Fabricante,
                                                 productor   : respuesta.Productor }, 
                             productor       : respuesta.Productor[0],
                             registro        : (respuesta.Registro && respuesta.Registro[0]) || {},
                             caracteristicas : respuesta.Caracteristica[0],
                             materias        : respuesta.MateriasPrimas || [],
                             micro           : respuesta.Micro[0]       || { _codigo : '', _fertilizante : '', _tipo : 0 },
                             microO          : respuesta.MicroO         || [],
                             microS          : respuesta.MicroS         || [],
                             residuos        : respuesta.Residuos       || [],
                             fertilizantes   : respuesta.Fertilizantes  || [],
                             hchPat          : respuesta.HchPat[0]      || { _valor : '' },
                             documentos      : __normalizeDocuments(respuesta),
                             nutrientes      : respuesta.Nutrientes[0]  || {},
                             variaciones     : respuesta.Variacion[0]   || {},
                             equilibrio      : respuesta.Equilibrio[0]  || { _nitrogenoTotal : '', _anhidridoTotal : '', _oxidoPotasio   : '' },
                             cultivo         : respuesta.Cultivo,
                             peligrosidad    : respuesta.Peligrosidad[0]|| { _valor : '' },
                             reference       : respuesta.Reference      || [respuesta.Fabricante.reverse()[0], 
                                                                            {}] // referencias para la inserción de solicitudes: fabricante, Producto registrado
        };
        __populateFields(solicitud);
      });    
    }(target));    
    // ===========================================================================================
    // Acciones de persistencia de datos 
    // ===========================================================================================
    function __executeDbAction(accion, o, callback){
      if(MAPA.Solicitudes.DB)  return MAPA.Solicitudes.DB[accion](o, target, MAPALayer, callback);
      MAPA.Include('../js/app/solicitudes.db.js', function(){         
        MAPA.Solicitudes.DB[accion](o, target, MAPALayer, callback)
      });        
    }
    // ===============================================================================
    // Operaciones
    // ===============================================================================
    function __parentNotify(o){        
      ({Insert     : function(){ window.parent.MAPA.Solicitudes.onUpdateItem(o, target);}, 
        Save       : function(){ window.parent.MAPA.Solicitudes.onUpdateItem(o, target); },               
        Estimar    : function(){ window.parent.MAPA.Solicitudes.onUpdateItem(o, target); },
        Desestimar : function(){ window.parent.MAPA.Solicitudes.onUpdateItem(o, target); },
        SaveFertilizante : function(){        
          window.parent.MAPA.Fertilizantes && window.parent.MAPA.Fertilizantes.onUpdateItem(o, target);
          window.parent.MAPA.Solicitudes.onUpdateItem(o, target);
        },
        HabilitarFertilizante    : function(){ window.parent.MAPA.Fertilizantes && window.parent.MAPA.Fertilizantes.onUpdateItem(o, target); },
        DeshabilitarFertilizante : function(){ window.parent.MAPA.Fertilizantes && window.parent.MAPA.Fertilizantes.onUpdateItem(o, target); },
        ProrrogarFertilizante    : function(){ window.parent.MAPA.Fertilizantes && window.parent.MAPA.Fertilizantes.onUpdateItem(o, target); },
        Inscribir                : function(){ window.parent.MAPA.Fertilizantes && window.parent.MAPA.Fertilizantes.onUpdateItem(o, target);
                                               window.parent.MAPA.Solicitudes.onUpdateItem(o, target);
        }
       })[o.name]();
    }

    function __synEstadoFertilizante(){ 
      return MAPA.Solicitudes.Mode === 'producto'
    }
    __commands.ExpandPanel = function(o){
      Object.keys(__boxes)
            .map(function(k){return __boxes[k];})
            .Where(function(box){return box.Handler.style.display != 'none';})
            .forEach(function(box){
              box.Expand();
            });
    }
    __commands.CollapsePanel = function(o){
      Object.keys(__boxes)
            .map(function(k){return __boxes[k];})
            .Where(function(box){return box.Handler.style.display != 'none';})
            .forEach(function(box){
              box.Collapse();
            });
    }      
    __commands.Save = function(o){
      __executeDbAction('save', __template, function(o){
        var __cmd = target._insertMode ? 'Insert' : 'Save';
        if(target._insertMode){
          target._insertMode = false;
          target._id         = o.Solicitud._id;          
          __template.querySelector('#fer-s-txtTipoFertilizante').disabled = true;
          __template.querySelector('#fer-s-txtId').value = target._id;
          if(target._tipo == 'I'){
            target._expediente = o.Expediente;
            __template.querySelector('#fer-s-txtExpediente').value = o.Expediente;
          }          
        }
        target._denominacion    = __template.querySelector('#fer-s-txtDenominacion').value;
        target._fechaDeRegistro = __template.querySelector('#fer-s-txtFechaDeEntrada').value;
        target._fechaEntrada    = __template.querySelector('#fer-s-txtFechaDeRegistro').value;
        target._idAbono         = __template.querySelector('#fer-s-txtTipoFertilizante').value;
        __parentNotify(MAPA.apply(o, { name : __cmd }));
      });
    }
    __commands.SaveFertilizante = function(o){ 
      __executeDbAction('saveFertilizante', o, function(response){        
        o.container.querySelector('#txtEstado').value = response.Data[0];
        o.container.querySelector('#txtCodigo').value = response.Data[1];
        o.container.querySelector('#txtFechaCaducidad').value = response.Data[2]; 
        if(__synEstadoFertilizante()){ // Camiar estado solo si es fertilizante
          (function(estado){          
            var __element = o.container.querySelector('h2 span')
            __element.className = 'estado-{0}'.format(estado);
            __element.innerHTML = estado; 
          }(_estadoFertilizante[response.Data[0] || 'R']));        
        }
        __parentNotify(MAPA.apply(o, { data : response.Data }));
      });
    }
    __commands.HabilitarFertilizante = function(o){ 
      __executeDbAction('habilitarFertilizante', o, function(response){
        o.container.querySelector('#txtEstado').value = response.Data[0];
        if(__synEstadoFertilizante()){ // Camiar estado solo si es fertilizante
          (function(estado){
            var __element = o.container.querySelector('h2 span');
            __element.className = 'estado-{0}'.format(estado);
            __element.innerHTML = estado; 
          }(o.estado == 'C' ? 'Caducado' : 'Activo'));
        }
        __parentNotify(MAPA.apply(o, { data : response.Data })); 
      });
    }
    __commands.DeshabilitarFertilizante = function(o){ 
      __executeDbAction('deshabilitarFertilizante', o, function(response){        
        o.container.querySelector('#txtEstado').value = 'A';
        if(__synEstadoFertilizante()){ // Camiar estado solo si es fertilizante
          (function(estado){
            var __element = o.container.querySelector('h2 span');
            __element.className = 'estado-{0}'.format(estado);
            __element.innerHTML = estado; 
          }('Anulado'));
        }
        __parentNotify(MAPA.apply(o, { data : ['A'] }));
      });
    }
    __commands.ProrrogarFertilizante = function(o){
      __executeDbAction('prorrogarFertilizante', o, function(response){        
        o.container.querySelector('#txtEstado').value = 'P'; 
        if(__synEstadoFertilizante()){ // Camiar estado solo si es fertilizante
          (function(estado){
            var __element = o.container.querySelector('h2 span');
            __element.className = 'estado-{0}'.format(estado);
            __element.innerHTML = estado; 
          }('Prorrogado'));
        }
        __parentNotify(MAPA.apply(o, { data : ['P'] }));        
      });
    }
    __commands.Desestimar = function(o){      
      __executeDbAction('desestimarSolicitud', o, function(response){
        target._fechaLimite = '01/01/2000 00:00:00 000';
        target._state       = 'D';        
        (function(estado){
          if(target._estado != 'T') return;
          o.container.querySelector('#fer-s-txtEstado').value = 'D';
          var __element = o.container.querySelector('h2 span');
          __element.className = 'estado-{0}'.format(estado);
          __element.innerHTML = estado; 
        }('Desestimada'));
        __parentNotify(o);        
      });
    }
    __commands.Estimar = function(o){
      __executeDbAction('estimarSolicitud', o, function(response){
        target._fechaLimite = '';
        target._state       = '';          
        (function(estado){
          if(target._estado != 'T') return;
          o.container.querySelector('#fer-s-txtEstado').value = '-';
          var __element = o.container.querySelector('h2 span');
          __element.className = 'estado-{0}'.format(estado);
          __element.innerHTML = estado; 
        }('Tramite'));
        __parentNotify(o);        
      });
    }
    __commands.Vincular = function(){
      __executeDbAction('vincular', {}, function(response){
        if(target.tables.registro._id){
          MAPA.pubsub.publish('/sede/reload', target);
          response.Registro = [target.tables.registro];
          MAPA.pubsub.publish('/documents/reload', response);                   
        }else{
          __boxes.sede.Hide();
          MAPA.pubsub.publish('/documents/clear/registro', target);       
        }    
      });     
    }
    __commands.Validar = function(){
      __executeDbAction('validar', {}, function(response){});     
    }
    __commands.Print = function(){      
      __executeDbAction('print', __template, function(response){});     
    }
    // ==================================================================================
    // Formatear los campos con decimales
    // ==================================================================================
    function __onBlurEventHandler(event){
      var __txt    = event.target;
      var __fmt    = event.target.dataset.format;
      var __txtVal = function(v){ return (v || __txt.value).replace(',', '.').replace('-', ''); };
      var __onParsed = function(){};
      if((__txt.nodeName === 'INPUT') && /^txt5[13]$/.test(__txt.className)){
        return __onBlurCodeTxt(__txt);
      }
      if((__txt.nodeName === 'INPUT') && __fmt){
        if(__txt.value === ''){ // Vacío
          __onParsed = function(){ return ''; }           
        }else if(/^\d/.test(__fmt)){ // Un valor
          var __v    = parseFloat(__txtVal());
          __onParsed = function(){ return isNaN(__v) ? __txt_backup[__txt.id] 
                                                     : __v.toFixed(__fmt)
                                                          .replaceAll('.', ','); }
        }else{ // Un valor o un rango     
          var __match     = /^([0-9]*[,\.]?[0-9]+)\s*-\s*([0-9]*[,\.]?[0-9]+)\s*$/g.exec(__txt.value)
          var __decimales = __fmt.replace('R', '');
          var __toString  = function(v){ return v.toFixed(__decimales).replaceAll('.', ','); }
          if(__match && __match.length == 3){
            var __min       = parseFloat(__txtVal(__match[1]));
            var __max       = parseFloat(__txtVal(__match[2]));
            if(__min > __max){
              var __temp = __min;
              __min = __max;
              __max = __temp;
            }
            __onParsed = function(){ return '{0} - {1}'.format(__toString(__min), __toString(__max)); }          
          }else{
            var __v    = parseFloat(__txtVal());
            __onParsed = function(){ return isNaN(__v) ? __txt_backup[__txt.id] : __toString(__v); }
          }
        }
        __txt_backup[__txt.id] = __txt.value = __onParsed();      
      }      
    } 
  }

  function __updateStatus(){
    __statusContainer.innerHTML = _$Fabricante.Checked_sol.length ? '<div>{0} solicitudes. {1} seleccionadas</div>'.format(__dsSolicitudes.length,
                                                                                                                           _$Fabricante.Checked_sol.length) 
                                                                  : '<div>{0} solicitudes'.format(__dsSolicitudes.length);
  }

  function __filterData(){
    var __tipo   = __cmbTipo.value   || '';
    var __estado = __cmbEstado.value || '';
    var __filter = {};
    if(__tipo)   __filter._tipo   = __tipo;
    if(__estado) __filter._state = __estado.replace('T', '');    
    if(Object.keys(__filter).length){
      __dsSolicitudes = _$Fabricante.Solicitudes.Where(__filter);
    }else{
      __dsSolicitudes = _$Fabricante.Solicitudes;
    }    
    __initTable();
  }

  function __initTable(){    
    __container.innerHTML = '{0}<tbody>{1}{2}</tbody></table>'.format(
                            __header, 
                            __row_header, 
                            __dsSolicitudes.reduce(function(s, f){
                              return s += __row_template.format(f._id.toString(),
                                                                f._expediente,
                                                                f._codigo,
                                                                f._denominacion,
                                                                f._tipoDeFertilizante,
                                                                f._fechaDeRegistro.fixDate(),
                                                                f._fechaEntrada.fixDate(),
                                                                f._literalTipo,
                                                                f._state == 'D' ? '<div class="estado Desestimada">Desestimada</div>' : '');                                                
                            }, ''));        
    $('.check', __container).forEach( function(e){ e.onclick = __onCheck; });
    $('.row_edit', __container).forEach( function(e){ e.onclick = __onRowClick; });    
    __btnOpen.disabled     = true;
    __btnDelete.disabled   = true;
    __btnReassign.disabled = true;
    __btnCommit.disabled   = true;
    _$Fabricante.Checked_sol = [];
    __updateStatus();
  }

  // ======================================================================================
  // Obtener las solicitudes del fabricante
  // ======================================================================================
  function __loadData(sender){
    if(_$Fabricante.solicitudes_loaded) return;
    __container.innerHTML = '{0}<tbody>{1}</tbody></table>'.format(__header, __row_header);
    __container.style.backgroundImage = 'url(../img/bg-wait.gif)';  
    setTimeout( function(){      
      var params = 'accion=getitems&Id={0}'.format(_$Fabricante._id);                      
      $Ajax.Post("../JSon/Solicitud.ashx", params, function(o){                                                              
        __container.style.backgroundImage = '';
        var respuesta = MAPA.tryParse(o); 
        if (respuesta.Resultado != 'OK'){
          __container.innerHTML = respuesta.Mensaje;                          
        }else{             
          __handleResponse(respuesta);
        } 
      });
      }, 200);
    _$Fabricante.Solicitudes = true;
  }
  
  // ===================================================================================================================================
  // Asociar a cada solicitud los datos del fertilizante
  // ===================================================================================================================================
  function __handleResponse(response){
    
    _$Fabricante.Expedientes    = MAPA.toDictionary(response.Expedientes, 'id');
    var __Fertilizantes  = MAPA.toDictionary(response.Fertilizantes, '_id');
    _$Fabricante.Solicitudes    = 
    __dsSolicitudes             = response.Solicitudes
                                          .Where(function(s){ 
                                            return s._tipo == 'I' || response.EnPropiedad.indexOf(s._idFertilizante) >- 1; 
                                          })
                                          .SortBy('_id') 
                                          .map( function(s){                                          
                                            s._literalTipo        = __tipos[s._tipo];                                                                                 
                                            s._tipoDeFertilizante = '{_codigo} - {_descripcion}'.format(_tiposDeFertilizantes[s._idAbono]);
                                            s._codigo             = s._tipo == 'I' ? '' : __Fertilizantes[s._idFertilizante]._codigo;
                                            s._state              = s._fechaLimite == '01/01/2000 00:00:00 000' ? 'D' : ''
                                            s._expediente         = _$Fabricante.Expedientes[s._id].expediente;
                                            s.ProductoRegistrado  = {};
                                            return s;
                                          });
    _$Fabricante.solicitudes_loaded = true;
    __initTable();    
  }

  MAPA.Solicitudes.onExpand               = __initModule;
  MAPA.Solicitudes.onUpdateItem           = MAPA.Solicitudes.onUpdateItem || MAPA.emptyFn;
  MAPA.Solicitudes.DocumentsLoader        = MAPA.emptyFn;
  MAPA.Solicitudes.QuelantesListLoader    = MAPA.emptyFn;
  MAPA.Solicitudes.ComplejantesListLoader = MAPA.emptyFn;
  MAPA.Solicitudes.MateriasPrimasLoader   = MAPA.emptyFn;
  MAPA.Solicitudes.MicorrizasLoader       = MAPA.emptyFn;
  MAPA.Solicitudes.SedeLoader             = MAPA.emptyFn;
  MAPA.Solicitudes.ShowSolicitud          = __open;
  MAPA.Solicitudes.ExecuteCommand         = function(cmd){if(cmd && __commands[cmd.name||cmd]) return __commands[cmd.name||cmd](cmd); };

})();

