  
namespace Dal.Repositories.Messenger{

  using Dal.Core;
  using Dal.Core.Loader;
  using Dal.Utils;
  using System.Collections.Generic;
  using System.Data;

  [RepoName("Dal.Repositories.Messenger.GroupMembersRepository")]
  public class GroupMembersRepository : RepositoryBase {
  
    public GroupMembersRepository(DbContext context) : base(context) { }
        
    public IDataReader GetItems(Dictionary<string, string> @params){
      return GetItems(__toQuery(@params));
    }        
        
    private static string __toQuery(Dictionary<string, string> @params)
    {
      QueryBuilder builder = new QueryBuilder(@params);
      builder.AndListOfIntegers("Id", "Ids");
      builder.AndInteger("GroupId"); 
      builder.AndInteger("UserId"); 
      builder.AndReplace("Nif", "UserId IN(SELECT Id FROM Messenger_User WHERE UserId='{0}')");
      builder.AndReplace("GroupName", "GroupId IN (SELECT Id FROM Messenger_Group WHERE Name='{0}')"); 
      return builder.ToQueryString();
    }
     
    public int Insert(int groupId, int userId){
      return Insert( new string[] { groupId.ToString(), userId.ToString()});               
    }
    
    public int Update(int id, 
                      int groupId, 
                      int userId){			         
      return Update( new string[] { id.ToString(), 
                                    groupId.ToString(), 
                                    userId.ToString()});           
    }

  }
}
    
