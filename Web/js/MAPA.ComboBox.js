MAPA.ComboBox = function(o){
  o = o || {};
  var THIS = this;
  this.OnLoadData = o.OnLoadData
  this.tag;    
  this.Element = $.New('table',{ className    : 'CB_CONTAINER',
                                 cellPadding  : '3',
                                 cellSpacing  : '0',
                                 border       : '0',                                                                       
                                 onmousedown  : function(ev){                                      
                                    if (this.Locator && this.Locator.IsVisible())                                                                               
                                      this.Locator.Hide();
                                    else{                                                                                
                                      THIS.Arrow.style.opacity = '0.2';
                                      THIS.Arrow.style.filter = 'alpha(opacity=20)';
                                      if (!this.Box.Panel.Loaded && this.Box.OnLoadData)
                                        this.Box.OnLoadData(this.Box);
                                      this.Box.Panel.Loaded = true;
                                      this.Locator.Show();
                                    }  
                                    return MAPA.cancelEvent(ev);                                      
                                 },
                                 onmouseover  : function(){this.style.backgroundColor = 'blue'},
                                 onmouseout   : function(){this.style.backgroundColor = 'black'},
                                 Box          : this,
                                 style        : {
                                    backgroundColor : 'black',
                                    tableLayout     : 'fixed',
                                    height          :  o.Height || '20px',
                                    width           :  o.Width || '200px' ,
                                    border          : 'solid 1px gray'
                                 }});
   
                                            
  this.Panel = $.New('div',{ className : 'CB_PANEL', 
                             Loaded    : false,                                 
                             style     : { 
                                backgroundColor: 'white',
                                height  : o.ListHeight || '100px',
                                width   : o.Width || '200px',
                                cursor  : 'default',
                                border  : o.Border || 'solid 1px black',
                                position: 'absolute',
                                display : 'none',
                                overflow: 'auto',
                                marginTop: '1px',
                                zIndex:'100000'
                             }});
                             
  document.body.appendChild(this.Panel);
            
  this.Edit = $.New('td',{ className : 'CB_EDIT',                                
                           style     : { 
                              backgroundColor: 'white',
                              width   : '100%',
                              cursor  : 'default'
                           }}).Add(document.createTextNode(' '));      
   
  this.Handle = $.New('td',{ className  : 'CB_HANDLE',                               
                             style      : {
                                backgroundColor : 'silver',
                                width           : o.HandleWidth || '12px',
                                cursor          : 'pointer'
                             }});
  this.Arrow = $.New('div', {innerHTML: '&nbsp;', className: 'Arr' ,style : {width : '100%', height: '100%'}});                                                   
  this.Element.Add(
    $.New('tbody').Add($.New('tr').Add(this.Edit).Add(this.Handle.Add(this.Arrow))))   
    
  this.Element.Locator = 
    new MAPA.LocatorControl({ TargetControl  : this.Panel, 
                              RefControl     : this.Element, 
                              SizeTargetControl : true, 
                              SizeValue         : 0,                                 
                              HideInternal : function(){
                                THIS.Arrow.style.opacity = '1';
                                THIS.Arrow.style.filter = 'alpha(opacity=100)';
                              }})
  
  this.Set = function(listItem){
    this.Edit.innerHTML = '';    
    this.Edit.innerHTML = listItem.innerHTML || listItem;
    this.Element.Locator.Hide();
  }
  this.ShowList = function(){THIS.Element.Locator.Show()};
  this.HideList = function(){THIS.Element.Locator.Hide()};
                                            
  this.Element.Locator.Hide(); 
                                   
  return this;    
}