

MAPA.Core = { Event : {},
              Math  : {} };

// ============================================================================== 
//
// MAPA.Graphics
//
// ==============================================================================
MAPA.Graphics = function(){
  var _that = { };
 
  _that.Clear = function(ctx, color){
    ctx.fillStyle = color;
    ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
    return _that;
  }

  _that.createBuffer = function (width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
  };

  _that.DrawCircle = function(ctx, circle, lineWidth, strokeStyle, fillStyle){   
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    return _that;
  }

  _that.roundRect = function (ctx, x, y, width, height, radius, fill, stroke) {
    var cornerRadius = { upperLeft: radius, upperRight: radius, lowerLeft: radius, lowerRight: radius };
    if(typeof radius === "object") {
      for (var side in radius) cornerRadius[side] = radius[side];        
    }
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius.upperLeft, y);
    ctx.lineTo(x + width - cornerRadius.upperRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
    ctx.lineTo(x + width, y + height - cornerRadius.lowerRight);
    ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
    ctx.lineTo(x + cornerRadius.lowerLeft, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
    ctx.lineTo(x, y + cornerRadius.upperLeft);
    ctx.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
    ctx.closePath();
    if(fill){
      ctx.fill();
    }
    if(stroke){
      ctx.stroke();
    }
  }

  return _that;

} ();

// ========================================================================= 
//
// MAPA.Core.Event
//
// =========================================================================
MAPA.Core.Event = function(name){  
  var _subscribers = {};
  var _lastUid     = 0;
  var _that        = { Name      : name, 
                       Dispatch  : function(eventArgs){
                                  for(var m in _subscribers){
                                    if(_subscribers.hasOwnProperty(m)){
                                       _subscribers[m](name, eventArgs || {} );
                                    }
                                  }
                                  return _that;
                       },
                       Add    : function (callback){
                                  var id = (++_lastUid).toString();
                                  _subscribers[id] = callback;                                      
                                  return id;
                       },
                       Remove : function (id){                                  
                                  if ( _subscribers.hasOwnProperty(id) ) {
                                    delete _subscribers[id];
                                    return true;
                                  }
                                  return false;
                      }};                
  return _that;
}

// =============================================================== 
//
// MAPA.Core.State
//
// ===============================================================
MAPA.Core.StateManager = function(){
  var _that = { state    : {}, enter : {}, idle : {}, leave : {},
                setState : function(name,o){
                  _that.state = _that[name];  
                  _that.state.activate(o);} }
  return _that;
}

// ==================================================================================================== 
//
// MAPA.Core.Math.Vector2
//
// ==================================================================================================== 
MAPA.Core.Math.Vector2                 = function(x,y) { this.x = x; this.y = y;};
MAPA.Core.Math.Vector2_ZERO            = new MAPA.Core.Math.Vector2(0.0, 0.0);
MAPA.Core.Math.Vector2_UNIT_X          = new MAPA.Core.Math.Vector2(1.0, 0.0);
MAPA.Core.Math.Vector2_UNIT_Y          = new MAPA.Core.Math.Vector2(0.0, 1.0);
MAPA.Core.Math.Vector2_NEGATIVE_UNIT_X = new MAPA.Core.Math.Vector2(-1.0, 0.0);
MAPA.Core.Math.Vector2_NEGATIVE_UNIT_Y = new MAPA.Core.Math.Vector2(0.0, -1.0);
MAPA.Core.Math.Vector2_UNIT_SCALE      = new MAPA.Core.Math.Vector2(1.0, 1.0);
MAPA.Core.Math.Vector2.fromArrayi = function(array){ return new MAPA.Core.Math.Vector2(~~array[0], ~~array[1]);};
MAPA.Core.Math.Vector2.sum        = function(a, b) { return new MAPA.Core.Math.Vector2(a.x + b.x, a.y + b.y); };
MAPA.Core.Math.Vector2.difference = function(a, b) { return new MAPA.Core.Math.Vector2(a.x - b.x, a.y - b.y);};
MAPA.Core.Math.Vector2.dot        = function(a, b) { return a.x * b.x + a.y * b.y;};
MAPA.Core.Math.Vector2.cross      = function(a, b) { return a.x * b.y - a.y * b.x;};
MAPA.Core.Math.Vector2.distance   = function(a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy);};
MAPA.Core.Math.Vector2.distanceSquared = function(a, b) { var dx = a.x - b.x; var dy = a.y - b.y; return dx * dx + dy * dy; };
MAPA.Core.Math.Vector2.equals     = function(a, b) { return this == vector || (a.x == b.x && a.y == b.y);};
MAPA.Core.Math.Vector2.lerp       = function(a, b, f, resultVec) {
  var x = a.x, y = a.y;
  resultVec.x = (b.x - x) * f + x;
  resultVec.y = (b.y - y) * f + y;
  return resultVec;
}
MAPA.Core.Math.Vector2.rotateAroundPoint = function(v, axisPoint, angle) { return v.clone().subtract(axisPoint).rotate(angle).add(axisPoint);};

MAPA.Core.Math.Vector2.prototype.set           = function(x,y)   { this.x=x; this.y=y; return this;};
MAPA.Core.Math.Vector2.prototype.clone         = function()      { return new MAPA.Core.Math.Vector2(this.x, this.y); };
MAPA.Core.Math.Vector2.prototype.length        = function()      { return Math.sqrt(this.x * this.x + this.y * this.y);};
MAPA.Core.Math.Vector2.prototype.lengthSquared = function()      { return this.x * this.x + this.y * this.y; };
MAPA.Core.Math.Vector2.prototype.invert        = function()      { this.x = -this.x; this.y = -this.y; return this; };
MAPA.Core.Math.Vector2.prototype.cross         = function(vector){ return this.x * vector.y - this.y * vector.x;}
MAPA.Core.Math.Vector2.prototype.dot           = function(vector){ return this.x * vector.x + this.y * vector.y;};
MAPA.Core.Math.Vector2.prototype.scale         = function(sx, sy){ this.x *= sx; this.y *= sy; return this; };
MAPA.Core.Math.Vector2.prototype.normalize      = function()     { var _d = 1 / this.length(); return this.scale(_d,_d); };
MAPA.Core.Math.Vector2.prototype.normalisedCopy = function()     { return new MAPA.Core.Math.Vector2(this.x,this.y).normalise(); };
MAPA.Core.Math.Vector2.prototype.add           = function(vector){ this.x += vector.x; this.y += vector.y; return this; };
MAPA.Core.Math.Vector2.prototype.subtract      = function(vector){ this.x -= vector.x; this.y -= vector.y; return this;};
MAPA.Core.Math.Vector2.prototype.mul           = function(scalar){ this.x *= scalar; this.y *= scalar; return this;};
MAPA.Core.Math.Vector2.prototype.divide        = function(scalar){ this.x /= scalar; this.y /= scalar; return this;};
MAPA.Core.Math.Vector2.prototype.equals        = function(vector){ return this == vector || !!vector && this.x == vector.x && this.y == vector.y; };
MAPA.Core.Math.Vector2.prototype.rotate        = function(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var newX = this.x * cos - this.y * sin;
  var newY = this.y * cos + this.x * sin;
  this.x = newX;
  this.y = newY;
  return this;
};

// ================================================================================================================================================================================= 
//
// MAPA.Core.Math.Box
//
// ================================================================================================================================================================================= 
MAPA.Core.Math.Box                       = function(t, r, b, l) { this.left = l; this.top = t; this.right = r; this.bottom = b;};
MAPA.Core.Math.Box.prototype.clone       = function() { return new MAPA.Core.Math.Box(this.top, this.right, this.bottom, this.left); };
MAPA.Core.Math.Box.prototype.toRect      = function() { return new MAPA.Core.Math.Rect(this.left, this.top, this.right-this.left, this.bottom-this.top); };
MAPA.Core.Math.Box.prototype.centerPoint = function() { return new MAPA.Core.Math.Vector2( this.left + ((this.right-this.left) >> 1), this.top + ((this.bottom-this.top) >> 1)); };

// ========================================================================================================================================================================== 
//
// MAPA.Core.Math.Rect
// 
// ==========================================================================================================================================================================
MAPA.Core.Math.Rect = function(x, y, w, h) {
  if(arguments.length==1){
    var __a = x.split(',');
    this.left = ~~__a[0];
    this.top = ~~__a[1];
    this.width = ~~__a[2];
    this.height = ~~__a[3];  
    return;
  }
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h;
};
MAPA.Core.Math.Rect.prototype.clone = function()            { return new MAPA.Core.Math.Rect(this.left, this.top, this.width, this.height); };
MAPA.Core.Math.Rect.prototype.toBox = function()            { return new MAPA.Core.Math.Box(this.top, this.left + this.width, this.top + this.height, this.left); };
MAPA.Core.Math.Rect.prototype.centerPoint = function()      { return new MAPA.Core.Math.Vector2( this.left + (this.width >> 1), this.top + (this.height >> 1));};
MAPA.Core.Math.Rect.prototype.contains    = function(other) {
  if (other instanceof MAPA.Core.Math.Rect) {
    return this.left <= other.left &&
           this.left + this.width >= other.left + other.width &&
           this.top <= other.top &&
           this.top + this.height >= other.top + other.height;
  } else { 
    return other.x >= this.left &&
           other.x <= this.left + this.width &&
           other.y >= this.top &&
           other.y <= this.top + this.height;
  }
};

MAPA.Core.Math.Random  = function(max, min)        { return Math.random() * (max - min + 1) + min; }
MAPA.Core.Math.Clamp   = function(value, min, max) { return Math.min(Math.max(value, min), max);};
MAPA.Core.Math.Radians = function(degrees) { return degrees * Math.PI / 180; };
MAPA.Core.Math.Degrees = function(radians) { return radians * 180 / Math.PI; };
MAPA.Core.Math.IsPowerOfTwo  = function(value){ return value > 0 && (value & (value - 1)) == 0; };
MAPA.Core.Math.NextPowerOfTwo = function(value){  var k = 1; while (k < value) k *= 2;  return k; };

// ========================================================================================================= 
//
// MAPA.Core.Collision 
//
// =========================================================================================================             
MAPA.Core.Collision = {

  CreateCircle : function(x,y,radius,o){
    var _that = { x : x, y : y, radius : radius , radiusSquared : radius*radius, 
                  contains : function(x,y){
                    if(arguments.length==1) return ((this.x-x.x)*(this.x-x.x)) + ((this.y-x.y)*(this.y-x.y)) < this.radiusSquared;                      
                    return ((this.x-x)*(this.x-x)) + ((this.y-y)*(this.y-y)) < this.radiusSquared;
                  }};
    if(o) MAPA.apply(_that, o);                      
    return _that
  },
  CreateRectangle : function(x,y,w,h){ return new MAPA.Core.Math.Rect(x,y,w,h); },
  FindObjectAt    : function(objects, point){
    var __b;
    objects.some( function(b){
                    if( b.contains(point) || b.contains(point.x, point.y) ){
                      __b = b; 
                      return true;
                    }
                    return false;
                 });
    return __b;
  }
} 


MAPA.Charts = function(o){

  var _chart = { Events : { OnClick        : new MAPA.Core.Event('MAPA.Charts.OnClick'),
                            OnItemSelected : new MAPA.Core.Event('MAPA.Charts.OnItemSelected')  
                          },
                 Width  : o.Width, Height : o.Height, Padding : o.Padding, 
                 Title  : o.Title, LegendBox : o.LegendBox, LegendWidth : o.LegendWidth, 
                 Style  : o.Style, 
                 Colors : o.Colors, Backgound : 'white', fill : 'rgba(210,210,210,.5)'
               };
  var ctx;

  var __clamp = function(value){ 
    var __max = [10, 20, 50, 100, 150, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 50000, 100000];
    for(var x=0; x < __max.length ; x++){
      var __d = __max[x];
      if(value<__d) return ~~(value/__d) + __d;
    }
    return value;
  }

  var __reset_canvas = function(o){
    _chart.Canvas.width  = _chart.Width;
    _chart.Canvas.height = _chart.Height;
    MAPA.Graphics.Clear(ctx, _chart.Backgound || 'white');      
    _chart.Context.fillStyle = _chart.fill || 'rgba(210,210,210,.5)';
    _chart.Context.fillRect(_chart.bounds.left, _chart.bounds.top, _chart.bounds.width, _chart.bounds.height); 
    if(o && o.border){
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'silver';
      _chart.Context.strokeRect(_chart.bounds.left, _chart.bounds.top, _chart.bounds.width, _chart.bounds.height); 
    }
  }
  var __measure_text = function(ctx, font, text){
    ctx.font = font;
    return ctx.measureText(text).width;
  }
 
  var __draw_title = function(ctx, r, value){
    ctx.fillStyle  = 'black';
    ctx.font       = '22px Lucida Sans Unicode';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    var __point    = r.centerPoint();
    ctx.fillText(value, __point.x, __point.y);
  }

  var __draw_axes  = function(ctx, r, o){
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';      
    ctx.beginPath();
    ctx.moveTo(r.left, r.top - 4);
    ctx.lineTo(r.left, r.top + r.height + 4);
    ctx.moveTo(r.left - 4, r.top + r.height);
    ctx.lineTo(r.left + r.width + 4, r.top + r.height); 
    ctx.stroke();
  }

  var __draw_bar = function(ctx, r, color, fill, lineWidth, value){
      ctx.fillStyle = fill || ctx.fillStyle;
      ctx.fillRect(r.left, r.top, r.width, r.height);
      ctx.lineWidth   = lineWidth || ctx.lineWidth;;
      ctx.strokeStyle = color || ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(r.left, r.top + r.height);
      ctx.lineTo(r.left, r.top);
      ctx.lineTo(r.left + r.width, r.top);
      ctx.lineTo(r.left + r.width, r.top + r.height);
      ctx.stroke();      
  }

  var __draw_barValue = function(ctx, point, value, o){
    if(o && o.box){
      var __w = 12 + __measure_text(ctx, '11px sans-serif-condensed', value);
      var __h = 18;
      ctx.lineWidth = 1;
      ctx.fillStyle  = 'white';
      ctx.strokeStyle  = 'black';
      MAPA.Graphics.roundRect(ctx, point.x - __w * .5, point.y - __h * .5, __w, __h, 6, true, true) 
    }
    ctx.fillStyle  = 'black';
    ctx.font       = '11px sans-serif-condensed';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    if(o && o.textAlign) ctx.textAlign = o.textAlign;      
    ctx.fillText(value, point.x, point.y);
  }

  var __draw_legendBox = function(ctx, r, o){
    ctx.lineWidth = 2; 
    ctx.strokeStyle = 'silver';
    ctx.strokeRect(r.left, r.top, r.width, r.height);
    ctx.lineWidth = 1; 
    ctx.strokeStyle = 'black';
    
    var __ident = 10;
    var __width = 0;
    var __top   = 0;

    _chart.Legends.forEach( function(l, i){
      ctx.fillStyle = l.fillStyle;
      ctx.fillRect(r.left + __ident, __top + r.top + 10, 12, 12);
      ctx.lineWidth = 2;
      ctx.strokeRect(r.left + __ident, __top + r.top + 10, 12, 12);
      ctx.lineWidth    = 2;
      ctx.fillStyle    = 'black';
      ctx.font         = '9px Lucida Sans Unicode';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(l.text, r.left + __ident+20, __top + r.top + 10);
      __width = Math.max(__width, __measure_text(ctx, '9px Lucida Sans Unicode', l.text));
      __top += 18
      if(__top > r.height - 32){
        __top = 0;
        __ident += __width + 30;
        __width=0;
      }
    })
  } 
  
  var __normalizePosition = function(e) {
    var scaleX = _chart.Canvas.clientWidth / _chart.Width;
    var scaleY = _chart.Canvas.clientHeight / _chart.Height; 
    var x = 1/scaleX * (e.offsetX - _chart.Canvas.offsetLeft);
    var y = 1/scaleY * (e.offsetY - _chart.Canvas.offsetTop);      
    return { x : x, y : y};
  }

  var __onclick = function(eventArg){
    var __pos = __normalizePosition(eventArg);
    
    _chart.Events.OnClick.Dispatch(__pos);

    if(_chart.TitleBounds && _chart.TitleBounds.contains(__pos)){ 
      _chart.Events.OnItemSelected.Dispatch({ position : __pos, source : 'title', data : {} });  
      //_chart.Style++;
      //_chart.Style = _chart.Style % 4;
      //__set_view();
      //_chart.LoadData(_chart.dataSource);
      //return;
    }else{
      var __selected;
      _chart.Data.forEach( function(data, i){
        if(_chart.Style==1){
          data.selected = false; 
          if(data.bar.contains(__pos)){
            data.selected = true
            __selected = data;
          };    
        }else if(_chart.Style==2 ||_chart.Style==3 ||_chart.Style==4){          
          data.selected = false;
          if(data.hotPoint.contains(__pos)){
            data.selected = true
            __selected = data;
          }    
        }        
      });
      if(__selected) _chart.Events.OnItemSelected.Dispatch({ position : __pos, source : 'item', data : __selected });  
    }
    _chart.Draw();
  }

  // ==================================================
  // [value, legend, serie, color]
  // ==================================================
  var Type_BarView = function(){

    var _that = {};

    _that.LoadData = function(data){
      _chart.dataSource = data;
      _chart.Data       = [];
      _chart.Series     = [];
      _chart.Legends    = [];
      data.forEach( function(value, i){       
        var __item   = { value      : value[0],                          
                         legend     : value[1] || '',
                         serie      : value[2] || '',                         
                         fillStyle  : value[3] || _chart.Colors.Next()
                        };
        _chart.Data.add(__item);
      });

      _chart.Data.Distinct( function(d){ return d.legend; })
                 .forEach( function(name){
                    var __fillStyle = _chart.Data.Item('legend', name).fillStyle;
                    _chart.Legends.add( { key : name, text : name, fillStyle : __fillStyle } );               
                 })

      if(_chart.SeriesEnabled){
        _chart.Data.Distinct( function(d){ return d.serie; })
                   .forEach( function(name){
                      if(name){ 
                        var __count = _chart.Data.Where( function(d){ return d.serie==name; }).length;
                        _chart.Series.add( { key : name, text : name, count : __count, fillStyle : _chart.Colors.Next() } );
                      }
                   })

         _chart.Data.forEach( function(d){
           d.fillStyle = _chart.Legends.Item('key', d.legend).fillStyle;
         });
      }


      var __values =  _chart.Data.Distinct( function(d){ return d.value; } );
      _chart.ratio = 100.0 / __clamp(Math.max.apply(Math, __values ));
      _that.RefreshLayout();
    }
   
    _that.RefreshLayout = function(){
      _chart.twoLines = false;
      _chart.bounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                              _chart.Padding[0], 
                                              _chart.Width  - _chart.Padding[1] - _chart.Padding[3],
                                              _chart.Height - _chart.Padding[0] - _chart.Padding[2]);
      if(_chart.Title){
        _chart.TitleBounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                                      _chart.Padding[0], 
                                                      _chart.Width - _chart.Padding[1] - _chart.Padding[3], 
                                                    30);  
        _chart.bounds.top    += _chart.Padding[3] + 15;
        _chart.bounds.height -= _chart.Padding[3] + 15;
      }
      _chart.LegendBox = _chart.LegendBox;
      if(_chart.LegendBox){
        var __w = _chart.bounds.width * (_chart.LegendWidth || .33);
        _chart.bounds.width -= __w;
        _chart.LegendBounds = new MAPA.Core.Math.Rect( _chart.bounds.width + _chart.bounds.left + 15, 
                                                        _chart.bounds.top, 
                                                        __w - 15, 
                                                        _chart.bounds.height);        
      }

      var __totalWidth  = _chart.bounds.width / _chart.Data.length;
      var __margin      = __totalWidth * .1;
      var __marginSerie = __margin * 4;
      var __barWidth    = (__totalWidth - __margin / _chart.Data.length); 
  
      var __serie  = _chart.Data[0] ? _chart.Data[0].serie : '';
      if(_chart.Series.length){
        __barWidth   -= __marginSerie * (_chart.Series.length-1) / _chart.Data.length; 
        var __scount = 0;
        var __left   = _chart.bounds.left;
        var __top    = _chart.bounds.top + _chart.bounds.height;
        var __width  = 0;
        _chart.Data.forEach( function(value, i){ 
          if(__serie != value.serie){
            var __s = _chart.Series[__scount];                         
            __s.bar = new MAPA.Core.Math.Rect(__left, __top, __barWidth  * __s.count + __marginSerie * .5 + __margin , 1);            
            if( __MeasureBarLegend(_chart.Context, __serie) > __width){ 
              _chart.twoLines  = true;
            }
            __serie = value.serie;             
            __left += (__barWidth * __s.count ) + __marginSerie ;
            __width = 0;
            __scount++;
          } 
          __width += __barWidth + __margin;        
        });
        var __s = _chart.Series[__scount];
         __s.bar = new MAPA.Core.Math.Rect(__left, __top, __barWidth * __s.count, 1);
        _chart.Series.forEach( function(s, i){
          s.bar.line = _chart.twoLines && i % 2;
          if(_chart.twoLines) s.bar.top -= 15;
        })
      }else{
        if(_chart.SeriesEnabled){
          _chart.twoLines = _chart.Data.some( function(b){ return __MeasureBarLegend(_chart.Context, b.legend ) > __barWidth; });
        }else{
          _chart.twoLines = _chart.Data.some( function(b){ return __MeasureBarLegend(_chart.Context, b.serie) > __barWidth; });
        }                    
      }
      if(_chart.twoLines){        
        _chart.bounds.height -= 15;
        if(_chart.LegendBounds) _chart.LegendBounds.height -= 15;
      } 

      __serie  = _chart.Data[0] ? _chart.Data[0].serie : '';
      var __sh = 0;
      _chart.Data.forEach( function(value, i){
        if(_chart.SeriesEnabled){           
          if(__serie != value.serie){
            __sh += __marginSerie;
            __serie = value.serie; 
          }         
        }
        var __height = _chart.ratio * value.value * _chart.bounds.height / 100;
        value.bar = new MAPA.Core.Math.Rect((_chart.bounds.left + __barWidth * i) + __margin + __sh,
                                              _chart.bounds.top + _chart.bounds.height - __height,
                                              __barWidth - __margin,
                                              __height)
        value.hotPoint   = MAPA.Core.Collision.CreateCircle(value.bar.centerPoint().x, value.bar.top, 4)
        value.bar.line   = _chart.twoLines && i%2;
      });        

      _that.Draw();
    }

    _that.Draw = function(){
      __reset_canvas();     
      if(_chart.Title){
        __draw_title(ctx, _chart.TitleBounds, _chart.Title);      
      }
      if(_chart.LegendBox){
        __draw_legendBox(ctx, _chart.LegendBounds);
      }
      __DrawGridX(ctx, _chart.bounds);      
      __DrawGridY(ctx, _chart.bounds, _chart.Data);
      if(_chart.Style==1)
        __DrawBars();      
      else
        __DrawLines();
      __draw_axes(ctx, _chart.bounds);
    }

    function __DrawBars(){
      _chart.Data.forEach( function(data, i){
        __draw_bar(ctx, data.bar, 
                   data.selected ? 'black' : 'black',
                   data.selected ? 'rgba(0,0,125,.8)' : data.fillStyle, 
                   2)        
      });
      _chart.Data.forEach( function(data, i){ 
        var __point    = data.bar.centerPoint();
        __point.y      = data.bar.top - 12; 
        __draw_barValue(ctx, __point, data.value, { box : false}); 
      });
      if(_chart.Series.length==0){
        _chart.Data.forEach( function(data, i){
          if(_chart.SeriesEnabled){
            __DrawBarLegend(ctx, data.bar, data.legend );
          }else{
            __DrawBarLegend(ctx, data.bar, data.serie);
          }          
        });
      }else{
        _chart.Series.forEach( function(s, i){
          ctx.lineWidth = 1; 
          ctx.strokeStyle = 'silver';
          ctx.beginPath();
          ctx.moveTo(s.bar.left + s.bar.width, _chart.bounds.top - 4);
          ctx.lineTo(s.bar.left + s.bar.width, _chart.bounds.top + _chart.bounds.height + 4);        
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'black';
          __DrawBarLegend(ctx, s.bar, s.text);
        });
      }
    }

    function __DrawLines(){      
      ctx.lineWidth = 2;
      if(_chart.Series.length){
        _chart.Legends.forEach( function(l, i){ 
          ctx.strokeStyle = l.fillStyle;      
          ctx.beginPath();       
          _chart.Data.forEach( function(data, i){        
            if(data.legend != l.key) return;
            if(i==0)
              ctx.moveTo(data.hotPoint.x, data.hotPoint.y);
            else
              ctx.lineTo(data.hotPoint.x, data.hotPoint.y);     
          });        
          ctx.stroke();  
        });
      }else{
        ctx.strokeStyle = 'gray';      
        ctx.beginPath();     
        _chart.Data.forEach( function(data, i){ 
          if(i==0)
            ctx.moveTo(data.hotPoint.x, data.hotPoint.y);
          else
            ctx.lineTo(data.hotPoint.x, data.hotPoint.y);     
        });
        ctx.stroke();  
      }
      _chart.Data.forEach( function(data, i){
        MAPA.Graphics.DrawCircle(ctx, data.hotPoint, 1, 'black', 'white');
        MAPA.Graphics.DrawCircle(ctx, data.hotPoint, 1, 'black', data.selected ? 'rgba(0,0,125,.8)' : 'white')     
      });
      _chart.Data.forEach( function(data, i){  
        var __point    = data.bar.centerPoint();
        __point.y      = data.bar.top - 18 
        __draw_barValue(ctx, __point, data.value, { box : false });        
      });
      if(_chart.Series.length){
        _chart.Series.forEach( function(s, i){            
          __DrawBarLegend(ctx, s.bar, s.text);
        });
      }else{
        _chart.Data.forEach( function(data, i){      
          if(_chart.SeriesEnabled){
            __DrawBarLegend(ctx, data.bar, data.legend);
          }else{
            __DrawBarLegend(ctx, data.bar, data.serie );
          }
        });
      }


    }
             
    function __MeasureBarLegend(ctx,value){
      ctx.font = '9.5px sans-serif-condensed';
      return ctx.measureText(value).width;
    }

    function __DrawBarLegend(ctx, r, value){
      ctx.fillStyle    = 'black';
      ctx.font         = '9.5px sans-serif-condensed';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      var __point    = r.centerPoint();
      __point.y      = r.top + r.height + (r.line ? 24 : 12); 
      ctx.fillText(value, __point.x, __point.y);
    }
   
    function __DrawGridX(ctx, r, o){    
      ctx.lineWidth = 1;      
      for(var x = 0; x < 100; x++){
        if(x % 10 == 0){
          var __top = r.top + r.height * (x / 100.0)
          ctx.beginPath();
          ctx.moveTo(r.left - 4, __top);
          ctx.lineTo(r.left + r.width + 2, __top);  
          ctx.strokeStyle = 'silver';      
          ctx.stroke();
          
          ctx.fillStyle    = 'black';
          ctx.font         = '9.5px sans-serif-condensed';
          ctx.textAlign    = 'right'; 
          ctx.textBaseline = 'middle';
          ctx.fillText((100 - x) * 1 / _chart.ratio, r.left - 6, __top);
        }
      }
    }
    
    function __DrawGridY(ctx, r, data){
      if(_chart.Series.length) return;
      ctx.lineWidth = 1; 
      ctx.strokeStyle = 'silver';
      data.forEach( function(item, i){           
        var __point = item.bar.centerPoint();
        ctx.beginPath();
        ctx.moveTo(__point.x, r.top - 4);
        ctx.lineTo(__point.x, r.top + r.height + (item.bar.line ? 12 : 6));        
        ctx.stroke();
      });

    }

    return _that;
  
  }();

  // ==================================================
  // [value, legend, color]
  // ==================================================
  var Type_PieView = function(){

    var _that = {};
    
    _that.LoadData = function(data){
      _chart.dataSource = data;
      _chart.Data       = [];
      _chart.Legends    = [] ;
      data.forEach( function(value, i){       
        var __item   = { value      : value[0],                          
                         legend     : value[1] || '',
                         fillStyle  : value[2] || _chart.Colors.Next()
                        };
        _chart.Data.add(__item);
        _chart.Legends.add( { key : __item.legend, text : __item.legend, fillStyle : __item.fillStyle } )
      });
      _that.total = 0.0;
      _chart.Data.forEach( function(item){ _that.total += item.value; });
      _that.RefreshLayout();
    }

    _that.RefreshLayout = function(){      
      _chart.bounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                              _chart.Padding[0], 
                                              _chart.Width  - _chart.Padding[1] - _chart.Padding[3],
                                              _chart.Height - _chart.Padding[0] - _chart.Padding[2]);
      if(_chart.Title){
        _chart.TitleBounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                                      _chart.Padding[0], 
                                                      _chart.Width - _chart.Padding[1] - _chart.Padding[3], 
                                                    30);  
        _chart.bounds.top    += _chart.Padding[3] + 15;
        _chart.bounds.height -= _chart.Padding[3] + 15;
      }
      
      if(_chart.LegendBox){
        var __w = _chart.bounds.width * (_chart.LegendWidth || .33);
        _chart.bounds.width -= __w;
        _chart.LegendBounds = new MAPA.Core.Math.Rect( _chart.bounds.width + _chart.bounds.left + 15, 
                                                        _chart.bounds.top, 
                                                        __w - 15, 
                                                        _chart.bounds.height);        
      } 

      var __360  = Math.PI * 2 - (Math.PI/180 * _chart.Data.length);
      _chart.Data.forEach( function(item, i){
        item.percent = item.value * 100 / _that.total;
        item.angle   = __360 * item.percent/100; 
        item.text    = '{0} %'.format(item.percent.toFixed(1));
      });

      _that.Draw();
    }

    _that.Draw = function(){
      __reset_canvas({ border : 1 });     
      if(_chart.Title){
        __draw_title(ctx, _chart.TitleBounds, _chart.Title);      
      }
      if(_chart.LegendBox){
        __draw_legendBox(ctx, _chart.LegendBounds);
      }
      if(_chart.Data.length==1){
        __DrawCircle(ctx, _chart.bounds);
      }else{
        __DrawChart(ctx, _chart.bounds);  
      }               
    }
    
    function __DrawChart(ctx, r, o){
      var __center = r.centerPoint();
      var __radius = Math.min(r.width, r.height) * .40; 
      var __last   = 0;  
      
      ctx.lineWidth   = 1;
      ctx.strokeStyle = 'black';      
      _chart.Data.forEach( function(item, i){ 
        var __angle = item.angle_t = item.angle * .5 + __last;        
        var __dir    = new MAPA.Core.Math.Vector2(Math.cos(__angle), Math.sin(__angle));
        var __origin = __dir.clone().mul(5).add(__center);
        
        ctx.beginPath();                        
        ctx.moveTo(__origin.x, __origin.y);      
        ctx.arc(__center.x, __center.y, __radius, __last, __last + item.angle, false);
        ctx.lineTo(__origin.x, __origin.y);
        ctx.fillStyle = item.fillStyle;
        ctx.fill();
        ctx.stroke();

        item.pos1 = __dir.clone().mul(__radius * 1.1).add(__center); 
        if(item.angle>.2){
          item.pos2 = __dir.clone().mul(__radius * 0.6).add(__center);
        }else{
          item.pos2 = __dir.clone().mul(__radius * ((i%2) ? 0.6 : 0.9)).add(__center);
        }       
        __last += item.angle + Math.PI/180; 
      });
      _chart.Data.forEach( function(item, i){        
        //ctx.save();
        //ctx.translate(item.pos1.x, item.pos1.y);
        //ctx.rotate(item.angle_t);
        //ctx.translate(-item.pos1.x, -item.pos1.y);
        __draw_barValue(ctx, item.pos1, item.legend , { textAlign : (item.pos1.x > __center.x) ? 'left' : 'right' }); 
        //ctx.restore();
        //ctx.save();
        //ctx.translate(item.pos2.x, item.pos2.y);
        //ctx.rotate(item.angle_t);
        //ctx.translate(-item.pos2.x, -item.pos2.y);
        __draw_barValue(ctx, item.pos2, item.text, { box : true });
        //ctx.restore();  
      })
    }

    function __DrawCircle(ctx, r, o){
      var __center = r.centerPoint();
      var __radius = Math.min(r.width, r.height) * .40;             
      ctx.lineWidth   = 1;
      ctx.strokeStyle = 'black';          
      ctx.beginPath();                             
      ctx.arc(__center.x, __center.y, __radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = _chart.Data[0].fillStyle;
      ctx.fill();
      ctx.stroke();
      __draw_barValue(ctx, __center.clone().set(__center.x,__center.y - __radius - 15), _chart.Data[0].legend); 
      __draw_barValue(ctx, __center.clone(), _chart.Data[0].text, { box : true });
    }

    return _that;
 
  }();

  // ==================================================
  // ['x y', serie, color]
  // ==================================================
  var Type_LineView = function(){

    var _that = {};
   
    var __getY = function(value){ return _chart.bounds.top + _chart.bounds.height - _that.ratio[1] * value * _chart.bounds.height / 100; }  
    var __getX = function(value){ return _chart.bounds.left + (_that.ratio[0] * value * _chart.bounds.width / 100); } 

    _that.LoadData = function(data){
      _chart.dataSource = data;
      _chart.Data       = [];
      _chart.Series     = [];
      _chart.Legends    = _chart.Series;
      data.forEach( function(value, i){ 
        var __tokens = (value[0] + '').split(' ');
        var __getValue = function(){
          if(__tokens.length==1)  return { x : i * 10 + 10, 
                                           y : (__tokens[0] || 0.0) * 1.0 }
          else                    return { x : (__tokens[0] || 0.0) * 1.0, 
                                           y : (__tokens[1] || 0.0) * 1.0 }
        }
        var __item   = { value      : __getValue(),                          
                         serie      : value[1] || '',
                         fillStyle  : value[2] || _chart.Colors.Next()
                       };
        _chart.Data.add(__item);
      });
      _chart.Data.Distinct( function(d){ return d.serie; })
                 .forEach( function(name){
                    if(name){ 
                      var __fillStyle = _chart.Data.Item('serie', name).fillStyle;
                      _chart.Series.add( { key : name, text : name, fillStyle : __fillStyle } );                                            
                    }
                 });
      
      _that.max   = [-Infinity, -Infinity];         
      _that.ratio = [1.0, 1.0];
      _chart.Data.forEach( function(item){ 
        _that.max[0] = _that.max[0] < item.value.x ? item.value.x : _that.max[0]; 
        _that.max[1] = _that.max[1] < item.value.y ? item.value.y : _that.max[1];        
      });
      _that.max[1] = __clamp(_that.max[1]);
      _that.max[0] = __clamp(_that.max[0]);    
      _that.ratio[0] = 100.0 / _that.max[0]; 
      _that.ratio[1] = 100.0 / _that.max[1]; 

      _that.RefreshLayout();
    }

    _that.RefreshLayout = function(){      
      _chart.bounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                              _chart.Padding[0], 
                                              _chart.Width  - _chart.Padding[1] - _chart.Padding[3],
                                              _chart.Height - _chart.Padding[0] - _chart.Padding[2]);
      if(_chart.Title){
        _chart.TitleBounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                                      _chart.Padding[0], 
                                                      _chart.Width - _chart.Padding[1] - _chart.Padding[3], 
                                                    30);  
        _chart.bounds.top    += _chart.Padding[3] + 15;
        _chart.bounds.height -= _chart.Padding[3] + 15;
      }
      
      if(_chart.LegendBox){
        var __w = _chart.bounds.width * (_chart.LegendWidth || .33);
        _chart.bounds.width -= __w;
        _chart.LegendBounds = new MAPA.Core.Math.Rect( _chart.bounds.width + _chart.bounds.left + 15, 
                                                        _chart.bounds.top, 
                                                        __w - 15, 
                                                        _chart.bounds.height);        
      }
      
      _chart.Data.forEach( function(data){ 
        data.hotPoint  = MAPA.Core.Collision.CreateCircle( __getX(data.value.x), __getY(data.value.y), 3);
      })
      

      _that.Draw();
    }

    _that.Draw = function(){
      __reset_canvas();     
      if(_chart.Title){
        __draw_title(ctx, _chart.TitleBounds, _chart.Title);      
      }
      if(_chart.LegendBox){
        __draw_legendBox(ctx, _chart.LegendBounds);
      }
      __DrawY(ctx, _chart.bounds);
      __DrawX(ctx, _chart.bounds);
      __draw_axes(ctx, _chart.bounds);
      __DrawLines(ctx, _chart.bounds);
      __DrawPoints(ctx, _chart.bounds);    
    }

    function __DrawLines(ctx, r, o){        
      var __drawItem = function(data, i){
        if(i==0) ctx.moveTo(data.hotPoint.x, data.hotPoint.y);
        else     ctx.lineTo(data.hotPoint.x, data.hotPoint.y);
      }    
      if(_chart.Series.length){
        _chart.Legends.forEach( function(l, i){     
          ctx.beginPath();       
          _chart.Data.forEach( function(data, i){        
            if(data.serie == l.key) __drawItem(data, i);               
          });  
          ctx.lineWidth   = 2;
          ctx.strokeStyle = l.fillStyle;      
          ctx.stroke();  
        });
      }else{      
        ctx.beginPath();       
        _chart.Data.forEach( function(data, i){ __drawItem(data, i); });
        ctx.lineWidth   = 2;
        ctx.strokeStyle = 'red';
        ctx.stroke();  
      }
    }

    function __DrawPoints(ctx, r, o){
      
      var __drawPoint = function(data, i){ 
        MAPA.Graphics.DrawCircle(ctx, data.hotPoint, 1, 'black',  data.selected ? 'rgba(0,0,125,.8)' : 'white');
      } 
      
      var __c = MAPA.Core.Collision.CreateCircle(0,0,2)  
      var __last = -Infinity;
      var __drawLabel = function(data, i){
          __c.x = data.hotPoint.x;
          __c.y = data.hotPoint.y - ((__last < data.value.y) ? 10 : -15);
          __draw_barValue(ctx, __c, data.value.y);
          __last = data.value.y; 
      }
      if(_chart.Series.length){
        _chart.Legends.forEach( function(l, i){
           __last = -Infinity;
          _chart.Data.forEach( function(data, i){        
            if(data.serie == l.key){
              __drawPoint(data, i);
              __drawLabel(data, i);
            }
          });  
        });
      }else{  
        _chart.Data.forEach( __drawPoint );
        _chart.Data.forEach( __drawLabel );
      }
    }

    function __DrawY(ctx, r, o){    
      ctx.lineWidth = 1;      
      for(var x = 0; x < 100; x++){
        if(x % 10 == 0){     
          var __y_pos = __getY((100 - x) /_that.ratio[1]);

          ctx.beginPath();
          ctx.moveTo(r.left - 4, __y_pos);
          ctx.lineTo(r.left + r.width + 2, __y_pos);  
          ctx.strokeStyle = 'silver';      
          ctx.stroke();
          
          ctx.fillStyle    = 'black';
          ctx.font         = '9.5px sans-serif-condensed';
          ctx.textAlign    = 'right'; 
          ctx.textBaseline = 'middle';
          ctx.fillText( (100 - x) / _that.ratio[1], r.left - 6, __y_pos);
        }
      }
    }

    function __DrawX(ctx, r, o){    
      ctx.lineWidth = 1;      
      for(var x=1; x <= 100; x++){
        if(x % 10 == 0){
          var __x_pos = __getX(x /_that.ratio[0]);
               
          ctx.moveTo(__x_pos, r.top - 4);
          ctx.lineTo(__x_pos, r.top + r.height + 4);  
          ctx.strokeStyle = 'silver';        
          ctx.stroke();
          
          ctx.fillStyle    = 'black';
          ctx.font         = '9.5px sans-serif-condensed';
          ctx.textAlign    = 'center'; 
          ctx.textBaseline = 'middle';
          ctx.fillText( x / _that.ratio[0], __x_pos, r.top + r.height + 12);
        }
      }
    }

    return _that;
 
  }();


  // ================================================================================
  // 0: ["8:00,9:00,13:00,14:00,17:00,21:00,22:00", 0.5]        Eje X, desplazamiento
  // 1: ["04179642J,00000000T"]                                 Eje Y
  // 2: ["8:00,9:00,13:00,14:00,17:00,22:00", "3,1,1,3,3,1"]    Valores [Literales]  
  // n: ["04179642J#Rafael,00000000T#Otro"]                     Descripcion EjeY
  // ================================================================================
  var Type_TableView = function(){

    var _that = {};
   
    var __getY = function(value){ return _chart.bounds.top + _chart.bounds.height - value * _chart.bounds.height / (_that.Y.length + 1); }  
    var __getX = function(value){ return _chart.bounds.left + value * _chart.bounds.width / (_that.X.length + 1); } 

    _that.LoadData = function(data){
      _chart.dataSource = data.data;
      _chart.Data       = [];
      _chart.Legends    = [];
      _that.X        = data[0][0].split(',');
      _that.X_offset = data[0][1] || 0.5;
      _that.Y   = data[1][0].split(',');
      _that.Y_color = [];
      var __names = data.pop()[0].split(',')
                                 .map( function(s){ var __t = s.split('#'); 
                                                    return { key : __t[0], name : s.replace('#',' ') }
                                                  });
      data.forEach( function(value, i){
        if(i<2) return;
        var __labels = (value[1] || '').split(',');
        value[0].split(',')
                .forEach( function(v, ii){
          var __item   = { x      : _that.X.indexOf(v), 
                           y      : i - 2,
                           value  : v,
                           text   : __labels[ii] };
          _chart.Data.add(__item);  
        });        
      });

      _that.Y.forEach( function(y,i){ 
        _that.Y_color[i] =  _chart.Colors.Next();
        var __text = __names.Item('key',y).name;
        _chart.Legends.add( { key : y, text : __text, fillStyle : _that.Y_color[i] } );               
      })          
      _chart.Legends.reverse();
      _that.RefreshLayout();
    }

    _that.RefreshLayout = function(){
      var __width = _chart.Padding[3];
      _that.Y.forEach( function(l, i){ 
       __width =  Math.max(__width, _chart.Padding[3]/2 + __measure_text(ctx, '9.5px sans-serif-condensed', l)); 
      });
      _chart.bounds = new MAPA.Core.Math.Rect(__width, 
                                              _chart.Padding[0], 
                                              _chart.Width  - _chart.Padding[1] - __width,
                                              _chart.Height - _chart.Padding[0] - _chart.Padding[2]);
      if(_chart.Title){
        _chart.TitleBounds = new MAPA.Core.Math.Rect(_chart.Padding[3], 
                                                      _chart.Padding[0], 
                                                      _chart.Width - _chart.Padding[1] - _chart.Padding[3], 
                                                    30);  
        _chart.bounds.top    += _chart.Padding[3] + 15;
        _chart.bounds.height -= _chart.Padding[3] + 15;
      }
      
      if(_chart.LegendBox){
        var __w = _chart.bounds.width * (_chart.LegendWidth || .33);
        _chart.bounds.width -= __w;
        _chart.LegendBounds = new MAPA.Core.Math.Rect( _chart.bounds.width + _chart.bounds.left + 15, 
                                                        _chart.bounds.top, 
                                                        __w - 15, 
                                                        _chart.bounds.height);        
      }   
      
      _chart.Data.forEach( function(data){ 
        data.hotPoint  = MAPA.Core.Collision.CreateCircle( __getX(data.x + _that.X_offset), __getY(data.y + 1), 3);
      })
      _that.Draw();
    }

    _that.Draw = function(){
      __reset_canvas();     
      if(_chart.Title){
        __draw_title(ctx, _chart.TitleBounds, _chart.Title);      
      }
      if(_chart.LegendBox){
        __draw_legendBox(ctx, _chart.LegendBounds);
      }
      __DrawY(ctx, _chart.bounds);
      __DrawX(ctx, _chart.bounds);
      __draw_axes(ctx, _chart.bounds);
      __DrawLines(ctx, _chart.bounds);
      __DrawPoints(ctx, _chart.bounds); 
    }

    function __DrawY(ctx, r, o){    
      ctx.lineWidth = 1;      
      _that.Y.forEach( function(l, i){    
          var __y_pos = __getY(i+1);
          ctx.beginPath();
          ctx.moveTo(r.left - 4, __y_pos);
          ctx.lineTo(r.left + r.width + 2, __y_pos);  
          ctx.strokeStyle = 'silver';      
          ctx.stroke();          
          ctx.fillStyle    = 'black';
          ctx.font         = '9.5px sans-serif-condensed';
          ctx.textAlign    = 'right'; 
          ctx.textBaseline = 'middle';
          ctx.fillText(l, r.left - 6, __y_pos);        
      });
    }

    function __DrawX(ctx, r, o){    
      ctx.lineWidth = 1; 
       _that.X.forEach( function(l, i){
         var __x_pos = __getX(i+1);               
         ctx.moveTo(__x_pos, r.top - 4);
         ctx.lineTo(__x_pos, r.top + r.height + 4);  
         ctx.strokeStyle = 'silver';        
         ctx.stroke();          
         ctx.fillStyle    = 'black';
         ctx.font         = '9.5px sans-serif-condensed';
         ctx.textAlign    = 'center'; 
         ctx.textBaseline = 'middle';
         __x_pos = __getX(i + _that.X_offset); 
         ctx.fillText(l, __x_pos, r.top + r.height + 12);  
      });      
    }

    function __DrawLines(ctx, r, o){        
      var __drawItem = function(data, i){        
        if(i==0) {
          ctx.beginPath();
          ctx.moveTo(data.hotPoint.x, data.hotPoint.y);
        }
        else{
          ctx.lineTo(data.hotPoint.x, data.hotPoint.y);
        }
      }  

      _that.Y.forEach( function(y, i){
        _chart.Data.Where( function(d){ return d.y == i;})
                   .forEach(__drawItem);
        ctx.lineWidth   = 2;
        ctx.strokeStyle = _that.Y_color[i];
        ctx.stroke();
      });
    }

    function __DrawPoints(ctx, r, o){            
      var __drawPoint = function(data, i){ 
        MAPA.Graphics.DrawCircle(ctx, data.hotPoint, 1, 'black',  data.selected ? 'rgba(0,0,125,.8)' : 'white');
      }
      var __c = MAPA.Core.Collision.CreateCircle(0,0,2)        
      var __drawLabel = function(data, i){
        __c.x = data.hotPoint.x;
        __c.y = data.hotPoint.y - 10;
        __draw_barValue(ctx, __c, data.text || data.value);          
      }
      _chart.Data.forEach( __drawPoint );
      _chart.Data.forEach( __drawLabel );
    }

    return _that;
 
  }();

  _chart.ChangeStyle = function(value){
    _chart.Style = value % 5; 
    __set_view();
    _chart.LoadData(_chart.dataSource);
    return _chart;
  }

  var __set_view = function(){
    if(_chart.Style == 0){
      _chart.RefreshLayout = Type_PieView.RefreshLayout;
      _chart.LoadData      = Type_PieView.LoadData;
      _chart.Draw          = Type_PieView.Draw; 
    }else if(_chart.Style == 3){
      _chart.RefreshLayout = Type_LineView.RefreshLayout;
      _chart.LoadData      = Type_LineView.LoadData;
      _chart.Draw          = Type_LineView.Draw; 
    }else if(_chart.Style == 4){
      _chart.RefreshLayout = Type_TableView.RefreshLayout;
      _chart.LoadData      = Type_TableView.LoadData;
      _chart.Draw          = Type_TableView.Draw;    
    }else{
      _chart.RefreshLayout = Type_BarView.RefreshLayout;
      _chart.LoadData      = Type_BarView.LoadData;
      _chart.Draw          = Type_BarView.Draw; 
    }  
  }
 
  _chart.Canvas         = $.$('canvas', { id : 'canvas', width : _chart.Width, height : _chart.Height, 
                                          className : 'default-canvas'
                                        });
  _chart.Canvas.onclick = __onclick;  
  _chart.Context        = _chart.Canvas.getContext("2d");
  ctx                   = _chart.Context ;
  __set_view();
      
  return _chart;
}

MAPA.Charts.prototype.createColors = function(v){
  var __v = [0, 51, 102, 153, 204, 255];
  var __l = __v.length-1;
  var __c = [];
  var __x = 0;
  while(__x < v){
    __c.add('rgba({0},{1},{2},.9)'.format(__v[~~MAPA.Core.Math.Random(__l,0)],
                                          __v[~~MAPA.Core.Math.Random(__l,0)],
                                          __v[~~MAPA.Core.Math.Random(__l,0)]));
    __x++;
  }
  return __c;
}




