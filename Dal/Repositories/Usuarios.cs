
using Dal.Core;
using Dal.Core.Loader;
using Dal.Utils;
using System.Collections.Generic;
using System.Data;

namespace Dal.Repositories
{

  [RepoName("Dal.Repositories.UsuariosRepository")]
  public class UsuariosRepository : RepositoryBase {
  
      public UsuariosRepository(DbContext context) : base(context) { }
        
      public IDataReader GetItems(Dictionary<string, string> @params){
          return GetItems(__toQuery(@params));
      }

    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      //builder.AndListOfIntegers("Id", "Ids");
      builder.AndStringLike("CD_USUARIO");
      builder.AndStringLike("DS_USUARIO");
      builder.AndStringLike("CD_USUARIO_MOD");
      builder.AndStringLike("FE_ALTA");
      builder.AndStringLike("FE_MODIFICACION");
      builder.AndStringLike("DS_EMAIL");

      return builder.ToQueryString();
    }




    public int Insert(string codigo, 
                      string descripcion, 
                      string modificadoPor, 
                      string fechaDeAlta, 
                      string fechaDeModificacion, 
                      string email){
      
      return Insert( new string[] { Helper.ParseString(codigo),
                                    Helper.ParseString(descripcion),
                                    Helper.ParseString(modificadoPor),
                                    Helper.ParseDate(fechaDeAlta),
                                    Helper.ParseDate(fechaDeModificacion),
                                    Helper.ParseString(email)});      
                
    }
    
    public int Update(int id, 
                      string codigo, 
                      string descripcion, 
                      string modificadoPor, 
                      string fechaDeAlta, 
                      string fechaDeModificacion, 
                      string email){
			         
      return Update( new string[] { id.ToString(),
                                         Helper.ParseString(codigo),
                                         Helper.ParseString(descripcion),
                                         Helper.ParseString(modificadoPor),
                                         Helper.ParseDate(fechaDeAlta),
                                         Helper.ParseDate(fechaDeModificacion),
                                         Helper.ParseString(email)});           
    }

    }
}
    
