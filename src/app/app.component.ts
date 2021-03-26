import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IPicture } from './components/picture/picture';
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  book: IPicture[] = [];
  // [
  //   { id: 1, imageUrl: "https://static-ppimages.freetls.fastly.net/product/2000029531248-1.jpg?height=600&mode=max&width=600&404=default.jpg", audioUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3" },
  //   { id: 2, imageUrl: "https://cdn.britannica.com/15/152315-050-226AA671/twin-towers-skyline-Lower-Manhattan-World-Trade-September-11-2001.jpg", audioUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3" },
  //   { id: 3, imageUrl: "https://miro.medium.com/max/500/1*-vyrY_ys_doUIxZgdHkEGw.png", audioUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3" }
  // ]
  selected: IPicture[] = [];
  audio = new Audio();
  currentAudioIndex: number;

  constructor(private store: AngularFirestore) {
  }

  ngOnInit() {
    this.getPictures();
    this.audio.addEventListener("ended", () => {
      this.playNextAudio();
    })
  }

  drop(event: CdkDragDrop<IPicture[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      )
    }
  }

  async getPictures() {
    await this.store.collection<IPicture>('pictures').get().toPromise().then(storePicGroup => {
      storePicGroup.forEach(storePic => {
        var tempPic: IPicture = {
          audioUrl: storePic.data().audioUrl,
          id: storePic.data().id,
          imageUrl: storePic.data().imageUrl
        }
        this.book.push(tempPic);
      })
    });
  }

  logArrays() {
    console.log('Book array: ', this.book);
    console.log('Selected array: ', this.selected);
  }
  pauseAudio() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause()
    }
  }
  playNextAudio() {
    if (this.currentAudioIndex == null) {
      this.currentAudioIndex = 0;
    } else {
      this.currentAudioIndex += 1;
    }
    if (this.selected[this.currentAudioIndex]) {
      this.audio.src = this.selected[this.currentAudioIndex].audioUrl;
      this.audio.load();
      this.audio.play();
    }
  }
}
