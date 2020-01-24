// ========================================================================================
// Templates
// ========================================================================================
(function(module){
  function getValue(v, scope){ 
    if(!v) return '';
    var o = scope || window;
    v.split(/\.|\[|\]/).forEach( function(token){
      if(token === '') return;
      o = o[token];
      if(o === undefined) o = window[token];
    });
    return o;
  }    
  function fillTemplate(element, scope){   
    module.templates.$$Current = scope || window;  
    var _root     = element || document.body;
    var _elements = module.toArray(_root.querySelectorAll('[xbind]'));
    if (_root.attributes.xbind) _elements.push(_root);
    _elements.forEach( function(child){
      child.attributes.xbind.value.split(';').forEach( function(token){
        var _tokens = token.split(':');
        var _converter = _tokens[1].trim().split(' ');  
        if(_converter[1]){
          var _value = getValue(_converter[0].trim(), scope);
          var _func  = getValue(_converter[1].trim(), scope);
          child[_tokens[0].trim()] = _func(_value, _converter[2], scope, child);
        }else{      
          child[_tokens[0].trim()] = getValue(_converter[0].trim(), scope);     
        }          
      });
    });
  }  

  function executeTemplate(template, values){
    module.templates.$$values = values;
    var _itemplate = module.$(template); 
    var _sb = module.CreateStringBuilder();
    module.templates.$$values.forEach(function(o, i){
      o.$$index   = i;
      o.$$Node    = _itemplate.cloneNode(true);
      o.$$Node.id = 'Template-' + (++module.templates.$$counter);            
      fillTemplate(o.$$Node, o);
      _sb.append(o.$$Node.outerHTML.replace(/xbind="[^"]*"/g, ''));            
    });
    return _sb.toString();
  }  
  module.templates = { getValue        : getValue, 
                       fillTemplate    : fillTemplate, 
                       executeTemplate : executeTemplate,
                       $$counter       : 0 };  
}(MAPA));

// ========================================================================================
// Reports
// ========================================================================================
(function(module) {

  module.ReportEngine = {};
  
  
  module.ReportEngine.createLink = function(ref){
   return function(){
      var __anchor = $.$('a', { target : '_blank', href : ref });                          
      document.body.appendChild(__anchor); 
      if(module.isIE8){
        __anchor.click();
      }else{
         var __event = document.createEvent('MouseEvents');
        __event.initMouseEvent('click', true, true, window, 0, 0, 0, 1, 1, false, false, false, false, 0, null);
        __anchor.dispatchEvent(__event);     
      }           
      document.body.removeChild(__anchor);
    }
  }
    
  function __cloneRowTemplate(e){           
   var __row = e.cloneNode(true);             
    e.parentNode.parentNode.deleteRow(e.rowIndex);
    return __row;      
  }

  function __mergeTemplate(template, sb, context, onGroupFooter){      
    if(template.forEach) return template.forEach( function(t, i){ __mergeTemplate(t, sb, context[i], onGroupFooter); });      
    module.templates.fillTemplate(template, window);   
    if(BS.reportDefinition.dom_table){
      // Las filas sin columnas no se añaden
      if(template.childElementCount){
        BS.reportDefinition.dom_tbody.appendChild(template.cloneNode(true));
      }
      if(onGroupFooter){
       onGroupFooter({ "sb" : sb, "section" : context });  
      } 
    }else{
      if(context.tag || context.tag == 'nofooter'){        
        return;
      }
      sb.append(template.outerHTML.replace(/xbind="[^"]*"/g, '')); 
      if(onGroupFooter){
       onGroupFooter({ "sb" : sb, "section" : context });  
      } 
    }    
  }
    
  module.ReportEngine.processAll = function(o){
    //console.time('FillReport');
    var __doc = document.createDocumentFragment();
    __doc.appendChild( $.$('div', { innerHTML : o.ReportTemplate } ));      
    o.DetailTemplate = __cloneRowTemplate(__doc.querySelector(o.DetailTemplateSelector));
    if(o.HideTotal){
      var __row = __doc.querySelector(o.TotalTemplateSelector);
      __row.parentNode.removeChild(__row);
    }else{
      o.TotalTemplate  = __cloneRowTemplate(__doc.querySelector(o.TotalTemplateSelector));
    }
    o.GroupsTemplates = [];
    o.GroupsTemplates = o.Grupos.map( function(g){ return __cloneRowTemplate(__doc.querySelector(g.selector))}); 
    
    var _g_id = -1;        
    function __DoHeaders(){
      o.Grupos.forEach( function(grupo,ii){
        if(ii<_g_id) return; 
        var g = o.Grupos[ii];
        if(g.header){        
          var __header = module.templates.getValue(g.header)(g.current,g.name);
          if(__header != 'hidden;'){
            if(__header.text){
              _sb.append('<tr {0}>{1}</tr>'.format(__header.attributes, __header.text));    
            }else if(__header.row){
              BS.reportDefinition.dom_tbody.appendChild(__header.row);
            }else{
              _sb.append('<tr class="group-header">{0}</tr>'.format(__header));
            }            
          }
          if(o.RepeatHeadersAfter==ii){
            o.RepeatHeaders.forEach(function(index){
              if(index!='') _sb.append(o.Headers[index].html);
            })             
          }
        }                           
      });    
    }    
        
    var _sb = module.CreateStringBuilder();             
    o.OnStart(o.DataSet);                    
    o.DataSet.forEach( function(r,i){ 
      if(i==0) __DoHeaders();      
      o.OnRow(r);         
      if(o.Grupos.every( function(g){ return g.test(r) })){
        o.Grupos.forEach( function(g){ 
          g.sum(r);
        });               
      }else{                                                                        
        o.Grupos.some( function(g,i){              
          if(!g.test(r)){
            _g_id = i;                                            
            var __templates = o.GroupsTemplates.map( function(t){ return t;});
            __templates.splice(0,i)
            __templates.reverse();            
            var __groups    = o.Grupos.map( function(g){ return g;});     
            __groups.splice(0,i)    
            __groups.reverse();                           
            __mergeTemplate( __templates, _sb, __groups, o.OnGroupFooter);                                      
            o.Grupos.forEach( function(grupo,ii){                               
              if(ii>=i){
                grupo.init(r)
                _g_id = i;
              }else{
                grupo.sum(r);
               }                  
            });                                                                                   
            return true;
          }                      
          return false; 
        })                                                  
        o.OnRowEnd(r); 
        __DoHeaders()                              
      }    
      if (o.HideDetail) return;      
      __mergeTemplate(o.DetailTemplate, _sb, { name : 'detail' }, o.g);                                      
    });
    if(o.DataSet.length>0){ 
      window.BS.previous = window.BS.data;     
      var __templates = o.GroupsTemplates.map( function(t){ return t;});          
      __templates.reverse();
      if(!o.HideTotal) __templates.push(o.TotalTemplate);
      var __groups    = o.Grupos.map( function(g){ return g;}); 
      __groups.reverse();     
      __groups.push({ name : 'summary'});
      __mergeTemplate(__templates, _sb, __groups, o.OnGroupFooter); 
    }
    //console.timeEnd('FillReport');
    if(BS.reportDefinition.dom_table){
      return module.ReportEngine;
    }else{
      //console.time('StringBuilder');
      module.ReportEngine.Report     = _sb.toString();
      module.ReportEngine.ReportHtml = module.isIE8 ? __doc.querySelector(o.ReportTableSelector).innerHTML.replace('<TBODY>', '<TBODY>' + module.ReportEngine.Report) 
                                                    : __doc.querySelector(o.ReportTableSelector).innerHTML.replace('<tbody>', '<tbody>' + module.ReportEngine.Report);                   
      //console.timeEnd('StringBuilder');
      return module.ReportEngine.ReportHtml;                                               
    }
  }
  
  module.ReportEngine.fromReportDefinition = function(rd, data, callback){
    if(rd.context.renderMode && rd.context.renderMode === 'DOM'){
      rd.dom_table = $.$('div', { innerHTML : rd.html } ).querySelector('table');
      rd.dom_thead = rd.dom_table.querySelector('thead');
      rd.dom_tbody = module.clearNodes(rd.dom_table.querySelector('tbody'));       
    }    
    window.BS = { reportDefinition : rd };
    // ================================================================================================
    // Ordenar los datos
    // ================================================================================================
    if(rd.context.Iteratefn) data.forEach(rd.context.Iteratefn);
    if(rd.context.orderBy)   data.SortBy(rd.context.orderBy, false);    
    // ================================================================================================
    // Inicializar los grupos
    // ================================================================================================
    var __summary = JSON.parse(rd.context.summary || '{}');    
    function __createGroups(){      
      return rd.context
               .groups
               .Where(function(g, i){ return i < rd.context.groups.length-1;})
               .map  (function(g, i){
                        return { name     : 'G' + (i+1), 
                                 selector : '#' + g.id, 
                                 key      : g.key, 
                                 tag      : g.tag || '', 
                                 current  : '',
                                 header   : g.header, 
                                 data     : module.clone(__summary),                                              
                                 init     : function(value){
                                              var __k = value[this.key].toString();
                                              var __BS_Name = window.BS[this.name];
                                              __BS_Name.all[__k] = __BS_Name.all[__k] || [];;
                                              __BS_Name.all[__k].push(value);
                                              __BS_Name.recordCount = 1;                                                                                     
                                              module.ReportEngine.Copy(value, this.data); },
                                 sum      : function(value){ 
                                              var __k = value[this.key].toString();
                                              var __BS_Name = window.BS[this.name];
                                              __BS_Name.all[__k] = __BS_Name.all[__k] || [];;
                                              __BS_Name.all[__k].push(value);                            
                                              __BS_Name.recordCount += 1;                                                                                                                                      
                                              module.ReportEngine.Sum(value, this.data); }, 
                                 test     : function(value){ return value[this.key] == this.current; }}           
      }) || [];     
    }
    // ================================================================================================
    // Inicializar el informe e imprimirlo
    // ================================================================================================
    return ({ DataSet                : data,
              HideDetail             : rd.context.hideDetail=='true' || false,
              HideTotal              : rd.context.groups.length==0 || rd.context.HideTotal=='true' || false,
              ReportTemplate         : rd.html,
              ReportTableSelector    : '#' + rd.context.tableId,          
              DetailTemplateSelector : '#' + rd.context.details[0].id, 
              TotalTemplateSelector  : rd.context.groups.length==0 ? '' : '#' + rd.context.groups.lastItem().id, 
              Grupos                 : __createGroups(), 
              OnGroupFooter          : rd.context.OnGroupFooter, 
              Headers                : rd.context.headers,
              RepeatHeaders          : (rd.context.repeatHeader || '').split(','),  
              RepeatHeadersAfter     : rd.context.repeatHeaderAfter,                                               
              OnRow   : function(data){     
                window.BS.recordCount += 1;   
                window.BS.previous    = window.BS.data || data;
                window.BS.data        = data; 
                this.Grupos.forEach( function(g, i){ window.BS[g.name].data  = Object.create(g.data); }); 
                module.ReportEngine.Sum(data, window.BS.G0);        
                if(rd.context.onRowfn) (new Function('ctx', rd.context.onRowfn)(window.BS));
              },                              
              OnStart : function(dataSet){
                window.BS = { recordCount : 0, 
                              G0          : module.clone(__summary), 
                              dataSet     : dataSet,
                              reportDefinition : window.BS.reportDefinition};
                this.Grupos.forEach( function(g, i){                   
                  g.current = (dataSet && dataSet[0]) ? dataSet[0][g.key] : '';
                  window.BS[g.name] = { recordCount : 0, all : {} };
                });
                if(rd.context.onStartfn) rd.context.onStartfn(window.BS);                    
              },
              OnRowEnd : function(data){
                this.Grupos.forEach( function(g){ g.current = data[g.key]; });
                if(rd.context.onRowEndfn) (new Function('ctx', rd.context.onRowEndfn)(window.BS));  
              },        
              PrintReport : function(callback){        
                if(callback) callback(module.ReportEngine.processAll(this));
                return this;
              }
            }).PrintReport(callback);
  }

  module.ReportEngine.Copy = function(source, dest){ 
    for (var p in dest) { 
      if (dest.hasOwnProperty(p)){ 
        if(source.hasOwnProperty(p)){
          dest[p] = source[p];
          continue;
        }
        if(p === '_max_' || p === '_mim_'){
          var __max = dest[p];
          for (var m in __max){
            if(__max.hasOwnProperty(m) && source.hasOwnProperty(m)) __max[m] = source[m];
          }
        }
        if(p === '_values_'){
          var __agregate = dest[p];
          for (var m in __agregate){
            if(__agregate.hasOwnProperty(m) && source.hasOwnProperty(m)){
              __agregate[m] = [source[m]];
            }
          }
        }
      }
    }
  }                                                                                        
  module.ReportEngine.Sum  = function(source, dest){ 
    for (var p in dest) { 
      if (dest.hasOwnProperty(p)){ 
        if(source.hasOwnProperty(p)){
          dest[p] += source[p];
          continue;
        } 
        if(p === '_max_' || p === '_min_'){
          var __max = dest[p];
          for (var m in __max){
            if(__max.hasOwnProperty(m) && source.hasOwnProperty(m)){
              if(p == '_max_')
                __max[m] = source[m] > __max[m] ? source[m] : __max[m];
              else
                __max[m] = source[m] < __max[m] ? source[m] : __max[m];
            }
          }
        }
        if( p === '_values_'){
          var __agregate = dest[p];
          for (var m in __agregate){
            if(__agregate.hasOwnProperty(m) && source.hasOwnProperty(m)) __agregate[m].add(source[m]);                            
          }
        }
      }
    }    
  } 
  
  module.ReportEngine.Compute = function(d, t){ return d.reduce( function(p, c){ return p + c[t]; }, 0.0); }
  module.ReportEngine.Group   = function(a, c){
	  var dataSet = a, ctx = c;
	  var __f = function(k, t){
	    dataSet.Distinct( function(v){ return v[k]; })	            
	           .forEach ( function(v){ c[v] = dataSet.reduce( function(p, c, i, a){ return (c[k]==v) ? p + c[t] : p; }, 0.0); });
      return __f;	           
	  }
	  return __f;
	}
 
 
})(MAPA);       

// ========================================================================================
// Tabbly
// ========================================================================================
(function (module){
      
  var __context;

  function __get(value){
    if(value && value.trim().beginsWith('@')){
      return __context[value.trim().split('@')[1].trim()] || '';
    }else if(value){
      return value.trim();
    }
    return '';
  }   

  function __getAttributes(data){
    var __attributes = [];
    Object.keys(data)
          .Where( function(key){ return key != 'columns' && key != 'html' && data.hasOwnProperty(key); })
          .forEach( function(key){
            var __k = key=='className' ? 'class' : key;
            __attributes.push('{0}="{1}"'.format(__k, __get(data[key])))
          });
    return __attributes.length>0 ? ' ' +__attributes.join(' ') : '';
  }

  function __fill(data, hide){   
    var sb = module.CreateStringBuilder();   
    (data||[]).forEach(function(row, i){
      var sb_row = module.CreateStringBuilder();
      sb_row.append('\n      <tr{0}>'.format(__getAttributes(row)));
      row.columns.forEach(function(col,i){
        sb_row.append('\n        <td{0}>{1}</td>'.format(__getAttributes(col), __get(col.html)));
      });
      sb_row.append('\n      </tr>');
      row.html = sb_row.toString();
      if(hide && hide.indexOf(i.toString()) > -1) return;
      sb.append(sb_row.toString());      
    });
    return sb.toString();  
  }

  function __ExecuteCode(code){

    __context = { headers : [], groups : [], details : [] };
    var __cur;
    var __func     = '';
    var __funcBody = '';

    function __parse_properties(value){
      var __reg=  /(id|colspan|rowspan|className|html|xbind|style|key|header|tag):('[^']*'|[^\s]*)/g;
      var __o = {};
      var __match = __reg.exec(value);
      while (__match != null) {
        __o[__match[1]] = __get(__match[2].replace(/^'([^']*)'$/g, '$1'));
        __match = __reg.exec(value);
      }
      return __o
    }

    function __parse_cell(value){ return __parse_properties(value); }

    function __parse_row(value){
      var __properties =  __parse_properties(value);
      __properties.columns = [];
      return __properties;
    }

    function __parseLine(l, o){
      if(!__func && !l.trim()) return function(){};
      var __keys = /^(DEFINE|#|ADD_COL|CREATE|RENDER|FUNCTION|END)/;
      if(__keys.test(l)){
        if(/^#/.test(l)){
          return function(){};
        }else if(/^FUNCTION (\w.*)/.test(l)){  
          var __tokens = l.match(/^FUNCTION (\w.*)$/);
          __func     = __tokens[1].trim();
          __funcBody = '';
          return function(){};
        }else if(/^END/.test(l)){      
          var __body = __funcBody;
          var __name = __func;
          __func = __funcBody = ''; 
          return function(){            
            return function(ctx){ ctx[__name] = new Function('ctx', __body); }
          }(); 
        }else if(/^RENDER (\w.*)/.test(l)){        
          return function(){ 
            var __tokens = l.match(/^RENDER (\w.*)$/);
            return function(ctx){
              module.templates.getValue(__tokens[1], window)(__render(ctx)); 
            }
          }();
        }else if(/^ADD_COL /.test(l)){
          var __tokens = l.match(/ADD_COL (.*)$/); 
          return function(){ 
            var tokens = __tokens;
            return function(ctx){ __cur.lastItem().columns.add(__parse_cell(tokens[1])); }
          }();        
        }else if(/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)){
          var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
          return function(){ 
            var tokens = __tokens;
            return function(ctx){ ctx[tokens[1].trim()] = tokens[2].trim(); }
          }();
        }else if(/^CREATE\s\s*(\w*) (.*)$/.test(l)){
          var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
          if(__tokens[1]=='header'){
            return function(){ 
              var tokens = __tokens;
              return function(ctx){ ctx.headers.add(__parse_row(tokens[2])); __cur = ctx.headers;}
            }();
          }
          else if(__tokens[1]=='group'){
            return function(){ 
              var tokens = __tokens;
              return function(ctx){ ctx.groups.add(__parse_row(tokens[2])); __cur = ctx.groups; }
            }();
          }else if(__tokens[1]=='detail'){
            return function(){ 
              var tokens = __tokens;
              return function(ctx){ ctx.details.add(__parse_row(tokens[2])); __cur = ctx.details;}
            }();
          }else{
            return function(){ 
              var tokens = __tokens;
              return function(ctx){ ctx[tokens[1]] = tokens[2]; }
            }();          
          }
        }else{ throw new Error('Tabbly : Unrecognized text after DEFINE')}  
      }else{ 
        if(__func){
          __funcBody += o;
          __funcBody += '\n';
          return function(){};
        }debugger;
        throw new Error('Tabbly : Unrecognized text')
      }
    }

    function __render(ctx){           
      return ('<div id="{0}">\n'.format(ctx.tableId || '') + 
              '  <table class="pre-table" style="width:100%;" id="{3}">\n' +
              '    <thead>{0}\n    </thead>\n' +
              '    <tbody>{1} {2}\n    </tbody>\n' +
              '  </table>\n' + 
              '</div>').format( __fill(ctx.headers, (ctx.hiddenHeaders || '').split(',')), 
                                __fill(ctx.details),
                                __fill(ctx.groups),
                                ctx.tableId);
    }
 
    code.split('\n').forEach(function(l){ 
      __parseLine(l.trim(),l)(__context); 
    });
    return { context : __context, html : __render(__context) };
  }

  module.Tabbly = { execute : __ExecuteCode };

}(MAPA));     