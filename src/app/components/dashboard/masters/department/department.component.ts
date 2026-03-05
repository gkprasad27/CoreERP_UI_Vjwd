import { Component, Inject, Optional, OnInit } from '@angular/core';
import { AlertService } from '../../../../services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StatusCodes } from '../../../../enums/common/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../../../services/api-config.service';
import { ApiService } from '../../../../services/api.service';

import { CommonService } from '../../../../services/common.service';
@Component({
  selector: 'department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})

export class DepartmentComponent implements OnInit {

  modelFormData: FormGroup;
  isSubmitted = false;
  formData: any;
  voucherClass: any;
  compList: any;

  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DepartmentComponent>,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private commonService: CommonService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    this.modelFormData = this.formBuilder.group({
      departmentId: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(4)]],
      departmentName: ['', [Validators.required, Validators.minLength(2)]],
      id: ['0'],
      responsiblePersonCode: [null],
      responsiblePersonDesc: [null],
      isActive: [null],
      createdBy: [null],
      createdDate: [null],
      companyCode: [null],
      companyDesc: [null],
      companyGroupCode: [null]

    });


    this.formData = { ...data };
    if (!isNullOrUndefined(this.formData.item)) {
      this.modelFormData.patchValue(this.formData.item);
    }

  }

  ngOnInit() {
    this.getCompaniesList();
  }

 
  getCompaniesList() {
    const getCompaniesList = ['/', this.apiConfigService.getCompaniesList].join('/');
    this.apiService.apiGetRequest(getCompaniesList)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.compList = res.response['CompaniesList'];
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
    this.formData.item = this.modelFormData.value;
    this.dialogRef.close(this.formData);
  }

  cancel() {
    this.dialogRef.close();
  }

}
