

namespace Negocio.Entities
{
  using Dal.Core;
  using Dal.Repositories;
  using Negocio.Core;
  using System.Collections.Generic;

  [System.Xml.Serialization.XmlRoot("Coordinados")]
  public class Coordinados : EntityList<Coordinado>
  {
      public Coordinados() { }

      public Coordinados(DbContext context) : base(context) { }

      public Coordinados Load()
      {
          using (CoordinadosRepository repo = new CoordinadosRepository(base.DataContext))
          {
              return (Coordinados)repo.Load<Coordinado>(this, repo.GetItems());
          }
      }

      public Coordinados Load(Dictionary<string, string> @params)
      {
          using (CoordinadosRepository repo = new CoordinadosRepository(base.DataContext))
          {
              return (Coordinados)repo.Load<Coordinado>(this, repo.GetItems(@params));
          }
      }
  }
}
