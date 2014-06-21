using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace beta.DBRepository
{
    public class CMDRunner
    {
        public async Task ExecuteNonQuery(string cmdText)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = cmdText;
            using (SqlConnection conn = new SqlConnection(DBContext.DefaultConnection))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
               await cmd.ExecuteNonQueryAsync();
            }           
        }
    }
}
