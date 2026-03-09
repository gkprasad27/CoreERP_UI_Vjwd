import { Component, ViewChild, ElementRef, ViewEncapsulation, AfterViewInit, OnInit, Input } from '@angular/core';
import { ApiService } from '../../../services/api.service';


import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog as MatDialog } from '@angular/material/dialog';

import { NgxSpinnerService } from 'ngx-spinner';
import { StatusCodes } from '../../../enums/common/common';
import { AlertService } from '../../../services/alert.service';
import { SnackBar } from '../../../enums/common/common';
import { SalesService } from './sales.service';
@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  tableData: any;
  addOrUpdateData: any;
  tableUrl: any;
  routeParams: any;



  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private salesService: SalesService
  ) {
    activatedRoute.params.subscribe(params => {
      this.routeParams = params.id;
      this.tableUrl = salesService.getRouteUrls(params.id);
    });
  }

  ngOnInit() {
  }

}
