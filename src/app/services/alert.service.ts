import { Injectable } from '@angular/core';
import {MatLegacySnackBar as MatSnackBar, MatLegacySnackBarConfig as MatSnackBarConfig } from '@angular/material/legacy-snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  public appDrawer: any;

  constructor(
    private snackBar: MatSnackBar
    ) { }


  openSnackBar(message: string, action: string, style) {
    this.snackBar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass : [style]
    });
  }

  public closeNav() {
    this.appDrawer.close();
  }

  public openNav() {
    this.appDrawer.open();
  }

}
