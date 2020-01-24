

  namespace Negocio.Entities.Messenger
  {
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System;

  [Serializable()]
  public class User : Entity
  {

    public User(){ }
    public User(DbContext context) : base(context) { }
        
    public User Load(int id){    
      using (UsersRepository repo = new UsersRepository(DataContext)){
        return repo.LoadOne<User>(this, repo.GetItem(id)); 
      }   
    }

    public User LoadByName(string userId){    
      using (UsersRepository repo = new UsersRepository(DataContext)){
        var __params = new ParameterContainer().Add("UserId", userId)
                                               .ToDictionary();
        return repo.LoadOne<User>(this, repo.GetItems(__params)); 
      }   
    }

    public User Save(){
      using (UsersRepository repo = new UsersRepository(DataContext)){
        if(_id == 0){
          _id = repo.Insert(UserId, UserName);
        } else{
          repo.Update(Id, UserId, UserName);
        }
        return this;
      }
    }
             
    public void Delete(){
      using (UsersRepository repo = new UsersRepository(DataContext)){
        repo.Delete(_id);
      }
    }
  
    int _id;
    public override int Id  
    {
      get { return _id; }         
      set { _id = value; }
    }

    string _userId = "";
    public string UserId  
    {
      get { return _userId; }         
      set { _userId = value; }
    }

    string _userName = "";
    public string UserName  
    {
      get { return _userName; }         
      set { _userName = value; }
    }

  }
}
