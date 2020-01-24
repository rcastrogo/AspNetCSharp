<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>
<html>
<head runat="server">
  <title>Página de inicio</title>
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge" >
  <style type="text/css" media="screen">
    @import url(css/Estilo.css);
    @import url(css/Layout.css);

    #MainContainer { overflow: auto; overflow-x: hidden; padding: 0.5em 0 .25em 0.5em; }   
    .group-title { float:left; width:100%; } 
    .G5 { width: 29.8em; height: 13em; float: left; border: solid 1px silver; border-radius:.5em; margin: .5em; box-sizing:border-box; padding: 11px 8px 5px 56px;}
    .G5 { position: relative; transition: all 0.4s ease-in-out; }
    .G5:hover{ border-color: gray; }
    .G5 h5 { margin: 0em; margin-bottom: .2em; border: none; font-size: 1.3em; color: navy; background-color: white; background-image:none;}
    .G5 h5 .task-sub-title {font-size:90%; color:red; font-weight:normal; font-style:italic;}
    .G5 h5 .task-sub-title:before { content: "\A"; white-space:pre; }
    .G5 a.link{ text-decoration:none; margin: 0 .5em 0 0; }
    .G5-buttons { position: absolute; bottom: .2em; left: .2em; right: .2em; padding:.5em; border-top:solid 1px silver; text-align:right; }
    .G5-image { position: absolute; top: .42em; bottom: .42em; left: .42em; right: .42em; }
    .G5-image { width: 5.4em; height: 50px; background: transparent url(img/Dlg_S_Sheet.png) no-repeat -47px -147px; }  

    .search-box{ position: absolute; bottom: 29px;left: 56px;}
    .search-box input[type="text"]{ font-size:10px; width:10em; padding: 4px 2px 2px 2px; text-align:center; width:120px} 
    .search-box label{ font-size:10px;}

    .match      { background-color: yellow; text-decoration: underline; }
    .dlg_image  { position: absolute; top:.3em; left:.4em; width:5em; height:5em; background: transparent url(img/Dlg_S_Sheet.png) no-repeat 0 0;}                   
    .i_doc_info { background-position: 0 -48px }
    .i_doc_rpt  { background-position: -48px -48px }
    .i_tables   { background-position: 6px -238px; }
    .i_tables_b { background-position: 6px -289px; }
    .i_docs     { background-position: 2px -98px; }
    .i_users    { background-position: 2px -191px; } 
    .i_export   { background-position: 0 -339px }
    .i_doc_ok   { background-position: -99px 0 }
    .i_historico{ background-position: -192px -144px }
    .i_admin    { background-position: -240px -144px }  
    .i_send_csv { background-position: -46px -144px }   
    .i_doc_in{ background-position: -243px 0 }
    .i_doc_out{ background-position: -289px 0 }
    .i_doc_lock{ background-position: -192px -48px }
    .i_doc_unlock{ background-position: -240px -48px }
    .i_send_pdf{ background-position: -288px -189px }


  </style>
  <script type="text/javascript" src="js/mapa.js"></script>
  <script type="text/javascript" src="js/mapa.splitHelper.js"></script>
  <script type="text/javascript">
    
    var _CONST = {
      AppName      : 'Fertilizantes'
    };
    var _error = false;
    
    MAPA.DocManager.OnDocumentReady = function() {
      $('txt-id-fabricante').onkeypress   = function(e){ if(e.keyCode==13) __executeCommand('fabricanteByNif'); };
      $('txt-id-fertilizante').onkeypress = function(e){ if(e.keyCode==13) __executeCommand('fertilizanteByCode'); };
    }

    function __executeCommand(name){ MAPA.Include('js/app/default.aspx.js', function(){ MAPA.Search[name](); }); }

    function __ShowConfirmDialog(sb, callback, o, init){       
      var __dialog = MAPA.Layer.ShowConfirm({ Title         : o.Title || _CONST.AppName,
                                              Height        : (o||{}).Height || 140,
                                              Width         : (o||{}).Width  || 430,
                                              Message       : sb.toString(),
                                              Selectable    : o.Selectable || false,
                                              BeforeConfirm : (o||{}).BeforeConfirm || MAPA.emptyFn,
                                              OnConfirm     : function(){ callback(__dialog);},
                                              OnCancel      : MAPA.Layer.Hide,
                                              OnTerminate   : function() { 
                                                MAPA._KeyEvents.DisableDialogEvents().EnableEvents();
                                                if(o.OnTerminate) o.OnTerminate(__dialog);
                                              }});  
      __dialog.RemoveOnclose = true;
      MAPA._KeyEvents.DisableEvents().EnableDialogEvents(__dialog, { "27": __dialog.BtnNo.onclick, "13": MAPA.emptyFn });
      if(init) init(__dialog);
      return __dialog;      
    }

  </script>
</head>
<body scroll="no">
  <form id="form1" runat="server">
         
    <div >

      <div class="G5"> 
        <div class="G5-image i_tables"></div>                            
        <h5><a class="link" href="Pages/Fabricante.aspx">Fabricantes</a></h5>
        Permite gestionar el alta, edición o borrado de los Fabricantes de productos.
        <div class="search-box">        
          <label for="txt-id-fabricante">Buscar </label><input id="txt-id-fabricante" type="text" placeholder="Nif del fabricante" />
          <button type="button" onclick="__executeCommand('fabricanteByNif')">🔎</button>
        </div>   
        <div class="G5-buttons">      
          <a class="link" href="Pages/Fabricante.aspx">Ir a la página</a>                       
        </div> 
      </div> 
      <div class="G5"> 
        <div class="G5-image i_abonos"></div>                            
        <h5><a class="link" href="Pages/ProductoRegistrado.aspx">Productos</a></h5>
        Permite realizar distintas operaciones sobre los productos.
        <div class="search-box">          
          <label for="txt-id-fertilizante">Buscar </label><input id="txt-id-fertilizante" type="text" placeholder="Código del producto" />
          <button type="button" onclick="__executeCommand('fertilizanteByCode')">🔎</button>
        </div>
        <div class="G5-buttons">
          <a class="link" href="javascript:__executeCommand('nombresComerciales')" title="Búsqueda de duplicidad del nombre comercial">Nombres</a>       
          <a class="link" href="Pages/ProductoRegistrado.aspx">Ir a la página</a>                       
        </div> 
      </div>
       
      <div class="G5"> 
        <div class="G5-image i_doc_rpt"></div>                            
        <h5><a class="link" href="Pages/Reports.aspx">Informes</a></h5>
        Permite la obtención de informes ...
        <div class="G5-buttons">         
          <a class="link" href="Pages/Reports.aspx">Ir a la página</a>                       
        </div> 
      </div>
         
                                      
      <input type="text" id="Text1" style="visibility: hidden;height: 0; width:0" />
    </div>    
  </form>

  <div style="display:none">
 
  </div>
  
</body>
</html>
