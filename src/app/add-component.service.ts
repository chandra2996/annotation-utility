// import {
//     ComponentFactoryResolver,
//     Injectable,
//     Inject,
//     ReflectiveInjector
//   } from '@angular/core'
//   import { DragResizeAnnoComponent } from './drag-resize-anno/drag-resize-anno.component'
//   @Injectable()
//   export class Service {
//     constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
//       this.factoryResolver = factoryResolver
//     }
//     setRootViewContainerRef(viewContainerRef) {
//       this.rootViewContainer = viewContainerRef
//     }
//     addDynamicComponent() {
//       const factory = this.factoryResolver
//                           .resolveComponentFactory(DynamicComponent)
//       const component = factory
//         .create(this.rootViewContainer.parentInjector)
//       this.rootViewContainer.insert(component.hostView)
//     }
//   }