MAPA.SplitHelper = function(value){               
  var State = 0;                  
  value.Element.Handlers = {          
    OnClick   : function(){
      State = (State==0) ? 1 : 0;            
      if (State==0) setTimeout(this.Handlers.OnExpand,150)              
      else  setTimeout(this.Handlers.OnCollapse,150)              
    },
    Element : value.Element,
    OnCollapse  : value.OnCollapse || undefined ,
    OnExpand    : value.OnExpand || undefined
  }  
  if (value.keyAccelerators) {
    MAPA.OnCtrlKeyPress(37,value.Element.Handlers.OnCollapse); // Izquierda  --> Contraer
    MAPA.OnCtrlKeyPress(39,value.Element.Handlers.OnExpand);   // Derecha --> Expandir
  }        
  value.Element.onclick     = value.Element.Handlers.OnClick; 
  return value.Element.Handlers;                 
}

MAPA.SplitHelper.DefaultAnimation = function(o){
  var options = o || {};
  var _Splitter = $('splitter');
  var _Left     = $('Menu1');
  var _Right    = $('MainContainer');
  
  _Splitter.className = "spliter S1" ; 
  
  MAPA.SplitHelper({
    Element   : _Splitter,
    keyAccelerators : true,        
    OnExpand  : function(){
      _Splitter.className = "spliter S1" ; 
      _Left.style.display = '';
      var _II = MAPA.Serie([1,12,17,0]);            
      var DoStep = function(){
        var current = _II.Next();
        if(current){                                                            
          _Splitter.style.left = String.format('{0}em', current);               
          _Right.style.left = String.format('{0}.95em', current);
          if(MAPA.SplitHelper.DefaultAnimation.__resize) MAPA.SplitHelper.DefaultAnimation.__resize(_Right.style.left);
          _Left.style.width = String.format('{0}em', current - 0.9);
          setTimeout(DoStep, 85);              
        }
        else
        {
          _Splitter.style.left = '';
          _Splitter.style.borderLeft = ''
          _Right.style.left = '';
          if(MAPA.SplitHelper.DefaultAnimation.__resize) MAPA.SplitHelper.DefaultAnimation.__resize(_Right.style.left);
          _Left.style.width = '';
          _Left.style.overflow = '';              
        }              
      }
      DoStep();
    },
    OnCollapse : function(){
      _Splitter.className = "spliter S2" ;                               
      _Left.style.overflow = 'hidden';                             
      var _II = MAPA.Serie([1,3,9,18,17,15,17,18,0]);            
      var DoStep = function(){
        var current = _II.Next();
        if(current){                                                            
          _Splitter.style.left = String.format('{0}em', 18.5 - current);               
          _Right.style.left = String.format('{0}em',19.4 - current);
          if(MAPA.SplitHelper.DefaultAnimation.__resize) MAPA.SplitHelper.DefaultAnimation.__resize(_Right.style.left);
          _Left.style.width = String.format('{0}em', 18.5 - current);
          setTimeout(DoStep,85);              
        }
        else
        {
          _Splitter.style.left = '0.1em';
          _Splitter.style.borderLeft= 'solid 1px gray';               
          _Right.style.left = '1.1em'    
          if(MAPA.SplitHelper.DefaultAnimation.__resize) MAPA.SplitHelper.DefaultAnimation.__resize(_Right.style.left);         
          _Left.style.width = '0em';
          _Left.style.display = 'none';              
        }              
      }
      DoStep();                                                         
    }                             
  })
}


MAPA.InitSearchPanel = function(o){
  var options = o || {};
  var _Splitter = $('SearchSpliter');
  var _Search   = $('SearchContainer');
  var _Items    = $('TableContainer');
  var _Top      = $('TopPaginationContainer');
  var _IsVisible  = false;     
  var _btnFiltrar = new MAPA.ToolBarButton({Id    : 'TBar1-014', Url : 'javascript:MAPA.____TogglePanel()',                                                                                        
                                            Align : 'Left', Texto : 'Búsquedas'})
  var _btnBuscar  = new MAPA.ToolBarButton({Id    : 'TBar1-015', Url : 'javascript:MAPA.____Buscar();',                                                                                        
                                            Align : 'Left', Texto : 'Buscar'})
  var _btnCancelar  = new MAPA.ToolBarButton({Id    : 'TBar1-016', Url : 'javascript:MAPA.____TogglePanel();',                                                                                        
                                              Align : 'Left', Texto : 'Cancelar'})                                                                                          																				    
  _btnBuscar.Hide();
  _btnCancelar.Hide();
                                              
  _ToolBar.AddButton(_btnFiltrar)
  _ToolBar.AddButton(_btnBuscar)
  _ToolBar.AddButton(_btnCancelar)
  
  if(o.SearchPanel){ _Search.appendChild(o.SearchPanel) };
  var _Max = o.Max || 19; // alto del panel
																				        																				
  _Splitter.onclick = TogglePanel;
  
  MAPA.OnCtrlKeyPress(66, TogglePanel)
  MAPA.____TogglePanel = TogglePanel;    
  MAPA.____Buscar = function(){
    if (o.OnClick){    
      o.OnClick.call(this, {Container: _Search, TableContainer: _Items, SearchPanel: o.SearchPanel})  
    } 
  };
    
  function TogglePanel(){
    var alto = parseInt(_Max);
    if (_IsVisible){
      _btnBuscar.Hide();
      _btnCancelar.Hide();
      _btnFiltrar.Show();      
      _Search.style.overflow = 'hidden';                                 
      //var _II = MAPA.Serie([19,12,6,0,-1]);            
      var _II = MAPA.Serie([alto,alto-(alto/4),alto-(alto/1.5),0,-1]);            
      var DoStep = function(){
        var current = _II.Next();
        if(current!=-1){                                                            
          _Search.style.height= String.format('{0}em', current);
          _Splitter.style.top = String.format('{0}em',  current + 2.3 );
          _Top.style.top = String.format('{0}em',  current + 3.4);
          _Items.style.top = String.format('{0}em',  current + 6);
          setTimeout(DoStep,85);              
        } 
        else
        {
         _Search.style.display = 'none';
         _Splitter.style.display = 'none';
         _Items.style.top = '';
         _Top.style.top = '';         
        }                       
      }
      DoStep();          
    }
    else {
      _btnFiltrar.Hide();
      _btnBuscar.Show();
      _btnCancelar.Show();             
      _Search.style.display = 'block';
      _Search.style.overflow = '';
      _Splitter.style.display = 'block';        
      //var _II = MAPA.Serie([1,3,9,20,18,16,17,20,0]);            
      var _II = MAPA.Serie([1,3,9,alto+1,alto-1,alto-3,alto-2,alto+1,0]);            
      var DoStep = function(){
        var current = _II.Next();
        if(current){                                                            
          _Search.style.height= String.format('{0}em', current);
          _Splitter.style.top = String.format('{0}em',  current + 2.3);
          _Top.style.top = String.format('{0}em',  current + 3.4);
          _Items.style.top = String.format('{0}em',  current + 6);
          setTimeout(DoStep,85);                        
        }                        
        else{
          if (options.SetFocusTo) setTimeout(function(){options.SetFocusTo.focus();},50);
        }
      }
      DoStep(); 
      if(o.OnShow) o.OnShow();       
    }
    _IsVisible = !_IsVisible;          
  }             
}