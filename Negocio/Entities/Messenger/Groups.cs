
namespace Negocio.Entities.Messenger
{
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System.Collections.Generic;

  [System.Xml.Serialization.XmlRoot("Groups")]
  public class Groups : EntityList<Group>
  {
    public Groups() { }

    public Groups(DbContext context) : base(context) { }

    public Groups Load()
    {
      using (GroupsRepository repo = new GroupsRepository(base.DataContext))
      {
        return (Groups)repo.Load<Group>(this, repo.GetItems());
      }
    }

    public Groups Load(Dictionary<string, string> @params)
    {
      using (GroupsRepository repo = new GroupsRepository(base.DataContext))
      {
        return (Groups)repo.Load<Group>(this, repo.GetItems(@params));
      }
    }
  }
}
