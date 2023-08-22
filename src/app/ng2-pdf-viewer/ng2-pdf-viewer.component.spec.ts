import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ng2PdfViewerComponent } from './ng2-pdf-viewer.component';

describe('Ng2PdfViewerComponent', () => {
  let component: Ng2PdfViewerComponent;
  let fixture: ComponentFixture<Ng2PdfViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Ng2PdfViewerComponent]
    });
    fixture = TestBed.createComponent(Ng2PdfViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
