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

@Component({
  selector: 'app-create-oilconversion',
  templateUrl: './create-oilconversion.component.html',
  styleUrls: ['./create-oilconversion.component.scss']
})
export class CreateOilconversionsComponent implements OnInit {

  branchFormData: FormGroup;
  GetBranchesListArray = [];
  myControl = new FormControl();
  filteredOptions: Observable<any[]>;
  getAccountLedgerListArray = [];
  getAccountLedgerListNameArray = [];
  getSalesBranchListArray = [];
  branchesList = [];
  getmemberNamesArray = [];

  displayedColumns: string[] = ['productCode', 'productName', 'hsnNo', 'unitName', 'qty',  'damageQty', 'newQty', 'batchNo', 'delete'
  ];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  date = new Date((new Date().getTime() - 3888000000));
  modelFormData: FormGroup;
  tableFormData: FormGroup;
  //printBill: any;
  issueno = null;
  totalamount = null;
  tableFormObj = false;
  routeUrl = '';
  getProductByProductCodeArray = [];
  getProductByProductNameArray: any[];

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
      oilConversionVchNo : [null],
      oilConversionDate : [(new Date()).toISOString()],
      branchCode: [null],
      branchName: [null],
      branchId: [null],
      voucherTypeId: [null],
      serverDate:[null],
      shiftId: [null],
      userId: '0',
      userName: [null],
      employeeId: [null],
      narration: [null],
      oilConversionMasterId: '0',
      //printBill: [false],

    });
    const user = JSON.parse(localStorage.getItem('user'));
    if (!isNullOrUndefined(user)) {
      //debugger;
      this.branchFormData.patchValue
        ({
          userId: user.userId,
          userName: user.userName,
          shiftId: user.shiftId
        })
    }
  }


  ngOnInit()
  {
    this.loadData();
    this.commonService.setFocus('productCode');
  }
  loadData() {
    this.getCashPaymentBranchesList();
    this.activatedRoute.params.subscribe(params => {
      if (!isNullOrUndefined(params.id1)) {
        this.routeUrl = params.id1;
        //this.disableForm(params.id1);
        this.getOilconversionDeatilList(params.id1);
        let billHeader = JSON.parse(localStorage.getItem('selectedOilconversion'));
        this.branchFormData.setValue(billHeader);
      } else {
        //this.disableForm();
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

  getOilconversionDeatilList(id) {
    //debugger;
    const getInvoiceDeatilListUrl = String.Join('/', this.apiConfigService.getOilconversionDeatilList, id);
    this.apiService.apiGetRequest(getInvoiceDeatilListUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response['OilconversionsDeatilList']) && res.response['OilconversionsDeatilList'].length) {
            this.dataSource = new MatTableDataSource(res.response['OilconversionsDeatilList']);
            this.spinner.hide();
          }
        }
      });
  }

  getCashPaymentBranchesList() {
    const getCashPaymentBranchesListUrl = String.Join('/', this.apiConfigService.getCashPaymentBranchesList);
    this.apiService.apiGetRequest(getCashPaymentBranchesListUrl).subscribe(
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


   //issueno code;
   genarateVoucherNo(branch?) {
    //debugger;
    this.branchFormData.patchValue
      ({
        oilConversionVchNo: String.Empty
      });
    let genarateVoucherNoUrl;
    if (!isNullOrUndefined(branch)) {
      genarateVoucherNoUrl = String.Join('/', this.apiConfigService.getoilconversionvocherNo, branch);
    } else {
      genarateVoucherNoUrl = String.Join('/', this.apiConfigService.getoilconversionvocherNo, this.branchFormData.get('branchCode').value);
    }
    this.apiService.apiGetRequest(genarateVoucherNoUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['oilconversionVoucherNo'])) {
              this.issueno = res.response['oilconversionVoucherNo']
              this.branchFormData.patchValue
                ({
                  oilConversionVchNo: res.response['oilconversionVoucherNo']
                });
              this.spinner.hide();
            }
          }
        }
      });
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.getmemberNamesArray.filter(option => option.text.toLowerCase().includes(filterValue));
  }

  addTableRow() {
    //debugger;
    const tableObj =
    {
      productCode: '', productName: '', hsnNo: '', unit: '', qty: '',  damageqty: '', newqty: '',  batchNo: '', delete: '', text: 'obj'
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
      oilConversionVchNo: [null],
      oilConversionDate: [null],
      shiftId: [null],
      userId: [null],
      employeeId: [null],
      productCode: [null, [Validators.required]],
      productName: [null, [Validators.required]],
      hsnNo: '0',
      unit: [null],
      qty: [null],
      availStock: [null],
      damageqty: [null],
      newqty: [null],
      delete: [null],
    });
  }


  setToFormModel(text, column, value) {
    this.tableFormObj = true;
    if (text == 'obj') {
      this.tableFormData.patchValue
        ({
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
    this.calculateAmount();
  }

  getProductByProductCode(value) {
    if (!isNullOrUndefined(value) && value != '') {
      const getProductByProductCodeUrl = String.Join('/', this.apiConfigService.getProductByProductCode);
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

  //Autocomplete code
  getProductByProductName(value) {
    //debugger;
    if (!isNullOrUndefined(value) && value != '') {
      const getProductByProductNameUrl = String.Join('/', this.apiConfigService.getProductByProductName);
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

  //getProductByProductCode(value) {
  //  if (!isNullOrUndefined(value) && value != '') {
  //    const getProductByProductCodeUrl = String.Join('/', this.apiConfigService.getProductByProductCode, value);
  //    this.apiService.apiGetRequest(getProductByProductCodeUrl).subscribe(
  //      response => {
  //        const res = response.body;
  //        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
  //          if (!isNullOrUndefined(res.response)) {
  //            if (!isNullOrUndefined(res.response['Products'])) {
  //              this.getProductByProductCodeArray = res.response['Products'];
  //              this.spinner.hide();
  //            }
  //          }
  //        }
  //      });
  //  } else {
  //    this.getProductByProductCodeArray = [];
  //  }
  //}

  ////Autocomplete code
  //getProductByProductName(value) {
  //  if (!isNullOrUndefined(value) && value != '') {
  //    const getProductByProductNameUrl = String.Join('/', this.apiConfigService.getProductByProductName, value);
  //    this.apiService.apiGetRequest(getProductByProductNameUrl).subscribe(
  //      response => {
  //        const res = response.body;
  //        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
  //          if (!isNullOrUndefined(res.response)) {
  //            if (!isNullOrUndefined(res.response['Products'])) {
  //              this.getProductByProductNameArray = res.response['Products'];
  //              this.spinner.hide();
  //            }
  //          }
  //        }
  //      });
  //  } else {
  //    this.getProductByProductNameArray = [];
  //  }
  //}

  //Code based getting data
  getdata(productCode) {
    //debugger;
    if (!isNullOrUndefined(this.branchFormData.get('branchCode').value) && this.branchFormData.get('branchCode').value != '' &&
      !isNullOrUndefined(productCode.value) && productCode.value != '') {
      const getBillingDetailsRcdUrl = String.Join('/', this.apiConfigService.GetProductListsforoilconversionList, productCode.value,
        this.branchFormData.get('branchCode').value);
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

  //assign data
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


  //Calaculating code
  calculateAmount(row?, index?) {
    //GetBranchesListArray
    let amount = 0;
    for (let a = 0; a < this.dataSource.data.length; a++)
    {
      if (this.dataSource.data[a].qty)
      {
        amount = (this.dataSource.data[a].qty)
       // amount = (this.dataSource.data[a].qty) * (this.dataSource.data[a].rate);
        this.dataSource.data[a]['newQty'] = amount;
      }
    }
    this.tableFormData.patchValue
      ({
        newqty: amount

      });
  }

  //Save Code
  save() {
  // debugger;
    var index = this.dataSource.data.indexOf(1);
    this.dataSource.data.splice(index, 1);
    if (this.routeUrl != '')
    {
      return;
    }
   let a = 0;
    //if (this.dataSource.data[a].grossAmount==0)
    //{
    //  this.alertService.openSnackBar(`This Product("availStock") 0 Availablilty Stock`, Static.Close, SnackBar.error);
    //  return;
    //}
    let availStock = this.dataSource.filteredData.filter(stock => {
      if (stock.availStock == 0 || (isNullOrUndefined(stock.qty) && isNullOrUndefined(stock.rate) && isNullOrUndefined(stock.grossAmount)))
      {
        return stock;
      }
    });
    if (availStock.length) {
      this.alertService.openSnackBar(`This Product(${availStock[0].productCode}) 0 Availablilty Stock`, Static.Close, SnackBar.error);
      return;
    }
    if (!this.tableFormObj) {
      this.dataSource.data.pop();
    }
    if (this.dataSource.data.length == 0) {
      return;
    }
    
    this.registerOilcoversions();
  }

  registerOilcoversions() {
    //debugger;
    const registerInvoiceUrl = String.Join('/', this.apiConfigService.registerOilconversion);
    const requestObj = { OilcnvsHdr: this.branchFormData.value, OilcnvsDtl: this.dataSource.data };
    this.apiService.apiPostRequest(registerInvoiceUrl, requestObj).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            this.alertService.openSnackBar('Oil COnversion Created Successfully..', Static.Close, SnackBar.success);
          }
          this.reset();
          this.spinner.hide();
          //location.reload();
        }
      });
  }

  reset() {
    this.branchFormData.reset();
    this.dataSource = new MatTableDataSource();
    this.formGroup();
    const user = JSON.parse(localStorage.getItem('user'));
    this.branchFormData = this.formBuilder.group({
      oilConversionDate: [(new Date()).toISOString()],
      branchCode: user.branchCode,
      oilConversionVchNo: user.branchCode
    });
    this.ngOnInit();
    this.loadData();
  }

}
