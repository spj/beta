using beta.DomainModels;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace beta.DBRepository
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

        public UserDealerModel GetUserDealers(string user)
        {
            List<string> _dealerIDs = new List<string>();
            UserDealerModel _userDealers = new UserDealerModel();
            _userDealers.Dealers = new List<string>();
            SqlParameter sql_user = new SqlParameter("@username", SqlDbType.NVarChar);
            sql_user.Value = user;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "getUserDealers";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(sql_user);
            using (SqlConnection conn = new SqlConnection(DBContext.DefaultConnection))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {                            
                            _userDealers.UserFullName = reader.GetString(0);
                            _userDealers.Dealers.Add(reader.GetString(1));
                        }
                    }
                }
            }
            return _userDealers;
        }

        public List<DealerUserModel> GetUsers(string dealer)
        {
            List<DealerUserModel> _users = new List<DealerUserModel>();
            SqlParameter sql_dealer = new SqlParameter("@dealer", SqlDbType.VarChar);
            sql_dealer.Value = dealer;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "getDealerUsers";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(sql_dealer);
            using (SqlConnection conn = new SqlConnection(DBContext.DefaultConnection))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            _users.Add(new DealerUserModel() { UID = reader.GetString(0), Email=reader.GetString(1), UName = reader.GetString(2) });
                        }
                    }
                }
            }
            return _users;
        }
    }
}
