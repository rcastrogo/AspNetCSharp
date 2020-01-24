
  namespace Negocio.Entities.Messenger
  {
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System;

  [Serializable()]
  public class Recipient : Entity
  {

    public Recipient(){ }
    public Recipient(DbContext context) : base(context) { }
        
    public Recipient Load(int id){    
      using (RecipientsRepository repo = new RecipientsRepository(DataContext)){
        return repo.LoadOne<Recipient>(this, repo.GetItem(id)); // Dal.Core.BasicRepository.LoadOne
      }   
    }

    public Recipient Save(){
      using (RecipientsRepository repo = new RecipientsRepository(DataContext)){
        if(_id == 0){
          _id = repo.Insert(MessageId, UserId);
        } else{
          repo.Update(Id, MessageId, UserId);
        }
        return this;
      }
    }
             
    public void Delete(){
      using (RecipientsRepository repo = new RecipientsRepository(DataContext)){
        repo.Delete(_id);
      }
    }
  
    int _id;
    public override int Id  
    {
      get { return _id; }         
      set { _id = value; }
    }

    int _messageId;
    public int MessageId  
    {
      get { return _messageId; }         
      set { _messageId = value; }
    }

    int _userId;
    public int UserId  
    {
      get { return _userId; }         
      set { _userId = value; }
    }

  }
}
