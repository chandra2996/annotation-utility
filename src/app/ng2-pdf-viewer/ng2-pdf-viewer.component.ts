import { Component, ViewChild, ViewContainerRef, ElementRef, AfterViewInit, HostListener, ComponentRef, TemplateRef } from '@angular/core';
import { DragResizeAnnoComponent } from '../drag-resize-anno/drag-resize-anno.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { RandomColorGeneratorService } from '../service/random-color-generator.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgFor, AsyncPipe } from '@angular/common';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

export class Annotation {
  labelId: number;
  label: string;
  labelValue: string;
  boundingBoxes: {};
}

const ELEMENT_DATA: Annotation[] = [
];

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
  maxPdfViewerWidth = 816;
  maxPdfViewerHeight = 1056;
  pdfViewerTop: any;
  pdfViewerLeft: any;
  currentLabelId = 1;
  creatingAnno = false;
  annoStartX: number;
  annoStartY: number;
  currentPage: number = 1;
  totalPages: number = 1;
  scale = 1;
  currentAnno: ComponentRef<DragResizeAnnoComponent>;
  zIndex: string | number = 'auto';
  annoStarted = false;
  annotationReady = false;
  currentNerId: number;
  @ViewChild('template', { read: ViewContainerRef }) template: ViewContainerRef;
  @ViewChild(PdfViewerComponent) pdfViewer: PdfViewerComponent;
  @ViewChild("pdfContainer", { static: true }) pdfContainer: ElementRef;
  @ViewChild('viewContainer') viewContainer: ElementRef;
  @ViewChild("pdfViewer", { static: true }) pdfViewerElement: ElementRef;
  annotationRefDict: { [key: number]: ComponentRef<DragResizeAnnoComponent>[] } = {};
  annos: any = [
    {nerId: 1, nerName: 'First Name', zIndex: 'auto'},
    {nerId: 2, nerName: 'Last Name', zIndex: 'auto'},
    {nerId: 3, nerName: 'Middle Name', zIndex: 'auto'},
    {nerId: 4, nerName: 'Date Of Birth', zIndex: 'auto'},
    {nerId: 5, nerName: 'Aadhar Number', zIndex: 'auto'},
    {nerId: 6, nerName: 'Pet Name', zIndex: 'auto'},
    {nerId: 7, nerName: 'Bank Name', zIndex: 'auto'}
  ]

  displayedColumns: string[] = ['labelId', 'label', 'labelValue', 'boundingBoxes', 'action'];
  dataSource = new MatTableDataSource<Annotation>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(private viewContainerRef: ViewContainerRef, private randomColorService: RandomColorGeneratorService, private fb: FormBuilder) {

  }

  ngOnInit() {

  }

  deleteAnno(labelId: number) {
    console.log(labelId, "called delete anno")
    for (let i = 0; i<ELEMENT_DATA.length; i++){
      var anno = ELEMENT_DATA[i]
      console.log(anno)
      if (anno.labelId==labelId) {
        ELEMENT_DATA.splice(i, 1);
        this.dataSource = new MatTableDataSource<Annotation>(ELEMENT_DATA);
        this.deleteAnnotation(labelId);
      }
    }
  }

  onAnnotationSelect(anno: any) {
    if (this.annotationReady) {
      console.log('annotation selected');
      this.annoStarted = true;
      this.annos[anno.nerId - 1].zIndex = 2
      this.zIndex = 2;
      this.currentNerId = anno.nerId;
    }
  }

  uploadFileEvt(filesEvent: any) {
    if (filesEvent.target.files && filesEvent.target.files[0]) {
      let file: File = filesEvent.target.files[0];
      this.fileAttr = '';
      Array.from(filesEvent.target.files).forEach((file: any) => {
        this.fileAttr += file.name + ' - ';
      });
      file.arrayBuffer().then((data: ArrayBuffer) => {
        this.fileData = data;
      })

    } else {
      this.fileAttr = 'Choose File';
    }
  }

  pageRendered(event: any) {
    // console.log("pageRendered", event.source.viewport)
    setTimeout(() => {
      // console.log(event)
      // console.log(this.pdfViewer)
      var pageView = event.source.viewport
      this.pdfViewerHeight = pageView?.height;
      this.pdfViewerWidth = pageView?.width;
      // console.log(this.pdfViewerHeight, this.pdfViewerWidth)
      // console.log(pageView)
      this.pdfContainer.nativeElement.style.width = Math.min(this.pdfViewerWidth, this.maxPdfViewerWidth) + 'px';
      this.pdfContainer.nativeElement.style.height = Math.min(this.pdfViewerHeight, this.maxPdfViewerHeight) + 'px';
      this.pdfViewerTop = this.pdfContainer.nativeElement.offsetTop;
      this.pdfViewerLeft = this.pdfContainer.nativeElement.offsetLeft;
      
    
      console.log(this.pdfContainer.nativeElement.offsetLeft, this.pdfContainer.nativeElement.offsetTop)
      console.log(this.viewContainer.nativeElement.offsetLeft, this.viewContainer.nativeElement.offsetTop)

      this.scale = Math.min(this.pdfViewerWidth, this.maxPdfViewerWidth)/this.pdfViewerWidth;
      // this.pdfViewer.pdfViewer.currentScale = this.scale

      // this.pdfViewer.pdfViewerContainer.nativeElement.addEventListener("scroll", (event: any) => {
      //     const scrollOne = event.srcElement as HTMLElement;
      //     console.log(event)
      //     const scrollTwo = this.pdfContainer.nativeElement as HTMLElement;
      //     console.log(scrollTwo)
      //     // do logic and set
      //     scrollTwo.scrollLeft = scrollOne.scrollLeft;
      //     scrollTwo.scrollTop = scrollOne.scrollTop;
      // });
      console.log()
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
        anno2.instance.labelId = anno1.instance.labelId
        anno2.instance.color = anno1.instance.color

      }
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.annoStarted) {
      console.log("MouseDown", event)
      console.log(this.pdfViewerLeft, this.pdfViewerTop)
      this.creatingAnno = true;
      this.annoStartX = event.pageX - this.pdfViewerLeft;
      this.annoStartY = event.pageY - this.pdfViewerTop;
      const dragResizeComp = this.template.createComponent(DragResizeAnnoComponent);
      dragResizeComp.instance.top = this.annoStartY;
      dragResizeComp.instance.left = this.annoStartX;
      dragResizeComp.instance.labelId = this.currentLabelId;
      dragResizeComp.instance.pageLeft = this.pdfViewerLeft;
      dragResizeComp.instance.pageTop = this.pdfViewerTop;
      dragResizeComp.instance.pageWidth = this.pdfViewerWidth;
      dragResizeComp.instance.pageHeight = this.pdfViewerHeight;
      dragResizeComp.instance.color = this.randomColorService.getRandomColor();
      this.currentAnno = dragResizeComp;
  
      if (this.annotationRefDict.hasOwnProperty(this.currentPage)) {
        var annList = this.annotationRefDict[this.currentPage];
        annList.push(dragResizeComp)
      }
      else {
        annList = []
        annList.push(dragResizeComp)
      }
      this.annotationRefDict[this.currentPage] = annList
      console.log(this.annotationRefDict)
      this.currentLabelId++;
      dragResizeComp.instance.resizableDragableDeleted.subscribe((labelId: any) => {
        this.deleteAnno(labelId);
        // this.deleteAnnotation(labelId);
      });

      dragResizeComp.instance.resizableDragableResizedOrDragged.subscribe((dragResizeComp: DragResizeAnnoComponent) => {
        this.resizableDragableResizedOrDragged(dragResizeComp)
      })
    }
  }


  onMouseMove(event: any) {

    if (this.annoStarted && this.creatingAnno && this.isValidMove(event)) {
      // console.log("MouseMove", event)
      this.currentAnno.instance.height = event.pageY - this.annoStartY - this.pdfViewerTop;
      this.currentAnno.instance.width = event.pageX - this.annoStartX - this.pdfViewerLeft;

    }
  }

  private isValidMove(event: any): boolean {
    if (event.pageX < this.pdfViewerLeft || event.pageX > (this.pdfViewerLeft +  this.pdfViewerWidth) 
    || event.pageY < this.pdfViewerTop || event.pageY > (this.pdfViewerTop + this.pdfViewerHeight)) {
      return false;
    } else {
      return true
    }
  }

  onMouseUp(event: any) {
    if (this.creatingAnno) {
      var anno : Annotation = {
        labelId: this.currentAnno.instance.labelId,
        label:  this.annos[this.currentNerId - 1].nerName,
        labelValue : "TBD",
        boundingBoxes: {
          x: this.currentAnno.instance.left,
          y: this.currentAnno.instance.top,
          w: this.currentAnno.instance.width,
          h: this.currentAnno.instance.height
        }
      }
      ELEMENT_DATA.push(anno)
      console.log(ELEMENT_DATA)
      this.dataSource = new MatTableDataSource<Annotation>(ELEMENT_DATA);
      this.closeAnnotation();
    }
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

  deleteAnnotation(labelId: number) {
    var annotations = this.annotationRefDict[this.currentPage]
    if (annotations.length > 0) {
      for (let i = 0; i < annotations.length; i++) {
        var anno = annotations.at(i);
        if (labelId == anno?.instance.labelId) {
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
    this.creatingAnno = false;
    this.annoStarted = false;
    this.zIndex = 'auto';
    this.annos[this.currentNerId - 1].zIndex = 'auto'
  }

  resizableDragableResizedOrDragged(anno: DragResizeAnnoComponent) {
    var labelId = anno.labelId;
    console.log(labelId, "called delete anno")
    for (let i = 0; i<ELEMENT_DATA.length; i++){
      var annoFound = ELEMENT_DATA[i]
      console.log(annoFound)
      if (annoFound.labelId==labelId) {
        annoFound.boundingBoxes = {
          x: anno.left,
          y: anno.top,
          w: anno.width,
          h: anno.height
        }
        this.dataSource = new MatTableDataSource<Annotation>(ELEMENT_DATA);
      }
    }

  }

  isSubRect(rect1: any, rect2: any): boolean {
    // Check if rect1 contains rect2
  
    // Calculate the coordinates of the edges of rect1
    const rect1Left = rect1.x;
    const rect1Right = rect1.x + rect1.width;
    const rect1Top = rect1.y;
    const rect1Bottom = rect1.y + rect1.height;
  
    // Calculate the coordinates of the edges of rect2
    const rect2Left = rect2.x;
    const rect2Right = rect2.x + rect2.width;
    const rect2Top = rect2.y;
    const rect2Bottom = rect2.y + rect2.height;
  
    // Check if rect2 is completely inside rect1
    return (
      rect2Left >= rect1Left &&
      rect2Right <= rect1Right &&
      rect2Top >= rect1Top &&
      rect2Bottom <= rect1Bottom
    );
  }

}
