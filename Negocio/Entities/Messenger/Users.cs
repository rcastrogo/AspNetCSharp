

namespace Negocio.Entities.Messenger
{
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System.Collections.Generic;

  [System.Xml.Serialization.XmlRoot("Users")]
  public class Users : EntityList<User>
  {
    public Users() { }

    public Users(DbContext context) : base(context) { }

    public Users Load()
    {
      using (UsersRepository repo = new UsersRepository(base.DataContext))
      {
        return (Users)repo.Load<User>(this, repo.GetItems());
      }
    }

    public Users Load(Dictionary<string, string> @params)
    {
      using (UsersRepository repo = new UsersRepository(base.DataContext))
      {
        return (Users)repo.Load<User>(this, repo.GetItems(@params));
      }
    }
  }
}
