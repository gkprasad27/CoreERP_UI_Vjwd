import { Component, Inject, Optional, OnInit } from '@angular/core';

import { ApiService } from '../../../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { AlertService } from '../../../../services/alert.service';

import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../../services/common.service';
import { StatusCodes } from '../../../../enums/common/common';

@Component({
  selector: 'app-productpacking',
  templateUrl: './productpacking.component.html',
  styleUrls: ['./productpacking.component.scss']
})
export class ProductpackingComponent implements OnInit {

  modelFormData: UntypedFormGroup;
  isSubmitted = false;
  formData: any;
  apiConfigService: any;
  apiService: any;
  companyList: any;
 // myModel = "1";


  constructor(
    private alertService: AlertService,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<ProductpackingComponent>,
    private commonService: CommonService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    this.modelFormData = this.formBuilder.group({
      packingCode: [null],
      packingName: [null],
      batchVerify: [null],
      barrelVerify: [null],
      packingId:"0"
    });


    this.formData = { ...data };
    if (this.formData.item != null) {
      this.modelFormData.patchValue(this.formData.item);
      //this.modelFormData.controls['packingCode'].disable();
    }

  }

  ngOnInit()
  {
    this.setbatchVerify();
    this.setbarrelVerify();
  }
  //Checkboxes code
  setbatchVerify()
  {
    var x = this.modelFormData.value.batchVerify;

    if (x == 1)
    {
      this.modelFormData.patchValue
        ({
          batchVerify: true
        });
    }
    if (x == false)
    {
      this.modelFormData.patchValue
        ({
          batchVerify: "0"
        });
    }
    if (x == true) {
      this.modelFormData.patchValue
        ({
          batchVerify: "1"
        });
    }
    else
    {
      this.modelFormData.patchValue
        ({
          batchVerify: false
        });
    }

  }
  setbarrelVerify() {
    var x = this.modelFormData.value.barrelVerify;
    if (x == false)
    {
      this.modelFormData.patchValue
        ({
          barrelVerify: "0"
        });
    }
    if (x == true)
    {
      this.modelFormData.patchValue
        ({
          barrelVerify: "1"
        });
    }
    if (x == 0)
    {
      this.modelFormData.patchValue
        ({
          barrelVerify: false
        });
    }

    else
    {
      this.modelFormData.patchValue
        ({
          barrelVerify: "1"
        });
    }
  }

  get formControls() { return this.modelFormData.controls; }


  save() {
    if (this.modelFormData.invalid) {
      return;
    }
    this.formData.item = this.modelFormData.value;
    this.dialogRef.close(this.formData);
    //this.modelFormData.controls['packingCode'].enable();
  }

  cancel() {
    this.dialogRef.close();
  }

}
