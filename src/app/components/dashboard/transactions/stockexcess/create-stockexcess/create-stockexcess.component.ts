import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../../../services/common.service';
import { ApiConfigService } from '../../../../../services/api-config.service';

import { ApiService } from '../../../../../services/api.service';
import { isNullOrUndefined } from 'util';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SnackBar, StatusCodes } from '../../../../../enums/common/common';
import { AlertService } from '../../../../../services/alert.service';
import { Static } from '../../../../../enums/common/static';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../directives/format-datepicker';

@Component({
  selector: 'app-create-stockexcess',
  templateUrl: './create-stockexcess.component.html',
  styleUrls: ['./create-stockexcess.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class CreateStockExcessComponent implements OnInit {

  branchFormData: FormGroup;
  GetBranchesListArray = [];
  myControl = new FormControl();
  filteredOptions: Observable<any[]>;
  getProductByProductCodeArray = [];
  getProductByProductNameArray = [];
  getStockExcessListArray = [];
  branchesList = [];
  getmemberNamesArray=[];

  displayedColumns: string[] = ['SlNo','productCode', 'productName', 'hsnNo', 'unitName', 'qty', 'rate', 'totalAmount',  'batchNo', 'delete'
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  date = new Date((new Date().getTime() - 3888000000));
  modelFormData: FormGroup;
  tableFormData: FormGroup;
  printBill: any;
  tableFormObj = false;
  routeUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,

  ) {
    this.branchFormData = this.formBuilder.group({
      stockExcessNo: [null],
      stockExcessDate: [(new Date()).toISOString()],
      branchCode: [null],
      branchName: [null],
      shiftId: [null],
      userId: [null],
      userName: [null],
      employeeId: [null],
      narration: [null],
      //printBill: [false],
      stockExcessMasterId:[null],
      costCenter:[null],
      serverDate:[null]
    });

  }

  ngOnInit() {
    this.loadData();
    this.commonService.setFocus('costCenter');
  }

  loadData() {
    this.getStockExcessBranchesList();
    this.getStockExcessCostCentersList();
    this.activatedRoute.params.subscribe(params => {
      if (!isNullOrUndefined(params.id1)) {
        this.routeUrl = params.id1;
        this.disableForm(params.id1);
        this.getStockExcessDetailsList(params.id1);
        let billHeader = JSON.parse(localStorage.getItem('selectedBill'));
        this.branchFormData.setValue(billHeader);
      } else {
        this.disableForm();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!isNullOrUndefined(user.branchCode)) {
          this.branchFormData.patchValue({
            branchCode: user.branchCode,
            userId: user.seqId,
            userName: user.userName
          });
          this.setBranchCode();
          this.genarateVoucherNo(user.branchCode);
          this.formGroup();
        }
	this.addTableRow();
      }
    });
  }

  getStockExcessDetailsList(id) {
    const getStockExcessDetailsListUrl = ['/', this.apiConfigService.getStockExcessDetailsList, id].join('/');
    this.apiService.apiGetRequest(getStockExcessDetailsListUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response['StockExcessDetails']) && res.response['StockExcessDetails'].length) {
            this.dataSource = new MatTableDataSource(res.response['StockExcessDetails']);
            this.spinner.hide();
          }
        }
      });
  }

  disableForm(route?) {
    if (!isNullOrUndefined(route)) {
      this.branchFormData.controls['stockExcessNo'].disable();
      this.branchFormData.controls['branchCode'].disable();
      this.branchFormData.controls['stockExcessDate'].disable();
      this.branchFormData.controls['userName'].disable();
      this.branchFormData.controls['narration'].disable();
      this.branchFormData.controls['costCenter'].disable();
    }

    //this.branchFormData.controls['voucherNo'].disable();
    // this.branchFormData.controls['totalAmount'].disable();
  }


  getStockExcessBranchesList() {
    const getStockExcessBranchesListUrl = ['/', this.apiConfigService.getStockExcessBranchesList].join('/');
    this.apiService.apiGetRequest(getStockExcessBranchesListUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['BranchesList']) && res.response['BranchesList'].length) {
              this.GetBranchesListArray = res.response['BranchesList'];
              this.spinner.hide();
            }
          }
        }
      });
  }

  genarateVoucherNo(branch?) {
    let genarateVoucherNoUrl;
    if (!isNullOrUndefined(branch)) {
      genarateVoucherNoUrl = ['/', this.apiConfigService.getstockexcessNo, branch].join('/');
    } else {
      genarateVoucherNoUrl = ['/', this.apiConfigService.getstockexcessNo, this.branchFormData.get('branchCode').value].join('/');
    }
    this.apiService.apiGetRequest(genarateVoucherNoUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['stockexcessNo'])) {
              this.branchFormData.patchValue({
                stockExcessNo: res.response['stockexcessNo']
              });
              this.spinner.hide();
            }
          }
        }
      });
  }

  getStockExcessCostCentersList() {
    const getStockExcessCostCentersListUrl = ['/', this.apiConfigService.getStockExcessCostCentersList].join('/');
    this.apiService.apiGetRequest(getStockExcessCostCentersListUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['CostCentersList']) && res.response['CostCentersList'].length) {
              this.getStockExcessListArray = res.response['CostCentersList'];
              this.spinner.hide();
            }
          }
        }
      });
  }

  setBranchCode() {
    const bname = this.GetBranchesListArray.filter(branchCode => {
      if (branchCode.id == this.branchFormData.get('branchCode').value) {
        return branchCode;
      }
    });
    if (bname.length) {
      this.branchFormData.patchValue({
        branchName: !isNullOrUndefined(bname[0]) ? bname[0].text : null
      });
    }
  }
  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.getmemberNamesArray.filter(option => option.text.toLowerCase().includes(filterValue));
  }
  
  addTableRow() {
    const tableObj = {
      productCode: '', productName: '', hsnNo: '', unit: '', qty: '', rate: '', totalAmount: '', batchNo: '', delete: '', text: 'obj'
    };
    if (!isNullOrUndefined(this.dataSource)) {
      this.dataSource.data.push(tableObj);
      this.dataSource = new MatTableDataSource(this.dataSource.data);
    } else {
      this.dataSource = new MatTableDataSource([tableObj]);
    }
    this.dataSource.paginator = this.paginator;
  }

  formGroup() {
    this.tableFormData = this.formBuilder.group({
      stockExcessNo: [null],
      stockExcessDate: [null],
      shiftId: [null],
      userId: [null],
      employeeId: [null],
      productCode: [null, [Validators.required]],
      productName: [null, [Validators.required]],
      amount: [null],
    });
  }

  setToFormModel(text, column, value) {
    this.tableFormObj = true;
    if (text == 'obj') {
      this.tableFormData.patchValue({
        [column]: value
      });
    }
    if (this.tableFormData.valid) {
      this.addTableRow();
      this.formGroup();
      this.tableFormObj = false;
    }
  }

  clearQty(index, value, column) {
    this.dataSource.data[index].qty = null;
    this.dataSource.data[index].fQty = null;
    this.dataSource.data[index][column] = value;
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
  }

  deleteRow(i) {
    this.dataSource.data = this.dataSource.data.filter((value, index, array) => {
      return index !== i;
    });
    this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.dataSource.paginator = this.paginator;
    console.log(this.dataSource);
  }

  getProductByProductCode(value) {
    if (!isNullOrUndefined(value) && value != '') {
      const getProductByProductCodeUrl = ['/', this.apiConfigService.getProductByProductCode].join('/');
      this.apiService.apiPostRequest(getProductByProductCodeUrl, { productCode: value }).subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              if (!isNullOrUndefined(res.response['Products'])) {
                this.getProductByProductCodeArray = res.response['Products'];
                this.spinner.hide();
              }
            }
          }
        });
    } else {
      this.getProductByProductCodeArray = [];
    }
  }

 calculateAmount(row, index) {
  let amount = 0;
  for (let a = 0; a < this.dataSource.data.length; a++) {
    if (this.dataSource.data[a].qty) {
      amount = (this.dataSource.data[a].qty) * (this.dataSource.data[a].rate);
      this.dataSource.data[a]['totalAmount'] = amount;
    }
  }
  this.tableFormData.patchValue
    ({
      totalAmount: amount

    });
}

getProductByProductName(value) {
  if (!isNullOrUndefined(value) && value != '') {
    const getProductByProductNameUrl = ['/', this.apiConfigService.getProductByProductName].join('/');
    this.apiService.apiPostRequest(getProductByProductNameUrl, { productName: value }).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['Products'])) {
              this.getProductByProductNameArray = res.response['Products'];
              this.spinner.hide();
            }
          }
        }
      });
  } else {
    this.getProductByProductNameArray = [];
  }
}

  getdata(productCode) {
    //debugger;
    if (!isNullOrUndefined(this.branchFormData.get('branchCode').value) && this.branchFormData.get('branchCode').value != '' &&
      !isNullOrUndefined(productCode.value) && productCode.value != '') {
      const getBillingDetailsRcdUrl = ['/', this.apiConfigService.getProductListsforStockexcessList, productCode.value,
        this.branchFormData.get('branchCode').value].join('/');
      this.apiService.apiGetRequest(getBillingDetailsRcdUrl).subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              if (!isNullOrUndefined(res.response['productsList'])) {
                this.DetailsSection(res.response['productsList']);
                this.spinner.hide();
              }
            }
          }
        });
    }
  }

  DetailsSection(obj) {
    this.dataSource.data = this.dataSource.data.map(val => {
      if (val.productCode == obj.productCode) {
        this.tableFormData.patchValue
          ({
            productCode: obj.productCode,
            productName: obj.productName
          });
        val = obj;
      }
      val.text = 'obj';
      return val;
    });
    this.setToFormModel(null, null, null);
  }

  setProductName(name) {
    this.tableFormData.patchValue
      ({
        productName: name.value
      });
    this.setToFormModel(null, null, null);
  }

  save() {
    // if (!this.tableFormObj) {
    //   this.dataSource.data.pop();
    //   console.log(this.dataSource.data);
    // }
    if (this.routeUrl != '' || this.dataSource.data.length == 0) {
      return;
    }
    let tableData = [];
    for (let d = 0; d < this.dataSource.data.length; d++) {
      if (this.dataSource.data[d]['productCode'] != '') {
        tableData.push(this.dataSource.data[d]);
      }
    }
    let content = '';
    let totalAmount = null;
    this.dataSource.data.forEach(element => {
      totalAmount = element.amount + totalAmount;
    });
  
    console.log(this.branchFormData, this.dataSource.data);

    this.registerStockexcess(tableData);
  }

  reset() {
    this.branchFormData.reset();
    this.dataSource = new MatTableDataSource();
    this.formGroup();
    this.loadData();
  }

  registerStockexcess(data) {
    this.branchFormData.patchValue({
      stockExcessMasterId: 0
    });
    const registerStockexcessUrl = ['/', this.apiConfigService.registerStockexcess].join('/');
    const requestObj = { StockexcessHdr: this.branchFormData.value, StockexcessDtl: data };
    this.apiService.apiPostRequest(registerStockexcessUrl, requestObj).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            this.alertService.openSnackBar('Stock Excess Created Successfully..', Static.Close, SnackBar.success);
          }
          this.reset();
          this.spinner.hide();
        }
      });
  }

}
