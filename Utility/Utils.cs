using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using System.ComponentModel;
using System.Xml.Linq;
using System.Xml.Serialization;
using System.Xml;
using System.Text;
using System.IO;
using System.Security.Cryptography;
using System.Data;
using System.Drawing;

namespace Utilities
{
    public static class Utils
    {
       
        public static string GetDynamicObjectPropertyValue(dynamic obj, string property)
        {
            return obj.GetType().GetProperty(property).GetValue(obj, null);
        }

        public static string GetEnumDescription(Enum value)
        {
            // Get the Description attribute value for the enum value
            FieldInfo fi = value.GetType().GetField(value.ToString());
            DescriptionAttribute[] attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);
            if (attributes.Length > 0)
            {
                return attributes[0].Description;
            }
            else
            {
                return value.ToString();
            }
        }
        public static string isType<T>(this XDocument xDoc)
        {
            return new SchemaValidator() { xDoc = xDoc, TypeOfSchemaAssembly = typeof(T) }.Validate();
        }

        public static T ToTypedObject<T>(this XDocument xDoc)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(T));
            return (T)serializer.Deserialize(xDoc.CreateReader());
        }

        public static string XMLSerialize<T>(T value)
        {

            if (value == null)
            {
                return null;
            }

            XmlSerializer serializer = new XmlSerializer(typeof(T));

            XmlWriterSettings settings = new XmlWriterSettings();
            settings.Encoding = new UnicodeEncoding(false, false); // no BOM in a .NET string
            settings.Indent = false;
            settings.OmitXmlDeclaration = false;

            using (StringWriter textWriter = new StringWriter())
            {
                using (XmlWriter xmlWriter = XmlWriter.Create(textWriter, settings))
                {
                    serializer.Serialize(xmlWriter, value);
                }
                return textWriter.ToString();
            }
        }

        public static T XMLDeserialize<T>(string xml, System.Xml.Serialization.XmlRootAttribute xRoot = null)
        {
            /*
            if (string.IsNullOrEmpty(xml))
            {
                return default(T);
            }

            XmlSerializer serializer = new XmlSerializer(typeof(T));

            XmlReaderSettings settings = new XmlReaderSettings();
            // No settings need modifying here

            using (StringReader textReader = new StringReader(xml))
            {
                using (XmlReader xmlReader = XmlReader.Create(textReader, settings))
                {
                    return (T)serializer.Deserialize(xmlReader);
                }
            }*/
            XmlSerializer xs;
            if (xRoot != null)
                xs = new XmlSerializer(typeof(T), xRoot);
            else
                xs = new XmlSerializer(typeof(T));
            XmlTextReader reader = new XmlTextReader(new StringReader(xml));

            return (T)xs.Deserialize(reader);
        }

        /// <summary>
        /// this method keeps an existing property's value of target if this property doesn't exist in source
        /// example:
        /// tradictionally meanings
        ///user = new BedsOnRoad.Domain.User() { Email = account.Email, isAdmin = account.isAdmin, OrgID = account.OrgID, Pwd = account.Pwd };
        ///
        ///new meanings with ObjectConvertFrom              
        ///user = new BedsOnRoad.Domain.User();
        ///user.ObjectConvertFrom<CreateNewAccountResult>(account);
        ///
        ///new meanings with ObjectConvertTo              
        ///user = account.ObjectConvertTo<Domain.User>() as Domain.User;
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="target"></param>
        /// <param name="source"></param>
        /// <returns></returns>
        public static bool ObjectConvertFrom<T>(this Object target, T source, bool ignoreNull = false)
        {
            bool rtn = true;
            if (source == null)
            {
                target = null;
                return rtn;
            }

            PropertyDescriptorCollection sourceProperties = TypeDescriptor.GetProperties(source);
            PropertyDescriptorCollection targetProperties = TypeDescriptor.GetProperties(target);
            try
            {
                foreach (PropertyDescriptor targetProperty in targetProperties)
                {
                    PropertyDescriptor sourceProperty = sourceProperties.Find(targetProperty.Name, true /* ignoreCase */);
                    if (sourceProperty != null)// && sourceProperty.PropertyType == targetProperty.PropertyType)
                    {
                        object v = sourceProperty.GetValue(source);
                        if (v is Enum)
                        {
                            v = v.ToString();
                        }
                        if (!ignoreNull || v != null)
                        {
                            try
                            {
                                targetProperty.SetValue(target, v);
                            }
                            catch { }
                        }
                    }
                }
            }
            catch
            {
                rtn = false;
            }

            return rtn;
        }


        // this method doesn't keep an existing property's value of target if this property doesn't exist in source
        public static T ObjectConvertTo<T>(this Object source, bool ignoreNull = false)
        {
            if (source == null) return (T)source;

            PropertyDescriptorCollection sourceProperties = TypeDescriptor.GetProperties(source);
            Type targetType = typeof(T);
            T target = (T)Assembly.GetAssembly(targetType).CreateInstance(targetType.FullName);
            PropertyInfo[] targetProperties = targetType.GetProperties();

            try
            {
                foreach (PropertyInfo targetProperty in targetProperties)
                {
                    PropertyDescriptor sourceProperty = sourceProperties.Find(targetProperty.Name, true /* ignoreCase */);
                    if (sourceProperty != null)// && sourceProperty.PropertyType == targetProperty.PropertyType)
                    {
                        object v = sourceProperty.GetValue(source);
                        if (v is Enum)
                        {
                            v = v.ToString();
                        }
                        if (!ignoreNull || v != null)
                        {
                            try
                            {
                                targetProperty.SetValue(target, v, null);
                            }
                            catch { }
                        }
                    }
                }
            }
            catch
            {

            }
            return target;
        }

        public static string EncryptPassword(string strPassword)
        {
            MD5CryptoServiceProvider p = new MD5CryptoServiceProvider();
            byte[] arr = Encoding.UTF8.GetBytes(strPassword);
            arr = p.ComputeHash(arr);
            StringBuilder sb = new StringBuilder();
            foreach (byte b in arr)
            {
                sb.Append(b.ToString("x2").ToLower());
            }
            return sb.ToString();
        }

        public static string ToJson(this DataTable table)
        {
            StringBuilder sb = new StringBuilder();
            if (table.Rows.Count > 1)
            {
                sb.Append("[");
            }
            foreach (DataRow dr in table.Rows)
            {
                if (sb.Length != 1)
                    sb.Append(",");
                sb.Append("{");
                StringBuilder sb2 = new StringBuilder();
                foreach (DataColumn col in table.Columns)
                {
                    string fieldname = col.ColumnName;
                    string fieldvalue = dr[fieldname].ToString();
                    if (sb2.Length != 0)
                        sb2.Append(",");
                    sb2.Append(string.Format("{0}:\"{1}\"", fieldname, fieldvalue));
                }
                sb.Append(sb2.ToString());
                sb.Append("}");
            }
            if (table.Rows.Count > 1)
            {
                sb.Append("]");
            }
            return sb.ToString();
        }

        #region convert collection to/from datatable
        public static DataTable ConvertTo<T>(this IList<T> list)
        {
            DataTable table = CreateTable<T>();
            Type entityType = typeof(T);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entityType);

            foreach (T item in list)
            {
                DataRow row = table.NewRow();

                foreach (PropertyDescriptor prop in properties)
                {
                    row[prop.Name] = prop.GetValue(item);
                }

                table.Rows.Add(row);
            }

            return table;
        }

        public static IList<T> ConvertTo<T>(IList<DataRow> rows)
        {
            IList<T> list = null;

            if (rows != null)
            {
                list = new List<T>();
                T item = default(T);
                foreach (DataRow row in rows)
                {
                    if (typeof(T).Namespace == "System")
                    {
                        item = (T)row[0];
                    }
                    else
                    {
                        item = CreateItem<T>(row);
                    }
                    list.Add(item);
                }
            }

            return list;
        }

        public static IList<T> ConvertTo<T>(this DataTable table)
        {
            if (table == null)
            {
                return null;
            }

            List<DataRow> rows = new List<DataRow>();

            foreach (DataRow row in table.Rows)
            {
                rows.Add(row);
            }

            return ConvertTo<T>(rows);
        }
        public static string EncodeSingleQuoteIntoDB(string value)
        {
            if (value == null) return null;
            return value;
         //   return ((string)value).Replace("'", "''");
        }
        private static string DecodeSingleQuoteFromDB(string value)
        {
            if (value == null) return null;
             return ((string)value).Replace("''", "'").Replace("'", "\'");
           
        }
        public static T CreateItem<T>(DataRow row)
        {
            T obj = default(T);
            if (row != null)
            {
                obj = Activator.CreateInstance<T>();

                foreach (DataColumn column in row.Table.Columns)
                {
                    PropertyInfo prop = obj.GetType().GetProperty(column.ColumnName);
                    if (prop == null) continue;
                    try
                    {
                        object value = row[column.ColumnName];
                        if (value is DBNull) continue;
                        //unescape single quota
                        if (value is string)
                        {
                           //value = ((string)value).Replace("''", "'").Replace("'", "\'");
                            value=DecodeSingleQuoteFromDB((string)value);
                        }
                        prop.SetValue(obj, value, null);
                    }
                    catch
                    {
                        // You can log something here
                        throw;
                    }
                }
            }

            return obj;
        }

        public static DataTable CreateTable<T>()
        {
            Type entityType = typeof(T);
            DataTable table = new DataTable(entityType.Name);
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entityType);

            foreach (PropertyDescriptor prop in properties)
            {
                table.Columns.Add(prop.Name, prop.PropertyType);
            }

            return table;
        }
        #endregion

        #region RandomPassword
        // Define default min and max password lengths.
        private static int DEFAULT_MIN_PASSWORD_LENGTH = 8;
        private static int DEFAULT_MAX_PASSWORD_LENGTH = 10;

        // Define supported password characters divided into groups.
        // You can add (or remove) characters to (from) these groups.
        private static string PASSWORD_CHARS_LCASE = "abcdefgijkmnopqrstwxyz";
        private static string PASSWORD_CHARS_UCASE = "ABCDEFGHJKLMNPQRSTWXYZ";
        private static string PASSWORD_CHARS_NUMERIC = "23456789";
        private static string PASSWORD_CHARS_SPECIAL = "*$-+?_&=!%{}/";

        public static string RandomPasswordGenerate()
        {
            return RandomPasswordGenerate(DEFAULT_MIN_PASSWORD_LENGTH, DEFAULT_MAX_PASSWORD_LENGTH);
        }

        /// <summary>
        /// Generates a random password of the exact length.
        /// </summary>
        /// <param name="length">
        /// Exact password length.
        /// </param>
        /// <returns>
        /// Randomly generated password.
        /// </returns>
        public static string RandomPasswordGenerate(int length)
        {
            return RandomPasswordGenerate(length, length);
        }

        public static string RandomPasswordGenerate(int minLength, int maxLength)
        {
            // Make sure that input parameters are valid.
            if (minLength <= 0 || maxLength <= 0 || minLength > maxLength)
                return null;

            // Create a local array containing supported password characters
            // grouped by types. You can remove character groups from this
            // array, but doing so will weaken the password strength.
            char[][] charGroups = new char[][] 
        {
            PASSWORD_CHARS_LCASE.ToCharArray(),
            PASSWORD_CHARS_UCASE.ToCharArray(),
            PASSWORD_CHARS_NUMERIC.ToCharArray(),
            PASSWORD_CHARS_SPECIAL.ToCharArray()
        };

            // Use this array to track the number of unused characters in each
            // character group.
            int[] charsLeftInGroup = new int[charGroups.Length];

            // Initially, all characters in each group are not used.
            for (int i = 0; i < charsLeftInGroup.Length; i++)
                charsLeftInGroup[i] = charGroups[i].Length;

            // Use this array to track (iterate through) unused character groups.
            int[] leftGroupsOrder = new int[charGroups.Length];

            // Initially, all character groups are not used.
            for (int i = 0; i < leftGroupsOrder.Length; i++)
                leftGroupsOrder[i] = i;

            // Because we cannot use the default randomizer, which is based on the
            // current time (it will produce the same "random" number within a
            // second), we will use a random number generator to seed the
            // randomizer.

            // Use a 4-byte array to fill it with random bytes and convert it then
            // to an integer value.
            byte[] randomBytes = new byte[4];

            // Generate 4 random bytes.
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
            rng.GetBytes(randomBytes);

            // Convert 4 bytes into a 32-bit integer value.
            int seed = (randomBytes[0] & 0x7f) << 24 |
                        randomBytes[1] << 16 |
                        randomBytes[2] << 8 |
                        randomBytes[3];

            // Now, this is real randomization.
            Random random = new Random(seed);

            // This array will hold password characters.
            char[] password = null;

            // Allocate appropriate memory for the password.
            if (minLength < maxLength)
                password = new char[random.Next(minLength, maxLength + 1)];
            else
                password = new char[minLength];

            // Index of the next character to be added to password.
            int nextCharIdx;

            // Index of the next character group to be processed.
            int nextGroupIdx;

            // Index which will be used to track not processed character groups.
            int nextLeftGroupsOrderIdx;

            // Index of the last non-processed character in a group.
            int lastCharIdx;

            // Index of the last non-processed group.
            int lastLeftGroupsOrderIdx = leftGroupsOrder.Length - 1;

            // Generate password characters one at a time.
            for (int i = 0; i < password.Length; i++)
            {
                // If only one character group remained unprocessed, process it;
                // otherwise, pick a random character group from the unprocessed
                // group list. To allow a special character to appear in the
                // first position, increment the second parameter of the Next
                // function call by one, i.e. lastLeftGroupsOrderIdx + 1.
                if (lastLeftGroupsOrderIdx == 0)
                    nextLeftGroupsOrderIdx = 0;
                else
                    nextLeftGroupsOrderIdx = random.Next(0,
                                                         lastLeftGroupsOrderIdx);

                // Get the actual index of the character group, from which we will
                // pick the next character.
                nextGroupIdx = leftGroupsOrder[nextLeftGroupsOrderIdx];

                // Get the index of the last unprocessed characters in this group.
                lastCharIdx = charsLeftInGroup[nextGroupIdx] - 1;

                // If only one unprocessed character is left, pick it; otherwise,
                // get a random character from the unused character list.
                if (lastCharIdx == 0)
                    nextCharIdx = 0;
                else
                    nextCharIdx = random.Next(0, lastCharIdx + 1);

                // Add this character to the password.
                password[i] = charGroups[nextGroupIdx][nextCharIdx];

                // If we processed the last character in this group, start over.
                if (lastCharIdx == 0)
                    charsLeftInGroup[nextGroupIdx] =
                                              charGroups[nextGroupIdx].Length;
                // There are more unprocessed characters left.
                else
                {
                    // Swap processed character with the last unprocessed character
                    // so that we don't pick it until we process all characters in
                    // this group.
                    if (lastCharIdx != nextCharIdx)
                    {
                        char temp = charGroups[nextGroupIdx][lastCharIdx];
                        charGroups[nextGroupIdx][lastCharIdx] =
                                    charGroups[nextGroupIdx][nextCharIdx];
                        charGroups[nextGroupIdx][nextCharIdx] = temp;
                    }
                    // Decrement the number of unprocessed characters in
                    // this group.
                    charsLeftInGroup[nextGroupIdx]--;
                }

                // If we processed the last group, start all over.
                if (lastLeftGroupsOrderIdx == 0)
                    lastLeftGroupsOrderIdx = leftGroupsOrder.Length - 1;
                // There are more unprocessed groups left.
                else
                {
                    // Swap processed group with the last unprocessed group
                    // so that we don't pick it until we process all groups.
                    if (lastLeftGroupsOrderIdx != nextLeftGroupsOrderIdx)
                    {
                        int temp = leftGroupsOrder[lastLeftGroupsOrderIdx];
                        leftGroupsOrder[lastLeftGroupsOrderIdx] =
                                    leftGroupsOrder[nextLeftGroupsOrderIdx];
                        leftGroupsOrder[nextLeftGroupsOrderIdx] = temp;
                    }
                    // Decrement the number of unprocessed groups.
                    lastLeftGroupsOrderIdx--;
                }
            }

            // Convert password characters into a string and return the result.
            return new string(password);
        }
        #endregion

        #region LLF

        public static decimal PlusTaxAndInterest(decimal principal, double interestRate, int terms, string payment_Frequency, decimal taxRate)
        {
            double rate = GetInterestOfFrequency(interestRate, payment_Frequency);
            principal *= 1 + taxRate;
            return rate == 0 ? principal : (decimal)(rate + rate / (Math.Pow((double)(1 + rate), (double)terms) - 1)) * principal * terms;
        }

        public static double RemoveTaxAndInterest(double principal, double interestRate, int terms, string payment_Frequency, double taxRate)
        {
            double newPrincipal = principal;
            double rate = GetInterestOfFrequency(interestRate, payment_Frequency);
            if (rate > 0)
            {
                newPrincipal = principal / ((rate + rate / (Math.Pow((double)(1 + rate), (double)terms) - 1)) * terms);
            }
            newPrincipal /= 1 + taxRate;
            return newPrincipal;
        }

        public static double GetInterestOfFrequency(double interestRate, string payment_Frequency)
        {
            double rate = 0;
            switch (payment_Frequency)
            {
                case "Monthly":
                    rate = interestRate / 1200;
                    break;
                case "Semi-Monthly":
                    rate = interestRate / 2400;
                    break;
                case "Weekly":
                    rate = interestRate / 5200;
                    break;
                case "Bi-Weekly":
                    rate = interestRate / 2600;
                    break;
            }

            return rate;
        }

        public static int NumberOfPayments(string payment_Frequency, int amortizedTerm)
        {
            int term = amortizedTerm;
            switch (payment_Frequency)
            {
                case "Semi-Monthly":
                    term *= 2;
                    break;
                case "Weekly":
                    term = (int)Math.Floor((double)term * 52 / 12);
                    break;
                case "Bi-Weekly":
                    term = (int)Math.Floor((double)term * 26 / 12);
                    break;
            }
            return term;
        }

        //principal already contains tax
        public static double PerPaymentCaculator(double principal, double interestRate, int numberOfPayments, string payment_Frequency)
        {
            double rate = GetInterestOfFrequency(interestRate, payment_Frequency);
            double rtn = principal;
            var powedRate = Math.Pow(1 + rate, numberOfPayments);
            if (rate == 0)
            {
                rtn /= numberOfPayments;
            }
            else
            {
                rtn = ((rtn * powedRate) * rate / (powedRate - 1));
            }
            return rtn;
        }

        public static int GetAdjustmentOfNumberOfPayments(bool isLease, string settings)
        {
            int adjustment = isLease ? 1 : 0;
            if (!isLease || string.IsNullOrEmpty(settings)) return adjustment; //by default is RR-style

            XElement xsettings = XElement.Parse(settings);
            XElement llfLeasing = xsettings.Element("LLFLeasing");
            if (llfLeasing == null || llfLeasing.Attribute("AdjustmentOfNumberOfPayments") == null) return adjustment;
            adjustment = int.Parse(llfLeasing.Attribute("AdjustmentOfNumberOfPayments").Value);
            return adjustment;
        }

        public static decimal GetLLFTaxRate(bool isLease, decimal llftaxRate, string settings)
        {
            decimal rate = llftaxRate;
            if (!isLease || string.IsNullOrEmpty(settings)) return rate; //by default is RR-style

            XElement xsettings = XElement.Parse(settings);
            XElement llfLeasing = xsettings.Element("LLFLeasing");
            if (llfLeasing == null || llfLeasing.Attribute("PST") == null) return rate;
            rate = llfLeasing.Attribute("PST").Value == "1" ? rate : 0;
            return rate;
        }
        public static string GetPaymentFrequency(int freq)
        {
            switch (freq)
            {
                case 12:
                    return "Monthly";
                case 24:
                    return "Semi-Monthly";
                case 52:
                    return "Weekly";
                case 26:
                    return "Bi-Weekly";

            }
            return "Unknown";
        }
        #endregion

        public static string getRidOfUnprintablesAndUnicode(string inpString)
        {
            string outputs = String.Empty;
            for (int jj = 0; jj < inpString.Length; jj++)
            {
                char ch = inpString[jj];
                if (((int)(byte)ch) >= 32 & ((int)(byte)ch) <= 128)
                {
                    outputs += ch;
                }
            }
            return outputs;
        }

        public static Bitmap Base64StringToBitmap(this string base64String)
        {
            Bitmap bmpReturn = null;
            byte[] byteBuffer = Convert.FromBase64String(base64String);
            using (MemoryStream memoryStream = new MemoryStream(byteBuffer))
            {
                memoryStream.Position = 0;
                bmpReturn = (Bitmap)Bitmap.FromStream(memoryStream);               
            }
            byteBuffer = null;
            return bmpReturn;
        }
    }

}