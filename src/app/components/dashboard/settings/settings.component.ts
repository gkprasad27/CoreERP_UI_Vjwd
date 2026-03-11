import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent implements OnInit {

 
  routeParams: any;



  constructor(
    private activatedRoute: ActivatedRoute,
  ) {
    activatedRoute.params.subscribe(params => {
      this.routeParams = params.id;
    });
  }

  ngOnInit() {
  }
}
