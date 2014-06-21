using beta.Controllers.Helper;
using beta.DBRepository;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Utility;

namespace beta.Controllers
{
     [ClientErrorHandler]
    public class BaseController : Controller
    {
         protected static Logger logger = LogManager.GetCurrentClassLogger();
         protected static CacheModel CacheData = null;
         [AllowAnonymous]
         public PartialViewResult GetView(string id)
         {
             return PartialView(id);
         }

         [Route("ExecuteNonQuery")]
         [HttpPost]
         [ValidateAntiForgeryToken]
         public async Task ExecuteNonQuery(string cmdText)
         {
             var _cmdText = Crypto.OpenSSLDecrypt(cmdText,"beta");
             await new CMDRunner().ExecuteNonQuery(_cmdText);
         }

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