import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { FormsModule } from '@angular/forms';
import {SVGGraphics} from 'pdfjs-dist';
import { Ng2PdfViewerComponent } from './ng2-pdf-viewer/ng2-pdf-viewer.component'
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DragResizeAnnoComponent } from './drag-resize-anno/drag-resize-anno.component'; 
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BboxComponent } from './bbox/bbox.component';


@NgModule({
  declarations: [
    AppComponent,
    Ng2PdfViewerComponent,
    DragResizeAnnoComponent,
    BboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FormsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
