using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace beta.DomainModels
{
    public class DealerModel
    {
        public string DealerID { get; set; }
        public string Name { get; set; }
        public string Contactor {get;set;}
        public string Street {get;set;}
        public string City {get;set;}
        public string Province {get;set;}
        public string PostalCode {get;set;}
        public string Country {get;set;}
        public string ContactPhone {get;set;}
        public string Email {get;set;}
        public string Fax {get;set;}
        public string Group {get;set;}
        public string Principle {get;set;}
        public string Settings {get;set;}
        public string Language { get; set; }
    }

    public class UserDealerModel
    {
        public string UserFullName { get; set; }
        public List<string> Dealers { get; set; }
        public UserDealerModel(string user) {
            SqlParameter sql_user = new SqlParameter("@username", SqlDbType.NVarChar);
            sql_user.Value = user;

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = "getUserDealers";
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
                        if (this.Dealers == null) this.Dealers = new List<string>();
                        while (reader.Read())
                        {
                            int _idx = reader.GetOrdinal("FullName");
                            this.UserFullName = reader.GetString(_idx);
                            _idx = reader.GetOrdinal("Dealer");
                            this.Dealers.Add(reader.GetString(_idx));
                        }
                    }
                }
            }
        }
    }

}
