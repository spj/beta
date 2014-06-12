using beta.Controllers.Helper;
using beta.DBRepository;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;


namespace beta.Controllers
{
     [ClientErrorHandler]
    [Authorize]
    public class BaseController : Controller
    {
         protected static Logger logger = LogManager.GetCurrentClassLogger();
         protected static CacheModel CacheData = null;
         protected override void OnActionExecuting(ActionExecutingContext filterContext)
         {
             base.OnActionExecuting(filterContext);
             if (CacheData == null)
             {
                 CacheData = CacheModel.CacheDataCreation();
             }
         }
    }
     [SessionState(System.Web.SessionState.SessionStateBehavior.Disabled)]
     public class SessionlessController : BaseController
     {

     }
}