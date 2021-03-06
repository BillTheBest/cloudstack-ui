import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Volume } from '../../../../../shared/models';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { VirtualMachine } from '../../../../shared/vm.model';
import { VolumeAttachmentDialogComponent } from '../volume-attchment-dialog/volume-attachment-dialog.component';


@Component({
  selector: 'cs-volume-attachment-detail',
  templateUrl: 'volume-attachment-detail.component.html',
  styleUrls: ['volume-attachment-detail.component.scss']
})
export class VolumeAttachmentDetailComponent implements OnInit {
  @Input() public virtualMachine: VirtualMachine;
  @Output() public onAttach = new EventEmitter();

  public loading: boolean;
  public selectedVolume: Volume;
  public volumes: Array<Volume>;

  constructor(
     private dialog: MatDialog,
     private volumeService: VolumeService,
     private authService: AuthService
  ) {}

  public ngOnInit(): void {
    if (!this.virtualMachine) {
      throw new Error('the virtualMachine property is missing in cs-volume-attachment-detail');
    }
    this.loadVolumes().subscribe();
    this.volumeService.onVolumeAttachment
      .subscribe(() => this.loadVolumes().subscribe());
  }

  public showDialog(): void {
    this.loadVolumes()
      .switchMap(() => {
        return this.dialog.open(VolumeAttachmentDialogComponent, {
          width: '375px',
          data: this.volumes
        }).afterClosed();
      })
      .subscribe((volume: Volume) => this.selectedVolume = volume);
  }

  public attachVolume(): void {
    this.loading = true;
    this.volumeService.attach({
      id: this.selectedVolume.id,
      virtualMachineId: this.virtualMachine.id
    })
      .finally(() => setTimeout(() => this.loading = false))
      .subscribe(() => {
        this.onAttach.next(this.selectedVolume);
        this.selectedVolume = undefined;
      });
  }

  private loadVolumes(): Observable<void> {
    return this.volumeService
      .getSpareList({ zoneId: this.virtualMachine.zoneId })
      .map(volumes => {
        this.volumes = this.authService.isAdmin()
          ? volumes
          : volumes.filter(item => item.account === this.virtualMachine.account);
      });
  }
}
