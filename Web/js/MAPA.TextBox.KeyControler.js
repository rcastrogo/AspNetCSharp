/// <reference path="MAPA.js" />
//<% if false then %><script src="../js/MAPA.TextBox.KeyControler–vsdoc.js" type="text/javascript"></script><% End If%>


MAPA.TextBoxKeyControler = function(o){ 
  /// <field name="Element" domElement="true">TEl Elemento DOM (caja de texto).</field>        
  /// <field name="Interval" type="Number" integer="true">Numero de milisegundos.</field>  
  /// <field name="MinLength" type="Number" integer="true">Numero de caracteres a partir del cual se notifican cambios.</field>
  /// <field name="OnSearch" type="Function">Funcion a la que notificar los cambios en la caja de texto.</field>
  /// <field name="OnClear" type="Function">Funcion a la que notificara cuando la longitud sea menor que MinLength.</field>
  ///	<summary>
  ///		Objeto que supervisa el contenido de una caja de texto cada cierto tiempo y notifica cuando
  ///   ha cambiado el texto y cuando es inferior del minimo especificado.
  ///	</summary>
  ///	<param name="o" type="object">
  ///		1: Element    - El Elemento DOM (caja de texto).
  ///		2: Interval   - Numero de milisegundos.
  ///		3: MinLength  - Numero de caracteres a partir del cual se notifican cambios.
  ///		4: OnSearch   - Funcion a la que notificar los cambios en la caja de texto.
  ///		5: OnClear    - Funcion a la que notificara cuando la longitud sea menor que MinLength.
  ///	</param>  
   
  ///	<returns type="MAPATextBox.KeyControler" />
        
  this.Element = o.Element;
  this.OnSearch = o.OnSearch;
  this.OnClear = o.OnClear;
  this.Interval = o.Interval || 500;
  this.MinLength = o.MinLength || 0;
  var THIS = this;
  
  var __Cancel = false;
  var __LastValue = '';
  var __Loop = function(){
    if(__Cancel) return;
    var _CurrentValue = THIS.Element.value
    if ((_CurrentValue != __LastValue) && (_CurrentValue.length > THIS.MinLength) && 
        (THIS.OnSearch)){
      __LastValue = _CurrentValue;
      THIS.OnSearch({Sender: THIS, Value: _CurrentValue });
    }
    __LastValue = _CurrentValue;
    if ((__LastValue.length) && (THIS.MinLength >=__LastValue.length) && (THIS.OnClear))
      THIS.OnClear({Sender: THIS, Value: _CurrentValue });               
    setTimeout(__Loop, THIS.Interval);
  }
  
  this.Start = function(){      
    __Cancel=false;
    __Loop();
    return THIS;
  }
  this.Stop = function(){     
    __Cancel=true;
  }
  return this;
}    
  
  
  
  
//MAPA.TextBoxKeyControler.prototype = {
//  Element: undefined,
//  Interval: undefined,
//  MinLength: undefined,
//  OnSearch: undefined,
//  OnClear: undefined,
//  Start: function() {
//    ///	<summary>
//    ///		Inicia la supervisión de los cambios en la caja de texto.	    
//    ///	</summary>
//    ///	<returns type="MAPA.TextBox.KeyControler" />      
//  },
//  Stop: function() {
//    ///	<summary>
//    ///		Suspende la supervisión de los cambios en la caja de texto.	    
//    ///	</summary>
//    ///	<returns type="MAPA.TextBox.KeyControler" />      
//  }
//}  