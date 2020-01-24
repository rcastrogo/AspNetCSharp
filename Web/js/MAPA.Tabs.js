/// <reference path="MAPA.js" />

MAPA.FlatTab1__id = 0;
MAPA.FlatTab1 = function(o) {
  var THIS = this;
  o = o || {}
  this.AutoSelect = false || o.AutoSelect;
  this.PanelHeight = o.PanelHeight
  this.Element = $.New('div', { id: o.id || ('FlatTab-' + ++MAPA.FlatTab1__id) ,  className: 'TCon1', style: o.style })
  this.Tab = $.New('ul', { className: 'HeaderT' })

  this.Tabs = []
  var _Tabs = o.Tabs || [{ Title: 'panel 1'}];

  this.CurrentTabIndex = -1;
  var __TabOnmouseover = function() {
    if (this.Tab.TabIndex == THIS.CurrentTabIndex) return;
    THIS.CurrentTabIndex = this.Tab.TabIndex;
    THIS.Tabs.forEach(function(t) {
      if (t.TabIndex === THIS.CurrentTabIndex) {        
        t.Header.className = 'active'
        t.Container.style.display = 'block';
        if (t.Header.OnSelectTab) t.Header.OnSelectTab(t)
      }
      else {
        t.Header.className = '';
        t.Container.style.display = 'none';
      }
    });
    var __tabs = THIS.VisiblesTabs();
    if (__tabs.length>0) __tabs[0].Header.className += ' first';    
  }

  var __CreateTab = function(h, c) {
    return new function() {
      this.TabIndex = THIS.Tabs.length;
      this.Header = h;
      this.Container = c;
      h.Tab = this;
      var _$$This = this;
      this.SetTitle = function(text) { _$$This.Header.firstChild.innerHTML = text; return _$$This;};
      this.SetIcon = function(value) { _$$This.Header.style.backgroundImage = String.format('url({0})', value); return _$$This;};
      this.SetContent = function(value, options) { _$$This.Container.Clear(); _$$This.Container.Add(value, options); return _$$This;};
      this.SetWidth = function(value) { _$$This.Header.style.width = value; return _$$This;};
      this.SetTextOnly = function() { _$$This.Header.style.paddingLeft = '0px'; _$$This.Header.style.backgroundImage = ''; return _$$This; };
      this.SelectMe = function() { if (h.onclick) h.onclick(); else h.onmouseover(); return _$$This; }
      this.Hide = function() { _$$This.Container.style.display = _$$This.Header.style.display = 'none'; return _$$This;}
      this.Show = function() { _$$This.Container.style.display = _$$This.Header.style.display = 'block'; return _$$This;}
      this.SelectNext = function() {
        var __tabs = THIS.VisiblesTabs();
        if (_$$This.TabIndex == THIS.CurrentTabIndex) {
          if (__tabs.length > 0) __tabs[0].SelectMe();
        }
        if (__tabs.length > 0) __tabs[0].Header.className += ' first';
        return _$$This;
      }
    }
  }

  _Tabs.forEach(function(t, _i) {
    var li = $.New('li', { id: 'UL_' + _i, OnSelectTab: t.OnSelectTab,
      style: {
        backgroundImage: (t.Image && t.Image.length) ? String.format('url({0})', t.Image) : '',
        paddingLeft: (t.Image && t.Image.length) ? '' : '0px',
        width: (t.Width) ? t.Width : 'auto'
      },
      className: '' + ((_i == 0) ? 'first active' : '')
    }).Add('span', { innerHTML: t.Title || 'titulo' })
    if (THIS.AutoSelect)
      li.onmouseover = __TabOnmouseover
    else
      li.onclick = __TabOnmouseover;
    var div = $.New('div', { id: THIS.Element.id + '_DIV_' + _i, className: 'Tab', style: { backgroundColor: 'white', display: ((_i == 0) ? 'block' : 'none')} })
    div.style.height = (THIS.PanelHeight) ? THIS.PanelHeight : '';
    if(t.Content){
      div.Add(t.Content)
    }
    else
    {
      div.innerHTML = t.InnerHTML || 'vacio';
    }
    li.UserKey = t.UserKey;
    THIS.Tabs.add(__CreateTab(li, div))
    THIS.Tab.Add(li);
  })

  this.Element.Add(this.Tab)
  this.Tabs.forEach(function(t) {
    THIS.Element.Add(t.Container)
  })

  // RemoveItem

  // AddItem
  this.Tabs.AddItem = function(options) {
    var Options = options || {};
    var __li = $.New('li', { OnSelectTab: Options.OnSelectTab,
      style: {
        backgroundImage: (Options.Image && Options.Image.length) ? String.format('url({0})', Options.Image) : '',
        paddingLeft: (Options.Image && Options.Image.length) ? '' : '0px',
        width: (Options.Width) ? Options.Width : 'auto'
      }
    }).Add('span', { innerHTML: Options.Title || 'panel' })
    if (THIS.AutoSelect)
      __li.onmouseover = __TabOnmouseover
    else
      __li.onclick = __TabOnmouseover
    var __div = $.New('div', { className: 'Tab', style: { backgroundColor: 'white', display: 'none'} })
    __div.style.height = (THIS.PanelHeight) ? THIS.PanelHeight : '';
    __div.innerHTML = Options.InnerHTML || 'vacio';
    _NewTab = THIS.Tabs.add(__CreateTab(__li, __div))
    THIS.Tab.Add(__li);
    THIS.Element.Add(__div)
    return _NewTab;
  }
  this.Tabs.SetTitle = function(index, text) { THIS.Tabs[index].SetTitle(text) };
  this.Tabs.SetIcon = function(index, icon) { THIS.Tabs[index].SetIcon(icon) };
  this.Tabs.SetContent = function(index, value, options) { THIS.Tabs[index].SetContent(value, options) };
  this.Tabs.SetWidth = function(index, value) { THIS.Tabs[index].SetWidth(value) };
  this.Tabs.SetTextOnly = function(index) { THIS.Tabs[index].SetTextOnly() };
  this.Tabs.SetSelectedTab = function(index) { THIS.Tabs[index].SelectMe() }
  this.SetTabHeight = function(value){    
    THIS.Tabs.forEach(function(t) {
      t.Header.firstChild.style.height='1.5em';
      t.Header.firstChild.style.lineHeight='1.5em';
    })
  }

  this.VisiblesTabs = function() { return THIS.Tabs.Where(function(tab) { return tab.Header.style.display != 'none'; }); };
  
  this.Hide = function(){THIS.Element.style.display = 'none'};
  this.Show = function(){THIS.Element.style.display = 'block'};
  return this;

};

MAPA.FlatTab2 = function(o){
  var THIS = this;
  o = o || {}
  this.AutoSelect = false || o.AutoSelect ;
  this.PanelHeight = o.PanelHeight
  this.Element = $.New('div', {className : 'TCon2'})
  this.Tab     = $.New('ul', {className : 'HeaderT'})
  
  this.Tabs = []
  var _Tabs = o.Tabs || [{Title:'panel 1'}];
  
  var __CurrentTab = undefined
  var __TabOnmouseover = function(){
    if(__CurrentTab == this) return
    __CurrentTab = this;
    THIS.Tabs.forEach(function(t){
      if(t.Header===__CurrentTab){
        t.Header.className += ' active'
        t.Container.style.display = 'block';
        if (t.Header.OnSelectTab) t.Header.OnSelectTab(__CurrentTab) 
      }
      else{
        t.Header.className = t.Header.className.replaceAll('active','').trim();
        t.Container.style.display = 'none';
      }
    })        
  }
  
  var __CreateTab = function(h,c){
    return new function(){       
      this.Header   = h;
      this.Container = c;
      var _$$This = this;
      this.SetTitle = function (text){_$$This.Header.firstChild.innerHTML = text;};
      this.SetIcon = function (value){_$$This.Header.style.paddingLeft = '';_$$This.Header.style.backgroundImage = String.format('url({0})',value);};
      this.SetContent = function (value,options){_$$This.Container.Clear(); _$$This.Container.Add(value,options)};		    
      this.SetWidth = function (value){_$$This.Header.style.width = value;};
      this.SetTextOnly = function (){_$$This.Header.style.paddingLeft = '0px'; _$$This.Header.style.backgroundImage =''};
      this.SelectMe = function(){if (h.onclick) h.onclick(); else h.onmouseover();}
    }
  }
  					
	_Tabs.forEach(function(t,_i){  
	  var li  = $.New('li',{id: 'UL_' + _i , OnSelectTab : t.OnSelectTab,
	                        style :{ 
	                          backgroundImage : (t.Image && t.Image.length) ? String.format('url({0})',t.Image): '',
	                          paddingLeft     : (t.Image && t.Image.length) ? '' : '0px',
	                          width           : (t.Width) ? t.Width : 'auto'
	                        },
	                        className : '' + ((_i==0) ? 'first active' : '' )}).Add('span', {innerHTML : t.Title || 'titulo'})
	  if (THIS.AutoSelect)
	    li.onmouseover = __TabOnmouseover 
	  else
	    li.onclick = __TabOnmouseover; 
	  var div = $.New('div',{id: 'DIV_' + _i , className : 'Tab', style : {display : ((_i==0) ? 'block' : 'none')}})
	  div.style.height = (THIS.PanelHeight) ? THIS.PanelHeight : '';
	  div.innerHTML = t.InnerHTML || 'vacio';
	  THIS.Tabs.add(__CreateTab(li,div));		  		  		  
	  THIS.Element.Add(div);
	})
	
	this.Element.Add(this.Tab)
  this.Tabs.forEach(function(t){
	  THIS.Tab.Add(t.Header)
	})
			
	// RemoveItem				
	
	this.Tabs.AddItem = function(options){
	  var Options = options || {};
	  var __li  = $.New('li', {OnSelectTab : Options.OnSelectTab, 
	                        style :{
	                          backgroundImage : (Options.Image && Options.Image.length) ? String.format('url({0})',Options.Image): '',
	                          paddingLeft     : (Options.Image && Options.Image.length) ? '' : '0px',
	                          width           : (Options.Width) ? Options.Width : 'auto'
	                        }
	                        }).Add('span', {innerHTML : Options.Title || 'panel'})
	  if (THIS.AutoSelect) 
	    __li.onmouseover = __TabOnmouseover 
	  else
	    __li.onclick = __TabOnmouseover
	  var __div = $.New('div',{ className : 'Tab', style : {backgroundColor: 'white' , display : 'none'}})
	  __div.style.height = (THIS.PanelHeight) ? THIS.PanelHeight : '';
	  __div.innerHTML = Options.InnerHTML || 'vacio';
    _NewTab = THIS.Tabs.add(__CreateTab(__li,__div)) 
	  THIS.Tab.Add(__li);
	  THIS.Element.Add(__div)
	  return _NewTab;
  }
	this.Tabs.SetTitle = function(index,text){THIS.Tabs[index].SetTitle(text)};
  this.Tabs.SetIcon = function(index,icon){THIS.Tabs[index].SetIcon(icon)};		
	this.Tabs.SetContent = function(index,value,options){THIS.Tabs[index].SetContent(value,options)};	
	this.Tabs.SetWidth = function (index,value){THIS.Tabs[index].SetWidth(value)};
	this.Tabs.SetTextOnly = function (index){THIS.Tabs[index].SetTextOnly()};	    
	this.Tabs.SetSelectedTab = function(index){THIS.Tabs[index].SelectMe()}
  return this;
  
};


MAPA.FlatTab3 = function(o) {
  var THIS = this;
  o = o || {}
  this.AutoSelect = false || o.AutoSelect ;
  this.Element = $.New('div', { className: 'TCon3', style : o.style  })
  this.Tab = $.New('div', { className: 'HeaderT' })
  this.Element.Tab = this.Tab;
  
  this.SetHeight = function(value){
    this.Element.style.height= String.format('{0}em',value);
    this.Tab.style.top= String.format('{0}em', value + 0.21);
    THIS.Tabs.forEach(function(t) {
      t.Container.style.height = String.format('{0}em',value);;
    })
  }
  this.SetTabHeight = function(value){    
    THIS.Tabs.forEach(function(t) {
      t.Header.firstChild.style.height =  String.format('{0}em',value);
      t.Header.firstChild.style.lineHeight = String.format('{0}em',value);
    })
  }

  this.Tabs = []
  var _Tabs = o.Tabs || [{Title:'panel 1'}];

  var __CurrentTab = undefined    
  var __TabOnmouseover = function() {
    if (__CurrentTab == this) return
    __CurrentTab = this;
    var T
    THIS.Tabs.forEach(function(t) {
      if (t.Header === __CurrentTab) {
        t.Header.className += ' active'
        t.Container.style.display = 'block';
        T=t          
      }
      else {
        t.Header.className = t.Header.className.replaceAll('active', '').trim();
        t.Container.style.display = 'none';
      }
    })
    if (T && T.Header.OnSelectTab) T.Header.OnSelectTab(__CurrentTab)
  }
  
  var __CreateTab = function(h,c){
    return new function(){
      this.Header = h;
      this.Container = c;
      var _$$This = this;
      this.SetTitle = function(text) { _$$This.Header.firstChild.innerHTML = text; };
      this.SetIcon = function(value) { _$$This.Header.firstChild.style.paddingLeft = '22px'; _$$This.Header.firstChild.style.backgroundImage = String.format('url({0})', value); };
      this.SetContent = function(value, options) { _$$This.Container.Clear(); _$$This.Container.Add(value, options) };
      this.SetWidth = function(value) { _$$This.Header.firstChild.style.width = value; };
      this.SetTextOnly = function() { _$$This.Header.firstChild.style.paddingLeft = '4px'; _$$This.Header.firstChild.style.backgroundImage = '' };
      this.SelectMe = function(){if (h.onclick) h.onclick(); else h.onmouseover();}
    }
  }
  
  _Tabs.forEach(function(t, _i) {
    var li = $.New('div', { id: 'UL_' + _i, OnSelectTab : t.OnSelectTab, className: 'TabItem' + ((_i == 0) ? ' first active' : '') })
                .Add('div', { className: 'Caption', innerHTML:  t.Title || 'titulo',
                              style : {
                                backgroundImage : (t.Image && t.Image.length) ? String.format('url({0})',t.Image): '',
	                              paddingLeft     : (t.Image && t.Image.length) ? '22px' : '5px',
  		                          width           : (t.Width) ? t.Width : 'auto',
  		                          lineHeight      : '2.0em'  
  		                        }
  		                        })
        
    if (THIS.AutoSelect)
	    li.onmouseover = __TabOnmouseover 
	  else
	    li.onclick = __TabOnmouseover; 		        
    var div = $.New('div', { id: 'DIV_' + _i, className: 'Tab', style: { display: ((_i == 0) ? 'block' : 'none')} })
    if(t.Content){
      div.Add(t.Content)
    }
    else
    {
      div.innerHTML = t.InnerHTML || 'vacio';
    }
    THIS.Tabs.add(__CreateTab(li,div));
    THIS.Element.Add(div);
  })

  this.Element.Add(this.Tab)
  this.Tabs.forEach(function(t) {   
    t.Header.Add('b', { className: 'b4'})
            .Add('b', { className: 'b3'})
            .Add('b', { className: 'b2'})
            .Add('b', { className: 'b1'});
    THIS.Tab.Add(t.Header)      
  })
  
  // RemoveItem				
  this.Tabs.AddItem = function(options){
	  var Options = options || {};
	  var __li = $.New('div', { OnSelectTab : Options.OnSelectTab , className: 'TabItem'})
	                .Add('div', { className: 'Caption', innerHTML:  Options.Title || 'titulo',
                              style : {
                                backgroundImage : (Options.Image && Options.Image.length) ? String.format('url({0})',Options.Image): '',
	                              paddingLeft     : (Options.Image && Options.Image.length) ? '22px' : '5px',
  		                          width           : (Options.Width) ? Options.Width : 'auto',
  		                          lineHeight      : '2.0em'  
  		                        }
  		                        })     
    __li.Add('b', { className: 'b4'})
        .Add('b', { className: 'b3'})
        .Add('b', { className: 'b2'})
        .Add('b', { className: 'b1'});                          		 		  		                        
	  if (THIS.AutoSelect) 
	    __li.onmouseover = __TabOnmouseover 
	  else
	    __li.onclick = __TabOnmouseover
	    
	  var __div = $.New('div', { className: 'Tab', style: { display: 'none'}})  			 
	  __div.innerHTML = Options.InnerHTML || 'vacio';
    _NewTab = THIS.Tabs.add(__CreateTab(__li,__div)) 
	  THIS.Tab.Add(__li);
	  THIS.Element.Add(__div)
	  return _NewTab;
  }
  
  this.Tabs.SetTitle = function(index, text) { THIS.Tabs[index].SetTitle(text) };
  this.Tabs.SetIcon = function(index, icon) { THIS.Tabs[index].SetIcon(icon) };
  this.Tabs.SetContent = function(index, value, options) { THIS.Tabs[index].SetContent(value, options) };
  this.Tabs.SetWidth = function(index, value) { THIS.Tabs[index].SetWidth(value) };
  this.Tabs.SetTextOnly = function(index) { THIS.Tabs[index].SetTextOnly()};
  this.Tabs.SetSelectedTab = function(index){THIS.Tabs[index].SelectMe()}
  
  this.GetCurrentTab = function(){ 
    var _ct;    
    THIS.Tabs.forEach(function(t) {
      if (t.Header === __CurrentTab) _ct = t;
    })
    return _ct || THIS.Tabs[0];
  }
  
  this.Collapse = function(value){ 
    var op = value || {}     
    THIS.Backup = THIS.Backup || {}
    THIS.Backup.height = THIS.Element.style.height;
    THIS.Backup.overflow = THIS.Element.style.overflow;
    THIS.Backup.marginBottom = THIS.Element.style.marginBottom;
    THIS.Element.style.border = 'solid 1px silver';
    THIS.Element.style.height = op.Height || '2em';
    THIS.Element.style.marginBottom = '0.5em';  
    THIS.Element.style.overflow = 'hidden';
    THIS.GetCurrentTab().Container.style.display = 'none';
    if(op.Info){
      THIS.Backup.InfoControl = $.New('div', {
        innerHTML:op.Info(),
        ondblclick : function(){ (op.OnExpand || function(){})()},
        style:{
          height: op.Height || '2em',
          padding:'0.3em',
          marginRight:'5.3em',
          whiteSpace : 'nowrap',
          overflow:'hidden',
          textOverflow: 'ellipsis'
        }
      });
      THIS.Element.Add(THIS.Backup.InfoControl);
    }
  }
  this.Expand = function(){
    if (THIS.Backup.InfoControl) THIS.Backup.InfoControl.RemoveMe();
    THIS.Element.style.border = '';
    THIS.Element.style.height = THIS.Backup.height;  
    THIS.Element.style.overflow = THIS.Backup.overflow;
    THIS.Element.style.marginBottom = THIS.Backup.marginBottom;
    THIS.GetCurrentTab().Container.style.display = 'block';
  }       
  return this;

};




//MAPA.OnDocumentReady = OnDocumentReady;


//var TT;
//function OnDocumentReady() { 
//  
//  var _Tabs = [ {Title : 'Tab 1', Image : 'icon_App.gif' , Width : '120px', OnSelectTab : function(sender){} } ,
//                {Title : 'Tab 2', Image : 'icon_Hoja.gif'} ,
//                {Title : 'Tab 3', Image : 'icon_DB.gif'} ,
//                {Title : 'Tab 4', Image : 'icon_Hoja.gif'} ,
//                {Title : 'Tab 5', Image : ''} ,
//                {Title : 'Tab 6', Image : 'icon_Hoja.gif'}                 
//              ]

//  TT = new MAPA.FlatTab1({AutoSelect:true, PanelHeight: '300px', style:{width:'500px'},Tabs:_Tabs});
//  document.body.appendChild(TT.Element)       
//}

//function jj(){
//  TT.Tabs[2].SetTitle('DBs');
//  TT.Tabs[0].SetTitle('Titulo 0');
//  TT.Tabs[1].SetTitle('Apps');
//  TT.Tabs[1].SetIcon('icon_App.gif');
//  TT.Tabs[2].SetIcon('icon_Hoja.gif');
//  TT.Tabs[2].SetContent('div',{innerHTML:'<h2>Titulo </h2>Hola <h2>Titulo </h2>caracola <h2>Titulo </h2><h2>Titulo </h2><h2>Titulo </h2><h2>Titulo </h2>del dos'})   
//  TT.Tabs.SetTitle(3,'Tres..')
//  TT.Tabs.SetTextOnly(3) 
//  TT.Tabs.SetWidth(3,'150px')
//  TT.Tabs[4].SetTextOnly()
//  TT.Tabs.AddItem({Title : 'titulo'}).SetIcon('icon_App.gif')
//  TT.Tabs.SetSelectedTab(2);
//}