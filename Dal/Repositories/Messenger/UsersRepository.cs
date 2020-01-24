  
namespace Dal.Repositories.Messenger{

  using Dal.Core;
  using Dal.Core.Loader;
  using Dal.Utils;
  using System.Collections.Generic;
  using System.Data;

  [RepoName("Dal.Repositories.Messenger.UsersRepository")]
  public class UsersRepository : RepositoryBase {
  
    public UsersRepository(DbContext context) : base(context) { }
        
    public IDataReader GetItems(Dictionary<string, string> @params){
      return GetItems(__toQuery(@params));
    }        
        
    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      builder.AndListOfIntegers("Id", "Ids");
      builder.AndString("UserId"); 
      builder.AndStringLike("UserName");      
      return builder.ToQueryString();
    }
 
    public int Insert(string userId, string userName){
      return Insert( new string[] { Helper.ParseString(userId), Helper.ParseString(userName)});               
    }
    
    public int Update(int id, 
                      string userId, 
                      string userName){			         
      return Update( new string[] { id.ToString(), 
                                    Helper.ParseString(userId, 100), 
                                    Helper.ParseString(userName, 100)});           
    }

  }
}
    
