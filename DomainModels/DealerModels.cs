﻿using System;
using System.Collections.Generic;
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
}
