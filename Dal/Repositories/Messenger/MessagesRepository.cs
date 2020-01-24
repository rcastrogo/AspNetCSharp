  
namespace Dal.Repositories.Messenger{

  using Dal.Core;
  using Dal.Core.Loader;
  using Dal.Utils;
  using System.Collections.Generic;
  using System.Data;

  [RepoName("Dal.Repositories.Messenger.MessagesRepository")]
  public class MessagesRepository : RepositoryBase {
  
    public MessagesRepository(DbContext context) : base(context) { }
        
    public IDataReader GetItems(Dictionary<string, string> @params){
      return GetItems(__toQuery(@params));
    }        
        
    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      builder.AndListOfIntegers("Id", "Ids");
      builder.AndInteger("ParentId"); 
      builder.AndInteger("UserId"); 
      builder.AndStringLike("SentAt"); 
      builder.AndInteger("Type"); 
      builder.AndStringLike("Subject"); 
      builder.AndStringLike("Body"); 
      builder.AndStringLike("Data"); 
      return builder.ToQueryString();
    }
 
    public int Insert(int parentId, 
                      int userId, 
                      int type, 
                      string subject, 
                      string body, 
                      string data){
      return Insert( new string[] { parentId.ToString(), 
                                    userId.ToString(), 
                                    type.ToString(), 
                                    Helper.ParseString(subject, 100), 
                                    Helper.ParseString(body, 500), 
                                    Helper.ParseString(data, 500)});             
    }
    
    public int Update(int id, 
                      int parentId, 
                      int userId, 
                      string sentAt,
                      int type, 
                      string subject, 
                      string body, 
                      string data){			         
      return Update( new string[] { id.ToString(), 
                                    parentId.ToString(), 
                                    userId.ToString(),  
                                    Helper.ParseDate(sentAt),
                                    type.ToString(), 
                                    Helper.ParseString(subject, 100), 
                                    Helper.ParseString(body, 500), 
                                    Helper.ParseString(data, 500)});           
    }

  }
}
    
