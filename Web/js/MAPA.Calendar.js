
MAPA.Calendar = function(o) {
  options = { Id: '',
    month: '',
    year: '',
    Header: '', Footer: '',
    AniosSuperior: 15, AniosInferior: 10,
    CellPadding: '0', CellSpacing: '1',
    CssClassName: 'Calendar', DateSel: null
  };
  if (o) MAPA.apply(options, o);
  MAPA.apply(this, options);
  if (this.Element) this.Id = this.Element.id;
  else {
    this.Element = document.createElement('div');
    this.Element.style.position = 'absolute';
    this.Id = String.format('Calendar-{0}', this.__ControlCounter++);
    this.Element.className = this.CssClassName;
    this.Element.style.display = 'none';
    document.body.appendChild(this.Element);
  }

  this.Element.Calendar = this;
  this.month = (isNaN(this.month) || this.month == null) ? new Date().getMonth() : this.month;
  this.year = (isNaN(this.year) || this.year == null) ? new Date().getFullYear() : this.year;
  this.AniosSuperior = (isNaN(this.AniosSuperior) || this.AniosSuperior == null) ? 1 : this.AniosSuperior;
  this.AniosInferior = (isNaN(this.AniosInferior) || this.AniosInferior == null) ? 1 : this.AniosInferior;
  this.Header = this.Header || this.DefaultHeaderRender;
  this.Footer = this.Footer || this.TodayFooterRender;
  this.ExtendedMode = this.ExtendedMode || null;
  var THIS = this;
  this.raiseOnClickEvent = function(s) { if (THIS.OnClick) THIS.OnClick(THIS, s); }
  this.Render();
  return this;
}

MAPA.applyIf(MAPA.Calendar.prototype, {
  __ControlCounter: 0,
  MonthsNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  DaysNames2: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
  DaysNames: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  DaysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  DefaultHeaderRender: function(objCalendar) {
    var THead = document.createElement("thead");
    var TRowHe = document.createElement("tr");
    var TCellH = document.createElement("th");
    TCellH.colSpan = 7;
    TCellH.appendChild(document.createElement('div'));
    TCellH.lastChild.style.padding = "3px";
    TCellH.lastChild.style.border = 'solid 1px white';
    TCellH.lastChild.appendChild(document.createElement('div'))
    var Left = TCellH.lastChild.lastChild;
    Left.className = 'Left';
    Left.title = 'Ir al mes anterior';

    TCellH.lastChild.appendChild(document.createElement('div'))
    var Right = TCellH.lastChild.lastChild;
    Right.className = 'Right';
    Right.title = 'Ir al mes siguiente';

    TCellH.lastChild.appendChild(document.createElement('div'))
    objCalendar.ComboMes = document.createElement("select");
    objCalendar.ComboMes.id = objCalendar.Id + '-ComboMes';
    objCalendar.ComboMes.className = 'cboMes';
    var ComboMes = objCalendar.ComboMes;
    var DivMes = TCellH.lastChild.lastChild.appendChild(ComboMes);
    for (var i = 0; i < MAPA.Calendar.prototype.MonthsNames.length; i++) {
      option = document.createElement("option");
      option.value = i;
      option.text = MAPA.Calendar.prototype.MonthsNames[i];
      ComboMes.options[ComboMes.options.length] = option;
      if (ComboMes.lastChild.value == objCalendar.month) { ComboMes.lastChild.selected = true; }
    }

    TCellH.lastChild.appendChild(document.createElement('div'))
    var DivAnio = TCellH.lastChild.lastChild;
    var ComboAnio = document.createElement("select");
    objCalendar.ComboAnio = ComboAnio;
    objCalendar.ComboAnio.id = objCalendar.Id + '-ComboAnio';
    ComboAnio.className = 'cboAnio';

    var selectedIndex = 0;
    for (var i = (parseInt(objCalendar.year) - parseInt(objCalendar.AniosInferior)); i <= (parseInt(objCalendar.year) + parseInt(objCalendar.AniosSuperior)); i++) {
      option = document.createElement("option");
      option.value = i;
      option.text = i;
      if (i == objCalendar.year) selectedIndex = ComboAnio.options.length;
      ComboAnio.options[ComboAnio.options.length] = option;
    }
    ComboAnio.selectedIndex = selectedIndex;

    DivAnio.appendChild(ComboAnio);

    MAPA.AddEvent(ComboMes, 'change', function() {
      objCalendar.month = ComboMes.value;
      objCalendar.RenderRows(ComboMes.value, ComboAnio.value);
    }
    );

    MAPA.AddEvent(ComboAnio, 'change', function() {
      objCalendar.month = ComboMes.value;
      objCalendar.RenderRows(ComboMes.value, ComboAnio.value);
    }
    );
    // Para que al seleccionar la lista desplegable no se desencadene el evento click del documento.
    // ver MAPA.LocatorControl.
    MAPA.AddEvent(ComboAnio, 'mousedown', function(ev){ return MAPA.cancelBubble(ev); });
    MAPA.AddEvent(ComboMes, 'mousedown', function(ev){  return MAPA.cancelBubble(ev); });

    MAPA.AddEvent(Left, 'click', function() {
      if ((parseInt(objCalendar.month) == 0)) {
        objCalendar.month = 11;
        if (ComboAnio.selectedIndex > 0)
          ComboAnio.selectedIndex--
        else {
          var nuevo = parseInt(ComboAnio.options[0].value) - 1;
          // Copiar el array y limpiar
          var oldValues = [];
          var i = ComboAnio.options.length - 1;
          while (i > -1) {
            var o = document.createElement("option");
            o.value = ComboAnio.options[i].value
            o.text = ComboAnio.options[i].value;
            oldValues.push(o);
            i--;
          }
          ComboAnio.innerHTML = '';
          oldValues.reverse();
          var option = document.createElement("option");
          option.value = nuevo
          option.text = option.value;
          ComboAnio.options[ComboAnio.options.length] = option;
          oldValues.forEach(function(item) {
            ComboAnio.options[ComboAnio.options.length] = item;
          })
          ComboAnio.selectedIndex = 0;
        }
      }
      else {
        objCalendar.month = parseInt(objCalendar.month) - 1
      }
      ComboMes.options[objCalendar.month].selected = "true";
      objCalendar.RenderRows(parseInt(objCalendar.month), ComboAnio.value);
    }
    );

    MAPA.AddEvent(Right, 'click', function() {
      if ((parseInt(objCalendar.month) == 11)) {
        objCalendar.month = 0;
        if (ComboAnio.selectedIndex < ComboAnio.options.length - 1)
          ComboAnio.selectedIndex++
        else {
          var option = document.createElement("option");
          option.value = parseInt(ComboAnio.value) + 1;
          option.text = option.value;
          ComboAnio.options[ComboAnio.options.length] = option;
          ComboAnio.selectedIndex++
        }
      }
      else {
        objCalendar.month = parseInt(objCalendar.month) + 1
      }
      ComboMes.options[objCalendar.month].selected = "true";
      objCalendar.RenderRows(parseInt(objCalendar.month), ComboAnio.value);
    }
    );

    TCellH.lastChild.appendChild(document.createElement('div'))
    var close = TCellH.lastChild.lastChild;
    close.className = 'Close';
    close.title = 'Cerrar el calendario';
    TRowHe.appendChild(TCellH);
    MAPA.AddEvent(close, 'click', function() { objCalendar.Hide(); });

    THead.appendChild(TRowHe);
    return THead;
  },
  FooterRender: function() {
    var TFoot = document.createElement("tfoot");
    var TRowF = document.createElement("tr");
    var TCellF = document.createElement("td");
    TCellF.colSpan = 7;
    TCellF.style.padding = "0px";
    TCellF.style.textAlign = 'center';
    var contenido = this.Footer(this);
    if (typeof (contenido) == 'string') {
      TCellF.appendChild(document.createTextNode(contenido));
    }
    else {
      TCellF.appendChild(contenido);
    }
    TRowF.appendChild(TCellF);
    TFoot.appendChild(TRowF);
    return TFoot;
  },
  TodayFooterRender: function(calendar) {
    var Div = document.createElement('div');
    Div.style.width = '100%';
    Div.style.padding = '3px 0px';
    Div.style.borderTop = 'solid 1px white';
    Div.style.borderBottom = 'solid 1px white';
    Div.appendChild(document.createElement('a'));
    Div.lastChild.innerHTML = String.format('Hoy: {0}', new Date().format());
    Div.lastChild.style.cursor = 'pointer';
    MAPA.AddEvent(Div.lastChild, 'click', function() { calendar.goToday(); });
    return Div;
  },
  RenderRows: function(month, year) {
    Tabla = this.TABLA;
    //si hay filas en el body, se quitan
    var tblBody = Tabla.getElementsByTagName('tbody')[0];
    while (Tabla.rows.length > 3) Tabla.deleteRow(2);

    var monthLength = this.DaysInMonth[month];
    if (month == 1) { // Bisiestos
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        monthLength = 29;
      }
    }
    // get first day of month
    var startingDay = new Date(year, month, 1).getDay();
    startingDay = (startingDay == 0) ? 7 : startingDay;

    // fill in the days
    var Hoy = new Date();
    var day = 1;
    var dayA = new Date(year, month, 0).getDate();
    var day2 = 1;
    dayA = ++dayA - startingDay;
    for (var i = 0; i < 6; i++) {      // this loop is for is weeks (rows)
      var TRow = document.createElement("tr");
      for (var j = 1; j <= 7; j++) { // this loop is for weekdays (cells)
        var TCell = document.createElement("td");
        if (day <= monthLength && (i > 0 || j >= startingDay)) {
          TCell.className = "CalendarDay";
          TCell.Date = new Date(year, month, day);
          TCell.setAttribute("id", TCell.Date.format());
          if (new Date(year, month, day).format() == Hoy.format()) { TCell.className = "today"; }
          if (this.DateSel != null && new Date(year, month, day).format() == this.DateSel.format()) { TCell.className = "SelectedDay"; }
          TCell.appendChild(document.createTextNode(String.format('{0}', day++)));
          MAPA.AddEvent(TCell, 'click', (function() {
            var C = TCell;
            return function() { Tabla.Calendar.raiseOnClickEvent(C) };
          })()
          )
        }
        else {
          TCell.className = "CalendarDayDisabled";
          TCell.appendChild(document.createTextNode(String.format('{0}', (day >= monthLength) ? day2++ : ++dayA)));
        }
        TRow.appendChild(TCell);
      }
      tblBody.appendChild(TRow);
    }
    Tabla.appendChild(tblBody);

  },
  Render: function() {
    this.TABLA = document.createElement("table");
    this.TABLA.Calendar = this;
    this.TABLA.cellPadding = this.CellPadding.replace('px', '');
    this.TABLA.cellSpacing = this.CellSpacing.replace('px', '');
    this.TABLA.border = 0;
    this.Element.appendChild(this.TABLA);

    if (this.Header) { this.TABLA.appendChild(this.Header(this)); }

    var tblBody = document.createElement("tbody");
    var TRowH = document.createElement("tr");
    TRowH.className = "Calendar-header-day";
    for (var i = 0; i <= 6; i++) {
      var TCell = document.createElement("td");
      TCell.appendChild(document.createTextNode(String.format('{0}', (this.ExtendedMode) ? this.DaysNames2[i] : this.DaysNames[i])));
      TRowH.appendChild(TCell);
    }
    tblBody.appendChild(TRowH);
    this.TABLA.appendChild(tblBody);

    this.RenderRows(this.month, this.year);
    if (this.Footer) { this.TABLA.appendChild(this.FooterRender()); }
  },
  goToday: function() {
    //if (parseInt(new Date().getFullYear()) != this.ComboAnio.options[this.AniosSuperior].value) { return; }
    this.month = parseInt(new Date().getMonth());
    this.year = parseInt(new Date().getFullYear());
    this.ComboMes.options[this.month].selected = "true";
    this.ComboAnio.options[this.AniosInferior].selected = "true";
    this.RenderRows(this.month, this.year);
  },
  SetDate: function(value) {
    var d = Date.IsDate(value);
    if (d.IsDate) {
      this.DateSel = d.Date;
      this.month = d.Date.getMonth();
      this.year = d.Date.getFullYear();
      this.ComboMes.options[this.month].selected = "true";

      this.ComboAnio.innerHTML = '';
      var selectedIndex = 0;
      for (var i = (parseInt(this.year) - parseInt(this.AniosInferior)); i <= (parseInt(this.year) + parseInt(this.AniosSuperior)); i++) {
        option = document.createElement("option");
        option.value = i;
        option.text = i;
        if (i == this.year) selectedIndex = this.ComboAnio.options.length;
        this.ComboAnio.options[this.ComboAnio.options.length] = option;
      }
      this.ComboAnio.selectedIndex = selectedIndex;
      this.RenderRows(this.month, this.year);
    }
  },
  SetCssClassName: function(ClassName) {
    this.TABLA.className = ClassName;
    this.CssClassName = ClassName;
  },
  Show: function() { this.Element.style.display = 'block'; },
  Hide: function() { this.Element.style.display = 'none'; }
});
