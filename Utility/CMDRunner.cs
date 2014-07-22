using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utilities
{
    public static class CMDRunner
    {
        public async static Task ExecuteNonQuery(string connString, string cmdText, string cmdParameter)
        {
            SqlCommand cmd = CMDBuilder(cmdText,cmdParameter);
            using (SqlConnection conn = new SqlConnection(connString))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
               await cmd.ExecuteNonQueryAsync();
            }           
        }

       static SqlCommand CMDBuilder(string cmdText, string cmdParameter)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = cmdText;
            if (!string.IsNullOrEmpty(cmdParameter))
            {
                JArray _cmdParameter = JArray.Parse(cmdParameter);
                foreach (var p in _cmdParameter)
                {
                    Type _type = Type.GetType(string.Format("System.{0}", p["type"]));
                    var _value = System.Convert.ChangeType(p["value"].ToString(), _type);
                    cmd.Parameters.AddWithValue("@" + p["name"], _value);
                }
            }
            return cmd;
        }
    }
}
