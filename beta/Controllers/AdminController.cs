using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace beta.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : SessionlessController
    {
        public void RefreshCache()
        {
            HttpContext.Cache["ParametersDS"] = CacheData.RefreshCache();
        }
    }
}