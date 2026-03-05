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
  selector: 'app-create-purchaserequisition',
  templateUrl: './create-purchaserequisition.component.html',
  styleUrls: ['./create-purchaserequisition.component.scss']
})
export class CreatePurchaseRequisitionComponent  implements OnInit {

  branchFormData: FormGroup;
  GetBranchesListArray = [];
  myControl = new FormControl();
  filteredOptions: Observable<any[]>;
  getAccountLedgerListArray = [];
  getAccountLedgerListNameArray = [];
  getSalesBranchListArray = [];
  branchesList = [];
  getmemberNamesArray = [];

  //displayedColumns: string[] = ['productCode', 'productName', 'hsnNo', 'unitName', 'qty', 'availbleQtyinBranch','rate', 'grossAmount', 'availStock','batchNo', 'delete'
  //];

  displayedColumns: string[] = ['productCode', 'productName', 'qty', 'availbleQtyinBranch', 'availbleQtyinGowdown', 'approvedQty',  'delete'
  ];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  date = new Date((new Date().getTime() - 3888000000));
  modelFormData: FormGroup;
  tableFormData: FormGroup;
  // printBill: any;
  issueno = null;
  totalamount = null;
  tableFormObj = false;
  routeUrl = '';
  getProductByProductCodeArray = [];
  getProductByProductNameArray: any[];
  receiptNo: any;
  GettoBranchesListArray: any;
  toBranchCode: any;
  compiniesList: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) {
    this.branchFormData = this.formBuilder.group
      ({
        //receiptNo: [null],
        company: [null],
        branch: [null],
        requisitionNo: [null],
        requisitionDate: [(new Date()).toISOString()],
        id: '0',
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
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    //debugger;
    const user = JSON.parse(localStorage.getItem('user'));
    this.getCompiniesList();
    this.getBranchesList();
    this.activatedRoute.params.subscribe(params => {
      if (!isNullOrUndefined(params.id1)) {
        this.routeUrl = params.id1;
        //this.disableForm(params.id1);
        this.getprreqDeatilList(params.id1);
        let billHeader = JSON.parse(localStorage.getItem('selectedstockissues'));
        console.log(billHeader);
        this.branchFormData.setValue(billHeader);
      } else {
        //this.disableForm();
        if (!isNullOrUndefined(user.branchCode)) {
          this.branchFormData.patchValue({
            fromBranchCode: user.branchCode,
            branch: user.branchCode,
            userId: user.seqId,
            userName: user.userName
          });
          this.setBranchCode();
          this.genaratereceiptNo(user.branchCode);
          this.formGroup();
        }
        this.addTableRow();
      }
    });
  }

  setBranchCode() {
    //sebranch
    const bname = this.GetBranchesListArray.filter(fromBranchCode => {
      if (fromBranchCode.id == this.branchFormData.get('branch').value) {
        return fromBranchCode;
      }
    });
    if (bname.length) {
      this.branchFormData.patchValue({
        fromBranchName: !isNullOrUndefined(bname[0]) ? bname[0].text : null
      });
    }
  }



  getprreqDeatilList(id) {
    debugger;
    const getInvoiceDeatilListUrl = String.Join('/', this.apiConfigService.getprreqDeatilList, id);
    this.apiService.apiGetRequest(getInvoiceDeatilListUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response['PrreqDeatilList']) && res.response['PrreqDeatilList'].length) {
            this.dataSource = new MatTableDataSource(res.response['PrreqDeatilList']);
            ////console.log(res.response['StockissuesDeatilList']);
            this.spinner.hide();
          }
        }
      });
  }
  getCompiniesList() {
    const getCompiniesListList = String.Join('/', this.apiConfigService.getCompaniesList);
    this.apiService.apiGetRequest(getCompiniesListList)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.compiniesList = res.response['CompaniesList'];
            }
          }
          this.spinner.hide();
        });
  }
  getBranchesList() {
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
  genaratereceiptNo(branch?) {
    debugger;
    //setbranch
    let genarateVoucherNoUrl;
    if (!isNullOrUndefined(branch)) {
      genarateVoucherNoUrl = String.Join('/', this.apiConfigService.getprreqreceiptnosList, branch);
    } else {
      genarateVoucherNoUrl = String.Join('/', this.apiConfigService.getprreqreceiptnosList, this.branchFormData.get('branch').value);
    }
    this.apiService.apiGetRequest(genarateVoucherNoUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['StackissueNo'])) {
              this.receiptNo = res.response['StackissueNo']
              this.branchFormData.patchValue
                ({
                  requisitionNo: res.response['StackissueNo']
                });
              this.spinner.hide();
            }
          }
        }
      });
    //this.gettingtobranches();
  }

  

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.getmemberNamesArray.filter(option => option.text.toLowerCase().includes(filterValue));
  }

  addTableRow() {
    //debugger;
    const tableObj =
    {
      productCode: '', productName: '', qty: '', availbleQtyinBranch: '', availbleQtyinGowdown: '', approvedQty: '', delete: '', text: 'obj'
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
      productCode: [null, [Validators.required]],
      productName: [null, [Validators.required]],
      qty: [null],
      availbleQtyinBranch: [null],
      AvailbleQtyinGowdown: [null],
      ApprovedQty: [null],
      availStock: [null],
      delete: [null],
    });
  }


  setToFormModel(text, column, value)
  {
   // debugger;
    //alert("hi");
    this.tableFormObj = true;
    if (text == 'obj')
    {
      this.tableFormData.patchValue
        ({
          [column]: value
        });
    }
    if (this.tableFormData.valid) {
      this.addTableRow();
      this.formGroup();
      //this.tableFormObj = false;
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


  getdata(productCode) {
    //debugger;set branch
    if (!isNullOrUndefined(this.branchFormData.get('branch').value) && this.branchFormData.get('branch').value != '' &&
      !isNullOrUndefined(productCode.value) && productCode.value != '') {
      const getBillingDetailsRcdUrl = String.Join('/', this.apiConfigService.GetProductListsforpreq, productCode.value,
        this.branchFormData.get('branch').value);
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
  DetailsSection(obj)
  {
    console.log(obj);
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
    //debugger;
    this.tableFormData.patchValue
      ({
        productName: name.value
      });
    this.setToFormModel(null, null, null);
  }


  //Calaculating code
  //calculateAmount(row, index) {
  //  //debugger;
  //  let amount = 0;
  //  for (let a = 0; a < this.dataSource.data.length; a++) {
  //    if (this.dataSource.data[a].qty) {
  //      amount = (this.dataSource.data[a].qty) * (this.dataSource.data[a].rate);
  //      this.dataSource.data[a]['grossAmount'] = amount;
  //    }
  //  }
  //  this.tableFormData.patchValue
  //    ({
  //      grossAmount: amount

  //    });
  //}

  //Save Code
  save() {
    //debugger;
    var index = this.dataSource.data.indexOf(1);
    this.dataSource.data.splice(index, 1);
    if (this.routeUrl != '') {
      return;
    }
    let availStock = this.dataSource.filteredData.filter(stock => {
      if (stock.availStock == 0 || (isNullOrUndefined(stock.qty))) {
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

    this.registerpurreq();
  }

  registerpurreq() {
    debugger;
    const registerStackreceiptsUrl = String.Join('/', this.apiConfigService.registerPurchaserequisitionDetails);
    const requestObj = { PurreqHdr: this.branchFormData.value, PurreqDetail: this.dataSource.data };
    this.apiService.apiPostRequest(registerStackreceiptsUrl, requestObj).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            this.alertService.openSnackBar('PurchaseRequisition Created Successfully..', Static.Close, SnackBar.success);
            // this.branchFormData.reset();
          }
        }
        this.reset();
        this.spinner.hide();
      });
  }

  reset() {
    this.branchFormData.reset();
    this.dataSource = new MatTableDataSource();
    this.formGroup();
    const user = JSON.parse(localStorage.getItem('user'));
    this.genaratereceiptNo(user.branchCode);
   // this.gettingtobranches();
    this.branchFormData = this.formBuilder.group
      ({
        requisitionDate: [(new Date()).toISOString()],
        //fromBranchCode: !isNullOrUndefined(user.branchCode) ? user.branchCode : user.branchCode,
        branch: !isNullOrUndefined(user.branchCode) ? user.branchCode : user.branchCode,
        company: [null],
        requisitionNo: [null]
      });
   
    this.ngOnInit();
  }

}
