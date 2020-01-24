MAPA.TreeView = function(options) {
  MAPA.apply(this, options);

  var THIS = this;
  this._Update = true;
  this.SelectedNode = undefined;
  // Eventos
  this.OnNodeClick = this.OnNodeClick || undefined
  this.OnAddNode   = this.OnAddNode   || undefined
  
  this.ul = $.New('ul',{className:'tree'});
  //this.ul.style.scrollbarBaseColor="red"   
  this.Element = this.ul;

  var _NewNodes = [];
  (this.Nodes || []).forEach(function(e, index) {
    var li = $.New('li',{className:'closed'});
    li.appendChild(_NewNodes.add(new MAPA.TreeNode(e.Text, THIS, THIS, e.img)).a);
    THIS.ul.appendChild(li);
    if (THIS.OnAddNode) THIS.OnAddNode(_NewNodes.lastItem());
  })
  this.Nodes = _NewNodes;

  this.Nodes.AddNode = function(text, img) {
    var li = $.New('li', {className:'closed'});
    THIS.ul.appendChild(li);      
    li.appendChild(_NewNodes.add(new MAPA.TreeNode(text, THIS, THIS, img)).a);     
    if (MAPA.isIE) li.style.width = MAPA.TreeView.getTextWidth(text) + 100;
    if (THIS.OnAddNode) THIS.OnAddNode(_NewNodes.lastItem());
    MAPA.TreeView.Recontar(THIS);
  }

  this.Nodes.AddNodes = function(o) {
    var NNN = o || [];
    NNN.forEach(function(e) {
      var li = $.New('li', {className:'closed'});
      THIS.ul.appendChild(li);        
      if (THIS.img && THIS.img.add) THIS.c.lastChild.style.backgroundImage = ['url(', THIS.img[1], ')'].join('');

      li.appendChild(_NewNodes.add(new MAPA.TreeNode(e.Text, THIS, THIS, e.img)).a);
      if (MAPA.isIE) li.style.width = MAPA.TreeView.getTextWidth(e.Text) + 100;
      if (THIS.OnAddNode) THIS.OnAddNode(_NewNodes.lastItem());
    })
    MAPA.TreeView.Recontar(THIS);
  }

  this.BeginUpdate = function() { THIS._Update = false };
  this.EndUpdate = function() { THIS._Update = true };
  this.__OnItemClick = function(evenArg) {
    THIS.SelectedNode = evenArg.Sender;
    if (THIS.OnNodeClick) THIS.OnNodeClick(evenArg);
  }

  MAPA.TreeView.Recontar(this);
  return this;

}
 
MAPA.TreeView.getTextWidth = function(text, _parent) {
  var p = _parent || document.body;
  var ea = document.createElement("span");
  ea.innerHTML = text;
  p.appendChild(ea);
  var len = ea.offsetWidth;
  p.removeChild(ea);
  return len;
}
MAPA.TreeView.OnClick = function(eventArg) {
  var node = eventArg.Sender.a;
  var parent = node.parentNode;
  
  if(!eventArg.Sender.HasChildren){ return;}       
  
  if (parent.className.beginsWith('A')) {
    parent.className = parent.className.replace('Aclosed', 'closed')
    node.className = node.className.replace('AspanClosed', 'spanClosed')
    if (eventArg.Sender.img && eventArg.Sender.img.add )
      eventArg.Sender.c.lastChild.style.backgroundImage = ['url(',eventArg.Sender.img[1],')'].join('');  
    else
      eventArg.Sender.c.lastChild.style.backgroundImage = ''; 
  }
  else {
    parent.className = parent.className.replace('closed', 'Aclosed')
    node.className = node.className.replace('spanClosed', 'AspanClosed')
    if (eventArg.Sender.img && eventArg.Sender.img.add)
      eventArg.Sender.c.lastChild.style.backgroundImage = ['url(',eventArg.Sender.img[2],')'].join('');  
    else
      eventArg.Sender.c.lastChild.style.backgroundImage = '';
  }
}  

MAPA.TreeView.Recontar = function(node) {              
  var ul = node.ul || node.li.parentNode   
  MAPA.toArray(ul.childNodes).forEach(function(e, indice) {
    e.className = e.className.replace('last', '');
    if (indice == ul.childNodes.length - 1) e.className = e.className + ' last';      
  })
  var _N = node.Nodes;
  _N.forEach(function(e, indice) {
    if (e.HasChildren){ 
      if (!e.a.className.beginsWith('AspanClosed')){        
        e.a.className = 'spanClosed a children' + ((indice == _N.length - 1) ? ' last' : '');
        e.c.lastChild.style.backgroundImage = ''
        if (e.img && e.img.add) e.c.lastChild.style.backgroundImage = ['url(',e.img[1],')'].join('');           
      }
    }
    else {
      e.a.className = (indice == _N.length - 1) ? 'a last' : 'a';       
      if (e.img && MAPA.isString(e.img)) e.c.lastChild.style.backgroundImage = ['url(',e.img,')'].join('');          
      if (e.img && e.img.add) e.c.lastChild.style.backgroundImage = ['url(',e.img[0],')'].join('');         
    }
  })
  if (node.parentNode) MAPA.TreeView.Recontar(node.parentNode)
}

MAPA.TreeNode = function(text, parentNode, treeView, img) {
  this.TreeView = treeView;
  this.parentNode = parentNode;
  this.Nodes = this.Nodes || [];
  this.HasChildren = false;
  this.Text = text;
  this.img = img;

  this.c = $.New('span',{className:'c'});
  this.b = $.New('span',{className:'b'});
  this.a = $.New('span',{className:'a'});    
  this.b.appendChild(this.c);
  this.a.appendChild(this.b);
  this.c.appendChild($.New('a', {href:'#'}));      
  if(this.img && MAPA.isString(this.img)){this.c.lastChild.style.backgroundImage = ['url(',this.img,')'].join('');}
  if(this.img && this.img.add){this.c.lastChild.style.backgroundImage = ['url(',this.img[0],')'].join('');}
  this.c.lastChild.appendChild(document.createTextNode(text));

  var THIS = this;
  var _eventArg = {Text: THIS.Text,Sender:THIS}    
  MAPA.AddEvent(this.c.lastChild, 'click',  function() { treeView.__OnItemClick(_eventArg); } );  

  this.Remove = function(){      
    this.parentNode.Nodes.remove(this);
    if(this.TreeView.SelectedNode && this.TreeView.SelectedNode==this) this.TreeView.SelectedNode = undefined; 
    this.parentNode.ul.removeChild(this.a.parentNode);
    this.parentNode.HasChildren = (this.parentNode.Nodes.length!=0);
    if (!this.parentNode.HasChildren) this.parentNode.a.parentNode.className = 'closed';
    MAPA.TreeView.Recontar( this.parentNode.HasChildren ? this.parentNode : this.parentNode.parentNode)          
  }
  
  this.AddNode = function(text,img) {
    this.HasChildren = true;      
    if (!this.ul) {
      this.ul = $.New('ul');        
      this.a.parentNode.appendChild(this.ul);
      this.a.parentNode.className = 'closed';        
      this.a.className = 'spanClosed a children ';
      if (this.img && this.img.add) this.c.lastChild.style.backgroundImage = ['url(',this.img[1],')'].join('');  
      
      var _eventArg = {Sender: THIS};
      MAPA.AddEvent(this.a, 'click', function() { MAPA.TreeView.OnClick(_eventArg) });
    }
    this.li = $.New('li');
    this.ul.appendChild(this.li);
    this.li.appendChild(this.Nodes.add(new MAPA.TreeNode(text, this, this.TreeView, img)).a);
    if (MAPA.isIE) this.li.style.width = MAPA.TreeView.getTextWidth(text) + 100;
    if (this.TreeView.OnAddNode) this.TreeView.OnAddNode(this.Nodes.lastItem());       
    
    if(this.TreeView._Update) MAPA.TreeView.Recontar(this);
    
    return this.Nodes.lastItem();
  }

  this.AddNodes = function(nodes) {
    this.HasChildren = true;      
    if (!this.ul) {
      this.ul = $.New('ul');        
      this.a.parentNode.appendChild(this.ul);
      this.a.parentNode.className = 'closed';        
      this.a.className = 'spanClosed a children ';
      if (this.img && this.img.add) this.c.lastChild.style.backgroundImage = ['url(',this.img[1],')'].join('');  
     
      var _eventArg = {Sender: THIS};
      MAPA.AddEvent(this.a, 'click', function() {MAPA.TreeView.OnClick(_eventArg) });
    }            
    (nodes || []).forEach(function(e){
      THIS.li = $.New('li')        
      THIS.ul.appendChild(THIS.li);
      THIS.li.appendChild(THIS.Nodes.add(new MAPA.TreeNode(e.Text, THIS, THIS.TreeView, e.img)).a);
      if (MAPA.isIE) THIS.li.style.width = MAPA.TreeView.getTextWidth(text) + 100;
      if (THIS.TreeView.OnAddNode) THIS.TreeView.OnAddNode(THIS.Nodes.lastItem());       
    })
          
    if(this.TreeView._Update) MAPA.TreeView.Recontar(this);
    
    return this.Nodes.lastItem();
  }
  
  this.SetImage   = function(i){if(!i){this.ClearImage();return;} this.c.lastChild.style.backgroundImage = String.format('url({0})',i);}
  this.ClearImage = function(){this.c.lastChild.style.backgroundImage = '';}
  this.SetText    = function(value){
    this.Text = value;
    this.c.lastChild.innerHTML = value
   if (MAPA.isIE) this.a.parentNode.style.width = MAPA.TreeView.getTextWidth(value) + 100;
  }
  
  return this;
}

//var _TT;  
//var _IL = {Hoja   : './icon_Hoja.gif',
//           DB     : './icon_DB.gif',
//           Disk   : './icon_Save.gif',
//           Open   : './Close.gif',
//           Close  : './Open.gif',
//           Wait   : './loading.gif'}

  
//_TT = new MAPA.TreeView({ Nodes: [{Text :'Dos-1',img: _IL.DB},
//                                  {Text :'Dos-2',img: [_IL.Disk,_IL.Close,_IL.Open]},
//                                  {Text :'Dos-3',img: [_IL.Disk,_IL.Close,_IL.Open]},
//                                  {Text :'Dos-4',img: [_IL.Disk,_IL.Close,_IL.Open]},
//                                  {Text :'Dos-5',img: _IL.DB},
//                                  {Text :'Dos-6',img: _IL.DB},
//                                  {Text :'Dos-7',img: _IL.DB},
//                                  {Text :'Dos-7',img: _IL.DB}],
//                                  OnAddNode : function(n){
//                                       $('dd').innerHTML += 'Add :' + n.Text + '<br/>'
//                                  },
//                                  OnNodeClick : MAPA.emptyFn
//                       })                                      
//_TT.Nodes.AddNodes([{Text :'333' , img: [_IL.Disk,_IL.Open,_IL.Close]},                        
//                    {Text :'555'}]);
//                        
//_TT.Nodes[0].AddNodes([{Text :'Dos-1'}, {Text :'Dos-2'}, {Text :'Dos-3'}, {Text :'Dos-4'}]);                             
//_TT.Nodes[1].AddNode('6-23').AddNode('6-23-1', _IL.Disk).AddNode('Este es el ultimo');  
//_TT.Nodes[7].AddNodes([{Text : '1', img: _IL.DB},
//                       {Text : '2', img: _IL.DB},
//                       {Text : '3', img: _IL.Hoja},
//                       {Text : '4', img: _IL.Hoja}]);
//                      
//_TT.OnNodeClick = function(n){
//  $('dd').innerHTML += n.Text + '<br/>'
//  
//  if (n.Sender.HasChildren){
//    n.Sender.c.innerHTML='';