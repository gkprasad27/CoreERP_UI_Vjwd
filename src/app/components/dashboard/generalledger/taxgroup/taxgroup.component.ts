import { Component, Inject, Optional, OnInit } from '@angular/core';
import { AlertService } from '../../../../services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { StatusCodes } from '../../../../enums/common/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ApiConfigService } from '../../../../services/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-taxgroup',
  templateUrl: './taxgroup.component.html',
  styleUrls: ['./taxgroup.component.scss']
})

export class TaxgroupsComponent implements OnInit {

  modelFormData: FormGroup;
  isSubmitted = false;
  formData: any;
  BranchesList: any;
  getCashPaymentBranchesListArray: any;
  ProductGroupsList: any;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TaxgroupsComponent>,

    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    this.modelFormData = this.formBuilder.group({
      taxGroupId: "0",
      taxGroupCode: [null],
      taxGroupName: [null],
      productGroupId: [null],
      productGroupCode: [null],
      productGroupName: [null],
      narration: [null],
      productLedgerId: [null],
      productLedgerName: [null]
    });


    this.formData = { ...data };
    if (!isNullOrUndefined(this.formData.item)) {
      this.modelFormData.patchValue(this.formData.item);
      this.modelFormData.controls['taxGroupCode'].disable();
    }

  }

  ngOnInit() {
    this.GetProductGroupsList();
  }

 
  GetProductGroupsList() {
    const getProductGroupsListUrl = String.Join('/', this.apiConfigService.GetProductGroups);
    this.apiService.apiGetRequest(getProductGroupsListUrl)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              this.ProductGroupsList = res.response['ProductGroupsList'];
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
    this.modelFormData.controls['taxGroupCode'].enable();
  }

  cancel() {
    this.dialogRef.close();
  }
  getGetProductGroupsNamesList() {
    
  }

}
