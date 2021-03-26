import { Component, Input, OnInit } from '@angular/core';
import { IPicture } from './picture';

@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss']
})
export class PictureComponent implements OnInit {

  @Input() picture: IPicture;

  public data: IPicture;

  constructor() { }

  ngOnInit(): void {
  }

}
