import { Component, ViewChild, ElementRef, ViewEncapsulation, AfterViewInit, OnInit, Input } from '@angular/core';
import { ApiService } from '../../../services/api.service';


import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MastersService } from './masters.service';
import { isNullOrUndefined } from 'util';
import { NgxSpinnerService } from 'ngx-spinner';
import { StatusCodes } from '../../../enums/common/common';
import { DeleteItemComponent } from '../../../reuse-components/delete-item/delete-item.component';
import { TableComponent } from '../../../reuse-components/table/table.component';
import { AlertService } from '../../../services/alert.service';
import { SnackBar } from '../../../enums/common/common';

@Component({
  selector: 'app-masters',
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class MastersComponent implements OnInit {

  tableData: any;
  addOrUpdateData: any;
  tableUrl: any;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  paramId: any;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private mastersService: MastersService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,

  ) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.mastersService.branchCode = user.branchCode;
    this.mastersService.role = user.role;
    activatedRoute.params.subscribe(params => {
      this.tableUrl = mastersService.getRouteUrls(params.id);
      this.paramId = params.id;
      if (!isNullOrUndefined(this.tableUrl)) {
        if (params.id != 'membermaster') {
          this.getTableData();
        }
        if (!isNullOrUndefined(this.tableComponent)) {
          this.tableComponent.defaultValues();
        }
      }

    });

  }

  ngOnInit() {
  }


  deleteRecord(value) {
    const dialogRef = this.dialog.open(DeleteItemComponent, {
      width: '1024px',
      data: value,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result)) {
      this.spinner.show();
      const deleteCompanyUrl = ['/', this.tableUrl.deleteUrl, result.item[this.tableUrl.primaryKey]].join('/');
      this.apiService.apiDeleteRequest(deleteCompanyUrl, result.item)
        .subscribe(
          response => {
            const res = response.body;
            if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
              if (!isNullOrUndefined(res.response)) {
                this.tableComponent.defaultValues();
                this.getTableData();
                this.alertService.openSnackBar('Delected Record...', 'close', SnackBar.success);
              }
            }
            this.spinner.hide();
          });
        }
    });
  }

  addOrUpdateEvent(value) {
    if (value.action === 'Delete') {
      this.deleteRecord(value);
    }
    else {
      const dialogRef = this.dialog.open(this.tableUrl.component, {
        width: '80%',
        data: value,
        panelClass: 'custom-dialog-container',
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!isNullOrUndefined(result)) {
          this.spinner.show();
          if (result.action === 'Add') {
            const addCompanyUrl = ['/', this.tableUrl.registerUrl].join('/');
            this.apiService.apiPostRequest(addCompanyUrl, result.item)
              .subscribe(
                response => {
                  const res = response.body;
                  if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
                    if (!isNullOrUndefined(res.response)) {
                      this.tableComponent.defaultValues();
                      if (this.paramId != 'membermaster') {
                        this.getTableData();
                      }
                      this.alertService.openSnackBar('Record Added...', 'close', SnackBar.success);
                    }
                  }
                  this.spinner.hide();
                });
          } else if (result.action === 'Edit') {
            const updateCompanyUrl = ['/', this.tableUrl.updateUrl].join('/');
            this.apiService.apiUpdateRequest(updateCompanyUrl, result.item)
              .subscribe(
                response => {
                  const res = response.body;
                  this.spinner.hide();
                  if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
                    if (!isNullOrUndefined(res.response)) {
                      this.tableComponent.defaultValues();
                      this.getTableData();
                      this.alertService.openSnackBar('Record Updated...', 'close', SnackBar.success);
                    }
                  }
                });
          }
      }
    });
  }
  }

  getTableData() {
    const getUrl = ['/', this.tableUrl.url].join('/');
    this.apiService.apiGetRequest(getUrl)
      .subscribe(
        response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            this.tableData = res.response[this.tableUrl.listName];
          }
        }
        this.spinner.hide();
      });
  }


}

