﻿import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Country } from './country';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
})
export class CountriesComponent implements OnInit {
  public displayedColumns: string[] = [
    'id',
    'name',
    'iso2',
    'iso3',
    'totCities',
  ];
  public countries: MatTableDataSource<Country>;

  defaultPageIndex = 0;
  defaultPageSize = 10;
  public defaultSortColumn = 'name';
  public defaultSortOrder = 'asc';

  defaultFilterColumn = 'name';
  filterQuery: string = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit() {
    this.loadData(null);
  }

  loadData(query: string = null) {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    if (query) {
      this.filterQuery = query;
    }
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    const url = this.baseUrl + 'api/Countries';
    let params = new HttpParams()
      .set('pageIndex', event.pageIndex.toString())
      .set('pageSize', event.pageSize.toString())
      .set('sortColumn', this.sort ? this.sort.active : this.defaultSortColumn)
      .set(
        'sortOrder',
        this.sort ? this.sort.direction : this.defaultSortOrder
      );

    if (this.filterQuery) {
      params = params
        .set('filterColumn', this.defaultFilterColumn)
        .set('filterQuery', this.filterQuery);
    }

    this.http
      .get<any>(url, { params })
      .subscribe(
        (result) => {
          this.paginator.length = result.totalCount;
          this.paginator.pageIndex = result.pageIndex;
          this.paginator.pageSize = result.pageSize;
          this.countries = new MatTableDataSource<Country>(result.data);
        },
        (error) => console.error(error)
      );
  }
}
