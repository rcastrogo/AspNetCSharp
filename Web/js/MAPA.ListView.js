MAPA.ListView = {};
MAPA.ListView.UIManager = {
  Hide: function(elements) {
    elements.forEach(function(element) { element.style.display = 'none' });
    return elements;
  },
  Enable: function(c) {
    c.style.opacity = '1';
    c.style.filter = 'alpha(opacity=100)';
    c.style.cursor = 'pointer';
    c.onclick = c._onclick || function() { };
  },
  Disable: function(c) {
    c.style.opacity = '0.4';
    c.style.filter = 'alpha(opacity=40)';
    c.onclick = function() { };
    c.style.cursor = 'default';
  },
  DisableSelect: function(c) {
    c.onselectstart = function() { return false; }
    c.onmousedown = function() { return false; }
  },
  Select: function(c) {
    if (c.Data.IsChecked == true) {
      c.style.backgroundColor = '#C1DCFC';
      c.style.color = 'Black';
    }
    else {
      c.style.backgroundColor = '';
      c.style.color = '';
    }
  },
  GetCssRule: function(ruleName) {
    var __rules = document.styleSheets[0]
    var __rules = __rules.cssRules ? MAPA.toArray(__rules.cssRules) : MAPA.toArray(__rules.rules);
    return __rules.Where(function(rule) { return rule.selectorText == ruleName; })[0];
  },
  KeyState: function() {
    var that = {}
    MAPA.AddEvent(document, 'keyup', function(ev) {
      var __ev = MAPA.MapaEvent(ev).Event;
      if (__ev.keyCode == 17) that.CtrlKey = false;
      if (__ev.keyCode == 16) that.ShiftKey = false;
    });
    MAPA.AddEvent(document, 'keydown', function(ev) {
      var __ev = MAPA.MapaEvent(ev).Event;
      if (__ev.keyCode == 17) that.CtrlKey = true;
      if (__ev.keyCode == 16) that.ShiftKey = true;
    });
    return that;
  } ()
};

MAPA.ListView.New = function(o) {

  var that = {};
  that.Context = o.Context;
  that.DataSet = o.DataSet;
  that.HeaderTemplateString = o.HeaderTemplateString || '{0} Elementos';
  that.FooterTemplateString = o.FooterTemplateString || '{0} Elementos seleccionados';
  that.RegPerPage = o.RegPerPage || 250;
  that.CurrentPage = 0;
  that.OnDelete = o.OnDelete || function() { };
  that.OnEdit = o.OnEdit || function() { };
  that.OnNew = o.OnNew || function() { };
  that.OnCreate = o.OnCreate || function() { }
  that.ShowLoading = function() { o.Container.style.backgroundImage = ''; return that; }
  that.HideLoading = function() { o.Container.style.backgroundImage = 'none'; return that; }
  that.SelectMode = o.SelectMode || 0;
  that.ViewData = o.ViewData || { Values: [], RuleName: '', OnChangeView: function() { } };
  that.SelectedItemsCount = 0;
  that.Serie = MAPA.Serie(that.ViewData.Values);

  function __createControls() {
    o.Container._LV = that;
    o.Container.appendChild(that.Header = $.$('div', { className: 'header' }));
    o.Container.appendChild(that.Body = $.$('div', { className: 'body' }));
    o.Container.appendChild(that.Footer = $.$('div', { className: 'footer' }));
    that.Footer.appendChild(that.FooterTitle = $.$('div', { className: 'title' }));

    that.BtnEdit = $.$('div', { className: 'btn edit', title: 'Editar' });
    that.BtnNew = $.$('div', { className: 'btn new', title: 'Nuevo' }); ;
    that.BtnDelete = $.$('div', { className: 'btn delete', title: 'Borrar' }); ;
    that.BtnBegin = $.$('div', { className: 'btn begin', title: 'Primera página' }); ;
    that.BtnPrevious = $.$('div', { className: 'btn previous', title: 'Anterior' });
    that.BtnInfo = $.$('div', { className: 'btn info' });
    that.BtnNext = $.$('div', { className: 'btn next', title: 'Siguiente' });
    that.BtnEnd = $.$('div', { className: 'btn end', title: 'Última página' });
    that.Title = $.$('div', { className: 'title' });
    that.BtnView = $.$('div', { className: 'btn view', title: 'Cambiar vista' });

    that.BtnEdit._onclick = __Edit;
    that.BtnNew._onclick = __New;
    that.BtnDelete._onclick = __Delete;
    that.BtnBegin._onclick = __Begin
    that.BtnPrevious._onclick = __Previous;
    that.BtnNext._onclick = __Next;
    that.BtnEnd._onclick = __End;
    that.BtnView._onclick = __View;

    [that.BtnEnd, that.BtnNext, that.BtnInfo, that.BtnPrevious, that.BtnBegin, that.BtnView, that.BtnEdit, that.BtnNew, that.BtnDelete, that.Title].forEach(function(c) {
      that.Header.appendChild(c);
    });
    [that.BtnEdit, that.BtnNew, that.BtnDelete, that.BtnBegin, that.BtnPrevious, that.BtnNext, that.BtnEnd].forEach(function(c) {
      MAPA.ListView.UIManager.Disable(c);
    });
    [that.BtnNew, that.BtnView].forEach(function(c) {
      MAPA.ListView.UIManager.Enable(c);
    });

    that.OnCreate(that);
    that.CustomButtons = that.CustomButtons || { Buttons: [],
      Enabled: [],
      Zero: { Enabled: [], Disabled: [] },
      One: { Enabled: [], Disabled: [] },
      More: { Enabled: [], Disabled: [] }
    };
    that.CustomButtons.Buttons.forEach(function(c, i) {
      that.Header.insertBefore(c, that.Title);
      c._onclick = __GenericHandler;
      MAPA.ListView.UIManager.Disable(c);
      if (that.CustomButtons.Enabled.indexOf(i) > -1) {
        MAPA.ListView.UIManager.Enable(c);
      };
    });
    var __index = that.CustomButtons.Buttons.length;
    that.CustomButtons.Buttons.add(that.BtnEdit);
    that.CustomButtons.Buttons.add(that.BtnNew);
    that.CustomButtons.Buttons.add(that.BtnDelete);
    that.CustomButtons.Zero.Disabled.add(__index);
    that.CustomButtons.Zero.Disabled.add(__index + 2);
    that.CustomButtons.One.Enabled.add(__index);
    that.CustomButtons.One.Enabled.add(__index + 2);
    that.CustomButtons.More.Disabled.add(__index);
    that.CustomButtons.More.Enabled.add(__index + 2);

    MAPA.ListView.UIManager.DisableSelect(o.Container);
    that.Serie.Current = MAPA.config.read('ListViews.{0}'.format(o.Container.id)) || 0;
    __ChangeView();
    that.HideLoading();

    MAPA.AddEvent(o.Container, 'keydown', function(ev) {
      var __ev = MAPA.MapaEvent(ev).Event;
      if (__ev.keyCode == 45) __New();
      else if (__ev.keyCode == 46) __Delete()
      else if (__ev.keyCode == 32) __Edit();
    });

    that.Body.oncontextmenu = function(id) {
      var _init = function() {
        if (!that.ContextMenu) {
          that.ContextMenu = new MAPA.ContextMenu({ Id: id, Width: '130px' })
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: 'Editar', _onclick: function() { __Edit(); }, className: 'mnu_edit' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: 'Nuevo', _onclick: function() { __New(); }, className: 'mnu_new' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: 'Borrar', _onclick: function() { __Delete(); }, className: 'mnu_delete' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: '-' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: 'Seleccionar todos', _onclick: function() { __SelectAll(); } }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: '-' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: 'Vista', _onclick: function() { __View(); }, className: 'mnu_view' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: '-' }));
          that.ContextMenu.AddMenuItem(new MAPA.ContextMenuItem({ Text: 'Cancelar' }));
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[0].Element);
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[1].Element);
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[2].Element);
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[4].Element);
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[6].Element);
          MAPA.ListView.UIManager.Disable(that.ContextMenu.MenuItems[0].Element);
          MAPA.ListView.UIManager.Disable(that.ContextMenu.MenuItems[2].Element);
          __SyncButtons();
        }
      }
      return function(e) {
        _init();        
        if (!that.ContextMenu.__e)
          that.ContextMenu.Show();
        else
          that.ContextMenu.Toggle();
        MAPA.cancelEvent(e);
        MAPA.cancelBubble(e);
        return false;
      }
    } (o.ContextMenuId);
  }

  function __GenericHandler() {
    this.Action(that, __CheckedItems());
  }

  function __Delete() {
    var __items = __CheckedItems();
    if (__items.length != 0) that.OnDelete(that, __items);
  }
  function __Edit() {
    var __items = __CheckedItems();
    if (__items.length == 1) that.OnEdit(that, __items[0]);
  }
  function __New() { that.OnNew(that); }
  function __View() {
    that.Serie.Next();
    MAPA.config.white('ListViews.{0}'.format(o.Container.id), that.Serie.Current);    
    __ChangeView();
  }

  function __ChangeView(viewIndex) {
    if (that.Serie.Current > that.Serie.Values.length - 1) return;
    if (that.ViewData.RuleName) {
      MAPA.ListView.UIManager.GetCssRule(that.ViewData.RuleName).style.width = String.format('{0}%', that.Serie.Values[that.Serie.Current]);
    } else {
      that.ViewData.OnChangeView(that, that.Serie.Values[that.Serie.Current], MAPA.ListView.UIManager.GetCssRule);
    }
  }


  function __Begin() {
    if (that.CurrentPage > 0) {
      that.CurrentPage = 0;      
      setTimeout(that.LoadData, 10);
    }
  }

  that.GoToLastPage = function() {   
    that.CurrentPage = __getDisplayRange().Pages - 1;
    setTimeout(that.LoadData, 10);   
  };
  
  function __End() {
    if (that.CurrentPage != __getDisplayRange().Pages - 1) {
      that.CurrentPage = __getDisplayRange().Pages - 1;      
      setTimeout(that.LoadData, 10);
    }
  }

  function __Previous() {
    if (that.CurrentPage > 0) {
      that.CurrentPage--;      
      setTimeout(that.LoadData, 10);
    }
  }

  function __Next() {
    if (that.CurrentPage < __getDisplayRange().Pages) {
      that.CurrentPage++;      
      setTimeout(that.LoadData, 10);
    }
  }

  function __OnDblClick() {
    this.Data.IsChecked = false;
    __OnCheck.apply(this);
    that.OnEdit(that, this.Data);
  }

  function __SelectAll() {
    that.DataSet.forEach(function(p) { p.IsChecked = true; });
    __SetSelected();
    that.SelectedItemsCount = that.DataSet.length;
    __SyncButtons();

  }
  function __ClearAll() { that.DataSet.forEach(function(p) { p.IsChecked = false; }); }
  function __SetSelected() { that.DataSet.forEach(function(p) { if (p.Element) MAPA.ListView.UIManager.Select(p.Element); }); }
  function __SyncButtons() {
    that.SelectedItemsCount = __CheckedItems().length;
    switch (that.SelectedItemsCount) {
      case 0:
        that.CustomButtons.Zero.Enabled.forEach(function(index) {
          MAPA.ListView.UIManager.Enable(that.CustomButtons.Buttons[index]);
        });
        that.CustomButtons.Zero.Disabled.forEach(function(index) {
          MAPA.ListView.UIManager.Disable(that.CustomButtons.Buttons[index]);
        });
        if (that.ContextMenu) {
          MAPA.ListView.UIManager.Disable(that.ContextMenu.MenuItems[0].Element);
          MAPA.ListView.UIManager.Disable(that.ContextMenu.MenuItems[2].Element);
        }
        break;
      case 1:
        that.CustomButtons.One.Enabled.forEach(function(index) {
          MAPA.ListView.UIManager.Enable(that.CustomButtons.Buttons[index]);
        });
        that.CustomButtons.One.Disabled.forEach(function(index) {
          MAPA.ListView.UIManager.Disable(that.CustomButtons.Buttons[index]);
        });
        if (that.ContextMenu) {
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[0].Element);
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[2].Element);
        }
        break;
      default:
        that.CustomButtons.More.Enabled.forEach(function(index) {
          MAPA.ListView.UIManager.Enable(that.CustomButtons.Buttons[index]);
        });
        that.CustomButtons.More.Disabled.forEach(function(index) {
          MAPA.ListView.UIManager.Disable(that.CustomButtons.Buttons[index]);
        });
        if (that.ContextMenu) {
          MAPA.ListView.UIManager.Disable(that.ContextMenu.MenuItems[0].Element);
          MAPA.ListView.UIManager.Enable(that.ContextMenu.MenuItems[2].Element);
        }
    }
    that.UpdateTitle();
  }

  that.SelectedIndex = -1;
  function __OnCheck() {
    if (that.SelectMode == 0) {
      that.SelectedIndex = that.DataSet.indexOf(this.Data);
      this.Data.IsChecked = !this.Data.IsChecked;
    }
    else if (MAPA.ListView.UIManager.KeyState.ShiftKey) {
      __ClearAll();
      var __from = that.SelectedIndex == -1 ? 0 : that.SelectedIndex;
      var __to = that.DataSet.indexOf(this.Data);
      if (__from > __to) {
        var __temp = __to;
        __to = __from;
        __from = __temp;
      }
      for (var __i = __from; __i <= __to; __i++) {
        that.DataSet[__i].IsChecked = true;
      }
    }
    else if (MAPA.ListView.UIManager.KeyState.CtrlKey) {
      that.SelectedIndex = that.DataSet.indexOf(this.Data);
      this.Data.IsChecked = !this.Data.IsChecked;
    }
    else {
      that.SelectedIndex = that.DataSet.indexOf(this.Data);
      var __current = !this.Data.IsChecked;
      __ClearAll();
      this.Data.IsChecked = __current;
    };    

    __SetSelected();
    __SyncButtons();

    return false;

  }

  function __CheckedItems() { return that.DataSet.Where(function(p) { return p.IsChecked; }); }

  function __getDisplayRange() {
    var __values = {};
    __values.Pages = Math.ceil(that.DataSet.length / that.RegPerPage);
    __values.Begin = that.CurrentPage * that.RegPerPage;
    __values.End = ((that.CurrentPage + 1) * that.RegPerPage) - 1;
    if (__values.End > that.DataSet.length) __values.End = that.DataSet.length - 1;
    return __values;
  }
  
  that.SortData = function(){  
    that.ViewData.SortFunctions[that.Serie.Values[that.Serie.Current]]();    
  }

  that.LoadData = function() {
    that.Body.innerHTML = '';
    var __range = __getDisplayRange();
    var __groupInfo;
    if(that.OnRequestGroups){
      __groupInfo=that.OnRequestGroups(that,__range);  
      __groupInfo.Containers.forEach( function(c){
        that.Body.appendChild(c);  
      });
    }       
    for (var x = __range.Begin; x <= __range.End; x++) { 
      var __child = o.OnRender(that, that.DataSet[x]);      
      __child.onclick = __OnCheck;
      __child.ondblclick = __OnDblClick;
      __child.Data = that.DataSet[x];
      __child.Data.Element = __child;
      if(__groupInfo){
        __groupInfo.GetContainer(that.DataSet[x]).appendChild(__child);
      }else{
        that.Body.appendChild(__child);
      }      
      MAPA.ListView.UIManager.Select(__child);     
    };
    if(__groupInfo){
     __groupInfo.OnRenderEnd();
    }
    __UpdateNavigationBar(__range);
    __SyncButtons()
    return that;
  }

  that.Hide = function() {
    that.Body.style.display = that.Footer.style.display = that.Header.style.display = 'none';
  };
  that.Show = function() {
    that.Body.style.display = that.Footer.style.display = that.Header.style.display = 'block';
  };

  that.UpdateTitle = function() {
    that.Title.innerHTML = String.format(that.HeaderTemplateString, that.DataSet.length);
    that.FooterTitle.innerHTML = (that.SelectedItemsCount == 0) ? '' : String.format('{0} elementos seleccionados', that.SelectedItemsCount);
  }
  
  function __UpdateNavigationBar(range) {
    that.UpdateTitle();
    MAPA.ListView.UIManager.Enable(that.BtnBegin);
    MAPA.ListView.UIManager.Enable(that.BtnPrevious);
    MAPA.ListView.UIManager.Enable(that.BtnEnd);
    MAPA.ListView.UIManager.Enable(that.BtnNext);
    if (range.Pages < 2) {
      that.BtnBegin.style.display = 'none';
      that.BtnPrevious.style.display = 'none';
      that.BtnNext.style.display = 'none';
      that.BtnEnd.style.display = 'none';
      that.BtnInfo.style.display = 'none';
      return;
    }
    else {
      that.BtnBegin.style.display = '';
      that.BtnPrevious.style.display = '';
      that.BtnNext.style.display = '';
      that.BtnEnd.style.display = '';
      that.BtnInfo.style.display = '';
    }

    that.BtnInfo.innerHTML = String.format('Página {0} de {1}', that.CurrentPage + 1, range.Pages);
    if (that.CurrentPage == 0) {
      MAPA.ListView.UIManager.Disable(that.BtnBegin);
      MAPA.ListView.UIManager.Disable(that.BtnPrevious);
      return;
    }
    if (that.CurrentPage == range.Pages - 1) {
      MAPA.ListView.UIManager.Disable(that.BtnNext);
      MAPA.ListView.UIManager.Disable(that.BtnEnd);
    }

  }

  __createControls();

  return that;

}
