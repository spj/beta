using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace beta.DomainModels
{
    public class DealerUserModel
    {
        public string UID { get; set; }
        public string Email { get; set; }
        public string UName { get; set; }
        public DateTime? LockoutEndDate { get; set; }
    }

    public class RoleModel
    {
        public string Id { get; set;}
        public string Name { get; set; }
    }
}
