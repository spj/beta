using beta.DomainModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace beta.ViewModels
{
    public class DealerUserViewModel:DealerUserModel
    {
       public List<DealerUserModel> Users = null;
        public DealerUserViewModel(string dealer)
        {
            Users = new DealerUsers(dealer).Users;
        }
    }

}
