import {isDate, isObject, isUndefined} from 'lodash';
import {module} from 'angular';

import {IStateService} from 'angular-ui-router';

export interface IUrlBuilderInput {
  account: string;
  application: string;
  cluster: string;
  detail?: string;
  instanceId?: string;
  loadBalancer?: string;
  name?: string;
  project?: string;
  provider?: string;
  region?: string;
  serverGroup?: string;
  stack?: string;
  taskId?: string;
  type: string;
  vpcId?: string;
}

export interface ITask {
  name: string;
  getValueFor: (key: string) => any;
}

interface IParams {
  [key: string]: any;
}

interface IUrlBuilder {
  build: (input: IUrlBuilderInput) => string;
}

interface IClusterFilter {
  acct: string;
  q?: string;
  reg?: string;
  stack?: string;
}

class UrlBuilderUtils {

  private static forEachSorted(obj: any, iterator: Function, context: any = undefined): void {
    const keys: string[] = Object.keys(obj).sort();
    keys.forEach((key: string) => {
      iterator.call(context, obj[key], key);
    });
  }

  private static encodeUriQuery(value: string): string {
    return encodeURIComponent(value)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%20/g, '+');
  }

  public static buildUrl(url: string, params: IParams = {}): string {

    if (!params) {
      return url;
    }

    const parts: string[] = [];
    UrlBuilderUtils.forEachSorted(params, (value: any, key: string) => {
      if (value === null || isUndefined(value)) {
        return;
      }

      let val: any[];
      if (Array.isArray(value)) {
        val = value;
      } else {
        val = [value];
      }

      val.forEach((v: any) => {
        if (isObject(v)) {
          if (isDate(v)) {
            v = (<Date>v).toISOString();
          } else {
            v = JSON.stringify(v);
          }
        }

        parts.push(`${UrlBuilderUtils.encodeUriQuery(key)}=${UrlBuilderUtils.encodeUriQuery(v)}`);
      });
    });

    if (parts.length > 0) {
      url += (url.includes('?') ? '&' : '?') + parts.join('&');
    }

    return url;
  }
}

class ApplicationsUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {

    let result: string;
    if (input.project) {
      result = this.$state.href(
        'home.project.application.insight.clusters',
        {application: input.application, project: input.project},
        {inherit: false}
      );
    } else {
      result = this.$state.href(
        'home.applications.application.insight.clusters',
        {
          application: input.application,
        },
        {inherit: false}
      );
    }

    return result;
  }
}

class ClustersUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {

    const filters: IClusterFilter = {
      acct: input.account
    };
    if (input.cluster) {
      filters.q = `cluster:${input.cluster}`;
    }
    if (input.stack) {
      filters.stack = input.stack;
    }
    if (input.detail) {
      filters.q = `detail:${input.detail}`;
    }
    if (input.region) {
      filters.reg = input.region;
    }

    let href: string;
    if (input.project) {
      href = this.$state.href('home.project.application.insight.clusters',
        {
          application: input.application,
          project: input.project,
        },
        {inherit: false}
      );
    } else {
      href = this.$state.href(
        'home.applications.application.insight.clusters',
        {
          application: input.application,
        },
        {inherit: false}
      );
    }

    return UrlBuilderUtils.buildUrl(href, filters);
  }
}

class InstancesUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {

    let result: string;
    if (!input.application) {
      result = this.$state.href('home.instanceDetails',
        {
          account: input.account,
          region: input.region,
          instanceId: input.instanceId,
          provider: input.provider,
        }
      );
    } else {
      const href: string = this.$state.href(
        'home.applications.application.insight.clusters.instanceDetails',
        {
          application: input.application,
          instanceId: input.instanceId,
          provider: input.provider,
        },
        {inherit: false}
      );
      result = UrlBuilderUtils.buildUrl(href, {q: input.serverGroup, acct: input.account, reg: input.region});
    }

    return result;
  }
}

class LoadBalancersUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {

    const href: string = this.$state.href(
      'home.applications.application.insight.loadBalancers.loadBalancerDetails',
      {
        application: input.application,
        name: input.loadBalancer,
        region: input.region,
        accountId: input.account,
        vpcId: input.vpcId,
        provider: input.provider,
      },
      {inherit: false}
    );

    return UrlBuilderUtils.buildUrl(href, {q: input.loadBalancer, reg: input.region, acct: input.account});
  }
}

class ProjectsUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {
    return this.$state.href('home.project.dashboard', {project: input.name}, {inherit: false});
  }
}

class SecurityGroupsUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {
    const href: string = this.$state.href(
      'home.securityGroupDetails',
      {
        accountId: input.account,
        region: input.region,
        name: input.name,
        vpcId: input.vpcId,
        provider: input.provider,
      }
    );

    return UrlBuilderUtils.buildUrl(href);
  }
}

class ServerGroupsUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {
    const baseName: string = input.project ? 'project' : 'applications';
    const href: string = this.$state.href(
      `home.${baseName}.application.insight.clusters.serverGroup`,
      {
        application: input.application,
        accountId: input.account,
        region: input.region,
        serverGroup: input.serverGroup,
        provider: input.provider,
        project: input.project,
      },
      {inherit: false}
    );

    return UrlBuilderUtils.buildUrl(href, {q: input.serverGroup, acct: input.account, reg: input.region});
  }
}

class TaskUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {
    return this.$state.href(
      'home.applications.application.tasks.taskDetails',
      {
        application: input.application,
        taskId: input.taskId
      },
      {inherit: false}
    );
  }
}

class TasksUrlBuilder implements IUrlBuilder {

  constructor(private $state: IStateService) {}

  public build(input: IUrlBuilderInput) {
    return this.$state.href(
      'home.applications.application.tasks',
      {
        application: input.application,
      },
      {inherit: false}
    );
  }
}

export class UrlBuilderService {

  static get $inject(): string[] {
    return ['$state'];
  }

  private static PUSH_VERSION: RegExp = /-v\d+$/;
  private registry: Map<string, IUrlBuilder> = new Map<string, IUrlBuilder>();

  private createCloneTask(task: ITask): string | boolean {
    const regionAndName: any = task.getValueFor('deploy.server.groups');
    const account: string = task.getValueFor('deploy.account.name');

    let result: string | boolean;
    if (!regionAndName || !Object.keys(regionAndName)[0]) {
      result = false;
    } else {

      const regions: string[] = Object.keys(regionAndName);
      const region: string = regions[0];
      const asgName: string = regionAndName[region][0];
      if (!asgName) {
        result = false;
      } else if (!asgName.match(UrlBuilderService.PUSH_VERSION)) {
        result = false;
      } else {
        result = this.$state.href(
          'home.applications.application.insight.clusters.serverGroup',
          {
            application: asgName.split('-')[0],
            cluster: asgName.replace(UrlBuilderService.PUSH_VERSION, ''),
            account,
            accountId: account,
            region: regions,
            serverGroup: asgName,
            q: asgName
          });
      }
    }

    return result;
  }

  private asgTask(task: ITask): string | boolean {
    const asgName: string = task.getValueFor('asgName');
    const account: string = task.getValueFor('credentials');

    let result: string | boolean;
    if (!asgName) {
      result = false;
    } else if (!asgName.match(UrlBuilderService.PUSH_VERSION)) {
      result = '/';
    } else {
      result = this.$state.href(
        'home.applications.application.insight.clusters.serverGroup',
        {
          application: asgName.split('-')[0],
          cluster: asgName.replace(UrlBuilderService.PUSH_VERSION, ''),
          account,
          accountId: account,
          region: task.getValueFor('regions')[0],
          serverGroup: asgName,
        });
    }

    return result;
  }

  constructor(private $state: IStateService) {
    this.registry.set('applications', new ApplicationsUrlBuilder($state));
    this.registry.set('clusters', new ClustersUrlBuilder($state));
    this.registry.set('instances', new InstancesUrlBuilder($state));
    this.registry.set('loadBalancers', new LoadBalancersUrlBuilder($state));
    this.registry.set('projects', new ProjectsUrlBuilder($state));
    this.registry.set('securityGroups', new SecurityGroupsUrlBuilder($state));
    this.registry.set('serverGroups', new ServerGroupsUrlBuilder($state));
    this.registry.set('task', new TaskUrlBuilder($state));
    this.registry.set('tasks', new TasksUrlBuilder($state));
  }

  public buildFromMetadata(input: IUrlBuilderInput) {

    const builder: IUrlBuilder = this.registry.get(input.type);
    let result: string;
    if (builder) {
      result = builder.build(input);
    } else {
      result = '/';
    }

    return result;
  }

  public buildFromTask(task: ITask): string | boolean {

    const description: string = task.name || '';
    function contains(str: string): boolean {
      return description.includes(str);
    }

    let result: string | boolean;
    switch (true) {
      case contains('Destroy Server Group'):
        result = false;
        break;
      case contains('Disable Server Group'):
        result = this.asgTask(task);
        break;
      case contains('Enable Server Group'):
        result = this.asgTask(task);
        break;
      case contains('Resize Server Group'):
        result = this.asgTask(task);
        break;
      case contains('Create Cloned Server Group'):
        result = this.createCloneTask(task);
        break;
      case contains('Create New Server Group'):
        result = this.createCloneTask(task);
        break;
      default:
        result = false;
    }

    return result;
  }
}

export const URL_BUILDER_SERVICE = 'spinnaker.core.navigation.urlBuilder.service';
module(URL_BUILDER_SERVICE, [require('angular-ui-router')])
  .service('urlBuilderService', UrlBuilderService);
