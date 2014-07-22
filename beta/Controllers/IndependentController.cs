using beta.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using beta.Models;
using System.Threading.Tasks;
using beta.DomainModels;

namespace beta.Controllers
{
    public class IndependentController : SessionlessController
    {
        [AllowAnonymous]
        [Route("Dealers/{dealer}")]
        public JsonResult DealersForRegister(string dealer)
        {
            List<DealerRegisterViewModel> _dealers = new List<DealerRegisterViewModel>();
            foreach (var d in CacheData.GetDealers().Where(d => d.Name.ToLower().Contains(dealer.ToLower())).Select(d => d))
            {
                _dealers.Add(new DealerRegisterViewModel() { DealerID =d.DealerID, Name=d.Name });
            }

            return Json(_dealers, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetUserDealers(string user)
        {
            UserDealerModel _userDealers = new UserDealerModel(user);
            List<DealerViewModel> _dealers = new List<DealerViewModel>();
               _dealers = (from d in CacheData.GetDealers()
                           join i in _userDealers.Dealers on d.DealerID equals i
                           select new DealerViewModel()
                           {
                               DealerID = d.DealerID,
                               Group = d.Group,
                               Name = d.Name,
                               Language = d.Language,
                               Settings = d.Settings
                           }).ToList();
               return Json(new { UserFullName = _userDealers.UserFullName, Dealers = _dealers }, JsonRequestBehavior.AllowGet);
        }

    }
}