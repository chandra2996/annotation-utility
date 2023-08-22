import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragResizeAnnoComponent } from './drag-resize-anno.component';

describe('DragResizeAnnoComponent', () => {
  let component: DragResizeAnnoComponent;
  let fixture: ComponentFixture<DragResizeAnnoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DragResizeAnnoComponent]
    });
    fixture = TestBed.createComponent(DragResizeAnnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
