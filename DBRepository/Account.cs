using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBRepository
{
    public class Account
    {
        public void RegisterUserDealer(string user, string dealer)
        {
            SqlParameter sql_user = new SqlParameter("@user", SqlDbType.NVarChar);
            sql_user.Value = user;
            SqlParameter sql_dealer = new SqlParameter("@dealer", SqlDbType.VarChar);
            sql_dealer.Value = dealer;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "registerUserDealer";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(sql_user);
            cmd.Parameters.Add(sql_dealer);
            using (SqlConnection conn = new SqlConnection(DBContext.DefaultConnection))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
                cmd.ExecuteNonQuery();
            }
        }
    }
}
