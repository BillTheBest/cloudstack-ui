import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseTemplateModel } from '../shared/base-template.model';
import { ListService } from '../../shared/components/list/list.service';
import { OsType } from '../../shared/models/os-type.model';
import { Zone } from '../../shared/models/zone.model';
import { Domain } from '../../shared/models/domain.model';


@Component({
  selector: 'cs-template-page',
  templateUrl: 'template-page.component.html',
  providers: [ListService]
})
export class TemplatePageComponent implements OnInit {
  @Input() public templates: Array<BaseTemplateModel>;
  @Input() public isLoading: boolean;
  @Input() public osTypes: Array<OsType>;
  @Input() public zones: Array<Zone>;
  @Input() public viewMode: string;
  @Input() public groupings: object[];
  @Input() public accounts: Account[];
  @Input() public domains: Domain[];
  @Input() public selectedAccountIds: Account[];
  @Input() public selectedGroupings: any[];
  @Input() public selectedTypes: any[];
  @Input() public selectedZones: any[];
  @Input() public selectedOsFamilies: any[];
  @Input() public query: string;

  @Output() public onViewModeChange = new EventEmitter<string>();
  @Output() public updateList = new EventEmitter();
  @Output() public onQueryChange = new EventEmitter();
  @Output() public onSelectedAccountsChange = new EventEmitter();
  @Output() public onSelectedGroupingsChange = new EventEmitter();
  @Output() public onSelectedTypesChange = new EventEmitter();
  @Output() public onSelectedOsFamiliesChange = new EventEmitter();
  @Output() public onSelectedZonesChange = new EventEmitter();

  @Output() public onTemplateDelete = new EventEmitter();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public listService: ListService
  ) {
  }

  public ngOnInit(): void {
    this.listService.onUpdate.subscribe((template) => {
      this.updateList.emit(template);
    });
  }

  public showCreationDialog(): void {
    this.router.navigate(['./create'], {
      queryParamsHandling: 'preserve',
      relativeTo: this.activatedRoute
    });
  }
}
