import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CountryService } from './country.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Country } from './country';
import { ApiResult } from '../base.service';
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

  constructor(private countryService: CountryService) {}

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
    const sortColumn = this.sort ? this.sort.active : this.defaultSortColumn;
    const sortOrder = this.sort ? this.sort.direction : this.defaultSortOrder;
    const filterColumn = this.filterQuery ? this.defaultFilterColumn : null;
    const filterQuery = this.filterQuery ? this.filterQuery : null;

    this.countryService
      .getData<ApiResult<Country>>(
        event.pageIndex,
        event.pageSize,
        sortColumn,
        sortOrder,
        filterColumn,
        filterQuery
      )
      .subscribe((result) => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.countries = new MatTableDataSource<Country>(result.data);
      });
  }
}
