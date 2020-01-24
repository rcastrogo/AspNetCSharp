
using Dal.Core;
using Dal.Repositories;
using Negocio.Core;
using System;
using System.Collections.Generic;
using System.Xml.Serialization;  

namespace Negocio.Entities
{
    [System.Xml.Serialization.XmlRoot("Perfiles")]
    public class Perfiles : EntityList<Perfil>
    {
        public Perfiles() { }

        public Perfiles(DbContext context) : base(context) { }

        public Perfiles Load()
        {
            using (PerfilesRepository repo = new PerfilesRepository(base.DataContext))
            {
                return (Perfiles) repo.Load<Perfil>(this, repo.GetItems());
            }
        }

        public Perfiles Load(Dictionary<string, string> @params)
        {
            using (PerfilesRepository repo = new PerfilesRepository(base.DataContext))
            {
                return (Perfiles) repo.Load<Perfil>(this, repo.GetItems(@params));
            }
        }
    }
}
