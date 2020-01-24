

namespace Negocio.Entities.Messenger
{
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System.Collections.Generic;

  [System.Xml.Serialization.XmlRoot("Messages")]
  public class Messages : EntityList<Message>
  {
    public Messages() { }

    public Messages(DbContext context) : base(context) { }

    public Messages Load()
    {
      using (MessagesRepository repo = new MessagesRepository(base.DataContext))
      {
        return (Messages)repo.Load<Message>(this, repo.GetItems());
      }
    }

    public Messages Load(Dictionary<string, string> @params)
    {
      using (MessagesRepository repo = new MessagesRepository(base.DataContext))
      {
        return (Messages)repo.Load<Message>(this, repo.GetItems(@params));
      }
    }
  }
}
