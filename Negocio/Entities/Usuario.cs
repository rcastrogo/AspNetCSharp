
using Dal.Core;
using Dal.Repositories;
using Negocio.Core;
using System;

namespace Negocio.Entities
{
  [Serializable()]
  public class Usuario : Entity
  {

    public Usuario(){ }
    public Usuario(DbContext context) : base(context) { }
        
    public Usuario Load(int id){    
      using (UsuariosRepository repo = new UsuariosRepository(DataContext)){
        return repo.LoadOne<Usuario>(this, repo.GetItem(id));// Dal.Core.BasicRepository.LoadOne
      }   
    }

    public Usuario Save(){
      using (UsuariosRepository repo = new UsuariosRepository(DataContext)){
        if(_id == 0){
          _id = repo.Insert(Codigo, Descripcion, ModificadoPor, FechaDeAlta, FechaDeModificacion, Email);
        } else{
          repo.Update(Id, Codigo, Descripcion, ModificadoPor, FechaDeAlta, FechaDeModificacion, Email);
        }
        return this;
      }
    }
             
    public void Delete(){
      using (UsuariosRepository repo = new UsuariosRepository(DataContext)){
        repo.Delete(_id);
      }
    }
  

    int _id;
    public override int Id  
    {
      get { return _id; }         
      set { _id = value; }
    }

    String _codigo;
    public String Codigo  
    {
      get { return _codigo; }         
      set { _codigo = value; }
    }

    String _descripcion;
    public String Descripcion  
    {
      get { return _descripcion; }         
      set { _descripcion = value; }
    }

    String _modificadoPor;
    public String ModificadoPor  
    {
      get { return _modificadoPor; }         
      set { _modificadoPor = value; }
    }

    String _fechaDeAlta;
    public String FechaDeAlta  
    {
      get { return _fechaDeAlta; }         
      set { _fechaDeAlta = value; }
    }

    String _fechaDeModificacion;
    public String FechaDeModificacion  
    {
      get { return _fechaDeModificacion; }         
      set { _fechaDeModificacion = value; }
    }

    String _email;
    public String Email  
    {
      get { return _email; }         
      set { _email = value; }
    }

  }
}
