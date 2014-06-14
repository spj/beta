using beta.Controllers;
using System.Web.Mvc;

namespace beta.Controllers {
    //[Route("{action=Index}/{id?}")]
    public class HomeController : SessionlessController {
        [Authorize]
        public ActionResult Home(string id)
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
