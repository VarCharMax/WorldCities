import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
@NgModule({
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule],
  exports: [MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule],
})
export class AngularMaterialModule {}
