

namespace Negocio.Entities
{
  using Dal.Core;
  using Dal.Repositories;
  using Negocio.Core;
  using System;

  [Serializable()]
  public class Coordinado : Entity
  {

    public Coordinado(){ }
    public Coordinado(DbContext context) : base(context) { }
        
    public Coordinado Load(int id){    
      using (CoordinadosRepository repo = new CoordinadosRepository(DataContext)){
        return repo.LoadOne<Coordinado>(this, repo.GetItem(id)); // Dal.Core.BasicRepository.LoadOne
      }   
    }

    public Coordinado Save(){
      using (CoordinadosRepository repo = new CoordinadosRepository(DataContext)){
        if(_id == 0){
          _id = repo.Insert(Codigo, Descripcion, FechaDeInicioDeVigencia, FechaDeFinDeVigencia, ModificadoPor, FechaDeInsert, FechaDeUpdate);
        } else{
          repo.Update(Id, Codigo, Descripcion, FechaDeInicioDeVigencia, FechaDeFinDeVigencia, ModificadoPor, FechaDeInsert, FechaDeUpdate);
        }
        return this;
      }
    }
             
    public void Delete(){
      using (CoordinadosRepository repo = new CoordinadosRepository(DataContext)){
        repo.Delete(_id);
      }
    }
  

    int _id;
    public override int Id  
    {
      get { return _id; }         
      set { _id = value; }
    }

    string _codigo = "";
    public string Codigo  
    {
      get { return _codigo; }         
      set { _codigo = value; }
    }

    string _descripcion = "";
    public string Descripcion  
    {
      get { return _descripcion; }         
      set { _descripcion = value; }
    }

    string _fechaDeInicioDeVigencia = "";
    public string FechaDeInicioDeVigencia  
    {
      get { return _fechaDeInicioDeVigencia; }         
      set { 
        try
        {
          _fechaDeInicioDeVigencia = DateTime.Parse(value).ToString("dd/MM/yyyy");
        }
        catch { _fechaDeInicioDeVigencia = ""; }
      }
    
    }

    string _fechaDeFinDeVigencia = "";
    public string FechaDeFinDeVigencia  
    {
      get { return _fechaDeFinDeVigencia; }         
      set { 
        try
        {
          _fechaDeFinDeVigencia = DateTime.Parse(value).ToString("dd/MM/yyyy");
        }
        catch { _fechaDeFinDeVigencia = ""; }
      }
    
    }

    string _modificadoPor = "";
    public string ModificadoPor  
    {
      get { return _modificadoPor; }         
      set { _modificadoPor = value; }
    }

    string _fechaDeInsert = "";
    public string FechaDeInsert  
    {
      get { return _fechaDeInsert; }         
      set { 
        try
        {
          _fechaDeInsert = DateTime.Parse(value).ToString("dd/MM/yyyy");
        }
        catch { _fechaDeInsert = ""; }
      }
    
    }

    string _fechaDeUpdate = "";
    public string FechaDeUpdate  
    {
      get { return _fechaDeUpdate; }         
      set { 
        try
        {
          _fechaDeUpdate = DateTime.Parse(value).ToString("dd/MM/yyyy");
        }
        catch { _fechaDeUpdate = ""; }
      }
    
    }

  }
}
