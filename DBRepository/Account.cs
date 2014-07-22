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
                            int _idx = reader.GetOrdinal("FullName");
                            _userDealers.UserFullName = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("Dealer");
                            _userDealers.Dealers.Add(reader.GetString(_idx));
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
                            var _model = new DealerUserModel();
                            int _idx = reader.GetOrdinal("id");
                            _model.UID = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("email");
                            _model.Email = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("fullname");
                            _model.UName = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("LockoutEndDateUtc");
                            if (!reader.IsDBNull(_idx))
                                _model.LockoutEndDate = reader.GetDateTime(_idx);
                            _users.Add(_model);
                        }
                    }
                }
            }
            return _users;
        }

        //Tuple<roles,dealers>
        public Tuple<List<string>,List<string>> GetUserDealersAndRoles(string user)
        {
            List<string> _roles = new List<string>();
            List<string> _dealers = new List<string>();
            SqlParameter sql_user = new SqlParameter("@uid", SqlDbType.VarChar);
            sql_user.Value = user;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "getUserDealersAndRoles";
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
                            _roles.Add(reader.GetString(0));
                        }
                        reader.NextResult();
                        if (reader.HasRows)
                        {
                            while (reader.Read())
                            {
                                _dealers.Add(reader.GetString(0));
                            }
                        }
                    }
                }
            }
            return Tuple.Create(_roles,_dealers);
        }
    }
}
