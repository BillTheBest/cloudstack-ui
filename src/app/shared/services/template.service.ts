import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Template } from '../models';
import { BackendResource } from '../decorators/backend-resource.decorator';
import { BaseBackendService } from './base-backend.service';

interface TemplateRequestParams {
  templatefilter: string;
  [propName: string]: any;
}

@Injectable()
@BackendResource({
  entity: 'Template',
  entityModel: Template
})
export class TemplateService extends BaseBackendService<Template> {
  private templates: Object;
  private _templateFilters: Array<string>;

  constructor () {
    super();
    this.templates = {};
    this._templateFilters = ['featured', 'selfexecutable', 'community', 'sharedexecutable'];
  }

  public get templateFilters(): Array<string> {
    return this._templateFilters;
  }

  public get(id: string, params?: TemplateRequestParams): Observable<Template> {
    const templatefilter = params.templatefilter ? params.templatefilter : 'featured';
    return this.getList({ templatefilter, id })
      .map(data => data[0])
      .catch(error => Observable.throw(error));
  }

  public getList(params: TemplateRequestParams): Observable<Array<Template>> {
    if (this.templates.hasOwnProperty(params.templatefilter)) {
      return Observable.of(this.templates[params.templatefilter]);
    }

    let filter = params.templatefilter;
    return super.getList(params)
      .map(data => this.templates[filter] = data);
  }

  public getGroupedTemplates(params?: {}, templatefilters?: Array<string>): Observable<Object> {
    let _params = {};
    let localTemplateFilters = this._templateFilters;
    if (templatefilters) {
      localTemplateFilters = templatefilters;
    }
    if (params) {
      _params = params;
    }

    let templateObservables = [];
    for (let filter of localTemplateFilters) {
      _params['templatefilter'] = filter;
      templateObservables.push(this.getList(_params as TemplateRequestParams));
    }

    return Observable.forkJoin(templateObservables)
      .map(data => {
        let obj = {};
        data.forEach((templateSet, i) => {
          obj[localTemplateFilters[i]] = templateSet;
        });
        return obj;
      });
  }

  public getDefault(): Observable<Template> {
    return this.getGroupedTemplates()
      .map(data => {
        for (let filter of this._templateFilters) {
          if (data.hasOwnProperty(filter)) {
            if (data[filter].length > 0) {
              return data[filter][0];
            }
          }
        }
      })
      .catch(() => Observable.throw(0));
  }
}
