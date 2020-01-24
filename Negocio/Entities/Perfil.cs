
using Dal.Core;
using Dal.Repositories;
using Negocio.Core;
using System;

namespace Negocio.Entities
{
  [Serializable()]
  public class Perfil : Entity
  {

    public Perfil(){ }
    public Perfil(DbContext context) : base(context) { }
        
    public Perfil Load(int id){    
      using (PerfilesRepository repo = new PerfilesRepository(DataContext)){
        return repo.LoadOne<Perfil>(this, repo.GetItem(id));// Dal.Core.BasicRepository.LoadOne
      }   
    }

    public Perfil Save(){
      using (PerfilesRepository repo = new PerfilesRepository(DataContext)){
        if(_id == 0){
          _id = repo.Insert(Codigo, Descripcion, ModificadoPor, FechaDeAlta, FechaDeModificacion);
        } else{
          repo.Update(Id, Codigo, Descripcion, ModificadoPor, FechaDeAlta, FechaDeModificacion);
        }
        return this;
      }
    }
             
    public void Delete(){
      using (PerfilesRepository repo = new PerfilesRepository(DataContext)){
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

  }
}
