
MAPA.Slider = function(o){

  var _that = { Min         : o.Min, 
                Max         : o.Max, 
                Step        : o.Step || 5, 
                TimeFormat  : o.TimeFormat || false,
                ShowToolTip : o.ShowToolTip || false,
                Values      : o.Values || [20, 50],
                OnChange    : o.OnChange || function(){},
                OnUpdate    : o.OnUpdate || undefined,
                Ranges      : o.Ranges || [], // { S : 10*60  , E : 12*60, Color : 'Blue'}
                NoRange     : o.NoRange || false
              };
                
  var __getRange        = function()      { return _that.Max - _that.Min; } 
  var __screenToControl = function(value) { return _that.Min + ((value / _that.Control.clientWidth * 100) / 100 * __getRange()); }      
  var __controlToScreen = function(value) { return (value - _that.Min) * 100 / __getRange(); } 
  var __minutesToString = function(minutes,cero){
    return '{0}:{1}'.format( String.leftPad(Math.floor(minutes/60), cero ? 2 : 1,'0'), 
                             String.leftPad(Math.ceil(minutes%60),2,'0'));
  }
  _that.MinutesToString = __minutesToString;      
  var __raiseOnChange = function(){    
    _that.__controlToScreen = __controlToScreen;                       
    if(_that.OnChange) _that.OnChange(_that, _that.Values[0], _that.Values[1]);
  }                   

  _that.Container = o.Element;
  _that.Container.onselectstart = function(){ return false; };
  _that.Control   = $.New('div', { className : 'Slider', id : '{0}_c'.format(o.Element.id) });      
  _that.Progress  = $.New('div', { className : 'SliderB', id : '{0}_b'.format(o.Element.id) });
  _that.Handles = [ $.New('div', { className : 'SliderH', id : '{0}_h1'.format(o.Element.id) }),
                    $.New('div', { className : 'SliderH', id : '{0}_h2'.format(o.Element.id) })
                  ];                      
  _that.Labels = [ $.New('div', { className : 'SliderL ls', id : '{0}_ls'.format(o.Element.id) }),
                   $.New('div', { className : 'SliderL le', id : '{0}_le'.format(o.Element.id) }),
                   $.New('div', { className : 'SliderL lr', id : '{0}_lrs'.format(o.Element.id) }),
                   $.New('div', { className : 'SliderL lr', id : '{0}_lre'.format(o.Element.id) })
                 ];
                                       
  _that.Ranges.forEach( function(range){ 
    var __R = $.New('div', { className : 'SliderB SliderR', 
                             style     : {  left   : '{0}%'.format(__controlToScreen(range.S)),
                                            width  : '{0}%'.format(__controlToScreen(range.E) - __controlToScreen(range.S)),
                                            background      : 'none',
                                            backgroundColor : range.Color || 'Red'
                                         }
                           });
    range.Elemnt = __R;                                       
    _that.Control.appendChild(__R);         
  });                                                                                     
  _that.Control.appendChild(_that.Progress);
  _that.Control.appendChild(_that.Handles[0]);
  _that.Control.appendChild(_that.Handles[1]);
  _that.Labels.forEach( function(label){ _that.Control.appendChild(label); });      
  _that.Container.appendChild(_that.Control);
  
  for(x=_that.Min;x<=_that.Max; x+=_that.Step){
    var __i = document.createElement('div');
    __i.className = 'SliderStep';
    __i.style.left = '{0}%'.format(__controlToScreen(x));
    if(_that.ShowToolTip) __i.title = _that.TimeFormat ? __minutesToString(x) : x ;
    if(x==_that.Min || x==_that.Max ){__i.style.height = '1.4em';}
    else if(x%(_that.Step*2)==0){__i.style.height = '1em';}       
    __i.onclick = function(){ 
                    var __x = __controlToScreen(x) ; 
                    return function(){ __changePosition(__x*_that.Control.clientWidth/100);};
                  }(); 
    _that.Control.appendChild(__i);   
  }
  
  _that.Labels[0].style.left = '{0}%'.format(__controlToScreen(_that.Min)); 
  _that.Labels[1].style.left = '{0}%'.format(__controlToScreen(_that.Max));
  
  if(_that.NoRange){
    _that.Handles[0].style.display='none';
    _that.Labels[2].style.display='none';
  }
         
  _that.Update = function(){
    if(_that.OnUpdate){
      _that.__controlToScreen = __controlToScreen;
      _that.OnUpdate(_that);
    }else{        
      _that.Labels[0].innerHTML = _that.TimeFormat ? __minutesToString(_that.Min, false) : _that.Min; 
      _that.Labels[1].innerHTML = _that.TimeFormat ? __minutesToString(_that.Max, false) : _that.Max;
      _that.Labels[2].innerHTML = _that.TimeFormat ? __minutesToString(_that.Values[0], false) : _that.Values[0]; 
      _that.Labels[3].innerHTML = _that.TimeFormat ? __minutesToString(_that.Values[1], false) : _that.Values[1];          
      _that.Labels[0].style.display = _that.Min==_that.Values[0] ? 'none' : '';
      _that.Labels[1].style.display = _that.Max==_that.Values[1] ? 'none' : '';
    }
    _that.Labels[2].style.left  = '{0}%'.format(__controlToScreen(_that.Values[0])); 
    _that.Labels[3].style.left  = '{0}%'.format(__controlToScreen(_that.Values[1]));         
    _that.Progress.style.left   = '{0}%'.format(__controlToScreen(_that.Values[0]));
    _that.Progress.style.width  = '{0}%'.format( Math.max(0, __controlToScreen(_that.Values[1]) - __controlToScreen(_that.Values[0])));                         
    _that.Handles[0].style.left = '{0}%'.format(__controlToScreen(_that.Values[0]));
    _that.Handles[1].style.left = '{0}%'.format(__controlToScreen(_that.Values[1]));                       
    return _that;
  }
  
  _that.SetValue = function(value, target){
    if(target=='low'){
      var __v = MAPA.Slider.ParseTime(value);  
      if(__v){
        if(__v<_that.Min) __v = _that.Min;                        
        _that.Values[0]=__v;
        if(_that.Values[0]>_that.Values[1]) _that.Values[1]=_that.Values[0];
      }                 
    }else if(target=='hight'){
      var __v = MAPA.Slider.ParseTime(value);  
      if(__v){
        if(__v>_that.Max) __v = _that.Max;                        
        _that.Values[1]=__v; 
        if(_that.Values[1]<_that.Values[0]) _that.Values[0]=_that.Values[1];
      }          
    } 
   _that.Update();        
  }      
       
  var __changePosition = function(value){                    
    value = __screenToControl(value);

    if(value<_that.Min) value = _that.Min;
    if(value>_that.Max) value = _that.Max;
    var __rest = value%_that.Step         
    if(__rest>_that.Step/2){      
      value = Math.ceil(value/_that.Step) * _that.Step;      
    }else{ 
      if(_that.Max-__rest<value){
        value=_that.Max;
      }else{
        value = Math.floor(value/_that.Step) * _that.Step;
      }     
    }          
    if(_that.MouseDown){         
      if(_that.MouseDownSource=='low'){
        _that.Values[0] = value;
        if(_that.Values[0]>=_that.Values[1]){            
          _that.Values[1] =  _that.Values[0];
          if(_that.Values[1] + _that.Step<=_that.Max) _that.Values[1] += _that.Step;  
        }   
      }else if(_that.MouseDownSource=='hight'){
        _that.Values[1] = value;
        if( _that.Values[1]<=_that.Values[0]){
          _that.Values[0] =  _that.Values[1];
          if(_that.Values[0] - _that.Step>=_that.Min) _that.Values[0] -= _that.Step;  
        }            
      }          
    }else{       
      if(_that.NoRange)               _that.Values[1] = value;          
      else if(value<=_that.Values[0]) _that.Values[0] = value;  
      else if(value>=_that.Values[1]) _that.Values[1] = value;  
      else{
        var __d1 = value - _that.Values[0];
        var __d2 = _that.Values[1] - value;
        if(__d1<__d2) _that.Values[0] = value;
        else _that.Values[1] = value;                 
      }
    }                             
    __raiseOnChange(); 
    return _that.Update();       
  }
  
  _that.Control.onmousedown = function(e){        
    var __event = MAPA.MapaEvent(e);
    var __x = __event.Event.offsetX || __event.Event.layerX || 0;        
    if(__event.Target==_that.Handles[0] || __event.Target==_that.Handles[1]){
      _that.MouseDown = true;
      _that.Control.style.cursor = 'w-resize';
      _that.MouseDownSource = __event.Target==_that.Handles[0] ? 'low' : 'hight'; 
      return true;         
    }else if(__event.Target==_that.Control ){
      __changePosition(__x)   
    }else{
      __changePosition(__x + __event.Target.offsetLeft);
    }
  }
  _that.Control.onmouseup   = function(){ _that.MouseDown = false; _that.Control.style.cursor = 'pointer'; }      
  _that.Control.onmousemove = function(e){ 
    var __event = MAPA.MapaEvent(e);
    var __x = __event.Event.offsetX || __event.Event.layerX || 0;        
    if(__x>0 && _that.MouseDown && __event.Target==_that.Control ){
      __changePosition(__x)   
    }else if(__x>0 && _that.MouseDown ){
     __changePosition(__x + __event.Target.offsetLeft);
    }              
  }
         
  return _that.Update();     
}

MAPA.Slider.ParseTime = function(value){
  var __H = 0, __M = 0;
  __H = parseInt( value.split(':')[0]);      
  if(__H && (__H<0 || __H>24)) __H=0;      
  __H *= 60;      
  if(value.contains(':')){
   __M = parseInt(value.split(':')[1]);
   if(__M && (__M<0 || __M>59))__M=0;
  }
  return __H + __M;
}