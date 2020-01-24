
namespace Negocio.Entities.Messenger
{
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System.Collections.Generic;

  [System.Xml.Serialization.XmlRoot("GroupMembers")]
  public class GroupMembers : EntityList<GroupMember>
  {
    public GroupMembers() { }

    public GroupMembers(DbContext context) : base(context) { }

    public GroupMembers Load()
    {
      using (GroupMembersRepository repo = new GroupMembersRepository(base.DataContext))
      {
        return (GroupMembers)repo.Load<GroupMember>(this, repo.GetItems());
      }
    }

    public GroupMembers Load(Dictionary<string, string> @params)
    {
      using (GroupMembersRepository repo = new GroupMembersRepository(base.DataContext))
      {
        return (GroupMembers)repo.Load<GroupMember>(this, repo.GetItems(@params));
      }
    }
  }
}
