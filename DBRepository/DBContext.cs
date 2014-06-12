using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace beta.DBRepository
{
    public static class DBContext
    {
        public static string DefaultConnection { get { return ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString; } }
    }
}
