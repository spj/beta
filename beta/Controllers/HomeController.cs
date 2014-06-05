using beta.Controllers;
using System.Web.Mvc;

namespace beta.Controllers {
    public class HomeController : SessionlessController {
        [Authorize]
        public ActionResult Home()
        {
            return View();
        }

        public ActionResult Index() {
            ViewBag.Message = "Your app description page.";

            return View();
        }

        public PartialViewResult GetView(string id)
        {
            return PartialView(id);
        }
    }
}
