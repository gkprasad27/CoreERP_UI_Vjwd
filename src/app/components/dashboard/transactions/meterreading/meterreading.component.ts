import { Component, Inject, Optional, OnInit } from '@angular/core';
import { AlertService } from '../../../../services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA,MatDialog } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StatusCodes } from '../../../../enums/common/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiConfigService } from '../../../../services/api-config.service';

import { ApiService } from '../../../../services/api.service';
import { CommonService } from '../../../../services/common.service';
import { userInfo } from 'os';
import { SaveItemComponent } from '../../../../reuse-components/save-item/save-item.component';



@Component({
  selector: 'app-meterreading',
  templateUrl: './meterreading.component.html',
  styleUrls: ['./meterreading.component.scss']
})

export class MeterReadingComponent  implements OnInit {
  isSaveDisabled = true;
  modelFormData: FormGroup;
  isSubmitted  =  false;
  formData: any;
  getMeterReadingBranches:any;
  getPumpList:any;
  getShiftList:any;
  getOBFromPumpList:any;
  user : any;
  getSUFromIM : any;
  pumpNoConfig: any;
  getmemberNamesArray = [];
  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MeterReadingComponent>,
    private spinner: NgxSpinnerService,
    private apiConfigService: ApiConfigService,
    private apiService: ApiService,
    private commonService:CommonService,
    public dialog: MatDialog,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any ) {

      this.modelFormData  =  this.formBuilder.group({
        meterReadingId: 0,
        branchCode: [null, [Validators.required]],
        branchName: [null],
        shiftId: [null],
        testing: [0.00],
        density: [0.00],
        inMeterReading: [0.00],
        outMeterReading:[0.00],
        consumption:[0.00],
        totalSales:[0.00],
        variation:[0.00],
        pumpNo:[null],
        invoiceSales:[0.00]
      });



      this.formData = {...data};
      if (!isNullOrUndefined(this.formData.item)) {
        this.modelFormData.patchValue(this.formData.item);
       this.modelFormData.controls['totalSales'].disable();
       this.modelFormData.controls['invoiceSales'].disable();
       this.modelFormData.controls['variation'].disable();
       this.modelFormData.controls['shiftId'].disable();
       this.modelFormData.controls['inMeterReading'].disable();
       this.isSaveDisabled = true;
       this.getPump();
      }
      else{
        const user = JSON.parse(localStorage.getItem('user'));
       if (!isNullOrUndefined(user.branchCode)) {
        this.modelFormData.patchValue({
          branchCode: user.branchCode,
          userId: user.seqId,
          userName: user.userName
        });
        this.getPump(user.branchCode);
        this.getShift(user.seqId);
        this.modelFormData.controls['totalSales'].disable();
       this.modelFormData.controls['invoiceSales'].disable();
       this.modelFormData.controls['shiftId'].disable();
       this.modelFormData.controls['inMeterReading'].disable();
      }
      }

  }
calculateAmount(){
  let amount =0;
  this.modelFormData.patchValue({
    totalSales:(this.modelFormData.get('outMeterReading').value-this.modelFormData.get('inMeterReading').value
    -this.modelFormData.get('testing').value-this.modelFormData.get('density').value-this.modelFormData.get('consumption').value).toFixed(2),
    // invoiceSales:(this.modelFormData.get('outMeterReading').value-this.modelFormData.get('inMeterReading').value
    // -this.modelFormData.get('testing').value-this.modelFormData.get('density').value-this.modelFormData.get('consumption').value).toFixed(2),
  });
}

calculateSales(){
  this.modelFormData.patchValue({
    variation:(this.modelFormData.get('totalSales').value-this.modelFormData.get('invoiceSales').value).toFixed(2),
  });
}

getSaledUnits() {
  const getSaledUnitsUrl = String.Join('/', this.apiConfigService.getSaledUnits,this.modelFormData.get('branchCode').value,this.modelFormData.get('pumpNo').value,this.modelFormData.get('shiftId').value);
  this.apiService.apiPostRequest(getSaledUnitsUrl)
    .subscribe(
      response => {
      const res = response.body;
      if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
        if (!isNullOrUndefined(res.response)) {
          if (!isNullOrUndefined(res.response['saledList'])) {
            this.getSUFromIM = res.response['saledList'];
            this.modelFormData.patchValue({
              invoiceSales: this.getSUFromIM
            });
            this.spinner.hide();
        }
        }
      }
    });
}
 

  ngOnInit() {
  this.user = JSON.parse(localStorage.getItem('user'));
  this.getMeterReadingBranchesList();
  this.getShift(this.user.userId);
  this.isSubmitted = true;
  }

  getMeterReadingBranchesList() {
    const getMeterReadingBranchesList = String.Join('/', this.apiConfigService.getMeterReadingBranchesList);
    this.apiService.apiGetRequest(getMeterReadingBranchesList)
      .subscribe(
        response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            console.log(res);
            this.getMeterReadingBranches = res.response['BranchesList'];
          }
        }
        this.spinner.hide();
        
      });
  }

  getShift(userId) {
    let getShiftUrl
    //const getShift = String.Join('/', this.apiConfigService.getShift,userId);
    if (!isNullOrUndefined(userId)) {
      getShiftUrl = String.Join('/', this.apiConfigService.getShift, userId);
    }
    this.apiService.apiGetRequest(getShiftUrl)
      .subscribe(
        response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['ShiftList'])) {
              this.getShiftList = res.response['ShiftList'];
              this.modelFormData.patchValue({
                shiftId: this.getShiftList.shiftId
              });
              this.spinner.hide();
          }
          }
        }
      });
  }

  getOBFromPump() {
    const getOBFromPumpUrl = String.Join('/', this.apiConfigService.getOBFromPump,this.modelFormData.get('branchCode').value,this.modelFormData.get('pumpNo').value);
    this.apiService.apiPostRequest(getOBFromPumpUrl)
      .subscribe(
        response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['OBList'])) {
              this.getOBFromPumpList = res.response['OBList'];
              this.modelFormData.patchValue({
                inMeterReading: this.getOBFromPumpList.outMeterReading
              });
              this.spinner.hide();
          }
          }
        }
      });
      this.commonService.setFocus('outMeterReading');
  }

  getPump(branch?) {
    let getPumpUrl;
    //const getPump = String.Join('/', this.apiConfigService.getPump,branch);
    if (!isNullOrUndefined(branch)) {
      getPumpUrl = String.Join('/', this.apiConfigService.getPump, branch);
      this.getmemberNames(this.modelFormData.get('pumpNo').value);
    }
    else {
      getPumpUrl = String.Join('/', this.apiConfigService.getPump, this.modelFormData.get('branchCode').value);
      //this.getmemberNames(this.modelFormData.get('pumpNo').value);
    }
    
    this.pumpNoConfig = {
      url: getPumpUrl,
      list: 'PumpList',
      
    };
    // this.apiService.apiGetRequest(getPumpUrl)
    //   .subscribe(
    //     response => {
    //     const res = response.body;
    //     if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
    //       if (!isNullOrUndefined(res.response)) {
    //         if (!isNullOrUndefined(res.response['PumpList']) && res.response['PumpList'].length) {
    //           this.getPumpList = res.response['PumpList'];
    //       }
    //       this.spinner.hide();
    //     }
    //   }
    //   });
      
  }
  setTypeAheadValue(val, col, indx) {
    //this.dataSource.data[indx][col].value = val;
    //this.formControlValid(col, this.dataSource.data[indx][col], val, indx);
  }
  getpumpNo(val?)
   {
    let getPumpUrl;
    //const getPump = String.Join('/', this.apiConfigService.getPump,branch);
    if (!isNullOrUndefined(val))
    {
      getPumpUrl = String.Join('/', this.apiConfigService.getPump, val);
    }
    else {
      getPumpUrl = String.Join('/', this.apiConfigService.getPump, this.modelFormData.get('branchCode').value);
    }
    this.apiService.apiGetRequest(getPumpUrl)
      .subscribe(
        response => {
        const res = response.body;
        if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
          if (!isNullOrUndefined(res.response)) {
            if (!isNullOrUndefined(res.response['PumpList']) && res.response['PumpList'].length) {
              this.getPumpList = res.response['PumpList'];
          }
          this.spinner.hide();
        }
      }
      });
      
  }
  //autocompletecode
  setMemberName(member) {
    this.modelFormData.patchValue({
      pumpNo: member.item.id
       });
  }

  getmemberNames(value) {
    if (!isNullOrUndefined(value) && value != '') {
      const getmemberNamesUrl = String.Join('/', this.apiConfigService.getPump, value, this.modelFormData.get('branchCode').value);
      this.apiService.apiGetRequest(getmemberNamesUrl).subscribe(
        response => {
          const res = response.body;
          if (!isNullOrUndefined(res) && res.status === StatusCodes.pass) {
            if (!isNullOrUndefined(res.response)) {
              if (!isNullOrUndefined(res.response['PumpList']) && res.response['PumpList'].length) {
                this.getmemberNamesArray = res.response['PumpList'];
            }
            else
             {
                this.getmemberNamesArray = [];
              }
            }
          }
          this.spinner.hide();
        });
    } else {
      this.getmemberNamesArray = [];
    }
  }




  get formControls() { return this.modelFormData.controls; }


  save() {
    if (this.modelFormData.invalid) {
      return;
    }
   
    this.modelFormData.controls['meterReadingId'].enable();
    this.modelFormData.controls['totalSales'].enable();
    this.modelFormData.controls['invoiceSales'].enable();
    this.modelFormData.controls['variation'].enable();
    this.modelFormData.controls['shiftId'].enable();
    this.modelFormData.controls['inMeterReading'].enable();
    const dialogRef = this.dialog.open(SaveItemComponent, {
      width: '1024px',
      data: '',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!isNullOrUndefined(result)) {
        this.formData.item = this.modelFormData.value;
        this.dialogRef.close(this.formData);
      }
    });
    // this.formData.item = this.modelFormData.value;
    // this.dialogRef.close(this.formData);
    
  }

  cancel() {
    this.dialogRef.close();
  }

}
