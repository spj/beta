using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Utilities;

namespace beta.DBRepository
{
   public class CacheLoader
    {
        public DataSet LoadCache()
        {
            DataSet ds = new DataSet();
            using (SqlConnection conn = new SqlConnection(DBContext.DefaultConnection))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.CommandText = "CacheLoad";
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Connection = conn;
                SqlDataAdapter adapter = new SqlDataAdapter();
                adapter.SelectCommand = cmd;
                adapter.TableMappings.Add("Table", "Dealers");
                adapter.TableMappings.Add("Table1", "Roles");
                adapter.Fill(ds);
            }
            return ds;
        }
    }

}
