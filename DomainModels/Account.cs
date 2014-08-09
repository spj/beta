using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace beta.DomainModels
{
    public class DealerUsers
    {
        List<DealerUserModel> _users = null;
        public List<DealerUserModel> Users { get { return _users; } }
        public DealerUsers(string dealer)
        {
            SqlParameter sql_dealer = new SqlParameter("@dealer", SqlDbType.VarChar);
            sql_dealer.Value = dealer;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "getDealerUsers";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(sql_dealer);
            using (SqlConnection conn = new SqlConnection(Parameters.DefaultConnection))
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
                            _idx = reader.GetOrdinal("PhoneNumber");
                            if (!reader.IsDBNull(_idx))
                                _model.PhoneNumber = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("LockoutEndDateUtc");
                            if (!reader.IsDBNull(_idx))
                                _model.LockoutEndDate = reader.GetDateTime(_idx);
                            if (_users == null) _users = new List<DealerUserModel>();
                            _users.Add(_model);
                        }
                    }
                }
            }
        }
    }
    public class DealerUserModel
    {
        public string UID { get; set; }
        public string Email { get; set; }
        public string UName { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? LockoutEndDate { get; set; }
        public bool Lockout { get { return this.LockoutEndDate != null; } }
    }

    public class RoleModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class UserDealersAndRoles
    {
        DealerUserModel _user = null;
        List<string> _roles = null;
        List<string> _dealers = null;
        public DealerUserModel User { get { return _user; } }
        public List<string> Roles { get { return _roles; } }
        public List<string> Dealers { get { return _dealers; } }
        public UserDealersAndRoles(string user)
        {
            SqlParameter sql_user = new SqlParameter("@uid", SqlDbType.VarChar);
            sql_user.Value = user;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "getUserDealersAndRoles";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(sql_user);
            using (SqlConnection conn = new SqlConnection(Parameters.DefaultConnection))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            _user = new DealerUserModel();
                            int _idx = reader.GetOrdinal("id");
                            _user.UID = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("email");
                            _user.Email = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("fullname");
                            _user.UName = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("PhoneNumber");
                            if (!reader.IsDBNull(_idx))
                                _user.PhoneNumber = reader.GetString(_idx);
                        }

                        reader.NextResult();
                        if (reader.HasRows)
                        {
                           
                            if (_dealers == null) _dealers = new List<string>();
                            while (reader.Read())
                            {
                                _dealers.Add(reader.GetString(0));
                            }
                            reader.NextResult();
                            if (reader.HasRows)
                            {
                                if (_roles == null) _roles = new List<string>();
                                while (reader.Read())
                                {
                                    _roles.Add(reader.GetString(0));
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    public class Account
    {
        public void Register(string user, string dealer)
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
            using (SqlConnection conn = new SqlConnection(Parameters.DefaultConnection))
            {
                if (conn.State == ConnectionState.Closed) conn.Open();
                cmd.Connection = conn;
                cmd.ExecuteNonQuery();
            }
        }
    }
}
