/*
 * Copyright (C) 2020 The ToastHub Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use-strict';
import React, {Component, useRef } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as workflowStepActions from './workflowstep-actions';
import fuLogger from '../../core/common/fu-logger';
import WorkflowStepView from '../../memberView/pm_workflow/workflowstep-view';
import WorkflowStepModifyView from '../../memberView/pm_workflow/workflowstep-modify-view';
import BaseContainer from '../../core/container/base-container';


class PMWorkflowStepContainer extends BaseContainer {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		if (this.props.history.location.state != null && this.props.history.location.state.parent != null) {
			this.props.actions.init({parent:this.props.history.location.state.parent,parentType:this.props.history.location.state.parentType});
		} else {
			this.props.actions.init({});
		}
	}

	getState = () => {
		return this.props.pmworkflowstep;
	}
	
	getForm = () => {
		return "PM_WORKFLOW_STEP_FORM";
	}
	
	onMoveSelect = (item) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onMoveSelect',msg:"test"});
		if (item != null) {
			this.props.actions.moveSelect({state:this.props.pmworkflowstep,item});
		}
	}
	
	onMoveSave = (code,item) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onMoveSave',msg:"test"});
		if (item != null) {
			this.props.actions.moveSave({state:this.props.pmworkflowstep,code,item});
		}
	}
	
	onMoveCancel = () => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onMoveCancel',msg:"test"});
		this.props.actions.moveCancel({state:this.props.pmworkflowstep});
	}
	
	onOption = (code, item) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onOption',msg:" code "+code});
		if (this.onOptionBase(code,item)) {
			return;
		}
		
		switch(code) {
			case 'MOVESELECT': {
				this.onMoveSelect(item);
				break;
			}
			case 'MOVEABOVE': {
				this.onMoveSave(code,item);
				break;
			}
			case 'MOVEBELOW': {
				this.onMoveSave(code,item);
				break;
			}
			case 'MOVECANCEL': {
				this.onMoveCancel();
				break;
			}
		}
	}
	
	selectChange = (selected,event) => {
		if (event.action == "remove-value") {
			this.props.actions.selectChange("REMOVE",event.name,event.removedValue.value);
		} else if (event.action == "select-option" ) {
			this.props.actions.selectChange("ADD",event.name,event.option.value);
		}
	}
	
	onBlur = (field) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onBlur',msg:field.name});
		let fieldName = field.name;
		// get field and check what to do
		if (field.optionalParams != ""){
			let optionalParams = JSON.parse(field.optionalParams);
			if (optionalParams.onBlur != null) {
				if (optionalParams.onBlur.validation != null && optionalParams.onBlur.validation == "matchField") {
					if (field.validation != "") {
						let validation = JSON.parse(field.validation);
						if (validation[optionalParams.onBlur.validation] != null && validation[optionalParams.onBlur.validation].id != null){
							if (this.props.pmworkflowstep.inputFields[validation[optionalParams.onBlur.validation].id] == this.props.pmworkflowstep.inputFields[fieldName]) {
								if (validation[optionalParams.onBlur.validation].successMsg != null) {
									let successMap = this.state.successes;
									if (successMap == null){
										successMap = {};
									}
									successMap[fieldName] = validation[optionalParams.onBlur.validation].successMsg;
									this.setState({successes:successMap, errors:null});
								}
							} else {
								if (validation[optionalParams.onBlur.validation].failMsg != null) {
									let errorMap = this.state.errors;
									if (errorMap == null){
										errorMap = {};
									}
									errorMap[fieldName] = validation[optionalParams.onBlur.validation].failMsg;
									this.setState({errors:errorMap, successes:null});
								}
							}
						}
					}
				} else if (optionalParams.onBlur.func != null) {
					
				}
			}
		}
	}

	render() {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::render',msg:"Hi there"});
		if (this.props.pmworkflowstep.isModifyOpen) {
			return (
				<WorkflowStepModifyView
				containerState={this.state}
				itemState={this.props.pmworkflowstep}
				appPrefs={this.props.appPrefs}
				onSave={this.onSave}
				onCancel={this.onCancel}
				onReturn={this.onCancel}
				inputChange={this.inputChange}
				selectChange={this.selectChange}
				onBlur={this.onBlur}/>
			);
		} else if (this.props.pmworkflowstep.items != null) {
			return (
				<WorkflowStepView
				containerState={this.state}
				itemState={this.props.pmworkflowstep}
				appPrefs={this.props.appPrefs}
				onListLimitChange={this.onListLimitChange}
				onSearchChange={this.onSearchChange}
				onSearchClick={this.onSearchClick}
				onPaginationClick={this.onPaginationClick}
				onOrderBy={this.onOrderBy}
				closeModal={this.closeModal}
				onOption={this.onOption}
				inputChange={this.inputChange}
				goBack={this.goBack}
				session={this.props.session}
				/>
			);
		} else {
			return (<div> Loading... </div>);
		}
	}
}

PMWorkflowStepContainer.propTypes = {
	appPrefs: PropTypes.object,
	actions: PropTypes.object,
	pmworkflowstep: PropTypes.object,
	session: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  return {appPrefs:state.appPrefs, pmworkflowstep:state.pmworkflowstep, session:state.session};
}

function mapDispatchToProps(dispatch) {
  return { actions:bindActionCreators(workflowStepActions,dispatch) };
}

export default connect(mapStateToProps,mapDispatchToProps)(PMWorkflowStepContainer);
