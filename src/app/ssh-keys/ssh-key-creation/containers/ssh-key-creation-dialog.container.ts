import { Component } from '@angular/core';
import { DialogService } from '../../../dialog/dialog-service/dialog.service';
import { SshKeyCreationData } from '../../../shared/services/ssh-keypair.service';
import { Store } from '@ngrx/store';
import { State } from '../../../reducers/index';

import * as sshKeyActions from '../../redux/ssh-key.actions';
import * as fromSshKeys from '../../redux/ssh-key.reducers';

@Component({
  selector: 'cs-ssh-key-creation-dialog-container',
  template: `
    <cs-ssh-key-creation
      [isLoading]="loading$ | async"
      (onSshKeyPairCreation)="createSshKey($event)"
    >
    </cs-ssh-key-creation>`,
})
export class SShKeyCreationDialogContainerComponent {
  public loading$ = this.store.select(fromSshKeys.isLoading);

  constructor(
    public dialogService: DialogService,
    private store: Store<State>,
  ) {
  }

  public createSshKey(data: SshKeyCreationData) {
    this.store.dispatch(new sshKeyActions.CreateSshKeyPair(data));
  }
}
