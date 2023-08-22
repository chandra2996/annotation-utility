import { Component, Input, HostListener, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-drag-resize-anno',
  templateUrl: './drag-resize-anno.component.html',
  styleUrls: ['./drag-resize-anno.component.css']
})
export class DragResizeAnnoComponent implements AfterViewInit {


  @Input('labelId') public labelId: number;
  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('left') public left: number;
  @Input('top') public top: number;
  @Input('color') public color: string;
  @Input('pageTop') public pageTop: number;
  @Input('pageLeft') public pageLeft: number;
  @Input('pageHeight') public pageHeight: number;
  @Input('pageWidth') public pageWidth: number;

  @Output() resizableDragableDeleted = new EventEmitter<number>();
  @Output() resizableDragableResizedOrDragged = new EventEmitter<this>();
  // @ViewChild("deleteDiv") deleteDiv: ElementRef
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  resizableMargin = 15
  private isResizing = false;
  private resizeStartX = 0;
  private resizeStartY = 0;

  ngAfterViewInit(): void {
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
      // console.log("page", this.pageLeft, this.pageTop, this.pageHeight, this.pageWidth)
      // console.log("comp", this.left, this.top, this.height, this.width)
      var left = event.clientX - this.dragStartX;
      if(left >= 0 && (left + this.width) <= (this.pageWidth)) {
        this.left = left;
        this.resizableDragableResizedOrDragged.emit(this);
      }
      var top = event.clientY - this.dragStartY;
      if(top >= 0 && (top + this.height) <= (this.pageHeight)) {
        this.top = top;
        this.resizableDragableResizedOrDragged.emit(this);
      }
    }
    if (this.isResizing) {
      var width = event.clientX - this.resizeStartX;
      if ((this.left + width) <= this.pageWidth) {
        this.width = width;
        this.resizableDragableResizedOrDragged.emit(this);
      }
      var height = event.clientY - this.resizeStartY;
      if ((this.top + height) <= this.pageHeight) {
        this.height = height;
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
    console.log("deleted", this.labelId)
    this.resizableDragableDeleted.emit(this.labelId)
    event.stopPropagation();
  }




}
