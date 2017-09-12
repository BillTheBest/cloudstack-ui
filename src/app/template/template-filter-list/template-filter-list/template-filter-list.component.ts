import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { OsFamily } from '../../../shared/models/os-type.model';
import { Zone } from '../../../shared/models/zone.model';
import { AuthService } from '../../../shared/services/auth.service';
import { BaseTemplateModel } from '../../shared/base/base-template.model';
import { TemplateFilters } from '../../shared/base/template-filters';
import { Iso } from '../../shared/iso/iso.model';
import { Template } from '../../shared/template/template.model';
import { InstanceGroupOrNoGroup, noGroup } from '../../../shared/components/instance-group/no-group';
import { InstanceGroup } from '../../../shared/models/instance-group.model';
import { IsoService } from '../../shared/iso/iso.service';
import { TemplateService } from '../../shared/template/template.service';


@Component({
  selector: 'cs-template-filter-list',
  templateUrl: 'template-filter-list.component.html',
  styleUrls: ['../template-filter-list.scss']
})
export class TemplateFilterListComponent implements OnChanges, OnInit {
  @Input() public templates: Array<Template>;
  @Input() public isos: Array<Iso>;

  @Input() public showDelimiter = true;
  @Input() public viewMode: string;
  @Input() public zoneId: string;
  @Output() public deleteTemplate = new EventEmitter();
  @Output() public viewModeChange = new EventEmitter();

  public fetching = false;
  public query: string;
  public selectedFilters: Array<string> = [];
  public selectedOsFamilies: Array<OsFamily> = [];
  public selectedZones: Array<Zone> = [];
  public selectedGroups: Array<InstanceGroupOrNoGroup> = [];
  public visibleTemplateList: Array<BaseTemplateModel> = [];

  public selectedGroupings = [];
  public groupings = [
    {
      key: 'zones',
      label: 'TEMPLATE_PAGE.FILTERS.GROUP_BY_ZONES',
      selector: (item: BaseTemplateModel) => item.zoneId || '',
      name: (item: BaseTemplateModel) => item.zoneName || 'TEMPLATE_PAGE.FILTERS.NO_ZONE'
    },
    {
      key: 'groups',
      label: 'TEMPLATE_PAGE.FILTERS.GROUP_BY_GROUPS',
      selector: (item: BaseTemplateModel) => item.instanceGroup ? item.instanceGroup.name : noGroup,
      name: (item: BaseTemplateModel) => item.instanceGroup ? item.instanceGroup.name : 'TEMPLATE_PAGE.FILTERS.NO_GROUP'
    }
  ];

  constructor(
    protected authService: AuthService,
    private templateService: TemplateService,
    private isoService: IsoService
  ) {}

  public ngOnInit(): void {
    this.templateService.instanceGroupUpdateObservable.subscribe(updatedTemplate => {
      this.templates = this.templates.map(template => {
        if (template.id === updatedTemplate.id) {
          return updatedTemplate;
        } else {
          return template;
        }
      });
      this.updateList();
    });

    this.isoService.instanceGroupUpdateObservable.subscribe(updatedIso => {
      this.isos = this.isos.map(iso => {
        if (iso.id === updatedIso.id) {
          return updatedIso;
        } else {
          return iso;
        }
      });
      this.updateList();
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['isos'] || changes['templates']) {
      this.updateList();
    }
  }

  public get templateList(): Array<BaseTemplateModel> {
    return this.viewMode === 'Template' ? this.templates : this.isos;
  }

  public updateList(): void {
    this.visibleTemplateList = this.templateList;
    this.filterResults();
  }

  public changeViewMode(mode: string): void {
    this.viewMode = mode;
    this.updateList();
    this.viewModeChange.emit(this.viewMode);
  }

  public filterResults(filters?: any): void {
    if (!this.templateList) {
      return;
    }

    if (filters) {
      this.selectedOsFamilies = filters.selectedOsFamilies;
      this.selectedFilters = filters.selectedFilters;
      this.selectedZones = filters.selectedZones;
      this.selectedGroups = filters.selectedGroups;
      this.query = filters.query;

      if (filters.groupings) {
        this.selectedGroupings = filters.groupings
          .map(g => this.groupings.find(_ => _ === g))
          .filter(g => g);
      }
    }

    this.visibleTemplateList = this.filterByZone(this.templateList);
    this.visibleTemplateList = this.filterByGroups(this.visibleTemplateList);
    this.visibleTemplateList = this.filterBySearch(this.visibleTemplateList);
    this.visibleTemplateList = this.filterByCategories(this.visibleTemplateList);
    if (this.zoneId) {
      this.visibleTemplateList = this.visibleTemplateList
        .filter(template => template.zoneId === this.zoneId || template.crossZones);
    }
  }

  private filterByCategories(templateList: Array<BaseTemplateModel>): Array<BaseTemplateModel> {
    const username = this.authService.user && this.authService.user.username || '';

    return templateList
      .filter(template => {
        const featuredFilter = !this.selectedFilters || !this.selectedFilters.length ||
          this.selectedFilters.includes(TemplateFilters.featured) || !template.isFeatured;
        const selfFilter = !this.selectedFilters || !this.selectedFilters.length ||
          this.selectedFilters.includes(TemplateFilters.self) ||
          !(template.account === username);
        const osFilter = !this.selectedOsFamilies || !this.selectedOsFamilies.length ||
          this.selectedOsFamilies.includes(template.osType.osFamily);
        return featuredFilter && selfFilter && osFilter;
      });
  }

  private filterBySearch(templateList: Array<BaseTemplateModel>): Array<BaseTemplateModel> {
    if (!this.query) {
      return templateList;
    }
    const queryLower = this.query.toLowerCase();
    return templateList.filter(template => {
      return template.name.toLowerCase().includes(queryLower) ||
        template.displayText.toLowerCase().includes(queryLower);
    });
  }

  private filterByZone(templateList: Array<BaseTemplateModel>): Array<BaseTemplateModel> {
    return (!this.selectedZones || !this.selectedZones.length)
      ? templateList
      : templateList.filter(template =>
        this.selectedZones.some(zone => template.zoneId === zone.id)
      );
  }

  private filterByGroups(templateList: Array<BaseTemplateModel>): Array<BaseTemplateModel> {
    if (!this.selectedGroups.length) {
      return templateList;
    }

    return templateList.filter(
      template =>
        (!template.instanceGroup && this.selectedGroups.includes(noGroup)) ||
        (template.instanceGroup &&
          this.selectedGroups.some(g => template.instanceGroup.name === (g as InstanceGroup).name))
    );
  }
}