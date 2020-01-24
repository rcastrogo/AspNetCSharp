
namespace Negocio.Entities.Messenger
{
  using Dal.Core;
  using Dal.Repositories.Messenger;
  using Negocio.Core;
  using System.Collections.Generic;

  [System.Xml.Serialization.XmlRoot("Recipients")]
  public class Recipients : EntityList<Recipient>
  {
    public Recipients() { }

    public Recipients(DbContext context) : base(context) { }

    public Recipients Load()
    {
      using (RecipientsRepository repo = new RecipientsRepository(base.DataContext))
      {
        return (Recipients)repo.Load<Recipient>(this, repo.GetItems());
      }
    }

    public Recipients Load(Dictionary<string, string> @params)
    {
      using (RecipientsRepository repo = new RecipientsRepository(base.DataContext))
      {
        return (Recipients)repo.Load<Recipient>(this, repo.GetItems(@params));
      }
    }
  }
}
