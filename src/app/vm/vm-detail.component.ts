import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output, OnInit
} from '@angular/core';
import { VirtualMachine } from './vm.model';
import { ServiceOfferingService } from '../shared/services/service-offering.service';
import { ServiceOffering } from '../shared/models/service-offering.model';
import { ServiceOfferingSelectorComponent } from '../service-offering/service-offering-selector.component';
import { MdlDialogComponent, MdlDialogService } from 'angular2-mdl';

@Component({
  selector: 'cs-vm-detail',
  templateUrl: './vm-detail.component.html',
  styleUrls: ['./vm-detail.component.scss']
})
export class VmDetailComponent {
  @Output() public onClickOutside = new EventEmitter();
  @Input() public vm: VirtualMachine;
  @Input() @HostBinding('class.open') private isOpen;
  private expandNIC: boolean;
  private expandServiceOffering: boolean;
  private serviceOfferingSelected: string;

  constructor(
    private elementRef: ElementRef,
    private serviceOfferingService: ServiceOfferingService,
    private dialogService: MdlDialogService
  ) {
    this.expandNIC = false;
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent) {
    const target = event.target;
    if (!target || !this.isOpen || (<Element>event.target).tagName.toLowerCase() === 'span') { // fix!
      return;
    }

    const isOutside = !this.elementRef.nativeElement.contains(target);

    if (isOutside) {
      this.onClickOutside.emit();
    }
  }

  public toggleNIC() {
    this.expandNIC = !this.expandNIC;
  }

  public toggleServiceOffering() {
    this.expandServiceOffering = !this.expandServiceOffering;
  }

  public changeServiceOffering() {
    this.dialogService.showCustomDialog({
      component: ServiceOfferingSelectorComponent,
      isModal: true,
      styles: { 'width': '400px' },
      clickOutsideToClose: true,
      enterTransitionDuration: 400,
      leaveTransitionDuration: 400
    });
  }
}
