// ==================================================================================================================================================
//  textFileViewer
// ==================================================================================================================================================
(function (module){ 
  var __counter = 0;      
  var __template = '<div class="scv_overlayText"></div><div class="scv_overlayLine"></div>' + 
                    '<div class="scv_Main">' +
                    '  <pre class="scv_LineContainer" id="svc_{0}_line"></pre>' +      
                    '  <pre class="scv_TextContainer" id="svc_{0}_code"></pre>' +                          
                    '</div>';  
  function __scrollOverlays(){          
    this.parentNode.querySelector('.scv_overlayText').style.left = '{0}px'.format(-this.scrollLeft);  
    this.parentNode.querySelector('.scv_overlayLine').style.left = '{0}px'.format(-this.scrollLeft); 
  } 
  function __createControl(text, onLineClick) {         
    var __control = module.New('div', { className : 'svc_viewer reduced', 
                                       id        : 'svc_{0}'.format(++__counter), 
                                       innerHTML : __template.format(__counter) }); 
    __control.querySelector('.scv_Main').onscroll = __scrollOverlays;
    __control.SetLines = function(value){
      var __i=0;
      __control.querySelector('.scv_LineContainer').innerHTML = (value + '\r\n').replace(/(.*)\r\n|\r|\n/mg, function(){ return ++__i + '<br/>';} ); 
      if(onLineClick){
        __control.querySelector('.scv_TextContainer').innerHTML = (value + '\n').replace(/^(.*)\r\n|\r|\n/gim, '<span>$1</span><br/>');
      }else{
        __control.querySelector('.scv_TextContainer').innerHTML = (value + '\n').replace(/\r\n|\r|\n/gim, '<br/>');
      }
      return  __control;
    }         
    return (text) ? __control.SetLines(text) : __control;
  }             
  module.textFileViewer = { createControl : __createControl };            
})(MAPA);

// =======================================================================================================================================================
// Editable grid
// =======================================================================================================================================================
(function (module){

  function __makeEditable(table, divs){

    var __events = { onChange : new module.core.Event('editableGrid.onChange'),
                     onFocus  : new module.core.Event('editableGrid.onFocus')  };

    table._currentIndex   = -1;
               
    // ============================================
    // Onfocus
    // ============================================
    function __onfocus(e){
      var __div = e.target;
      var __td  = __div.parentNode;
      var __tr  = __div.parentNode.parentNode; 
      table._old = __div.textContent.trim();
      table._currentIndex = __tr.rowIndex;
      __events.onFocus.Dispatch({ tr  : __tr, 
                                  td  : __td, 
                                  div : __div }); 
    } 
    // ===============================================================
    // Onblur
    // ===============================================================
    function __onblur(e){          
      var __div = e.target;
      var __td = __div.parentNode;
      var __tr = __div.parentNode.parentNode;       
      if( table._old != undefined && table._old != __div.textContent.trim()){
        __events.onChange.Dispatch({ tr  : __tr, 
                                     td  : __td, 
                                     div : __div, 
                                     previous : table._old });            
        delete table._old;                
      };     
    }        
    // =========================================================
    // Divs editables
    // =========================================================
    function __addHandlers(divs){
      Array.prototype.forEach.call(divs, function(e){
        e.onblur  = __onblur;
        e.onfocus = __onfocus;  
      });
    }   
    __addHandlers(divs || table.querySelectorAll('tr.editable-row div'))
    // =========================================
    // onkeypress : Evitar multiples líneas
    // =========================================
    table.onkeypress = function(e){                            
      if(e.keyCode==13){                   
        if(e.preventDefault) e.preventDefault();        
        return false;      
      }    
    }     
    // =======================================================================================================================
    // onkeydown : Cambio de celda activa
    // =======================================================================================================================
    table.onkeydown = function(e){
      var __res = true;
      var __sender = e.target;
      if(__sender.tagName=='DIV' && [13, 37, 38, 39, 40].indexOf(e.keyCode) > -1){           
        var __td  = __sender.parentNode;
        var __row = __sender.parentNode.parentNode; 
        var __pos = window.getSelection().getRangeAt(0).startOffset;            
        var __focus = function(t, r, c) {
          e.preventDefault();
          try{t.rows[r].cells[c].firstChild.focus();} catch(e){}
          __res = false;
        };
        if (e.keyCode == 13)                                         __focus(this, __row.rowIndex, __td.cellIndex+1);
        if (e.keyCode == 38 && __row.rowIndex > 1)                   __focus(this, __row.rowIndex-1, __td.cellIndex);  // Up
        if (e.keyCode == 40 && __row.rowIndex < this.rows.length-1)  __focus(this, __row.rowIndex+1, __td.cellIndex);  // Down                         
        if (e.keyCode == 39 && __pos == __sender.textContent.length) __focus(this, __row.rowIndex, __td.cellIndex+1);
        if (e.keyCode == 37 && __pos == 0)                           __focus(this, __row.rowIndex, __td.cellIndex-1);
      }
      return __res;
    } 
    return { addHandlers : __addHandlers, events : __events };
  }

  module.editableGrid = { makeEditable   : __makeEditable };

}(MAPA));
