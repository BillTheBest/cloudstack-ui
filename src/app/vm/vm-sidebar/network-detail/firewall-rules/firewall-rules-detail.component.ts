import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { SgRulesComponent } from '../../../../security-group/sg-rules/sg-rules.component';
import { SecurityGroup } from '../../../../security-group/sg.model';
import { VirtualMachine } from '../../../shared/vm.model';
import { SecurityGroupService } from '../../../../security-group/services/security-group.service';


@Component({
  selector: 'cs-firewall-rules-detail',
  templateUrl: 'firewall-rules-detail.component.html'
})
export class FirewallRulesDetailComponent {
  @Input() public vm: VirtualMachine;

  constructor(
    private dialog: MatDialog,
    private securityGroupService: SecurityGroupService
  ) {
  }

  public showRulesDialog(entity: SecurityGroup) {
    const vmId = this.vm.id;

    this.dialog.open(SgRulesComponent, <MatDialogConfig>{
      width: '880px',
      data: { entity, vmId }
    })
      .afterClosed()
      .map(updatedGroup => {
        return this.securityGroupService.onSecurityGroupUpdate.next(updatedGroup);
      });
  }
}
