
  
namespace Dal.Repositories.Messenger{

  using Dal.Core;
  using Dal.Core.Loader;
  using Dal.Utils;
  using System.Collections.Generic;
  using System.Data;

  [RepoName("Dal.Repositories.Messenger.RecipientsRepository")]
  public class RecipientsRepository : RepositoryBase {
  
    public RecipientsRepository(DbContext context) : base(context) { }
        
    public IDataReader GetItems(Dictionary<string, string> @params){
      return GetItems(__toQuery(@params));
    }        
        
    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      builder.AndListOfIntegers("Id", "Ids");
      builder.AndInteger("MessageId"); 
      builder.AndInteger("UserId"); 
      return builder.ToQueryString();
    }
    
    public int Insert(int messageId, int userId){
      return Insert( new string[] { messageId.ToString(), 
                                    userId.ToString()});             
    }
    
    public int Update(int id,
                      int messageId, 
                      int userId){   
      return Update( new string[] { id.ToString(), 
                                    messageId.ToString(), 
                                    userId.ToString()});           
    }

  }
}
    
