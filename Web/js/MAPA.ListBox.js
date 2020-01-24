
MAPA.EditBox = function(o){
    o = o || {};
    var THIS = this;
    var SELECTED_BACKGROUND_COLOR = '#e9e9e9'
    var NORMAL_BACKGROUND_COLOR = 'white'    
    this.Element = o.Element;
    this.Element.__SelectedIndex = -1;
    this.Suggest  = {};
    this.Suggest.Values = o.Data || [];
    this.Suggest.AddItem = function(v){ if(THIS.Panel) THIS.Panel.Add(v);}
           
    
    var ClearCurrentItem = this.CoreClearCurrentItem = function (){
      if(THIS.Element.__SelectedIndex>-1)  PaintItem(THIS.Panel.childNodes[THIS.Element.__SelectedIndex],false)      
    }
    
    var PaintItem = this.CorePaintItem = function(item,isSelected){ 
      // si el elemento de la lista es el responsable de repintarse le notificamos a el
      if (item.Paint) 
        item.Paint({Selected: isSelected });
      else
      {
        item.style.backgroundColor = isSelected ? SELECTED_BACKGROUND_COLOR : NORMAL_BACKGROUND_COLOR;
      }              
     if (isSelected) THIS.Element.__SelectedIndex = item.index;
    }
    
    this.OnDataRequired = o.OnDataRequired || function(e){
      var __Reg = new RegExp('^' + e.Value ,'i');
      var __Result = e.DataSource.filter(function(v){return __Reg.test(v)})      
      __Result.sort();
      return __Result;
    };

    var __OnItemClick   = function(){
      THIS.Element.value = this.value
      THIS.HideList();
    }

    var __AddItemToList = function(item, _index){
      var div = $.New('div',{value: item, innerHTML : item, style : { padding:'2px', cursor: 'default'},
                        onclick     : __OnItemClick ,
                        index       : _index ,
                        onmouseover : function(){CoreClearCurrentItem();PaintItem(this,true)} ,
                        onmouseout  : function(){CorePaintItem(this,false)}
                       }) 
      THIS.Suggest.AddItem(div)
      return div;
    }
    var ___LastValue = '';
    var ___Loop = function(){        
        var currentValue = THIS.Element.value;
        if ((currentValue != ___LastValue) && (currentValue != '') && THIS.OnDataRequired) {                       
          ___LastValue = currentValue;
          var eventArg = {Sender: THIS, Value: currentValue, DataSource: THIS.Suggest.Values}
          if(THIS.Panel) THIS.Panel.Clear();          
          var items = THIS.OnDataRequired(eventArg) || [] ;
          items.forEach(__AddItemToList);                    
        }
        ___LastValue = currentValue;
        if (___LastValue == '' && THIS.HideList) THIS.HideList();                       
        setTimeout(___Loop, 500)
    } 
    ___Loop();       
    
    this.Element.ondblclick = function(ev){(this.Locator && this.Locator.IsVisible()) ? this.Locator.Hide() : this.Locator.Show();};
    this.Element.onkeydown = function(ev){
      var Keys = {Escape : 27, Up : 38, Down : 40, Enter : 13, Tab : 9}
      var _ev = MAPA.MapaEvent(ev).Event;
      // Tecla escape y Tab cierran la lista 
      if (_ev.keyCode == Keys.Escape || _ev.keyCode == Keys.Tab){
        this.Locator.Hide();
        this.__CancelShow = true
        this.__SelectedIndex = -1;
        return true;    
      }      
      // La tecla enter establece el valor      
      if (_ev.keyCode == Keys.Enter && this.__SelectedIndex > -1){
        var _listItem = THIS.Panel.childNodes[this.__SelectedIndex];
        if (_listItem.OnSelect)
           _listItem.OnSelect() 
        else
          _listItem.onclick();        
        this.__CancelShow = true
        return true;
      }
      // Las teclas arriba y abajo cambian el indice seleccionado      
      if ( this.Locator.IsVisible() && (_ev.keyCode == Keys.Down || _ev.keyCode == Keys.Up)){                
        if (_ev.keyCode == Keys.Down) { this.__SelectedIndex = (this.__SelectedIndex < THIS.Panel.childNodes.length-1) ? ++this.__SelectedIndex : THIS.Panel.childNodes.length-1;}
        if (_ev.keyCode == Keys.Up)   { this.__SelectedIndex = (this.__SelectedIndex > 0) ? --this.__SelectedIndex : 0}
        // se limpian los no seleccionados y se establece la selección        
        var _$$$This = this;
        MAPA.toArray(THIS.Panel.childNodes).forEach( function(__o,__index){
          PaintItem(__o,(_$$$This.__SelectedIndex == __index))
        })                    
      }
      else
       this.__SelectedIndex = -1;                                        
                                    
    };
    
    this.Element.onkeyup = function(ev){
      if(this.value.length > 0 && !this.__CancelShow) THIS.ShowList();
      this.__CancelShow = false; 
    }
                                                                                   
    this.Panel = $.New('div',{ className : 'CB_PANEL', 
                               Loaded    : false,                                 
                               style     : { 
                                  backgroundColor: 'white',
                                  height  : o.ListHeight || 'auto',
                                  width   : o.Width || '200px',
                                  cursor  : 'default',
                                  border  : o.Border || 'solid 1px black',
                                  position: 'absolute',
                                  display : 'none',
                                  overflow: 'auto',
                                  overflowX: 'hidden',
                                  marginTop: '1px'
                               }});                               
    document.body.appendChild(this.Panel);
    this.Element.Locator =
      new MAPA.LocatorControl({ TargetControl  : this.Panel, 
                                RefControl     : this.Element, 
                                SizeTargetControl : true, 
                                SizeValue         : MAPA.isIE ? 1 : 0 
                              })                              
                              
    this.ShowList = function(){THIS.Element.Locator.Show()};
    this.HideList = function(){THIS.Element.Locator.Hide()};        
                                                  
    this.Element.Locator.Hide();

    return this;
  } 
  //MAPA={}
  MAPA.EditBox.FillEditBox = function (e){
    var __OnClick = function(){ e.Sender.Element.value = this.value; e.Sender.HideList(); }
    var __Reg = new RegExp(e.Value,'i');
    var __Result = e.DataSource.filter(function(v){return __Reg.test(v)})
    __Result.sort();                     
    __Result.forEach(function(_e,_in){
        var _style = {height:'18px', paddingLeft : '3px', overflow: 'hidden', width:'100%', margin:'0px'}
        var _div = $.New('div',{
          className : 'SG_ITEM',
          style: _style, 
          innerHTML: _e.replace(__Reg,'<span>' + e.Sender.Element.value + '</span>'),
          value: _e,
          index: _in, 
          onclick : __OnClick,
          onmouseover : function(){ e.Sender.CoreClearCurrentItem(); e.Sender.CorePaintItem(this, true);},
          onmouseout  : function(){ e.Sender.CoreClearCurrentItem()}
        })
        e.Sender.Suggest.AddItem(_div)
    });                
  }
  
  
//  EditBox1 = new MAPA.EditBox({ Element : $('txtCargos'), ListHeight : '200px',
//                                  Data    : ['catalina','cata','casa','castro','casero','castillo','castilla','soldado','sol'],
//                                  OnDataRequired: MAPA.EditBox.FillEditBox})
//                                  
//    EditBox2 = new MAPA.EditBox({ Element : $('Text1'), ListHeight : '200px',
//                                  Data    : ['catalina','cata','casa','casa de algo','castilla','soldado','sol'],
//                                  OnDataRequired: undefined})
