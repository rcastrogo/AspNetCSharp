
  namespace Negocio.Entities.Messenger
  {
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System;

  [Serializable()]
  public class GroupMember : Entity
  {

    public GroupMember(){ }
    public GroupMember(DbContext context) : base(context) { }
        
    public GroupMember Load(int id){    
      using (GroupMembersRepository repo = new GroupMembersRepository(DataContext)){
        return repo.LoadOne<GroupMember>(this, repo.GetItem(id)); 
      }   
    }

    public GroupMember Save(){
      using (GroupMembersRepository repo = new GroupMembersRepository(DataContext)){
        if(_id == 0){
          _id = repo.Insert(GroupId, UserId);
        } else{
          repo.Update(Id, GroupId, UserId);
        }
        return this;
      }
    }
             
    public void Delete(){
      using (GroupMembersRepository repo = new GroupMembersRepository(DataContext)){
        repo.Delete(_id);
      }
    }
  
    int _id;
    public override int Id  
    {
      get { return _id; }         
      set { _id = value; }
    }

    int _groupId;
    public int GroupId  
    {
      get { return _groupId; }         
      set { _groupId = value; }
    }

    int _userId;
    public int UserId  
    {
      get { return _userId; }         
      set { _userId = value; }
    }

  }
}
