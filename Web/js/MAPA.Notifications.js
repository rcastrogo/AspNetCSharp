
(function(m){
  var __export = m.NofificationManager || {};  
  
  __export.load = function(callback){
    __export.items = [];
    var __url = '/{0}/JSon/Messenger.ashx'.format(__export.fn.appName);
    $Ajax.Post(__url, 'accion=notifications.getitems', function(o){
      var __r = MAPA.tryParse(o); 
      if (__r.Resultado != 'OK'){
        __export.items = __r;
        if(callback) callback();
      }      
    });  
  }

  __export.loadGroups = function(userid, callback){    
    var __url = '/{0}/JSon/Messenger.ashx'.format(__export.fn.appName);
    var __params = 'accion=notifications.getgroupsinfo&userid={0}'.format(userid);
    $Ajax.Post(__url, __params, function(o){
      var __r = MAPA.tryParse(o); 
      if (__r.Resultado == 'OK'){        
        callback(__r);
      }else{
        callback({});
      }      
    });  
  }

  __export.loadMessages = function(userid, mode,callback){    
    var __url = '/{0}/JSon/Messenger.ashx'.format(__export.fn.appName);
    $Ajax.Post(__url, 'accion=notifications.getitems', function(o){
      var __r = MAPA.tryParse(o); 
      if (__r.Resultado != 'OK'){
        if(callback) callback(__r);
      }      
    }); 
  }

  __export.changeMembership = function(userId, id, append, callback){  
    var __url    = '/{0}/JSon/Messenger.ashx'.format(__export.fn.appName);
    var __params = 'accion=notifications.changemembership&userid={0}&id={1}&mode={2}'
                   .format(userId, id, append ? 'add' : 'remove');
    $Ajax.Post(__url, __params, function(o){
        callback(MAPA.tryParse(o));            
    });  
  }

  __export.addGroup = function(name, callback){  
    var __url    = '/{0}/JSon/Messenger.ashx'.format(__export.fn.appName);
    var __params = 'accion=groups.add&name={0}'.format(name);
    $Ajax.Post(__url, __params, function(o){ callback(MAPA.tryParse(o)); });  
  }

  __export.codeGroups = function(callback){  
    var __url    = '/{0}/JSon/Messenger.ashx'.format(__export.fn.appName);
    var __params = 'accion=groups.code';
    $Ajax.Post(__url, __params, callback);  
  }

  __export.fn = { 
    appName    : window.location.pathname.split('/')[1],
    formatId   : function(id){ return 'entry-{0}'.format(id);},
    formatLink : function(link, p, a){
      if(link){
        a.innerHTML = 'Abrir enlace';
        return '/{0}{1}'.format(__export.fn.appName, link);
      }
      a.style.display = 'none';
      return '';
    },
    formatBody : function(body, p, a){
     return body.replace(/~\/([^\s]+)/mg, ' <a href="/{0}/$1" target="_blank"> $1 </a> '.format(__export.fn.appName))
                .replace(/(http[s]?:\/\/[^\s]+)/mg, ' <a href="$1" target="_blank"> $1 </a> ')
                .replace(/\n/gm,'<br />');
    }
  }
       
  __export.populatePanel = function(panel, hidePanelfn){
    
    function __updateCounter(){
      var __l = document.querySelector('#RToolBar1 .notification-length');
      __l.innerHTML     = __export.items.length.toString();
      __l.style.display = __export.items.length ? 'inline-block' : 'none';
    }

    function __createTemplate(){    
      return $.$('div', { innerHTML : '<div class="delete-btn">X</div>' +
                                      '<div class="msg-subject" xbind="innerHTML:Subject"></div>' +
                                      '<div class="msg-date" xbind="innerHTML:SentAt"></div>' +
                                      '<div class="msg-from" xbind="innerHTML:Source"></div>' +
                                      '<p class="msg-body" xbind="innerHTML:Body MAPA.NofificationManager.fn.formatBody"></p>' +
                                      '<a class="msg-link" xbind="href:Data MAPA.NofificationManager.fn.formatLink" target="blank"></a>',
                          xbind     : 'id:RecipientId MAPA.NofificationManager.fn.formatId',
                          className : 'item' });   
    }

    function __deleteEntry(){    
      var __e  = this.parentNode;      
      var __id = __e.id.split('-')[1];                  
      $Ajax.Post('/{0}/JSon/Messenger.ashx'.format(__export.fn.appName), 'accion=delete&id={0}'.format(__id), function(o){
        var __r = MAPA.tryParse(o); 
        if (__r.Resultado != 'OK') return MAPA.Layer.ShowError({ Message : __r.Mensaje, OnClose : MAPA.Layer.Hide});        
        __e.innerHTML   = '';
        __e.style.width = '4.5em';
        __e.style.backgroundColor = 'gray';      
        __export.items = __export.items.Where( function(e){ return e.RecipientId != __id});
        setTimeout(function(){  
          var __c = __e.parentNode;
          __c.removeChild(__e);
          __updateCounter();
          if(!__c.childNodes.length) hidePanelfn();
        }, 400)         
      });   
    }
    
    setTimeout(function(){ 
      if(panel.innerHTML) return;     
      panel.innerHTML = m.CreateStringBuilder()
                         .append('<div class="UI-container"><h2>Notificaciones</h2>')
                         .append('<div class="UI-container-list">')
                         .append(MAPA.templates.execute(__createTemplate(), __export.items, true))
                         .append('</div></div>')
                         .toString();
      m.toArray(panel.querySelectorAll('.delete-btn'))
       .forEach( function(b){ b.onclick = __deleteEntry; });
    }, 100);
    panel.style.height = '30em';
  }
  
  m.NofificationManager = __export;

}(MAPA));
