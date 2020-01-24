using System;
using System.Collections.Generic;
using Negocio;
using Negocio.Core;
using Negocio.Entities;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        using (Dal.Core.DbContext __dbContext = new Dal.Core.DbContext())
        {
            Usuario __usuario = new Usuario(__dbContext).Load(6);
            Perfiles __perfiles = new Perfiles(__dbContext).Load();
            // =====================================================================
            // ToJsonString()
            // =====================================================================
            string __json = __usuario.ToJsonString();
            // =====================================================================
            // ToXml()
            // =====================================================================
            string __xml = __usuario.ToXml();
            string __clearXml = __usuario.ToClearXml();
            // =====================================================================
            // FromJsonTo()
            // =====================================================================
            Usuario __u1 = __json.FromJsonTo<Negocio.Entities.Usuario>();
            // =====================================================================
            // FromXmlTo()
            // =====================================================================
            Usuario __u2 = __xml.FromXmlTo<Negocio.Entities.Usuario>();
            // ==================================================================================
            // Serialización por el método de extensión
            // ==================================================================================
            __json = __perfiles.ToJsonString(new FieldInfo[]{
                                               new FieldInfo(typeof(int), "Id", "_identificador")
                                             });
            // =====================================================================
            // Carga de datos
            // =====================================================================
            Coordinados __coordinados = new Coordinados(__dbContext).Load();
            Perfil __perfil = new Perfil(__dbContext).Load(6);
           
            __json =  SerializersStringRepository.GetNamedSerializer(typeof(Perfil), "PerfilSmall").ToJsonString(__perfiles);
            __json =  SerializersStringRepository.GetNamedSerializer(typeof(Perfil), "Perfil").ToAssociativeArrayJsonString(__perfiles);
            __json =  SerializersStringRepository.GetNamedSerializer(typeof(Perfil), "Perfil").ToJsonString(__perfiles);  
            __json =  SerializersStringRepository.GetNamedSerializer(typeof(Perfil), "PerfilSmall").ToJsonString(__perfil);
            __json =  SerializersStringRepository.GetNamedSerializer(typeof(Perfil), "Perfil").ToJsonString(__perfil); 

        }


        using (Dal.Repositories.DynamicRepository __repo = new Dal.Repositories.DynamicRepository(null, "Dal.Repositories.table_name"))
        {
            // ===============================================================================================
            // Uso de ExecuteReader
            // ===============================================================================================
            using (var reader = __repo.ExecuteReader("SELECT ID,CD_USUARIO,DS_USUARIO FROM T_SEG_USUARIOS"))
            {
                List<object[]> rows = new List<object[]>();
                while (reader.Read())
                {
                    object[] row = new object[2];
                    reader.GetValues(row);
                    rows.Add(row);
                }
            }
            // ===============================================================================================
            // Uso de ExecuteNamedScalar
            // ===============================================================================================     
            int __result = __repo.ExecuteNamedScalar<int>("Count", new string[] { "5" });
            // ===============================================================================================
            // Uso de ExecuteNamedReader
            // ===============================================================================================       
            using (var reader = __repo.ExecuteNamedReader("SelectAll"))
            {
                List<object[]> rows = new List<object[]>();
                while (reader.Read())
                {
                    object[] row = new object[6];
                    reader.GetValues(row);
                    rows.Add(row);
                }
            }
        }
    }
}