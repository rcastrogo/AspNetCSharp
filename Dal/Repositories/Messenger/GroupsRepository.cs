  
namespace Dal.Repositories.Messenger{

  using Dal.Core;
  using Dal.Core.Loader;
  using Dal.Utils;
  using System.Collections.Generic;
  using System.Data;

  [RepoName("Dal.Repositories.Messenger.GroupsRepository")]
  public class GroupsRepository : RepositoryBase {
  
    public GroupsRepository(DbContext context) : base(context) { }
        
    public IDataReader GetItems(Dictionary<string, string> @params){
      return GetItems(__toQuery(@params));
    }        
        
    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      builder.AndListOfIntegers("Id", "Ids");
      builder.AndString("Name"); 
      return builder.ToQueryString();
    }
 
    

    public int Insert(string name){
      return Insert( new string[] { Helper.ParseString(name)});                
    }
    
    public int Update(int id, 
                      string name){	         
      return Update( new string[] { id.ToString(), 
                                    Helper.ParseString(name, 100)});           
    }

  }
}
    
