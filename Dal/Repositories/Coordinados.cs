
  
namespace Dal.Repositories{

  using Dal.Core;
  using Dal.Core.Loader;
  using Dal.Utils;
  using System.Collections.Generic;
  using System.Data;

  [RepoName("Dal.Repositories.CoordinadosRepository")]
  public class CoordinadosRepository : RepositoryBase {
  
    public CoordinadosRepository(DbContext context) : base(context) { }
        
    public IDataReader GetItems(Dictionary<string, string> @params){
      return GetItems(__toQuery(@params));
    }        
        
    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      builder.AndListOfIntegers("Id", "Ids");
      builder.AndStringLike("CD_COORDINADO"); 
      builder.AndStringLike("DS_COORDINADO"); 
      builder.AndStringLike("FE_INI_VIGENCIA"); 
      builder.AndStringLike("FE_FIN_VIGENCIA"); 
      builder.AndStringLike("CD_USUARIO_MOD"); 
      builder.AndStringLike("FE_ALTA"); 
      builder.AndStringLike("FE_MODIFICACION"); 
        
      return builder.ToQueryString();
    }
 
    

    public int Insert(string codigo, 
                      string descripcion, 
                      string fechaDeInicioDeVigencia, 
                      string fechaDeFinDeVigencia, 
                      string modificadoPor, 
                      string fechaDeInsert, 
                      string fechaDeUpdate){
      
      return Insert( new string[] { Helper.ParseString(codigo), 
                                    Helper.ParseString(descripcion), 
                                    Helper.ParseDate(fechaDeInicioDeVigencia), 
                                    Helper.ParseDate(fechaDeFinDeVigencia), 
                                    Helper.ParseString(modificadoPor), 
                                    Helper.ParseDate(fechaDeInsert), 
                                    Helper.ParseDate(fechaDeUpdate)});      
                
    }
    
    public int Update(int id, 
                      string codigo, 
                      string descripcion, 
                      string fechaDeInicioDeVigencia, 
                      string fechaDeFinDeVigencia, 
                      string modificadoPor, 
                      string fechaDeInsert, 
                      string fechaDeUpdate){
			         
      return Update( new string[] { id.ToString(), 
                                    Helper.ParseString(codigo), 
                                    Helper.ParseString(descripcion), 
                                    Helper.ParseDate(fechaDeInicioDeVigencia), 
                                    Helper.ParseDate(fechaDeFinDeVigencia), 
                                    Helper.ParseString(modificadoPor), 
                                    Helper.ParseDate(fechaDeInsert), 
                                    Helper.ParseDate(fechaDeUpdate)});           
    }

  }
}
    
