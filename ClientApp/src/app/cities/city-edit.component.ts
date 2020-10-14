import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { City } from './city';
import { Country } from '../countries/country';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.css'],
})
/** city-edit component*/
export class CityEditComponent implements OnInit {
  title: string;
  form: FormGroup;
  city: City;
  id?: number;
  countries: Country[];
  /** city-edit ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}
  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(''),
      lat: new FormControl(''),
      lon: new FormControl(''),
      countryId: new FormControl(''),
    });

    this.loadData();
  }

  loadCountries() {
    const url = this.baseUrl + 'api/countries';
    const params = new HttpParams()
      .set('pageSize', '9999')
      .set('sortColumn', 'name');

    this.http
      .get<any>(url, { params })
      .subscribe(
        (result) => {
          this.countries = result.data;
        },
        (error) => console.error(error)
      );
  }

  loadData() {
    this.loadCountries();

    this.id = +this.activatedRoute.snapshot.paramMap.get('id');

    if (this.id) {
      const url = this.baseUrl + 'api/cities/' + this.id;
      this.http.get<City>(url).subscribe(
        (result) => {
          this.city = result;
          this.title = 'Edit - ' + this.city.name;
          this.form.patchValue(this.city);
        },
        (error) => console.error(error)
      );
    } else {
      this.title = 'Create a new City';
    }
  }

  onSubmit() {
    const city = this.id ? this.city : <City>{};
    city.name = this.form.get('name').value;
    city.lat = +this.form.get('lat').value;
    city.lon = +this.form.get('lon').value;
    city.countryId = +this.form.get('countryId').value;

    if (this.id) {
      const url = this.baseUrl + 'api/cities/' + this.city.id;

      this.http.put<City>(url, city).subscribe(
        (result) => {
          console.log('City ' + city.id + ' has been updated.');
          this.router.navigate(['/cities']);
        },
        (error) => console.error(error)
      );
    } else {
      const url = this.baseUrl + 'api/cities';
      this.http.post<City>(url, city).subscribe(
        (result) => {
          console.log('City ' + result.id + ' has been created.');
          this.router.navigate(['/cities']);
        },
        (error) => console.error(error)
      );
    }
  }
}
