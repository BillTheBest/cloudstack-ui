import { Directionality } from '@angular/cdk/bidi';
import { ViewportRuler } from '@angular/cdk/overlay';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input, NgZone,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  ViewEncapsulation
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import {
  ErrorStateMatcher,
  fadeInContent,
  MAT_SELECT_SCROLL_STRATEGY, MatFormField, MatFormFieldControl,
  MatSelect,
  transformPanel
} from '@angular/material';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs/Subscription';
import * as uuid from 'uuid';

@Component({
  selector: 'cs-draggable-select',
  templateUrl: 'draggable-select.component.html',
  styleUrls: ['draggable-select.component.scss'],
  inputs: ['color', 'disabled', 'tabIndex'], // tslint:disable-line
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MatFormFieldControl, useExisting: DraggableSelectComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': '_ariaLabel',
    '[attr.aria-labelledby]': 'ariaLabelledby',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-owns]': '_optionIds',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.mat-select-disabled]': 'disabled',
    '[class.mat-select-invalid]': 'errorState',
    '[class.mat-select-required]': 'required',
    'class': 'mat-select',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
  animations: [
    transformPanel,
    fadeInContent
  ]
})
export class DraggableSelectComponent extends MatSelect implements AfterContentInit, OnDestroy,
  MatFormFieldControl<any> {
  @Input() public dragItems: Array<any>;
  public bagId: string = uuid.v4();

  private onDrop: Subscription;

  constructor(
    private dragula: DragulaService,
    _viewportRuler: ViewportRuler,
    _changeDetectorRef: ChangeDetectorRef,
    _ngZone: NgZone,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    renderer: Renderer2,
    elementRef: ElementRef,
    @Optional() _dir: Directionality,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() _parentFormField: MatFormField,
    @Self() @Optional() _control: NgControl,
    @Attribute('tabindex') tabIndex: string,
    @Inject(MAT_SELECT_SCROLL_STRATEGY) _scrollStrategyFactory
  ) {
    super(
      _viewportRuler,
      _changeDetectorRef,
      _ngZone,
      _defaultErrorStateMatcher,
      renderer,
      elementRef,
      _dir,
      _parentForm,
      _parentFormGroup,
      _parentFormField,
      _control,
      tabIndex,
      _scrollStrategyFactory
    );
  }

  public ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.dragula.dropModel.subscribe(() =>
      setTimeout(() => (this as any)._propagateChanges())
    );
  }

  public ngOnDestroy(): void {
    if (this.onDrop) {
      this.onDrop.unsubscribe();
    }
  }
}
