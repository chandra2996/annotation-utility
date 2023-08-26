import { Component, Input, HostListener, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnChanges, OnInit } from '@angular/core';


export interface Word {
  box: Number[],
  text: string
}
@Component({
  selector: 'app-drag-resize-anno',
  templateUrl: './drag-resize-anno.component.html',
  styleUrls: ['./drag-resize-anno.component.css']
})
export class DragResizeAnnoComponent implements OnInit, AfterViewInit, OnChanges {

  //annotation detils
  @Input('id') public id: number;
  @Input('label') public label: string;
  public text: string;
  public box: Number[] = [];
  @Input('words') public words: Word[];
  public linkedTo: number;
  public isLinked = false;

  //bounding boxes
  @Input('top') top: number;
  @Input('left') left: number;
  @Input('width') width: number;
  @Input('height') height: number;

  @Input('color') color: string;
  backgroundColor: string;
  idBackgroundColor: string;
  @Input('pageTop') pageTop: number;
  @Input('pageLeft') pageLeft: number;
  @Input('pageHeight') pageHeight: number;
  @Input('pageWidth') pageWidth: number;

  @Output() resizableDragableDeleted = new EventEmitter<number>();
  @Output() resizableDragableResizedOrDragged = new EventEmitter<this>();
  @Output() linkAnnotation = new EventEmitter<this>();


  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  resizableMargin = 15
  private isResizing = false;
  private resizeStartX = 0;
  private resizeStartY = 0;
  rdId: string;
  showControls = false;

  ngOnInit() {
    //update bbox if annotation changes
    this.updateBox();
    this.backgroundColor = 'rgba(' + this.color + ', 0.3)';
    this.idBackgroundColor = 'rgb(' + this.color + ')';
    this.rdId = 'rd' + this.id;

  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(): void {
    console.log("DragResizeAnnoComponent -> ngOnChanges")
    this.updateBox();
    this.updateText();
    this.backgroundColor = 'rgba(' + this.color + ', 0.3)';
    this.idBackgroundColor = 'rgb(' + this.color + ')';
  }

  updateBox() {
    this.box[0] = (this.left);
    this.box[1] = (this.top);
    this.box[2] = (this.left + this.width);
    this.box[3] = (this.top + this.height);
  }
  updateText() {
    var text = '';
    for (let i = 0; i < this.words.length; i++) {
      var word = this.words[i];
      if (text == '') {
        text = word.text;
      } else {
        text += ' ' + word.text;
      }
    }
    this.text = text;
    console.log(this.text);
  }
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.left;
    this.dragStartY = event.clientY - this.top;
    event.stopPropagation();
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    this.resizeStartX = event.clientX - this.width;
    this.resizeStartY = event.clientY - this.height;
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      var left = event.clientX - this.dragStartX;
      if (left >= 0 && (left + this.width) <= (this.pageWidth)) {
        this.left = left;
        this.showControlsStyle();
        this.resizableDragableResizedOrDragged.emit(this);
      }
      var top = event.clientY - this.dragStartY;
      if (top >= 0 && (top + this.height) <= (this.pageHeight)) {
        this.top = top;
        this.showControlsStyle();
        this.resizableDragableResizedOrDragged.emit(this);
      }
    }
    if (this.isResizing) {
      var width = event.clientX - this.resizeStartX;
      if ((this.left + width) <= this.pageWidth) {
        this.width = width;
        this.showControlsStyle();
        this.resizableDragableResizedOrDragged.emit(this);
      }
      var height = event.clientY - this.resizeStartY;
      if ((this.top + height) <= this.pageHeight) {
        this.height = height;
        this.showControlsStyle();
        this.resizableDragableResizedOrDragged.emit(this);
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }


  deleteResizableDraggable(event: any) {
    this.resizableDragableDeleted.emit(this.id)
    event.stopPropagation();
  }

  onClick(event: MouseEvent, rdId: string) {
    const doc = document.getElementById(rdId);
    if (doc) {
      doc.focus();
      this.showControls = true;
      if (event.ctrlKey) {
        this.linkAnnotation.emit(this);
      }
    }

  }

  onBlur(event: any, rdId: string) {
    const doc = document.getElementById(rdId);
    if (doc) {
      this.showControls = false;
    }
  }


  showControlsStyle() {
    const doc = document.getElementById(this.rdId);
    if (doc) {
      doc.focus();
      this.showControls = true;
    }
  }
}
