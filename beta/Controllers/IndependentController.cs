using beta.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace beta.Controllers
{
    public class IndependentController : SessionlessController
    {
        [AllowAnonymous]
        public JsonResult DealersForRegister(string id)
        {
            List<DealerRegisterViewModel> _dealers = new List<DealerRegisterViewModel>();
            foreach (var dealer in CacheData.GetDealers().Where(d => d.Name.ToLower().Contains(id.ToLower())).Select(d => d))
            {
                _dealers.Add(new DealerRegisterViewModel() { DealerID =dealer.DealerID, Name=dealer.Name });
            }

            return Json(_dealers, JsonRequestBehavior.AllowGet);
        }
    }
}