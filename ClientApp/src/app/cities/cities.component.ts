import { Component, OnInit, ViewChild } from '@angular/core';
import { City } from './city';
import { CityService } from './city.service';
import { ApiResult } from '../base.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css'],
})
/** cities component*/
export class CitiesComponent implements OnInit {
  public displayedColumns: string[] = [
    'id',
    'name',
    'lat',
    'lon',
    'countryName',
  ];
  public cities: MatTableDataSource<City>;
  defaultPageIndex = 0;
  defaultPageSize = 10;
  public defaultSortColumn = 'name';
  public defaultSortOrder = 'asc';
  defaultFilterColumn = 'name';
  filterQuery: string = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  /** cities ctor */
  constructor(private cityService: CityService) {}

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

    this.cityService
      .getData<ApiResult<City>>(
        event.pageIndex,
        event.pageSize,
        sortColumn,
        sortOrder,
        filterColumn,
        filterQuery
      )
      .subscribe(
        (result) => {
          this.paginator.length = result.totalCount;
          this.paginator.pageIndex = result.pageIndex;
          this.paginator.pageSize = result.pageSize;

          this.cities = new MatTableDataSource<City>(result.data);
        },
        (error) => console.error(error)
      );
  }
}
