

MAPA.Boxes = {}
MAPA.BoxButtonClickEventArg = function(o) {
  if (o) MAPA.apply(this, o);
  this.Sender = this.Sender || undefined;
  this.State = this.State || undefined;
  this.Cancel = this.Cancel || false;
  return this;
}

MAPA.Box = function(o) {
  var defaults = { CellPadding: '0',
    CellSpacing: '0',
    Mode: MAPA.Box.Modes.Panel,
    State: MAPA.Box.States.Close,
    Images: ['url(../img/expandir.gif)', 'url(../img/contraer.gif)']
  }
  if (o) MAPA.apply(defaults, o);
  MAPA.apply(this, defaults);

  var THIS = this;
  this.id = this.id || ++MAPA.Box._Counter
  MAPA.Boxes[this.id] = THIS;
  this.Mode = this.Mode || MAPA.Box.Modes.Panel;
  if (this.Mode == MAPA.Box.Modes.Window)
    this.State = this.State || MAPA.Box.States.Close;
  else
    this.State = this.State || MAPA.Box.States.Open;

  this.Element = document.createElement('table');
  this.Element.Box = this;
  this.Table = this.Element;
  this.Table.Box = THIS;
  this.Table.cellPadding = this.CellPadding.replace('px', '');
  this.Table.cellSpacing = this.CellSpacing.replace('px', '');
  this.Table.border = 0;
  this.Table.className = 'ta';

  var _Head = document.createElement('thead');
  var _RowH = document.createElement('tr');

  // Titulo de la ventana
  this.Title = document.createElement('td');
  this.Title.className = 'ti';
  if (this.Static) this.Title.style.cursor = 'default';
  this.Title.appendChild(document.createTextNode(this.Titulo = this.Titulo || 'Ventana'));
  this.Title.ondblclick = function() { (THIS.Mode == MAPA.Box.Modes.Panel ? this.nextSibling : this.previousSibling).onclick(); };

  // Boton de la ventana
  this.Button = $.New('td',
    { Box        : THIS, 
      className  : 'boton', 
      style      : 
        { backgroundImage : 
          (this.State == MAPA.Box.States.Open) ? this.Images[1] : this.Images[0]
        }
    }).Add(
      $.New('div', {style : {width : '14px', visibility : 'hidden'}})
  );
  this.Button.onmousemove = function(ev) {
    MAPA.cancelEvent(ev); 
    MAPA.cancelBubble(ev);
    return false;
  };
  
  this.Button.onclick = function() {
    var eventArg = new MAPA.BoxButtonClickEventArg({ Sender: THIS,
      Cancel: false,
      State: (this.Box.Table.tbody.style.display == 'none') ? MAPA.Box.States.Close : MAPA.Box.States.Open
    });
    if (THIS.OnButtonClick) THIS.OnButtonClick(eventArg);
    if (eventArg.Cancel) return;

    if (THIS.OnChange) THIS.OnChange({ Sender: THIS, State: (this.Box.Table.tbody.style.display == 'none') ? MAPA.Box.States.Close : MAPA.Box.States.Open });

    this.Box.Table.tbody.style.display = (this.Box.Table.tbody.style.display == 'none') ? '' : 'none';
    this.Box.Button.style.backgroundImage = (eventArg.State == MAPA.Box.States.Open) ? this.Box.Images[0] : this.Box.Images[1];
  };

  if (this.Mode && this.Mode == MAPA.Box.Modes.Window) {
    _RowH.appendChild(this.Button);
    _RowH.appendChild(this.Title);
  }
  else {
    _RowH.appendChild(this.Title);
    _RowH.appendChild(this.Button);
  }

  _Head.appendChild(_RowH);
  this.Table.appendChild(_Head);
  this.FirstRow = _RowH;

  this.Table.tbody = document.createElement("tbody");
  this.Table.tbody.style.display = (this.State == MAPA.Box.States.Open) ? '' : 'none';
  this.Table.tbody.id = 'IdBody';
  this.Table.appendChild(this.Table.tbody);
  var _Row = document.createElement("tr");
  this.LastRow = _Row;
  this.Cols = 2;
  _Row.appendChild(document.createElement("td"));
  _Row.lastChild.colSpan = this.Cols;

  this.Table.tbody.appendChild(_Row);
  this.Container = document.createElement("div")
  this.Container.className = 'BoxContainer';
  _Row.lastChild.appendChild(this.Container);

  // Establecer tamaño de la ventana
  this.Table.style.width = this.Width = this.Width || '100%';
  this.Container.style.height = this.Height = this.Height || '200px'
  // Establecer la posición de la ventana
  this.Window = this.Window || {}
  this.Element.style.top = this.Window.Top || this.Element.style.top;
  this.Element.style.left = this.Window.Left || this.Element.style.left;

  this.Element.IsOpaque = this.Window.IsOpaque || false;
  if (this.Window.Dragable) {
    this.Element.style.position = 'absolute';
    document.__DH.MakeDragable(this.Element);
    this.Element.style.zIndex = '40000'
  }

  // poner el contenido si hay
  if (this.Content) this.SetContent(this.Content);
  if (this.Html) this.SetHtml(this.Html);
  return this;

}

MAPA.Box._Counter = 100;
MAPA.Box.Modes = { Window: 1, Panel: 2 };
MAPA.Box.States = { Open: 1, Close: 2 };

MAPA.Box.prototype.RemoveCell = function(value) {
  if (this.Cols == 2) return;
  this.FirstRow.removeChild(this.FirstRow.lastChild);
  --this.Cols;
  this.LastRow.lastChild.colSpan = this.Cols;
}
MAPA.Box.prototype.AddCell = function(value) {
  var cell = document.createElement('td');
  if (value && value.Element)
    cell.appendChild(value.Element);
  else if(value && MAPA.isString(value))
     cell.appendChild(document.createTextNode(value))
  else
    cell.appendChild(value);
  this.FirstRow.appendChild(cell)
  if (value && value.Width)
    cell.style.width = value.Width.replace('px','') + 'px';
  else
    cell.style.width = '80px';  
  ++this.Cols;
  this.LastRow.lastChild.colSpan = this.Cols;
};

MAPA.Box.prototype.SetTitle = function(value) {
  this.Titulo = value;
  this.Title.innerHTML = value;
};
MAPA.Box.prototype.BeginLoad = function() {
  this.Container.innerHTML = '';
  this.Container.style.background = 'transparent url(img/loading2.gif) no-repeat center center';
};
MAPA.Box.prototype.EndLoad = function() {
  this.Container.style.background = '' ; 
};
MAPA.Box.prototype.SetHtml = function(value) {
  this.Container.innerHTML = value;
};
MAPA.Box.prototype.AppendHtml = function(value) {
  this.Container.innerHTML += value;
};
MAPA.Box.prototype.SetContent = function(value) {
  this.Container.innerHTML = '';
  this.AppendChild(value);
};
MAPA.Box.prototype.SetWidth = function(value) { this.Width = value; this.Table.style.width = value; };
MAPA.Box.prototype.AppendChild = function(value) {
  if (MAPA.isString(value))
    this.Container.appendChild(document.createTextNode(value));
  else if (value.Element)
    this.Container.appendChild(value.Element);
  else
    this.Container.appendChild(value);
};
MAPA.Box.prototype.Toggle = function() { this.Button.onclick();};
MAPA.Box.prototype.IsCollapsed = function() { return this.Table.tbody.style.display == 'none'; };
MAPA.Box.prototype.IsExpanded = function() { return !this.IsCollapsed(); };
MAPA.Box.prototype.Collapse = function() { if (this.IsExpanded()) this.Toggle(); };
MAPA.Box.prototype.Expand = function() { if (this.IsCollapsed()) this.Toggle(); };
MAPA.Box.prototype.OnButtonClick = MAPA.emptyFn;


MAPA.BoxGroup = function(o) {
  MAPA.apply(this, o);

  // Private  
  var THIS = this
  var MenuOnClick = function(eventArg) {  
    if (this.cancel) return;
    if (eventArg.State == MAPA.Box.States.Close) {
      this.cancel = true;
      THIS.Boxes.forEach(function(e) {
        MAPA.Boxes[e.id].Collapse();        
      })
      this.cancel = false;
    }    
  }

  this.Element = document.createElement('div');
  this.Element.BoxGroup = THIS;
  this.Boxes = this.Boxes || [];
  this.Boxes.forEach(function(e) {
    e.OnButtonClick = MenuOnClick;
    THIS.Element.appendChild(e.Element)
  })

  // Public 
  this.GetDom = function() { return THIS.Element };
  this.AddBox = function(o) {    
    o.OnButtonClick = MenuOnClick;
    THIS.Boxes.add(o);
    THIS.Element.appendChild(o.Element);
    return o;
  }

  return this;
}