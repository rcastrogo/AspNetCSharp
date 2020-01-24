
(MAPA._KeyEvents = function(){
    var _that = { };      
    function __keyCheck(e){
      if(MAPA.__OnTopDialog) return;
      var __src  = MAPA.MapaEvent(e).Target;
      while(__src){
        if(__src.id=='SearchContainer') return; 
        __src = __src.parentNode;       
      }    
      var KeyID = (window.event) ? event.keyCode : e.keyCode;
      if( window.OnKeyPressHandler &&  window.OnKeyPressHandler(KeyID)) return; 
      if (KeyID==45) window.ShowDlg();
      if (KeyID==46) window.Borrar();            
    } 
    var _enabled = false;
    _that.EnableEvents = function(){
      if(!_enabled){
        MAPA.AddEvent(document,'keyup',__keyCheck)
        _enabled = true;        
      } 
      return _that;     
    }      
    _that.DisableEvents = function (){
      MAPA.RemoveEvent(document,'keyup',__keyCheck);
      _enabled = false;
      return _that;
    }
    var __dialog;
    var __handlers;
    var __onDlgKeyPress = function (e){ 
      if(!MAPA.__OnTopDialog ){
        var KeyID = (window.event) ? event.keyCode : e.keyCode;        
        if (KeyID==27 && __dialog)(__handlers && __handlers["27"] ? __handlers["27"] : __dialog.BtnCancel.onclick)();
        if (KeyID==13 && __dialog)(__handlers && __handlers["13"] ? __handlers["13"] : __dialog.BtnAcept.onclick)();
      }
      return _that;
    };     
    _that.EnableDialogEvents = function(dlg, o){
      __dialog = dlg;
      __handlers = o;
      MAPA.AddEvent(document,'keyup',__onDlgKeyPress)
      return _that;
    }
    _that.DisableDialogEvents = function(){
      __dialog=false;
      MAPA.RemoveEvent(document,'keyup',__onDlgKeyPress);
      return _that;
    }        
    return _that;
}());

MAPA.tryParse = function(expr){ try { return JSON.parse(expr); } catch (er) { return { Resultado : 'Error', Mensaje : er.message};}; }

MAPA.__show_user_panel = function(){ return _userId.toUpperCase() == '04179642J'; };


// =====================================================================================================
// MAPA.WSAdmin
// =====================================================================================================
(function(m){
   
  var _that = {};
  var _data = {};
  var _current = undefined;
  var _translationTable = { 'AN' : '01', 'AR' : '02', 'AS' : '03', 'BA' : '04', 'CA' : '09', 'CB' : '06', 
                            'CE' : '18', 'CL' : '07', 'CM' : '08', 'CV' : '10', 'EX' : '11', 'GA' : '12', 
                            'IC' : '05', 'MA' : '13', 'ME' : '19', 'MU' : '14', 'NA' : '15', 'PV' : '16', 'RI' : '17' };

  function __loadData(nif, container, item){
    _current = nif;
    var __data   = { services : [], properties : [] };
    var __tables = container.querySelectorAll('.data-table'); 
    var __div_properties = container.querySelector('.user-properties');
    var __div_services   = container.querySelector('.user-services');
        
    var __load_poperties = function(callbackfn){
      var __params = 'accion=getitems&target=property&id={0}&mode=nif'.format(nif);
      $Ajax.Post("JSon/WSAdmin.ashx", __params, function(o){                
        var respuesta = MAPA.tryParse(o); 
        if (respuesta.Resultado != 'OK'){            
          __tables[0].style.display = 'none';             
          __div_properties.innerHTML = respuesta.Mensaje;
        }else{
          __data.properties = respuesta.UserPoperties.SortBy('_propertyName');
          __data.userId     = respuesta.id;
          __load_services(callbackfn);                  
        }
      });
    }

    var __load_services = function(callbackfn){
      var __params = 'accion=getitems&target=service&id={0}'.format(__data.userId);
      $Ajax.Post("JSon/WSAdmin.ashx", __params, function(o){                
        var respuesta = MAPA.tryParse(o); 
        if (respuesta.Resultado != 'OK'){           
          __tables[1].style.display = 'none';
          __div_services.innerHTML  = respuesta.Mensaje;
        }else{
          __data.services = respuesta.Services.SortBy('_serviceUrl');
        }
        callbackfn();
      });
    }

    __load_poperties(function(){
      _data[nif] = { id         : __data.userId,
                     regeus     : item, 
                     services   : __data.services, 
                     properties : __data.properties, 
                     tables     : __tables, 
                     containers : [__div_properties, __div_services]};  
      __populate_data(_data[nif]);
      // =======================================
      // Onfocus
      // =======================================
      function __onfocus(e){
        var __div = e.target;
        var __td  = __div.parentNode;
        var __tr  = __div.parentNode.parentNode;       
        __div._old = m.InnerText(__div);   
        __div.style.fontWeight = 'bold';
      } 
      // ===================================================================
      // Onblur
      // ===================================================================
      function __onblur(e){          
        var __div = e.target;
        var __td = __div.parentNode;
        var __tr = __div.parentNode.parentNode;       
        if( __div._old != undefined && __div._old != m.InnerText(__div)){
          __div.textContent =  __div.innerText = __div.innerText = m.InnerText(__div);             
          delete __div._old;                
        }; 
        __div.style.fontWeight = '';
      }
      // =====================================================================================
      // Divs editables
      // =====================================================================================
      Array.prototype.forEach.call(container.querySelectorAll('.data-table div'), function(e){
        e.onblur  = __onblur;
        e.onfocus = __onfocus;  
      });
    });     
    
    // =========================================
    // onkeypress : Evitar multiples líneas
    // =========================================
    __tables[0].onkeypress = 
    __tables[1].onkeypress = function(e){          
      if(e.keyCode==13){                   
        if(e.preventDefault) e.preventDefault();
        return false;      
      }    
    }
  }

  function __populate_data(o){
    var __divs  = o.tables[0].querySelectorAll('div');
    m.toArray(__divs).forEach( function(d){ d.textContent = d.innerText = ''; });
    var __index = 0;
    if(o.id == 0){
      __divs[0].textContent = __divs[0].innerText = 'Apellidos';
      __divs[1].textContent = __divs[1].innerText = '{0} {1}'.format(o.regeus.apellido1Field, o.regeus.apellido2Field).trim();
      __divs[2].textContent = __divs[2].innerText = 'CA';
      __divs[3].textContent = __divs[3].innerText = o.regeus.idAutonomiaField ? _translationTable[o.regeus.idAutonomiaField] : '';
      __divs[4].textContent = __divs[4].innerText = 'Nombre';
      __divs[5].textContent = __divs[5].innerText = o.regeus.nombreField;
    }else{
      o.properties.forEach( function(p){
        __divs[__index].textContent = __divs[__index].innerText = p._propertyName;
        __index++; __divs[__index].textContent = __divs[__index].innerText = p._propertyValue;
        __index++; 
      });    
    }
    __divs = o.tables[1].querySelectorAll('div');
    m.toArray(__divs).forEach( function(d){ d.textContent = d.innerText = ''; });
    if(o.id == 0){
      __divs[0].textContent =  __divs[0].innerText = '*';
    }else{
      o.services.forEach( function(s, i){
        __divs[i].textContent =  __divs[i].innerText = s._serviceUrl;                   
      });
    }   
  }

  _that.initPanel = function(nif, container, item){         
    if(container.__ui) return;
    container.__ui = true;
    container.innerHTML = '<div class="c1"><div class="T1">Propiedades </div><div class="user-properties">{0}</div></div><div class="c1"><div class="T1">Servicios web</div><div class="user-services">{1}</dic></div>'
                          .format([1,2,3,4,5,6,7].reduce( function(sb){
                                                        return sb.append('  <tr><td><div contenteditable></div></td><td><div contenteditable></div></td></tr>');
                                                      }, m.CreateStringBuilder()
                                                          .append( '<table class="data-table">')
                                                    ).append('</table>')
                                                     .toString(), 
                                  [1,2,3,4,5,6,7].reduce( function(sb){
                                                        return sb.append('  <tr><td><div contenteditable></div></td></tr>');
                                                      }, m.CreateStringBuilder()
                                                           .append( '<table class="data-table">')
                                                    ).append('</table>')
                                                     .toString());
    __loadData(nif, container, item);
  }

  _that.save = function(){
    var __bag = _data[_current];
    var __properties = m.toArray(__bag.tables[0].rows)
                        .Where( function(row){
                          row.__divs = row.querySelectorAll('div');
                          return m.InnerText(row.__divs[0]).trim().length ||
                                 m.InnerText(row.__divs[1]).trim().length;
                        }).map( function(row){
                          return '{0}:{1}'.format(m.InnerText(row.__divs[0]).trim(), 
                                                  m.InnerText(row.__divs[1]).trim());
                        });
    var __services = m.toArray(__bag.tables[1].rows)
                      .Where( function(row){
                        row.__div = row.querySelector('div');
                        return m.InnerText(row.__div).trim();
                      }).map( function(row){
                        return m.InnerText(row.__div).trim();
                      });
    var __requestData = { send : !(__bag.services.length   == 0 && __services.length   == 0) ||
                                 !(__bag.properties.length == 0 && __properties.length == 0), 
                          data : { properties : __properties, 
                                   services   : __services } };
    if(__requestData.send){        
      m.Layer.ShowInfo('Grabando datos...');
      var params = 'accion=save&target=user-data&id={0}&properties={1}&services={2}&nif={3}'
                    .format(__bag.id, 
                            JSON.stringify(__requestData.data.properties),
                            JSON.stringify(__requestData.data.services),
                            __bag.id ? '' : __bag.regeus.nifField);           
      $Ajax.Post("JSon/WSAdmin.ashx", params, function(o){                                                              
        m.Layer.Hide();                                                             
        var respuesta = MAPA.tryParse(o); 
        if (respuesta.Resultado != 'OK')  return m.Layer.ShowError({ Message : respuesta.Mensaje, OnClose : m.Layer.Hide});            
        __bag.properties = respuesta.properties.SortBy('_propertyName'); 
        __bag.services   = respuesta.services.SortBy('_serviceUrl');
        __bag.id         = respuesta.id;
        __populate_data(__bag);
      });                    
    }
  }
      
  m.WSAdmin = _that;    
  
}(MAPA));


(function(m){

  if(!m.__show_user_panel()) return;
  
  var _that = {};

  _that.renderRegeus = function(sender, item, callback){
    var sb = m.CreateStringBuilder()
              .append('<div class="tag" style="padding:1em 2em">')
              .append('<input class="regeus-toogle-btn" type="button" value="📤" />')
              .append('<span class="regeus-name">{0} {1} {2} {3}</span>'.format(item.nifField, item.nombreField, item.apellido1Field, item.apellido2Field).trim())
              .append('<br /><span class="regeus-ca">{0}</span>'.format(_CCAA.GetCaDescription(item.idAutonomiaField)))
              .append('<br /><span class="regeus-email">{0}</span> '.format(item.emailField));
    if(item.telefono1Field || item.telefono2Field){
      sb.append('<br /><span class="regeus-telefono">{0}</span>'.format((item.telefono1Field + ' ' + item.telefono2Field).trim().replace(' ', ' y ')));
    }
    if(item.fechaCambioClaveField){
      sb.append('<br /><span class="regeus-fecha">Cambio de clave : {0}</span>'.format(item.fechaCambioClaveField));
    }
    sb.append('</div>')
      .append('<div class="tag">')
      .append('<div class="h">Grupos de Regeus</div>')
      .append('<div id="regeus-roles-container"><ul>')
      .append( item.rolesField
                   .OrderBy( function(e){ return e; })
                   .reduce ( function(sb, rol){
                     sb.append('<li>{0}</li>'.format(rol));
                     return sb; 
                   }, m.CreateStringBuilder())
                   .toString()
                   )    
      .append('</ul></div></div>');
    callback(sb.toString());
  }

  _that.renderAppGroups = function(sender, item, callback){
    var sb = m.CreateStringBuilder() 
              .append('<div class="tag">')
              .append('<div class="h">Grupos de la aplicación <input class="add-group-btn" type="button" value="+"><input class="code-group-btn" type="button" value="#"></div>')
              .append('<div id="app-group-container"></div>')
              .append('</div>')
              .append('<div class="tag">')
              .append('<div class="h">Configuración</div>') 
              .append('<div class="user-data" style="display: block;"></div>')
              .append('<div class="toolbar"><input class="regeus-save-btn" type="button" value="Grabar" /></div>')
              .append('</div>')
    callback(sb.toString(), __handle);
  }

  function __handle(sender, item, div){
    var __container    = div.querySelector('#app-group-container');
    var __ws_container = div.querySelector('.user-data');   
    
    (function(){
      
      var __onAddGroup  = function(){

        function __send(dlg){
          m.Layer.ShowInfo('Enviando datos...');
          var __name   = dlg.Element.querySelector('#txtGroupName').value;
          m.NofificationManager.addGroup(__name, function(e){
            m.Layer.Hide();
            if(e.Resultado=="Error") return m.Layer.ShowError({ Message : e.Mensaje});
            __container.appendChild( $.$('div', { className : 'selectable-group', 
                                                  innerHTML : '<input type="checkbox" id="sel-group-{0}"/><label for="sel-group-{0}"> {1}</label></div>'
                                                              .format(e.GroupId, __name)}));
            var __checkBox     = __container.querySelector('#sel-group-{0}'.format(e.GroupId));
            __checkBox.data    = { _id : e.GroupId, _name : __name };
            __checkBox.onclick = __onGroupChanged;   
            dlg.Close();
          });
          return true;
        }
        var __Dlg = m.Layer.ShowConfirm({ Title         : 'Nuevo grupo', Height: '127', Width: '310',                                      
                                          BeforeConfirm : __send,
                                          OnTerminate   : function() { m._KeyEvents.DisableDialogEvents().EnableEvents(); m.Layer.Hide(); }
                                        });    
        m._KeyEvents.DisableEvents().EnableDialogEvents(__Dlg, { "27" : __Dlg.BtnNo.onclick });
        __Dlg.Body.className = 'W1-Body';
        __Dlg.BtnNo.value = 'Cancelar';    
        __Dlg.BtnYes.value = 'Crear';
        __Dlg.BtnYes.style.width = '33%';
        __Dlg.BtnNo.style.width = '33%';
        __Dlg.Body.innerHTML = m.CreateStringBuilder()
                                .append('<div style="padding: 5px 10px">')
                                .append('  <label class="fcap" for="txtGroupName">Nombre</label>')
                                .append('  <input type="text" id="txtGroupName" value="" style="width:99%;">')              
                                .append('</div>');
        __Dlg.Body.querySelector('#txtGroupName').focus();
      }
      
      var __onGroupChanged = function(){
        var __sender = this;
        var __append = __sender.checked;
        var __ref_id = __append ? __sender.data._id : __sender.data._memberId ;
        m.NofificationManager.changeMembership(item.nifField, __ref_id, __append, function(e){
          if(__append){
            if(e.Resultado=="Error"){
              __sender.checked = false;
              return m.Layer.ShowError({ Message : e.Mensaje, OnClose : m.Layer.Hide});
            }
            __sender.data._memberId = e.membership._id;
          }else{
            delete __sender.data._memberId;           
          }          
        });
      }

      m.Include('js/MAPA.Notifications.js', function(){
        m.NofificationManager.loadGroups(item.nifField, function(data){
          __container.innerHTML = data.grupos.reduce( function(sb,g){
                                    return sb.append('<div class="selectable-group"><input type="checkbox" id="sel-group-{0}"/><label for="sel-group-{0}"> {1}</label></div>'.format( g._id, g._name));
                                  }, m.CreateStringBuilder()).toString();
          m.toArray(__container.querySelectorAll('input'))
           .forEach( function(e, i){
              e.data = data.grupos[i];
              var __member = data.values.Item('_groupId',  e.data._id)
              if(__member) e.data._memberId = __member._id;              
              e.checked = e.data._memberId;
              e.onclick = __onGroupChanged;
          });
          div.querySelector('.add-group-btn').onclick  = __onAddGroup;
          div.querySelector('.code-group-btn').onclick = function(){
            m.NofificationManager.codeGroups( function(s){ console.log(s);});
          };
          m.WSAdmin.initPanel(item.nifField, __ws_container, item);          
        });                 
      });  
      
    }());

    div.querySelector('.regeus-save-btn').onclick = function(){
      m.WSAdmin.save();
    }

    _that.toogleButton = div.querySelector('.regeus-toogle-btn');
    _that.toogleButton.onclick = function(){
      if(_that.toogleButton.value=='📤'){
        _that.toogleButton.value = '📥';
        div.style.top = '0px';
        div.__h = div.style.height;
        div.style.height = '';
        div.style.borderTop = 'none';      
      }else{
        _that.toogleButton.value = '📤';
        div.style.top = '';
        div.style.height =  div.__h;
        div.style.borderTop = '';
      }
    };
  }

  m.regeusAdmin = _that;  
}(MAPA));


(function(m){
  
  if(!m.__show_user_panel()) return;
  
  m.regeusAdmin =  m.regeusAdmin || { };
  
  m.regeusAdmin.initButtons = function(sender){ 
    // _userRoleNames = 'Administrador, Administrador CA, Grabador CA, Consulta');    
    sender.BtnMessenger = $.$('div', { className : 'btn', title : 'Enviar mensaje...',
                                       style     : { background : 'url("img/spritesheet2.png") -93px 0px no-repeat transparent' }
                                     });
    sender.BtnMessenger.Action = __showSendMessageDialog;
    sender.CustomButtons.Buttons.push(sender.BtnMessenger);
    sender.CustomButtons.Zero.Disabled = [0, 1, 2];
    sender.CustomButtons.One.Enabled   = [0, 1, 2];
    sender.CustomButtons.More.Disabled = [1];
  }

  m.regeusAdmin.initContextMenu = function(sender){
    sender.ContextMenu.AddMenuItem(new m.ContextMenuItem({ Text      : '-' }));                                         
    sender.ContextMenu.AddMenuItem(new m.ContextMenuItem({ Text      : 'Enviar mensaje...', 
                                                           OnClick   : function(){ __showSendMessageDialog(sender); }, 
                                                           className : 'mnu_email' }));
  }

  m.regeusAdmin.onContextMenu = function(sender, items){
    switch (items) {
      case 0:
        m.ListView.UIManager.Disable(sender.ContextMenu.MenuItems[10].Element);
        m.ListView.UIManager.Disable(sender.ContextMenu.MenuItems[11].Element);
        m.ListView.UIManager.Disable(sender.ContextMenu.MenuItems[13].Element);
        break;
      case 1:
        m.ListView.UIManager.Enable(sender.ContextMenu.MenuItems[10].Element);
        m.ListView.UIManager.Enable(sender.ContextMenu.MenuItems[11].Element);
        m.ListView.UIManager.Enable(sender.ContextMenu.MenuItems[13].Element);
        break;
      default:
        m.ListView.UIManager.Enable(sender.ContextMenu.MenuItems[10].Element);
        m.ListView.UIManager.Disable(sender.ContextMenu.MenuItems[11].Element);
        m.ListView.UIManager.Enable(sender.ContextMenu.MenuItems[13].Element);
    }
  }

  m.regeusAdmin.decorateListView = function(sender){
    m.regeusAdmin.panel = $.$('div', { className : 'regeus-panel', id : "CustomPanel",
                                       style     : { position : 'absolute', bottom : '2.6em', left : '0', right : '0', height : '0',
                                                     display  : 'none' }
                                     });          
    sender.Body.parentNode.insertBefore(m.regeusAdmin.panel, sender.Footer);         
  }

  m.regeusAdmin.decorateUserUI = function(sender, item, div){
    //console.log('MAPA.regeusAdmin.decorateUserUI : ' + item.nifField);
    return div;
  }

  m.regeusAdmin.decorateGroupUI = function(sender, div){
    //console.log('MAPA.regeusAdmin.decorateGroupUI : ' + div.id);    
  }
  
  m.regeusAdmin.onResizeUI = function(sender){
    m.regeusAdmin.panel.style.display = m.regeusAdmin.panel.visible ? 'block' : 'none';
    if( m.regeusAdmin.panel.visible){
      var __h = (sender.Body.parentNode.clientHeight - 50) / 2;
      sender.Body.style.height         = '{0}px'.format(__h);
      if(m.regeusAdmin.toogleButton) m.regeusAdmin.toogleButton.value = '📤';
      m.regeusAdmin.panel.style.height = '{0}px'.format(__h);
      m.regeusAdmin.panel.style.top = '';      
      m.regeusAdmin.panel.style.borderTop = '';
    }else{
      sender.Body.style.height = '';
    }   
  }

  m.regeusAdmin.onSelectedChange = function(sender){
    m.regeusAdmin.panel.visible = sender.SelectedItemsCount > 0;
    m.regeusAdmin.onResizeUI(sender)
    if(sender.SelectedItemsCount){ 
      var __html = '';
      var __item = sender.SelectedItem;      
      m.regeusAdmin.renderRegeus   (sender, __item, function(html){ __html = html; });
      m.regeusAdmin.renderAppGroups(sender, __item, function(html, onDomCreated){
        m.regeusAdmin.panel.innerHTML = __html + html;       
        onDomCreated(sender, __item, m.regeusAdmin.panel);
        __item.Element.scrollIntoView();
      });      
    }else{
      m.regeusAdmin.panel.innerHTML = '';
    }    
  }
  
  function __showSendMessageDialog(sender){
    if(!sender.SelectedItemsCount) return;
    var __from  = $('UserNameContainer').querySelectorAll('span')[1].textContent.replace(' Cerrar sesión','');
    var __ids   = sender.SelectedItems().map(function(u){ return u.nifField; }).join(',');
    var __names = sender.SelectedItems().map(function(u){ return '<b>{0}</b> <i>{1} {2} {3}</i>'.format( u.nifField, u.nombreField, u.apellido1Field, u.apellido2Field).trim(); })
                                        .join(', ');   
    
    function __params(dlg){
      return 'accion=notifications.send&ids={0}&userid={1}&from={2}&subject={3}&message={4}'
             .format(__ids, 
                     _userId, 
                     dlg.Body.querySelector('#txtFrom').value, 
                     dlg.Body.querySelector('#txtSubject').value, 
                     dlg.Body.querySelector('#txtMessage').value);
    }
    
    function __send(dlg){       
      m.Layer.ShowInfo('Enviando datos...');          
      $Ajax.Post('JSon/Messenger.ashx', __params(dlg), function(o){ 
        m.Layer.Hide();                                            
        var __res = MAPA.tryParse(o);                                                                                      
        if (__res.Resultado != 'OK') { 
          m.Layer.ShowError(__res.Mensaje);           
        }else{
          dlg.Close();
        }               
      });  
      return true;
    }

    var __Dlg = m.Layer.ShowConfirm({ Title         : 'Envío de mensajes', Height: '330', Width: '400',                                      
                                      BeforeConfirm : __send,
                                      OnTerminate   : function() { m._KeyEvents.DisableDialogEvents().EnableEvents(); m.Layer.Hide(); }
                                    });    
    var sb = m.CreateStringBuilder();
    sb.append('<div class="msg-dlg-container">')
      .append('  <div class="img"></div>')
      .append('  <label class="fcap" for="txtFrom">De</label>')
      .append('  <input type="text" id="txtFrom" value="{0}">'.format(__from))
      .append('  <label class="fcap">Para</label>')
      .append('  <pre style="height:7em;">{0}</pre>'.format(__names))      
      .append('  <label class="fcap" for="txtSubject">Asunto</label>')
      .append('  <input type="text" id="txtSubject" >')      
      .append('  <label class="fcap" for="txtMessage">Mensaje</label>')
      .append('  <textarea type="text" id="txtMessage" style="height:7em;"></textarea>')    
      .append('</div>');
    
    __Dlg.Body.className = 'W1-Body';
    __Dlg.Body.innerHTML = sb.toString(); 
    __Dlg.BtnNo.value = 'Cancelar';    
    __Dlg.BtnYes.value = 'Enviar';
    __Dlg.BtnYes.style.width = '23%';
    __Dlg.BtnNo.style.width = '23%';

    m._KeyEvents.DisableEvents().EnableDialogEvents(__Dlg, { "27" : __Dlg.BtnNo.onclick });        
  }
    

}(MAPA));

document.getElementsByTagName('head')[0].appendChild($.$('link', { rel   : 'stylesheet', 
                                                                   type  : 'text/css', 
                                                                   href  : 'css/Custom.css', 
                                                                   media : 'all' }));


 