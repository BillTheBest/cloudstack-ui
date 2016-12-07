import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { NotificationService } from '../notification.service';

import 'rxjs/add/operator/toPromise';

import { Zone } from '../models/zone.model';
import { BaseBackendService } from './base-backend.service';
import { BackendResource } from '../decorators/backend-resource.decorator';


@Injectable()
@BackendResource({
  entity: 'Zone',
  entityModel: Zone
})
export class ZoneService extends BaseBackendService<Zone> {
  constructor(http: Http, notification: NotificationService) {
    super(http, notification);
  }
}
