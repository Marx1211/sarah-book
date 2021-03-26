import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Platform } from '@angular/cdk/platform';
import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { IPicture } from './components/picture/picture';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('browsing', [
      state('selected', style({
        opacity: 1,
      })),
      state('unselected', style({
        opacity: 0.5,
      })),
      transition('selected <=> unselected', [
        animate('0.5s')
      ])
    ])
  ]
})
export class AppComponent implements OnInit {


  data: IPicture[] = [];

  page1: IPicture[] = [];
  page2: IPicture[] = [];
  page3: IPicture[] = [];
  page4: IPicture[] = [];
  page5: IPicture[] = [];
  // [
  //   { id: 1, imageUrl: "https://static-ppimages.freetls.fastly.net/product/2000029531248-1.jpg?height=600&mode=max&width=600&404=default.jpg", audioUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3" },
  //   { id: 2, imageUrl: "https://cdn.britannica.com/15/152315-050-226AA671/twin-towers-skyline-Lower-Manhattan-World-Trade-September-11-2001.jpg", audioUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3" },
  //   { id: 3, imageUrl: "https://miro.medium.com/max/500/1*-vyrY_ys_doUIxZgdHkEGw.png", audioUrl: "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3" }
  // ]
  selected: IPicture[] = [];
  audio = new Audio();
  currentAudioIndex: number;
  storageRef: AngularFireStorageReference;
  loaded: boolean = false;

  // Lightbox
  @ViewChild('lightbox', { static: false }) lightbox: ElementRef;
  @ViewChild('thumbnails', { static: false }) thumbnails: ElementRef;
  @ViewChildren('slides', { read: ElementRef }) slides: QueryList<ElementRef>;
  public dots: NodeListOf<HTMLElement>;
  public isSelected = [];
  public slideIndex = 1;
  public sizes = [];
  public active: boolean = true;


  constructor(
    private store: AngularFirestore,
    private storage: AngularFireStorage,
    public platform: Platform,
    private renderer: Renderer2
  ) {

  }

  ngOnInit() {
    this.getPictures();
    this.audio.addEventListener("ended", () => {
      this.playNextAudio();
    });
  }

  ngAfterViewInit() {
    $('#flipbook').turn({});
  }

  drop(event: CdkDragDrop<IPicture[]>): void {
    this.active = false;
    this.currentAudioIndex = 0;
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
    if (this.selected.length === 0){
      this.active = true;
    }
  }

  async getPictures() {
    await this.store.collection<IPicture>('pictures').get().toPromise().then(storePicGroup => {
      storePicGroup.forEach(storePic => {
        var tempPic: IPicture = {
          audioUrl: "audios/" + storePic.data().audioUrl + ".mp3",
          imageUrl: "images/" + storePic.data().imageUrl + ".jpg"
        }
        this.data.push(tempPic);
      })
    });
    this.populateLists();
  }
  async playPauseAudio() {
    if (this.audio.paused && !this.loaded) {
      await this.playNextAudio();
      this.audio.play();
    } else if (this.audio.paused && this.loaded) {
      this.audio.play()
    } else {
      this.audio.pause()
    }
  }
  async playNextAudio() {
    if (this.selected[this.currentAudioIndex]) {
      this.storageRef = this.storage.ref(this.selected[this.currentAudioIndex].audioUrl);
      await this.storageRef.getDownloadURL().toPromise().then(url => this.audio.src = url);
      this.audio.load();
      this.showSlides(this.currentAudioIndex)
      this.currentAudioIndex += 1;
      this.loaded = true;
      this.playPauseAudio();
    } else {
      this.loaded = false;
      this.currentAudioIndex = 0;
      this.closeLightBox();
    }
  }
  populateLists() {
    this.data.forEach((picture, index) => {
      if (index <= 5) this.page1.push(picture);
      else if (5 < index && index <= 11) this.page2.push(picture);
      else if (11 < index && index <= 17) this.page3.push(picture);
      else if (17 < index && index <= 23) this.page4.push(picture);
      else if (23 < index && index <= 29) this.page5.push(picture);
    })
  }
  clearSelected() {
    this.page1 = [];
    this.page2 = [];
    this.page3 = [];
    this.page4 = [];
    this.page5 = [];
    this.selected = [];
    this.audio.pause();
    this.loaded = false;
    this.populateLists();
    this.active = true;
  }

  initSelected() {
    for (let i = 0; i < this.dots.length; i++) {
      this.isSelected.push(false);
    }
  }

  public openLightBox() {
    this.dots = document.getElementsByName('dots');
    this.renderer.setStyle(this.lightbox.nativeElement, 'display', 'block');
    this.initSelected();
    this.showSlides(0);
  }

  public closeLightBox() {
    this.loaded = false;
    this.currentAudioIndex = 0;
    this.renderer.setStyle(this.lightbox.nativeElement, 'display', 'none');
  }

  public currentSlide(n) {
    this.showSlides(this.slideIndex = n);
  }
  public scrollTo(i) {
    var currentPic = this.dots[i];
    var left = currentPic.offsetLeft;
    var width = this.thumbnails.nativeElement.offsetWidth;
    var diff = left - width / 2
    this.thumbnails.nativeElement.scrollLeft = diff;
  }

  public showSlides(n) {
    var i;
    this.scrollTo(n);
    this.slideIndex = n;
    for (i = 0; i < this.slides.length; i++) {
      this.renderer.setStyle(this.slides.toArray()[i].nativeElement, 'display', 'none');
    }
    for (i = 0; i < this.dots.length; i++) {
      this.isSelected[i] = false;
    }
    this.renderer.setStyle(this.slides.toArray()[this.slideIndex].nativeElement, 'display', 'flex');
    this.isSelected[this.slideIndex] = true;
  }
}
