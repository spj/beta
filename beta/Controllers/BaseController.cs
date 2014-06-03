using DHW.Controllers.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace beta.Controllers
{
     [ClientErrorHandler]
    public class BaseController : Controller
    {

    }
     [SessionState(System.Web.SessionState.SessionStateBehavior.Disabled)]
     public class SessionlessController : BaseController
     {

     }
}