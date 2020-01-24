
namespace Negocio.Entities.Messenger
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Dal.Repositories;
    using Dal.Core;

    public class Manager
    {

        // =============================================================================================================
        // Eliminar usuarios de TODOS los grupos a los que pertenezcan
        // =============================================================================================================
        public static int RemoveMembersFromAllGroups(DbContext dbContext, string[] usersIds)
        {
            using (var __repo = new DynamicRepository(dbContext, "Dal.Repositories.Messenger.GroupMembersRepository"))
            {
                string __ids = string.Join(",", usersIds.ToList()
                                                        .ConvertAll(n => string.Format("'{0}'", n.Trim()))
                                                        .ToArray());
                return __repo.ExecuteNamedNonQuery("DeleteByUsersIds", new string[] { __ids });
            }
        }
        // =============================================================================================================
        // Número de mensajes de un usuario que están sin leer 
        // =============================================================================================================
        public static int CountOfUnreadMessages(DbContext dbContext, string userId)
        {
            using (var __repo = new DynamicRepository(dbContext, "Dal.Repositories.Messenger.RecipientsRepository"))
            {
                return __repo.ExecuteNamedScalar<int>("CountByUserId", 
                                                       new string[] { Dal.Utils.Helper.ParseString(userId) });
            }
        }

        // =============================================================================================================
        // Crear/Actualizar usuario
        // =============================================================================================================
        public static int SaveUser(string userId, string username)
        {
            return SaveUser(null, userId, username);
        }

        public static int SaveUser(DbContext dbContext, string userId, string username)
        {
            if (dbContext == null)
            {
                using (DbContext __db = new DbContext())
                {
                    return __saveUser(__db, userId, username);
                }
            }
            else
                return __saveUser(dbContext, userId, username);
        }

        private static int __saveUser(DbContext dbcontext, string userId, string username)
        {            
            new MessageWrapper(dbcontext).Subject("Regeus.Login")
                                         .Message("{0} {1}", userId, username)
                                         .Send("System");            
            User __user = new User(dbcontext).LoadByName(userId);
            __user.UserId = userId;
            __user.UserName = username;
            __user.Save();
            return __user.Id;
        }

        // =================================================================================================================
        // Envío de mensajes
        // =================================================================================================================
        public static void SendMessage(string userId, int type, string subject, string body, string data, string recipients)
        {
            SendMessage(null, userId, type, subject, body, data, recipients);
        }

        public static void SendMessage(DbContext dbContext, string subject, string body, string data, string recipients)
        {
            SendMessage(dbContext, "System", 2, subject, body, data, recipients);
        }

        public static void SendMessage(DbContext dbContext, 
                                       string userId, 
                                       int type, 
                                       string subject, 
                                       string body, 
                                       string data, 
                                       string recipients)
        {
            if (dbContext == null)
            {
                using (var __db = new DbContext())
                {
                    __db.BeginTransaction();
                    try
                    {
                        __send(__db, userId, type, subject, body, data, recipients);
                        __db.Commit();
                    }
                    catch (Exception)
                    {
                        __db.Rollback();
                        throw new Exception("Se ha producido un error al enviar el mensaje.");
                    }
                }
            }
            else
                __send(dbContext, userId, type, subject, body, data, recipients);
        }

        private static void __send(DbContext dbContext,
                                   string userId, 
                                   int type, 
                                   string subject, 
                                   string body, 
                                   string data, 
                                   string recipients)
        {
            // ===========================================================================================================
            // Grabar el mensaje
            // ===========================================================================================================
            var __message = new Message(dbContext);
            __message.UserId = new User(dbContext).LoadByName(userId).Id;
            if (__message.UserId == 0) return;
            __message.Type = type;
            __message.Subject = subject;
            __message.Body = body;
            __message.Data = data;
            __message.Save();
            // ===========================================================================================================
            // Obtener los destinatarios: NIF, Ids o Grupos
            // ===========================================================================================================
            var __tokens = recipients.Split(",;".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
            var __groups = __tokens.Where(t => t.StartsWith("@")).ToList();
            var __ids = __tokens.Where(t => t.StartsWith("#")).ToList();
            var __names = __tokens.Except(__ids).Except(__groups);
            // ===========================================================================================================
            // Obtener los Ids de los usuarios de los grupos
            // ===========================================================================================================
            __ids = __ids.ConvertAll(id => id.Replace("#", ""));
            foreach (string __groupId in __groups)
            {
                var __params = new ParameterContainer().Add("GroupName", __groupId.Replace("@", ""))
                                                       .ToDictionary();
                __ids.AddRange(new GroupMembers(dbContext).Load(__params)
                                                          .ToList()
                                                          .ConvertAll(m => m.UserId.ToString()));
            }
            // ===========================================================================================================
            // Obtener los Ids de los usuarios refenciados por nombre
            // ===========================================================================================================
            foreach (string __username in __names)
            {
                User __user = new User(dbContext).LoadByName(__username);
                if (__user.Id > 0)
                    __ids.Add(__user.Id.ToString());
            }
            // ===========================================================================================================
            // Grabar los destinatarios del mensaje
            // ===========================================================================================================
            using (var __dr = new Core.Data.CsvDataReader(__ids.Distinct()
                                                               .Select(id => string.Format("{0};{1}", __message.Id, id))
                                                               .ToArray(), "0|MessageId;1|UserId"))
            {
                dbContext.BulkCopy("Messenger_Recipient", __dr, "MessageId|MessageId#UserId|UserId".Split('#'));
            }
        }

        public static MessageWrapper Create(DbContext dbContext)
        {
            return new MessageWrapper(dbContext);
        }

        public class MessageWrapper
        {

            private readonly Dictionary<string, string> _formatStrings = new Dictionary<string, string>();
            private readonly DbContext _dbContext;
            private string _message = "";
            private string _subject = "";
            private string _data = "";

            public MessageWrapper(DbContext dbContext)
            {
                _dbContext = dbContext;
                _init();
            }

            public MessageWrapper Message(string value)
            {
                _message = value;
                return this;
            }

            public MessageWrapper Message(string format, params object[] values)
            {
                _message = string.Format(format, values);
                return this;
            }

            public MessageWrapper MergeData(params object[] values)
            {
                _message = string.Format(_formatStrings[_subject], values);
                return this;
            }

            public MessageWrapper Subject(string value)
            {
                _subject = value;
                return this;
            }

            public MessageWrapper Data(string value)
            {
                _data = value;
                return this;
            }

            public MessageWrapper Send(string recipients)
            {
                Manager.SendMessage(_dbContext, _subject, _message, _data, recipients);
                return this;
            }

            private void _init()
            {
                _formatStrings.Add("App.RemoveUser", "{0}|{1}|{2}");
                _formatStrings.Add("App.AddUser", "{0} {1}|{2}|{3}|{4}");
                _formatStrings.Add("App.JS.Error", "{0}|{1}|{2}|{3}");
                _formatStrings.Add("App.JS.Info", "{0}|{1}|{2}|{3}");
                _formatStrings.Add("App.JS.Trace", "{0}|{1}|{2}|{3}");
                _formatStrings.Add("App.JS.Message", "{0}|{1}|{2}|{3}");
            }
        }
    }
}

