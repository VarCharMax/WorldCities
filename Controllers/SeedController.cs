using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using OfficeOpenXml;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using WorldCities.Data;
using WorldCities.Data.Models;
using System.Collections.Generic;

namespace WorldCities.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public SeedController(
            ApplicationDbContext context,
            IWebHostEnvironment env,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _env = env;
            _roleManager = roleManager;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult> CreateDefaultUsers()
        {
            string role_RegisteredUser = "RegisteredUser";
            string role_Administrator = "Administrator";

            if (await _roleManager.FindByNameAsync(role_RegisteredUser) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(role_RegisteredUser));
            }

            if (await _roleManager.FindByNameAsync(role_Administrator) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(role_Administrator));
            }

            var addedUserList = new List<ApplicationUser>();
            var email_Admin = "admin@email.com";

            if (await _userManager.FindByNameAsync(email_Admin) == null)
            {
                var user_Admin = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_Admin,
                    Email = email_Admin
                };

                await _userManager.CreateAsync(user_Admin, "MySecr3r$");
                await _userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
                await _userManager.AddToRoleAsync(user_Admin, role_Administrator);

                user_Admin.EmailConfirmed = true;
                user_Admin.LockoutEnabled = false;

                addedUserList.Add(user_Admin);
            }

            var email_User = "user@email.com";

            if (await _userManager.FindByNameAsync(email_User) == null)
            {
                var user_User = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_User,
                    Email = email_User
                };

                await _userManager.CreateAsync(user_User, "MySecr3r$");
                await _userManager.AddToRoleAsync(user_User, role_RegisteredUser);

                user_User.EmailConfirmed = true;
                user_User.LockoutEnabled = false;

                addedUserList.Add(user_User);
            }

            if (addedUserList.Count > 0)
            {
                await _context.SaveChangesAsync();
            }

            return new JsonResult(new { addedUserList.Count, User = addedUserList });
        }

        [HttpGet]
        public async Task<ActionResult> Import()
        {
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