﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace WorldCities.Data
{
    public class CountryDTO
    {
        public CountryDTO() { }

        public int Id { get; set; }
        public string Name { get; set; }
        
        [JsonPropertyName("iso2")]
        public string ISO2 { get; set; }

        public string ISO3 { get; set; }

        public int TotCities { get; set; }
    }
}