using beta.Controllers.Helper;
using beta.DomainModels;
using Newtonsoft.Json.Linq;
using NLog;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
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
         public async Task ExecuteNonQuery(string cmdText, string cmdParameter)
         {
             var _cmdText = Decrypt(cmdText);
             await Utilities.CMDRunner.ExecuteNonQuery(Parameters.DefaultConnection, _cmdText, cmdParameter);
         }

         protected string Decrypt(string content)
         {
             return Crypto.OpenSSLDecrypt(content, ConfigurationManager.AppSettings["AESkey"]);
         }
         protected bool isValid(object @object, out ICollection<ValidationResult> results)
         {
             var context = new ValidationContext(@object, serviceProvider: null, items: null);
             results = new List<ValidationResult>();
             return Validator.TryValidateObject(
                 @object, context, results,
                 validateAllProperties: true
             );
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