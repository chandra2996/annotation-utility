import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bbox',
  templateUrl: './bbox.component.html',
  styleUrls: ['./bbox.component.css']
})
export class BboxComponent implements OnInit {

  @Input('x') public x: number;
  @Input('y') public y: number;
  @Input('w') public w: number;
  @Input('h') public h: number;


  ngOnInit(): void {
    console.log(this)
  }


}
