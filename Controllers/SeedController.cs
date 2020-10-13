using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using WorldCities.Data;
using WorldCities.Data.Models;

namespace WorldCities.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public SeedController(
            ApplicationDbContext context,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult> Import()
        {
            // NOTE: This method has been updated on 2020.09.13.
            // The new version is more efficient than the code described in the book's Chapter 4.
            // ref.: https://github.com/PacktPublishing/ASP.NET-Core-3-and-Angular-9-Third-Edition/issues/15

            var path = Path.Combine(
                _env.ContentRootPath,
                String.Format("Data/Source/worldcities.xlsx"));

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new FileStream(
                path,
                FileMode.Open,
                FileAccess.Read);
            using var ep = new ExcelPackage(stream);
            // get the first worksheet

            var ws = ep.Workbook.Worksheets[0];

            // initialize the record counters
            var nCountries = 0;
            var nCities = 0;

            #region Import all Countries
            // create a list containing all the countries already existing
            // into the Database (it will be empty on first run).
            var lstCountries = _context.Countries.ToList();

            // iterates through all rows, skipping the first one
            for (int nRow = 2; nRow <= ws.Dimension.End.Row; nRow++)
            {
                var row = ws.Cells[nRow, 1, nRow, ws.Dimension.End.Column];
                var name = row[nRow, 5].GetValue<string>();

                // does this country already exist in the database?
                if (lstCountries.Where(c => c.Name == name).Count() == 0)
                {
                    // create the Country entity and fill it with xlsx data
                    var country = new Country
                    {
                        Name = name,
                        ISO2 = row[nRow, 6].GetValue<string>(),
                        ISO3 = row[nRow, 7].GetValue<string>()
                    };

                    // add the new country to the DB context
                    _context.Countries.Add(country);

                    // store the country to retrieve its Id later on
                    lstCountries.Add(country);

                    // increment the counter
                    nCountries++;
                }
            }

            // save all the countries into the Database
            if (nCountries > 0) await _context.SaveChangesAsync();
            #endregion

            #region Import all Cities
            // create a list containing all the cities already existing
            // into the Database (it will be empty on first run).
            var lstCities = _context.Cities.ToList();

            // iterates through all rows, skipping the first one
            for (int nRow = 2;
                nRow <= ws.Dimension.End.Row;
                nRow++)
            {
                var row = ws.Cells[nRow, 1, nRow, ws.Dimension.End.Column];

                var name = row[nRow, 1].GetValue<string>();
                var name_ASCII = row[nRow, 2].GetValue<string>();
                var countryName = row[nRow, 5].GetValue<string>();
                var lat = row[nRow, 3].GetValue<decimal>();
                var lon = row[nRow, 4].GetValue<decimal>();
                // retrieve country and countryId
                var country = lstCountries.Where(c => c.Name == countryName)
                    .FirstOrDefault();
                var countryId = country.Id;

                // does this city already exist in the database?
                if (lstCities.Where(
                    c => c.Name == name
                    && c.Lat == lat
                    && c.Lon == lon
                    && c.CountryId == countryId
                ).Count() == 0)
                {
                    // create the City entity and fill it with xlsx data
                    var city = new City
                    {
                        Name = name,
                        Name_ASCII = name_ASCII,
                        Lat = lat,
                        Lon = lon,
                        CountryId = countryId
                    };

                    // add the new city to the DB context
                    _context.Cities.Add(city);

                    // increment the counter
                    nCities++;
                }
            }

            // save all the cities into the Database
            if (nCities > 0) await _context.SaveChangesAsync();
            #endregion

            return new JsonResult(new
            {
                Cities = nCities,
                Countries = nCountries
            });
        }
    }
}