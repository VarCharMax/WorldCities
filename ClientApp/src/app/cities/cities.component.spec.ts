﻿import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from '../angular-material.module';
import { of } from 'rxjs';

import { CitiesComponent } from './cities.component';
import { City } from './city';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';

describe('CitiesComponent', () => {
  let fixture: ComponentFixture<CitiesComponent>;
  let component: CitiesComponent;

  //async
  beforeEach(async(() => {
    let cityService = jasmine.createSpyObj<CityService>('CityService', [
      'getData',
    ]);

    cityService.getData.and.returnValue(
      of<ApiResult<City>>(<ApiResult<City>>{
        data: [
          <City>{
            name: 'TestCity1',
            id: 1,
            lat: 1,
            lon: 1,
            countryId: 1,
            countryName: 'TestCountry1',
          },
          <City>{
            name: 'TestCity2',
            id: 2,
            lat: 1,
            lon: 1,
            countryId: 1,
            countryName: 'TestCountry1',
          },
          <City>{
            name: 'TestCity3',
            id: 3,
            lat: 1,
            lon: 1,
            countryId: 1,
            countryName: 'TestCountry1',
          },
        ],
        totalCount: 3,
        pageIndex: 0,
        pageSize: 10,
      })
    );

    TestBed.configureTestingModule({
      declarations: [CitiesComponent],
      imports: [BrowserAnimationsModule, AngularMaterialModule],
      providers: [
        {
          provide: CityService,
          useValue: cityService,
        },
      ],
    }).compileComponents();
  }));

  //sync
  beforeEach(() => {
    fixture = TestBed.createComponent(CitiesComponent);
    component = fixture.componentInstance;

    component.paginator = jasmine.createSpyObj('MatPaginator', [
      'length',
      'pageIndex',
      'pageSize',
    ]);

    fixture.detectChanges();
  });

  it("should display a 'Cities' title", async(() => {
    let title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toEqual('Cities');
  }));

  it('should contain a table with a list of one or more cities', async(() => {
    let table = fixture.nativeElement.querySelector('table.mat-table');
    let tableRow = table.querySelectorAll('tr.mat-row');
    expect(tableRow.length).toBeGreaterThan(0);
  }));
});