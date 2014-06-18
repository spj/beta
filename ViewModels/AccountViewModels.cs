using beta.DBRepository;
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
        List<DealerUserModel> _users = null;
        public List<DealerUserModel> Users { get { return _users; } }
        public DealerUserViewModel(string dealer)
        {
           _users = new Account().GetUsers(dealer);
        }
    }
}
