

namespace Negocio.Entities.Messenger
{
    using Dal.Core;
    using Dal.Repositories.Messenger;
    using Negocio.Core;
    using System;
    using System.Linq;

    [Serializable()]
    public class Group : Entity
    {

        public Group() { }
        public Group(DbContext context) : base(context) { }

        public Group Load(int id)
        {
            using (GroupsRepository repo = new GroupsRepository(DataContext))
            {
                return repo.LoadOne<Group>(this, repo.GetItem(id));
            }
        }

        public Group LoadByName(string name)
        {
            using (GroupsRepository repo = new GroupsRepository(DataContext))
            {
                var __params = new ParameterContainer().Add("Name", name)
                                                       .ToDictionary();
                return repo.LoadOne<Group>(this, repo.GetItems(__params));
            }
        }

        public Group Save()
        {
            using (GroupsRepository repo = new GroupsRepository(DataContext))
            {
                if (_id == 0)
                {
                    _id = repo.Insert(Name);
                }
                else
                {
                    repo.Update(Id, Name);
                }
                return this;
            }
        }

        public void Delete()
        {
            using (GroupsRepository repo = new GroupsRepository(DataContext))
            {
                repo.Delete(_id);
            }
        }

        public Group AddMembers(int[] usersIds)
        {
            // ==================================================================
            // Miembros actuales del grupo
            // ==================================================================
            var __params = new ParameterContainer().Add("GroupId", Id.ToString())
                                                   .ToDictionary();
            var __membersIds = new GroupMembers(DataContext).Load(__params)
                                                            .Select(m => m.Id);
            // ==================================================================
            // Insertar los miembros que no son del grupo
            // ==================================================================
            usersIds.Except(__membersIds)
                    .Select( id => new GroupMember() { DataContext = DataContext,
                                                       GroupId = Id, 
                                                       UserId = id })
                    .Select( item => item.Save() )
                    .ToArray();
            return this;
        }

        int _id;
        public override int Id
        {
            get { return _id; }
            set { _id = value; }
        }

        string _name = "";
        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

    }
}
