import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { IPicture } from './picture';

@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss']
})
export class PictureComponent implements OnInit {

  @Input() picture: IPicture;
  public imageUrl;

  storageRef: AngularFireStorageReference;

  constructor(private storage: AngularFireStorage) { }

  ngOnInit(): void {
    this.getURLs();
  }

  async getURLs() {
    this.storageRef = this.storage.ref(this.picture.imageUrl);
    await this.storageRef.getDownloadURL().subscribe(url => this.imageUrl = url);
  }

}
