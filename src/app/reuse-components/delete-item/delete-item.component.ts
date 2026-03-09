import { Component, Inject, Optional } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-delete-item',
  templateUrl: './delete-item.component.html',
  styleUrls: ['./delete-item.component.scss']
})
export class DeleteItemComponent  {

  deleteData: any;
  tableUrl: any;

  constructor(
    public dialogRef: MatDialogRef<DeleteItemComponent>,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

      this.deleteData = {...data};
  }

  doAction() {
           this.dialogRef.close(this.deleteData);
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
