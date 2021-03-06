import * as React from 'react';
import * as ReactGA from 'react-ga';
import autoBindMethods from 'class-autobind-decorator';

import { IExecution } from 'core/domain/index';
import { $state } from 'core/uirouter';

import './ExecutionBuildNumber.less';

interface IExecutionBuildNumberProps {
  execution: IExecution;
}

@autoBindMethods
export class ExecutionBuildNumber extends React.Component<IExecutionBuildNumberProps, void> {
  constructor(props: IExecutionBuildNumberProps) {
    super(props);
  }

  private handleParentPipelineClick() {
    ReactGA.event({category: 'Pipeline', action: 'Execution build number clicked - parent pipeline'});
    const toStateParams = {application: this.props.execution.trigger.parentPipelineApplication, executionId: this.props.execution.trigger.parentPipelineId};
    const toStateOptions = {inherit: false, reload: 'home.applications.application.pipelines.executionDetails'};
    $state.go('^.executionDetails.execution', toStateParams, toStateOptions);
  }

  private handleBuildInfoClick(event: React.MouseEvent<HTMLElement>) {
    ReactGA.event({category: 'Pipeline', action: 'Execution build number clicked - build info'});
    event.stopPropagation();
  }

  public render() {
    return (
      <span>
        { this.props.execution.trigger.parentPipelineId && (
          <a className="execution-build-number clickable"
             onClick={this.handleParentPipelineClick}>
            {this.props.execution.trigger.parentPipelineName}
          </a>
        )}
        { this.props.execution.buildInfo && this.props.execution.buildInfo.number && (
          <a className="execution-build-number clickable"
             onClick={this.handleBuildInfoClick}
             href={this.props.execution.buildInfo.url}
             target="_blank">
            <span className="build-label">Build</span> #{this.props.execution.buildInfo.number}
          </a>
        )}
      </span>
    );
  }
}
