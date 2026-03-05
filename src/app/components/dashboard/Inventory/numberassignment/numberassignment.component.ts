import { Component, Inject, Optional, OnInit } from '@angular/core';
import { AlertService } from '../../../../services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ApiConfigService } from '../../../../services/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { StatusCodes } from '../../../../enums/common/common';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-numberassignment',
  templateUrl: './numberassignment.component.html',
  styleUrls: ['./numberassignment.component.scss']
})

export class NumberAssignmentComponent implements OnInit {

  modelFormData: FormGroup;
  isSubmitted = false;
  formData: any;
    companyList: any;
    MaterialGroupsList: any;
    getProductGroup: any;

  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<NumberAssignmentComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    this.modelFormData = this.formBuilder.group({
      code: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(4)]],
      companyCode: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      description: [null],
      ext1: [null],
      ext2: [null],
      materialGroup: [null],
      noType: [null],
      numberInterval: [null],
      active: ['Y']
    });


    this.formData = { ...data };
    if (!isNullOrUndefined(this.formData.item)) {
      this.modelFormData.patchValue(this.formData.item);
      //this.modelFormData.controls['code'].disable();
    }

  }

  ngOnInit() {
    this.getTableData();
    this.getProductGroupList();

    //this.getMaterialGroupsList();
  }

  getTableData() {
    const getCompanyUrl = String.Join('/', this.apiConfigService.getCompaniesList);
    this.apiService.apiGetRequest(getCompanyUrl)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.companyList = res.response['CompaniesList'];
            }
          }
          this.spinner.hide();
        });
  }
  getProductGroupList() {
    const getProductGroupList = String.Join('/', this.apiConfigService.getProductGroupList);
    this.apiService.apiGetRequest(getProductGroupList)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.getProductGroup = res.response['ProductGroupList'];
            }
          }
          this.spinner.hide();
        });
  }


  getMaterialGroupsList() {
    const getCompanyUrl = String.Join('/', this.apiConfigService.getMaterialGroupsList);
    this.apiService.apiGetRequest(getCompanyUrl)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.MaterialGroupsList = res.response['materialGroupList'];
            }
          }
          this.spinner.hide();
        });
  }


  get formControls() { return this.modelFormData.controls; }


  save() {
    if (this.modelFormData.invalid) {
      return;
    }
    //this.modelFormData.controls['code'].enable();
    this.formData.item = this.modelFormData.value;
    this.dialogRef.close(this.formData);
  }

  cancel() {
    this.dialogRef.close();
  }

}
