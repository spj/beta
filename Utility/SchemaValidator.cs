using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Schema;
using System.Reflection;
using System.Xml.Linq;

namespace Utilities
{
    public class SchemaValidator
    {
        string _schemaIndentifer = null;
        public XDocument xDoc { get; set; }
        public Type TypeOfSchemaAssembly { get; set; }
        public string SchemaIndentifer
        {
            get
            {
                if (string.IsNullOrEmpty(_schemaIndentifer)) _schemaIndentifer = ".xsd";
                return _schemaIndentifer;
            }

            set
            {
                _schemaIndentifer = value;
            }
        }

        //return null if vaild, or return error msg
        public virtual string Validate()
        {
            StringBuilder errs = new StringBuilder();
            XmlSchemaSet schemas = GetSchemas();
            if (schemas == null || schemas.Count == 0)
            {
                //report an error if the schema is not registered in the system
                //throw new XmlSchemaException("Schema is not found");
                errs.AppendLine("Schema is not found");
            }

            schemas.Compile();
            xDoc.Validate(schemas, (s, arg) => { errs.AppendLine(arg.Message); });
            //if (errs.Length > 0)
            //{
            //    //throw new ApplicationException(errs.ToString());
            //}
            return errs.Length == 0 ? null : errs.ToString();
        }

        /// <summary>
        /// Return a list of resources names that correspond to embedded schemas required for validation
        /// </summary>
        /// <param name="identity"></param>
        /// <returns>XmlSchemaSet</returns>
        XmlSchemaSet GetSchemas()
        {
            XmlSchemaSet schemas = new XmlSchemaSet();
            Assembly schemaAssembly = Assembly.GetAssembly(TypeOfSchemaAssembly);
            string[] schemaNames = schemaAssembly.GetManifestResourceNames().Where(n => n.Contains(SchemaIndentifer)).Select(n => n).ToArray();
            foreach (string name in schemaNames)
            {
                schemas.Add(XmlSchema.Read(schemaAssembly.GetManifestResourceStream(name), null));
            }

            return schemas;
        }
    }
}
