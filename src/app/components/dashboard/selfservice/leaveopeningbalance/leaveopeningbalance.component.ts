import { Component, Inject, Optional, OnInit } from '@angular/core';

import { ApiService } from '../../../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AlertService } from '../../../../services/alert.service';
import { ApiConfigService } from '../../../../services/api-config.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../../services/common.service';
import { StatusCodes } from '../../../../enums/common/common';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-leaveopeningbalance',
  templateUrl: './leaveopeningbalance.component.html',
  styleUrls: ['./leaveopeningbalance.component.scss']
})
export class LeaveopeningbalanceComponent implements OnInit {

  modelFormData: FormGroup;
  isSubmitted = false;
  formData: any;
  companyList: any;
  LeaveTypeatList: any;
  getProductByProductCodeArray = [];
  getProductByProductNameArray: any[];


  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<LeaveopeningbalanceComponent>,
    private commonService: CommonService,
    private apiConfigService: ApiConfigService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {


    const user = JSON.parse(localStorage.getItem('user'));
    let username = user.userName;
    this.modelFormData = this.formBuilder.group({
      empCode: [username],
       // '', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(0), Validators.maxLength(4)]],
      year: [(new Date()).getFullYear()],
      leaveCode: ['', [Validators.required, Validators.minLength(2)]],
      opbal: ['', [Validators.required, Validators.pattern("^[0-9\.]*$"), Validators.minLength(0),Validators.maxLength(3)]],
      used: [null],
      userId: [null],
      timeStamp: [null],
      balance: ['', [Validators.required, Validators.pattern("^[0-9\.]*$"), Validators.minLength(0),Validators.maxLength(3)]],
      remarks: [null],
      compCode: [null]
    });


    this.formData = { ...data };
    if (!isNullOrUndefined(this.formData.item))
    {
      
     
      this.modelFormData.patchValue(this.formData.item);
      //this.modelFormData.controls['empCode'].disable();
      
    }

  }

  ngOnInit()
  {
    //debugger;
    
    this.getTableData();
    this.modelFormData.patchValue
      ({
        //empCode: username
      });
    //this.getProductByProductCode(username);
  }

  getProductByProductCode(value) {
    //alert("hi");
    //debugger;
    if (!isNullOrUndefined(value) && value != '') {
      const getProductByProductCodeUrl = String.Join('/', this.apiConfigService.getEmpCode);
      this.apiService.apiPostRequest(getProductByProductCodeUrl, { Code: value }).subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              if (!isNullOrUndefined(res.response['Empcodes'])) {
                this.getProductByProductCodeArray = res.response['Empcodes'];
                this.spinner.hide();
              }
            }
          }
        });
    } else {
      this.getProductByProductCodeArray = [];
    }
  }

  onSearchChange(code) {
   // debugger;
    //alert("hi");
    let genarateVoucherNoUrl;
    if (!isNullOrUndefined(code)) {
      genarateVoucherNoUrl = String.Join('/', this.apiConfigService.getEmpName, code.value);
    } else {
      genarateVoucherNoUrl = String.Join('/', this.apiConfigService.getEmpName, this.modelFormData.get('empCode').value);
    }
    this.apiService.apiGetRequest(genarateVoucherNoUrl).subscribe(
      response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['empname'])) {
              //this.EmpName = res.response['empname']
              this.modelFormData.patchValue
                ({
                  empName: res.response['empname']
                });
              this.spinner.hide();
            }
          }
        }
      });
  }

  getTableData() {
    //debugger;
    const user = JSON.parse(localStorage.getItem('user'));
    let username = user.userName;
    this.spinner.show();
    const getCompanyUrl = String.Join('/', this.apiConfigService.getLeaveTypeatListforlop, user.companyCode ? user.companyCode : "6");
    this.apiService.apiGetRequest(getCompanyUrl)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.LeaveTypeatList = res.response['leavetypesList'];
            }
          }
          this.spinner.hide();
        }, error => {

        });
  }
  get formControls() { return this.modelFormData.controls; }


  save() {
    if (this.modelFormData.invalid) {
      return;
    }
    this.modelFormData.controls['empCode'].enable();
    this.formData.item = this.modelFormData.value;
    this.dialogRef.close(this.formData);
  }

  cancel() {
    this.dialogRef.close();
  }

}
