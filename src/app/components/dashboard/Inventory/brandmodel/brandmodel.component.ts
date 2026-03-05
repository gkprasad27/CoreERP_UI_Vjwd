import { Component, Inject, Optional, OnInit } from '@angular/core';
import { AlertService } from '../../../../services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { StatusCodes } from '../../../../enums/common/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ApiConfigService } from '../../../../services/api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-brandmodel',
  templateUrl: './brandmodel.component.html',
  styleUrls: ['./brandmodel.component.scss']
})

export class BrandModelComponent implements OnInit {

  modelFormData: FormGroup;
  isSubmitted = false;
  formData: any;
    companyList: any;
    brandList: any;
    MaterialGroupsList: any;
    SizesList: any;

  constructor(
    private apiService: ApiService,
    private apiConfigService: ApiConfigService,
    private spinner: NgxSpinnerService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BrandModelComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    this.modelFormData = this.formBuilder.group({
      code: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(4)]],
      brandName: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      closingStock: [null],
      compName: [null],
      description: [null],
      ext1: [null],
      ext2: [null],
      ext3: [null],
      itemCode: [null],
      rate: [null],
      brandCode: [null],
      ext4: [null],
      ext5: [null],
      ext6: [null],
      hsncode: [null],
      inputTaxCode: [null],
      materialGroupCode: [null],
      modelName: [null],
      outputTaxCode: [null],
      size: [null],
      active: "Y"
    });


    this.formData = { ...data };
    if (!isNullOrUndefined(this.formData.item)) {
      this.modelFormData.patchValue(this.formData.item);
      this.modelFormData.controls['code'].disable();
    }

  }

  ngOnInit() {
    this.getCompiniesList();
    this.getbrandTableData();
    this.getMaterialGroupsList();
    this.getSizesList();
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
              this.companyList = res.response['CompaniesList'];
            }
          }
          this.spinner.hide();
        });
  }
  //getTableData() {
  //  const getCompanyUrl = String.Join('/', this.apiConfigService.getCompaniesList);
  //  this.apiService.apiGetRequest(getCompanyUrl)
  //    .subscribe(
  //      response => {
  //        const res = response.body;
  //        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
  //          if (!isNullOrUndefined(res.response)) {
  //            console.log(res);
  //            this.companyList = res.response['companiesList'];
  //          }
  //        }
  //        this.spinner.hide();
  //      });
  //}

  getbrandTableData() {
    const getCompanyUrl = String.Join('/', this.apiConfigService.getBrandList);
    this.apiService.apiGetRequest(getCompanyUrl)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.brandList = res.response['BrandList'];
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

  getSizesList()  {
    const getCompanyUrl = String.Join('/', this.apiConfigService.getSizesList);
    this.apiService.apiGetRequest(getCompanyUrl)
      .subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              console.log(res);
              this.SizesList = res.response['sizesList'];
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
    this.modelFormData.controls['code'].enable();
    this.formData.item = this.modelFormData.value;
    this.dialogRef.close(this.formData);
  }

  cancel() {
    this.dialogRef.close();
  }

}
