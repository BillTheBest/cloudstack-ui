import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'cs-list',
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.scss']
})
export class ListComponent {
  @Input() isOpen = false;
  @Output() onAction = new EventEmitter();
}
