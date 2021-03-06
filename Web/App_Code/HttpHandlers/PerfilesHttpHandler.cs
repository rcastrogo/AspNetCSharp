﻿using Toledo.Core;
using System;
using System.Web;

namespace Toledo.HttpHandlers
{

 public class PerfilesHttpHandler : IHttpHandler, System.Web.SessionState.IRequiresSessionState
  {
    private ContextWrapper _context;

    public void ProcessRequest(HttpContext context)
    {
      _context = new ContextWrapper(context);

      Func<ActionResult> __proc = __doDefault;
      switch (_context.GetItem("action").ToLower())
      {
        case "all":
          __proc = new Controllers.PerfilesController(_context).GetAll;
          break;
        case "all-sql-direct-query":
          __proc = new Controllers.PerfilesController(_context).GetAllSqlDirectQuery;
        break;
      }
      try
      {
        ActionResult __result = __proc();
        if (__result.Binary)
        {
          if (__result.SetHeadersCallBack != null)
            __result.SetHeadersCallBack(context, __result.RawData);
          context.Response.BinaryWrite(__result.RawData);
        }
        else if (__result.Redirect)
          context.Response.Redirect(__result.Data, false);
        else
        {
          if (__result.SetHeadersCallBack != null)
            __result.SetHeadersCallBack(context, __result.RawData);
          else
          {
            context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
            context.Response.ContentType = "text/plain";
          }
          context.Response.Write(__result.Data);
        }
      }
      catch (Exception ex)
      {
        context.Response.ContentType = "application/json;charset=utf-8";
        context.Response.Write(JsonActionResult.Fail(ex.Message.Replace("\r\n", "")).Data);
      }
    }

    public bool IsReusable
    {
      get { return false; }
    }

    private ActionResult __doDefault()
    {
      throw new Exception("Parámetros insuficientes");
    }

  }

}