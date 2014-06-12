using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace beta.ViewModels
{
    public class DealerViewModel
    {
        public string DealerID { get; set; }
        public string Name { get; set; }
        public string Group {get;set;}
        public string Settings {get;set;}
        public string Language { get; set; }
    }

    public class DealerRegisterViewModel
    {
        public string DealerID { get; set; }
        public string Name { get; set; }
    }
}
