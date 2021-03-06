import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/services/auth-guard.service';
import { SecurityGroupCreationDialogComponent } from './sg-creation/security-group-creation-dialog.component';
import { SecurityGroupListComponent } from './sg-list/security-group-list.component';
import { SecurityGroupRulesDialogComponent } from './sg-rules/sg-rules-dialog.component';

export const sgRoutes: Routes = [
  {
    path: 'security-group',
    component: SecurityGroupListComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'create',
        component: SecurityGroupCreationDialogComponent
      }, {
        path: ':id',
        component: SecurityGroupRulesDialogComponent
      }
    ]
  }
];
