using System;
using System.Collections.Generic;
using System.Linq;
using Negocio.Core;
using Negocio.Entities;

using Toledo.Core;


namespace Toledo.Controllers
{

  public class PerfilesController : BaseController
  {


    #region CONSTRUCTORES

    public PerfilesController(ContextWrapper context) : base(context) { }

    #endregion


    public ActionResult GetAll()
    {
      return new StringActionResult(new Perfiles().Load().ToJsonString());
    }

    public ActionResult GetAllSqlDirectQuery()
    {
      return JsonActionResult.Success(
        "perfiles", 
        SqlDirectQuery.LoadFromQuery("SELECT CD_PERFIL as codigo, DS_PERFIL as descripcion FROM T_SEG_PERFILES;")
      );
    }
    
  }

}