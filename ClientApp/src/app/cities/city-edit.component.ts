﻿import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { City } from './city';
import { Country } from '../countries/country';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
} from '@angular/forms';
import { BaseFormComponent } from '../base.form.component';
@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.css'],
})
/** city-edit component*/
export class CityEditComponent extends BaseFormComponent implements OnInit {
  title: string;
  form: FormGroup;
  city: City;
  id?: number;
  countries: Country[];
  activityLog: string = '';
  /** city-edit ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService
  ) {
    super();
  }
  ngOnInit(): void {
    this.form = new FormGroup(
      {
        name: new FormControl('', Validators.required),
        lat: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/),
        ]),
        lon: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/),
        ]),
        countryId: new FormControl('', Validators.required),
      },
      null,
      this.isDupeCity()
    );

    this.form.valueChanges.subscribe((val) => {
      if (!this.form.dirty) {
        this.log('Form model has been loaded.');
      } else {
        this.log('Form was updated by the user.');
      }
    });

    this.form.get('name')!.valueChanges.subscribe((val) => {
      if (!this.form.dirty) {
        this.log('Name has been loaded with initial values.');
      } else {
        this.log('Name was updated by the user.');
      }
    });

    this.loadData();
  }

  log(str: string) {
    this.activityLog +=
      '[' + new Date().toLocaleString() + '] ' + str + '<br />';
  }

  loadCountries() {
    this.cityService
      .getCountries<ApiResult<Country>>(0, 9999, 'name', null, null, null)
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
      this.cityService.get<City>(this.id).subscribe(
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
      this.cityService.put<City>(city).subscribe(
        (result) => {
          console.log('City ' + result.id + ' has been updated.');
          this.router.navigate(['/cities']);
        },
        (error) => console.error(error)
      );
    } else {
      this.cityService.post<City>(city).subscribe(
        (result) => {
          console.log('City ' + result.id + ' has been created.');
          this.router.navigate(['/cities']);
        },
        (error) => console.error(error)
      );
    }
  }

  isDupeCity(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      var city = <City>{};
      city.id = this.id ? this.id : 0;
      city.name = this.form.get('name').value;
      city.lat = +this.form.get('lat').value;
      city.lon = +this.form.get('lon').value;
      city.countryId = +this.form.get('countryId').value;

      return this.cityService.isDupeCity(city).pipe(
        map((result) => {
          return result ? { isDupeCity: true } : null;
        })
      );
    };
  }
}
