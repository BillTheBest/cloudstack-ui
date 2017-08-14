import { Component, Injectable, Injector } from '@angular/core';
import {
  async,
  discardPeriodicTasks,
  fakeAsync,
  getTestBed,
  TestBed
} from '@angular/core/testing';
import { BaseRequestOptions, Http, HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { NavigationExtras, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { MockCacheService } from '../../../testutils/mocks/mock-cache.service.mock';
import { AsyncJobService } from './async-job.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { ConfigService } from './config.service';
import { ErrorService } from './error.service';
import { LocalStorageService } from './local-storage.service';

import { RouterUtilsService } from './router-utils.service';
import { ServiceLocator } from './service-locator';
import { UserService } from './user.service';


@Component({
  selector: 'cs-test-view',
  template: '<div></div>'
})
class TestViewComponent {
}

@Injectable()
class MockErrorService {
  public send(): void {
  }
}

class Tag {
  constructor(
    public key: string,
    public value: string
  ) {
  }
}

@Injectable()
class MockUserService {
  private tags = [];

  public getList(): Observable<any> {
    return Observable.of(null);
  }

  public readTag(key: string): Observable<string> {
    const result = this.tags.find(tag => tag.key === key);
    return Observable.of(result && result.value || null);
  }

  public writeTag(key: string, value: string): Observable<void> {
    this.tags.push(new Tag(key, value));
    return Observable.of(null);
  }
}

@Injectable()
class MockStorageService {
  private storage = {};

  public write(key: string, value: string): void {
    this.storage[key] = value;
  }

  public read(key: string): string {
    return this.storage[key] || null;
  }

  public remove(key: string): void {
    delete this.storage[key];
  }

  public resetInMemoryStorage(): void {
    this.storage = {};
  }
}

const configStorage = {};

function getRefreshInterval(): number {
  return +configStorage['sessionRefreshInterval'] * 1000;
}

function setRefreshInterval(value: number): void {
  configStorage['sessionRefreshInterval'] = value;
}

@Injectable()
class MockConfigService {
  public get (key: string): string {
    return configStorage[key];
  }
}

@Injectable()
class MockAsyncJobService {
  public completeAllJobs(): void {
  }
}

@Injectable()
class MockRouter {
  public navigate(route: any): Promise<any> {
    return Promise.resolve(route);
  }
}

@Injectable()
class MockRouterUtilsService {
  public get locationOrigin(): string {
    return '';
  }

  public getRedirectionQueryParams(next?: string): NavigationExtras {
    return { queryParams: { next } };
  }
}

const testBedConfig = {
  declarations: [TestViewComponent],
  providers: [
    AuthService,
    MockBackend,
    BaseRequestOptions,
    { provide: AsyncJobService, useClass: MockAsyncJobService },
    { provide: CacheService, useClass: MockCacheService },
    { provide: ConfigService, useClass: MockConfigService },
    { provide: ErrorService, useClass: MockErrorService },
    { provide: UserService, useClass: MockUserService },
    { provide: Router, useClass: MockRouter },
    { provide: RouterUtilsService, useClass: MockRouterUtilsService },
    { provide: LocalStorageService, useClass: MockStorageService },
    {
      provide: Http,
      deps: [MockBackend, BaseRequestOptions],
      useFactory:
        (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
          return new Http(backend, defaultOptions);
        },
    },
    Injector
  ],
  imports: [
    HttpModule
  ]
};

describe('Auth service session', () => {
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(async(() => {
    TestBed.configureTestingModule(testBedConfig);

    ServiceLocator.injector = getTestBed().get(Injector);
    authService = TestBed.get(AuthService);
    configService = TestBed.get(ConfigService);
  }));

  it('should set inactivity timeout', () => {
    authService.getInactivityTimeout()
      .subscribe(timeout => expect(timeout).toBe(0));
    authService.setInactivityTimeout(1)
      .switchMapTo(authService.getInactivityTimeout())
      .subscribe(timeout => expect(timeout).toBe(1));
  });

  it('should refresh session', fakeAsync(() => {
    jest.useFakeTimers();
    const refresh = jest.spyOn(authService, 'sendRefreshRequest');
    const inactivityTimeout = 10;
    const refreshInterval = 60;

    setRefreshInterval(refreshInterval);
    authService.setInactivityTimeout(inactivityTimeout).subscribe();

    jest.runTimersToTime(getRefreshInterval() * inactivityTimeout * 60 / refreshInterval);
    expect(refresh).toHaveBeenCalledTimes(inactivityTimeout - 1);
    jest.useRealTimers();
    refresh.mockRestore();
    jest.resetAllMocks();
  }));

  it('should stop refreshing if inactivity interval=0', fakeAsync(() => {
    jest.useFakeTimers();
    const refresh = jest.spyOn(authService, 'sendRefreshRequest');
    const inactivityTimeout = 10;

    authService.setInactivityTimeout(inactivityTimeout).subscribe();
    setRefreshInterval(60);
    jest.runTimersToTime(getRefreshInterval());
    expect(refresh).toHaveBeenCalledTimes(1);
    authService.setInactivityTimeout(0).subscribe();
    jest.runTimersToTime(getRefreshInterval() * 10);
    expect(refresh).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
    refresh.mockRestore();
  }));

  it('should extend logout delay on user input', fakeAsync(() => {
    jest.useFakeTimers();
    const logout = jest.spyOn(authService, 'logout')
      .mockImplementation(() => Observable.of(null));
    authService.setInactivityTimeout(1).subscribe();
    jest.runTimersToTime(getRefreshInterval() - 100);
    document.dispatchEvent(new MouseEvent('mousemove', {}));
    jest.runTimersToTime(200);
    expect(logout).toHaveBeenCalledTimes(0);
    discardPeriodicTasks();
    jest.useRealTimers();
    // logout.mockRestore();
    (authService.logout as any).mockRestore();
    jest.resetAllMocks();
  }));
});

describe('Auth service session', () => {
  let authService: AuthService;
  let configService: ConfigService;
  let router: Router;
  let routerUtils: RouterUtilsService;
  const refreshInterval = 1;

  beforeEach(async(() => {
    setRefreshInterval(refreshInterval);
    TestBed.configureTestingModule(testBedConfig);

    ServiceLocator.injector = getTestBed().get(Injector);
    authService = TestBed.get(AuthService);
    configService = TestBed.get(ConfigService);
    router = TestBed.get(Router);
    routerUtils = TestBed.get(RouterUtilsService);
  }));

  it('should logout after session expires', fakeAsync(() => {
    jest.useFakeTimers();
    const inactivityTimeout = 10;
    const logout = jest.spyOn(router, 'navigate');
    const refresh = jest.spyOn(authService, 'sendRefreshRequest');
    authService.startInactivityCounter();
    authService.setInactivityTimeout(inactivityTimeout).subscribe();

    jest.runTimersToTime(getRefreshInterval() * (inactivityTimeout - 1) * 60 / refreshInterval);
    expect(refresh).toHaveBeenCalledTimes(540);
    expect(logout).toHaveBeenCalledTimes(0);

    jest.runTimersToTime(getRefreshInterval() * 60);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout)
      .toHaveBeenCalledWith(['/logout'], routerUtils.getRedirectionQueryParams());
    jest.useRealTimers();
    refresh.mockRestore();
  }));
});
