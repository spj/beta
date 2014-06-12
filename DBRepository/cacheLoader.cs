using beta.DomainModels;
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
                adapter.Fill(ds);
            }
            return ds;
        }
    }

   public class CacheModel
   {
       private static CacheLoader CacheLoader = null;
       private volatile static CacheModel cacheData;
       private static object syncRoot = new Object();
       private CacheModel() { }

       public static CacheModel CacheDataCreation()
       {
           CacheLoader = new CacheLoader();
           if (cacheData == null)
           {
               lock (syncRoot)
               {
                   if (cacheData == null)
                       cacheData = new CacheModel();
               }
           }

           return cacheData;
       }
       public DataSet CachedDS
       {
           get
           {
               var ds = HttpRuntime.Cache.Get("CachedDS") as DataSet;
               if (ds == null)
               {
                   ds = CacheLoader.LoadCache();
                   HttpRuntime.Cache["CachedDS"] = ds;
               }
               return ds;
           }
       }
       public IQueryable<T> GetCachedObject<T>(string objName, string tableName)
       {
           var models = HttpRuntime.Cache.Get(objName) as IQueryable<T>;
           if (models == null)
           {
               var table = CachedDS.Tables[tableName] as DataTable;
               models = table.ConvertTo<T>().AsQueryable();
               HttpRuntime.Cache[objName] = models;
           }
           return models;
       }

       public DataSet RefreshCache()
       {
           DataSet ds = CacheLoader.LoadCache();
           HttpRuntime.Cache.Remove("CachedDealers");
           return ds;
       }

       public DealerModel GetDealer(string id)
       {
           return GetDealers().FirstOrDefault(d => d.DealerID == id);
       }

       public IQueryable<DealerModel> GetDealers()
       {
           return GetCachedObject<DealerModel>("CacheDealers", "Dealers");
       }

   }
}
