
namespace Negocio.Entities.Messenger
{
    using Dal.Core;
    using Dal.Repositories.Messenger;
    using Negocio.Core;
    using System;

    [Serializable()]
    public class Message : Entity
    {

        public Message() { }
        public Message(DbContext context) : base(context) { }

        public Message Load(int id)
        {
            using (MessagesRepository repo = new MessagesRepository(DataContext))
            {
                return repo.LoadOne<Message>(this, repo.GetItem(id));
            }
        }

        public Message Save()
        {
            using (MessagesRepository repo = new MessagesRepository(DataContext))
            {
                if (_id == 0)
                {
                    _id = repo.Insert(ParentId,
                                      UserId,
                                      Type,
                                      Subject,
                                      Body,
                                      Data);
                }
                else
                {
                    repo.Update(Id,
                                ParentId,
                                UserId,
                                SentAt,
                                Type,
                                Subject,
                                Body,
                                Data);
                }
                return this;
            }
        }

        public void Delete()
        {
            using (MessagesRepository repo = new MessagesRepository(DataContext))
            {
                repo.Delete(_id);
            }
        }

        int _id;
        public override int Id
        {
            get { return _id; }
            set { _id = value; }
        }

        int _parentId;
        public int ParentId
        {
            get { return _parentId; }
            set { _parentId = value; }
        }

        int _userId;
        public int UserId
        {
            get { return _userId; }
            set { _userId = value; }
        }

        string _sentAt = "";
        public string SentAt
        {
            get { return _sentAt; }
            set
            {
                try
                {
                    _sentAt = DateTime.Parse(value).ToString("dd/MM/yyyy");
                }
                catch { _sentAt = ""; }
            }
        }

        int _type;
        public int Type
        {
            get { return _type; }
            set { _type = value; }
        }

        string _subject = "";
        public string Subject
        {
            get { return _subject; }
            set { _subject = value; }
        }

        string _body = "";
        public string Body
        {
            get { return _body; }
            set { _body = value; }
        }

        string _data = "";
        public string Data
        {
            get { return _data; }
            set { _data = value; }
        }

    }
}
