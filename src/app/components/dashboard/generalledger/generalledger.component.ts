import { Component, ViewChild, ViewEncapsulation, AfterViewInit, OnInit, Input } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { StatusCodes } from '../../../enums/common/common';
import { DeleteItemComponent } from '../../../reuse-components/delete-item/delete-item.component';
import { TableComponent } from '../../../reuse-components/table/table.component';
import { AlertService } from '../../../services/alert.service';
import { SnackBar } from '../../../enums/common/common';
import { GeneralledgerService } from './generalledger.service';
import { CommonService } from '../../../services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-generalledger',
    templateUrl: './generalledger.component.html',
    styleUrls: ['./generalledger.component.scss'],
    encapsulation: ViewEncapsulation.None
  })
  export class GeneralledgerComponent implements OnInit {
    tableData: any;
    tableUrl: any;

    @ViewChild(TableComponent) tableComponent: TableComponent;

    constructor(
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private generalLedgerService: GeneralledgerService,
        private alertService: AlertService,
        private commonService: CommonService,
        private spinner: NgxSpinnerService,

      ) { }

      ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
          this.tableUrl = this.generalLedgerService.getRouteUrls(params.id);
          if (!isNullOrUndefined(this.tableUrl)) {
            this.getTableData();
            if (!isNullOrUndefined(this.tableComponent)) {
              this.tableComponent.defaultValues();
            }
          }
        });
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

      deleteRecord(value) {
        const dialogRef = this.dialog.open(DeleteItemComponent, {
          width: '1024px',
          data: value,
          disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
          if (!isNullOrUndefined(result)) {
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
          } else {
        const dialogRef = this.dialog.open(this.tableUrl.component, {
          width: '80%',
          data: value,
          panelClass: 'custom-dialog-container',
          disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
          if (!isNullOrUndefined(result)) {
            if (result.action === 'Add') {
             const addCompanyUrl = ['/', this.tableUrl.registerUrl].join('/');
             this.apiService.apiPostRequest(addCompanyUrl, result.item)
                .subscribe(
                  response => {
                    const res = response.body;
                    if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
                    if (!isNullOrUndefined(res.response)) {
                      this.tableComponent.defaultValues();
                      this.getTableData();
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
                    if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
                      if (!isNullOrUndefined(res.response)) {
                        this.tableComponent.defaultValues();
                        this.getTableData();
                        this.alertService.openSnackBar('Record Updated...', 'close', SnackBar.success);
                      }
                    }
                    this.spinner.hide();
                  });
              }
          }
        });
      }
      }



  }
