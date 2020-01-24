
using Dal.Core;
using Dal.Core.Loader;
using Dal.Utils;
using System.Collections.Generic;
using System.Data;

namespace Dal.Repositories
{

  [RepoName("Dal.Repositories.PerfilesRepository")]
  public class PerfilesRepository : RepositoryBase {
  

      public PerfilesRepository(DbContext context) : base(context) { }
        
      public IDataReader GetItems(Dictionary<string, string> @params){
          return GetItems(__toQuery(@params));
      }

    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      //builder.AndListOfIntegers("Id", "Ids");
      builder.AndStringLike("CD_PERFIL");
      builder.AndStringLike("DS_PERFIL");
      builder.AndStringLike("CD_USUARIO_MOD");
      builder.AndStringLike("FE_ALTA");
      builder.AndStringLike("FE_MODIFICACION");

      return builder.ToQueryString();
    }




    public int Insert(string codigo, 
                      string descripcion, 
                      string modificadoPor, 
                      string fechaDeAlta, 
                      string fechaDeModificacion){
      
      return Insert( new string[] { Helper.ParseString(codigo),
                                    Helper.ParseString(descripcion),
                                    Helper.ParseString(modificadoPor),
                                    Helper.ParseDate(fechaDeAlta),
                                    Helper.ParseDate(fechaDeModificacion)});      
                
    }
    
    public int Update(int id, 
                      string codigo, 
                      string descripcion, 
                      string modificadoPor, 
                      string fechaDeAlta, 
                      string fechaDeModificacion){
			         
      return Update( new string[] { id.ToString(),
                                         Helper.ParseString(codigo),
                                         Helper.ParseString(descripcion),
                                         Helper.ParseString(modificadoPor),
                                         Helper.ParseDate(fechaDeAlta),
                                         Helper.ParseDate(fechaDeModificacion)});           
    }

    }
}
    
