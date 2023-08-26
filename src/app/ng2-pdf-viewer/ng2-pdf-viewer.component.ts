import { Component, ViewChild, ViewContainerRef, ElementRef, AfterViewInit, HostListener, ComponentRef, TemplateRef } from '@angular/core';
import { DragResizeAnnoComponent, Word } from '../drag-resize-anno/drag-resize-anno.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { RandomColorGeneratorService } from '../service/random-color-generator.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgFor, AsyncPipe } from '@angular/common';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpService } from '../service/http.service';
import { NgxSpinnerService } from 'ngx-spinner';

export interface Annotation {
  id: number;
  label: string;
  text: string;
  box: Number[];
  linking: number;
}

const ELEMENT_DATA: Annotation[] = [];

@Component({
  selector: 'app-ng2-pdf-viewer',
  templateUrl: './ng2-pdf-viewer.component.html',
  styleUrls: ['./ng2-pdf-viewer.component.css']
})
export class Ng2PdfViewerComponent implements AfterViewInit {

  fileAttr: any;
  fileData: any;
  currentElement: any;
  pdfViewerWidth: number;
  pdfViewerHeight: number;
  maxPdfViewerWidth = 716;
  maxPdfViewerHeight = 1056;
  pdfViewerTop: any;
  pdfViewerLeft: any;
  currentId = 1;
  creatingAnnotation = false;
  annotationStartX: number;
  annotationStartY: number;
  currentPage: number = 1;
  totalPages: number = 1;
  scale = 1;
  currentAnnotation: ComponentRef<DragResizeAnnoComponent>;
  zIndex: string | number = 'auto';
  annoStarted = false;
  annotationReady = false;
  currentLabelId: number;
  scrollWidth = 10;
  @ViewChild('template', { read: ViewContainerRef }) template: ViewContainerRef;
  @ViewChild(PdfViewerComponent) pdfViewer: PdfViewerComponent;
  @ViewChild("pdfContainer2", { static: true }) pdfContainer2: ElementRef;
  @ViewChild('viewContainer') viewContainer: ElementRef;
  @ViewChild("pdfViewer", { static: true }) pdfViewerElement: ElementRef;
  annotationRefDict: { [key: number]: ComponentRef<DragResizeAnnoComponent>[] } = {};
  textDetails: { [key: number]: any } = {}
  labels: any = [
    { labelId: 1, label: 'question', zIndex: 'auto' },
    { labelId: 2, label: 'answer', zIndex: 'auto' },
    { labelId: 3, label: 'header', zIndex: 'auto' },
    { labelId: 4, label: 'other', zIndex: 'auto' }
  ]

  displayedColumns: string[] = ['id', 'label', 'text', 'box', 'linking', 'action'];
  dataSource = new MatTableDataSource<Annotation>(ELEMENT_DATA);
  currentLinkAnno: DragResizeAnnoComponent;
  linkageStarted = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(private viewContainerRef: ViewContainerRef,
    private randomColorService: RandomColorGeneratorService,
    private fb: FormBuilder,
    private httpService: HttpService,
    private spinner: NgxSpinnerService) {

  }

  ngOnInit() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 10000);
  }

  deleteAnnotation(id: number) {
    console.log(id, "called delete anno");
    for (let i = 0; i < ELEMENT_DATA.length; i++) {
      var anno = ELEMENT_DATA[i];
      console.log(anno);
      if (anno.id == id) {
        ELEMENT_DATA.splice(i, 1);
        this.dataSource.data = ELEMENT_DATA;
      }
    }
    this.deleteAnnotationRef(id);
  }

  onAnnotationSelect(anno: any) {
    if (this.annotationReady) {
      console.log('annotation selected');
      this.annoStarted = true;
      this.labels[anno.labelId - 1].zIndex = 2
      this.zIndex = 2;
      this.currentLabelId = anno.labelId;
    }
  }

  uploadFileEvt(filesEvent: any) {
    if (filesEvent.target.files && filesEvent.target.files[0]) {
      let file: File = filesEvent.target.files[0];
      this.fileAttr = file.name;
      this.spinner.show();
      this.httpService.postData(file).subscribe((response: any) => {
        var data = response.data
        var extractedPages = data.extractedPages;
        for (let page = 0; page < extractedPages.length; page++) {
          var pageDetails = extractedPages[page]
          this.textDetails[page + 1] = pageDetails;
          console.log(this.textDetails)
        }
        this.spinner.hide();
      })
      file.arrayBuffer().then((data: ArrayBuffer) => {
        this.fileData = data;
      })
    } else {
      this.fileAttr = 'Choose File';
    }
  }

  pageRendered(event: any) {
    setTimeout(() => {
      var pageView = event.source.viewport
      this.pdfViewerHeight = pageView?.height;
      this.pdfViewerWidth = pageView?.width;
      var pdfViewer = document.getElementById('pdfViewer');
      if (pdfViewer) {
        pdfViewer.style.width = this.pdfViewerWidth + this.scrollWidth + 'px';
        pdfViewer.style.height = this.pdfViewerHeight + this.scrollWidth + 'px';
      }
      this.pdfViewerTop = this.pdfContainer2.nativeElement.offsetTop;
      this.pdfViewerLeft = this.pdfContainer2.nativeElement.offsetLeft;
      this.scale = Math.min(this.pdfViewerWidth, this.maxPdfViewerWidth) / this.pdfViewerWidth;
      this.annotationReady = true;
      this.loadAnnotations()
    }, 300);
  }

  loadAnnotations() {
    this.template.clear();
    if (this.annotationRefDict.hasOwnProperty(this.currentPage)) {
      const items = this.annotationRefDict[this.currentPage];
      for (const key in items) {
        var anno1 = items[key];
        var anno2 = this.template.createComponent(DragResizeAnnoComponent);
        anno2.instance.top = anno1.instance.top
        anno2.instance.left = anno1.instance.left
        anno2.instance.width = anno1.instance.width
        anno2.instance.height = anno1.instance.height
        anno2.instance.id = anno1.instance.id
        anno2.instance.color = anno1.instance.color

      }
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.annoStarted) {
      console.log("Event", event)
      this.creatingAnnotation = true;
      console.log("left, top", this.pdfViewerLeft, this.pdfViewerTop)
      var doc = document.getElementById('pdfContainer1')
      if (doc) {
        this.annotationStartX = event.pageX + doc.scrollLeft - this.pdfViewerLeft;
        this.annotationStartY = event.pageY + doc.scrollTop - this.pdfViewerTop;
      }
      const annotation = this.template.createComponent(DragResizeAnnoComponent);
      annotation.instance.top = this.annotationStartY;
      annotation.instance.left = this.annotationStartX;
      annotation.instance.width = 0;
      annotation.instance.height = 0;
      annotation.instance.id = this.currentId;
      annotation.instance.label = this.labels[this.currentLabelId - 1].label;
      annotation.instance.pageLeft = this.pdfViewerLeft;
      annotation.instance.pageTop = this.pdfViewerTop;
      annotation.instance.pageWidth = this.pdfViewerWidth;
      annotation.instance.pageHeight = this.pdfViewerHeight;
      annotation.instance.color = this.randomColorService.getRandomColor();
      this.currentAnnotation = annotation;
      if (this.annotationRefDict.hasOwnProperty(this.currentPage)) {
        var annList = this.annotationRefDict[this.currentPage];
      } else {
        annList = []
      }
      annList.push(annotation)
      this.annotationRefDict[this.currentPage] = annList
      this.currentId++;
      annotation.instance.resizableDragableDeleted.subscribe((id: any) => {
        this.deleteAnnotation(id);
      });
      annotation.instance.resizableDragableResizedOrDragged.subscribe((dragResizeComp: DragResizeAnnoComponent) => {
        this.resizableDragableResizedOrDragged(dragResizeComp)
      })
      annotation.instance.linkAnnotation.subscribe((annotation: DragResizeAnnoComponent) => {
        this.link(annotation);
      })
    }
  }

  isValidLink(anno1: DragResizeAnnoComponent, anno2: DragResizeAnnoComponent) {
    if (anno1.label == 'question' && anno2.label == 'answer') {
      return true;
    } else if (anno1.label == 'answer' && anno2.label == 'question') {
      return true;
    } else {
      return false;
    }
  }
  link(annotation: DragResizeAnnoComponent) {
    if (!annotation.isLinked) {
      console.log("started linking", annotation);
      if (this.linkageStarted && this.isValidLink(annotation, this.currentLinkAnno)) {
        annotation.linkedTo = this.currentLinkAnno.id;
        annotation.isLinked = true;
        this.currentLinkAnno.linkedTo = annotation.id;
        this.currentLinkAnno.isLinked = true;
        this.linkageStarted = false;
        console.log("linked", annotation);
        for (let i = 0; i < ELEMENT_DATA.length; i++) {
          var anno = ELEMENT_DATA[i];
          console.log(anno);
          if (anno.id == annotation.id) {
            var anno2: Annotation = {
              id: annotation.id,
              label: annotation.label,
              text: annotation.text,
              box: annotation.box,
              linking: annotation.linkedTo
            }
            ELEMENT_DATA[i] = anno2;
          } else if (anno.id == this.currentLinkAnno.id) {
            var anno2: Annotation = {
              id: this.currentLinkAnno.id,
              label: this.currentLinkAnno.label,
              text: this.currentLinkAnno.text,
              box: this.currentLinkAnno.box,
              linking: this.currentLinkAnno.linkedTo
            }
            ELEMENT_DATA[i] = anno2;
          }
        }
        this.dataSource.data = ELEMENT_DATA;
      } else {
        this.currentLinkAnno = annotation;
        this.linkageStarted = true;
      }
    }
  }


  onMouseMove(event: any) {

    if (this.annoStarted && this.creatingAnnotation && this.isValidMove(event)) {
      var doc = document.getElementById('pdfContainer1')
      if (doc) {
        var height = event.pageY + doc.scrollTop - this.annotationStartY - this.pdfViewerTop;
        var width = event.pageX + doc.scrollLeft - this.annotationStartX - this.pdfViewerLeft;
        if (height >= 0 && height <= this.pdfViewerHeight) {
          this.currentAnnotation.instance.height = height;
        }
        if (width >= 0 && width <= this.pdfViewerWidth) {
          this.currentAnnotation.instance.width = width;
        }
      }
      event.stopPropagation();
    }
  }

  private isValidMove(event: any): boolean {
    if (event.pageX < this.pdfViewerLeft || event.pageX > (this.pdfViewerLeft + this.pdfViewerWidth)
      || event.pageY < this.pdfViewerTop || event.pageY > (this.pdfViewerTop + this.pdfViewerHeight)) {
      return false;
    } else {
      return true
    }
  }

  onMouseUp(event: any) {
    if (this.creatingAnnotation) {
      if (this.currentAnnotation.instance.height < 10) {
        this.currentAnnotation.instance.height = 10;
      }
      if (this.currentAnnotation.instance.width < 10) {
        this.currentAnnotation.instance.width = 10;
      }
      var annotationRect = {
        x: this.currentAnnotation.instance.left,
        y: this.currentAnnotation.instance.top,
        w: this.currentAnnotation.instance.width,
        h: this.currentAnnotation.instance.height
      }
      var words = this.getWords(annotationRect);
      this.currentAnnotation.instance.words = words;
      this.currentAnnotation.instance.ngOnChanges();
      console.log(this.currentAnnotation)
      var annotation: Annotation = {
        id: this.currentAnnotation.instance.id,
        label: this.currentAnnotation.instance.label,
        text: this.currentAnnotation.instance.text,
        box: this.currentAnnotation.instance.box,
        linking: this.currentAnnotation.instance.linkedTo,
      }
      ELEMENT_DATA.push(annotation);
      this.dataSource.data = ELEMENT_DATA;
      this.closeAnnotation();
    }
  }

  private getWords(annoRect: { x: number; y: number; w: number; h: number; }): Word[] {
    var words: Word[] = [];
    var pageDetails = this.textDetails[this.currentPage];
    var pageHeight = pageDetails.pageHeight;
    var pageWidth = pageDetails.pageWidth;
    var yRatio = this.pdfViewerHeight / pageHeight;
    var xRatio = this.pdfViewerWidth / pageWidth;
    var textDetails = pageDetails.textDetails;
    for (let t = 0; t < textDetails.length; t++) {
      var pdfWord = textDetails[t];
      var coords = pdfWord.coordinates;
      var wordRect = {
        x: coords.x * xRatio,
        y: coords.y * yRatio,
        h: coords.height * yRatio,
        w: coords.width * xRatio
      };
      if (this.isSubRect(annoRect, wordRect)) {
        var word: Word = {
          text: pdfWord.text,
          box: [
            coords.x * xRatio,
            coords.y * yRatio,
            coords.height * yRatio,
            coords.width * xRatio
          ]
        }
        words.push(word);
      }
    }
    return words;
  }

  afterLoadComplete(event: any) {
    console.log("load complete", event)
    this.currentPage = 1;
    this.totalPages = event._pdfInfo.numPages;
    this.annotationRefDict = {}
    this.template.clear()
    this.loadAnnotations()
    console.log("totalPages", this.totalPages)
  }

  deleteAnnotationRef(id: number) {
    var annotations = this.annotationRefDict[this.currentPage]
    if (annotations.length > 0) {
      for (let i = 0; i < annotations.length; i++) {
        var anno = annotations.at(i);
        if (id == anno?.instance.id) {
          anno.destroy()
        }
      }
    }
  }

  goToNextPage() {
    this.currentPage++;
    this.loadAnnotations()
  }

  goToPreviousPage() {
    this.currentPage--;
    this.loadAnnotations()
  }

  onAnnoClose() {
    this.closeAnnotation()
  }

  closeAnnotation() {
    this.creatingAnnotation = false;
    this.annoStarted = false;
    this.zIndex = 'auto';
    this.labels[this.currentLabelId - 1].zIndex = 'auto'
  }

  resizableDragableResizedOrDragged(anno: DragResizeAnnoComponent) {
    var id = anno.id;
    console.log(id, "called resizableDragableResizedOrDragged")
    for (let i = 0; i < ELEMENT_DATA.length; i++) {
      var annoFound = ELEMENT_DATA[i]
      console.log(annoFound)
      if (annoFound.id == id) {
        var rect = {
          x: anno.left,
          y: anno.top,
          w: anno.width,
          h: anno.height
        }
        anno.words = this.getWords(rect)
        anno.ngOnChanges();
        annoFound.text = anno.text;
        annoFound.box = anno.box;
        this.dataSource = new MatTableDataSource<Annotation>(ELEMENT_DATA);
      }
    }

  }

  isSubRect(rect1: any, rect2: any): boolean {
    // Check if rect1 contains rect2

    // Calculate the coordinates of the edges of rect1
    const rect1Left = rect1.x;
    const rect1Right = rect1.x + rect1.w;
    const rect1Top = rect1.y;
    const rect1Bottom = rect1.y + rect1.h;

    // Calculate the coordinates of the edges of rect2
    const rect2Left = rect2.x;
    const rect2Right = rect2.x + rect2.w;
    const rect2Top = rect2.y;
    const rect2Bottom = rect2.y + rect2.h;

    // Check if rect2 is completely inside rect1
    return (
      rect2Left >= rect1Left &&
      rect2Right <= rect1Right &&
      rect2Top >= rect1Top &&
      rect2Bottom <= rect1Bottom
    );
  }

}
