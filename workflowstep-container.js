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
import utils from '../../core/common/utils';
import moment from 'moment';


class PMWorkflowStepContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {pageName:"PM_WORKFLOW_STEP",isDeleteModalOpen: false, errors:null, warns:null, successes:null};
	}

	componentDidMount() {
		if (this.props.history.location.state != null && this.props.history.location.state.parent != null) {
			this.props.actions.init({parent:this.props.history.location.state.parent,parentType:this.props.history.location.state.parentType});
		} else {
			this.props.actions.init({});
		}
	}

	onListLimitChange = (fieldName, event) => {
		let value = 20;
		if (this.props.codeType === 'NATIVE') {
			value = event.nativeEvent.text;
		} else {
			value = event.target.value;
		}

		let listLimit = parseInt(value);
		this.props.actions.listLimit({state:this.props.pmworkflowstep,listLimit});
	}

	onPaginationClick = (value) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onPaginationClick',msg:"fieldName "+ value});
		let listStart = this.props.pmworkflowstep.listStart;
		let segmentValue = 1;
		let oldValue = 1;
		if (this.state["PM_WORKFLOW_STEP_PAGINATION"] != null && this.state["PM_WORKFLOW_STEP_PAGINATION"] != ""){
			oldValue = this.state["PM_WORKFLOW_STEP_PAGINATION"];
		}
		if (value === "prev") {
			segmentValue = oldValue - 1;
		} else if (value === "next") {
			segmentValue = oldValue + 1;
		} else {
			segmentValue = value;
		}
		listStart = ((segmentValue - 1) * this.props.pmworkflowstep.listLimit);
		this.setState({"PM_WORKFLOW_STEP_PAGINATION":segmentValue});
		
		this.props.actions.list({state:this.props.pmworkflowstep,listStart});
	}

	onSearchChange = (fieldName, event) => {
		if (event.type === 'keypress') {
			if (event.key === 'Enter') {
				this.onSearchClick(fieldName,event);
			}
		} else {
			if (this.props.codeType === 'NATIVE') {
				this.setState({[fieldName]:event.nativeEvent.text});
			} else {
				this.setState({[fieldName]:event.target.value});
			}
		}
	}

	onSearchClick = (fieldName, event) => {
		let searchCriteria = [];
		if (fieldName === 'PM_WORKFLOW_STEP-SEARCHBY') {
			if (event != null) {
				for (let o = 0; o < event.length; o++) {
					let option = {};
					option.searchValue = this.state['PM_WORKFLOW_STEP-SEARCH'];
					option.searchColumn = event[o].value;
					searchCriteria.push(option);
				}
			}
		} else {
			for (let i = 0; i < this.props.pmworkflowstep.searchCriteria.length; i++) {
				let option = {};
				option.searchValue = this.state['PM_WORKFLOW_STEP-SEARCH'];
				option.searchColumn = this.props.pmworkflowstep.searchCriteria[i].searchColumn;
				searchCriteria.push(option);
			}
		}

		this.props.actions.search({state:this.props.pmworkflowstep,searchCriteria});
	}

	onOrderBy = (selectedOption, event) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onOrderBy',msg:"id " + selectedOption});
		let orderCriteria = [];
		if (event != null) {
			for (let o = 0; o < event.length; o++) {
				let option = {};
				if (event[o].label.includes("ASC")) {
					option.orderColumn = event[o].value;
					option.orderDir = "ASC";
				} else if (event[o].label.includes("DESC")){
					option.orderColumn = event[o].value;
					option.orderDir = "DESC";
				} else {
					option.orderColumn = event[o].value;
				}
				orderCriteria.push(option);
			}
		} else {
			let option = {orderColumn:"PM_WORKFLOW_STEP_TABLE_NAME",orderDir:"ASC"};
			orderCriteria.push(option);
		}
		this.props.actions.orderBy({state:this.props.pmworkflowstep,orderCriteria});
	}
	
	onSave = () => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onSave',msg:"test"});
		let errors = utils.validateFormFields(this.props.pmworkflowstep.prefForms.PM_WORKFLOW_STEP_FORM,this.props.pmworkflowstep.inputFields);
		
		if (errors.isValid){
			this.props.actions.saveItem({state:this.props.pmworkflowstep});
		} else {
			this.setState({errors:errors.errorMap});
		}
	}
	
	onModify = (item) => {
		let id = null;
		if (item != null && item.id != null) {
			id = item.id;
		}
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onModify',msg:"test"+id});
		this.props.actions.modifyItem({id,appPrefs:this.props.appPrefs});
	}
	
	onDelete = (item) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onDelete',msg:"test"});
		this.setState({isDeleteModalOpen:false});
		if (item != null && item.id != "") {
			this.props.actions.deleteItem({state:this.props.pmworkflowstep,id:item.id});
		}
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
	
	openDeleteModal = (item) => {
		this.setState({isDeleteModalOpen:true,selected:item});
	}
	
	onMoveCancel = () => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onMoveCancel',msg:"test"});
		this.props.actions.moveCancel({state:this.props.pmworkflowstep});
	}
	
	onOption = (code, item) => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onOption',msg:" code "+code});
		switch(code) {
			case 'MODIFY': {
				this.onModify(item);
				break;
			}
			case 'DELETE': {
				this.openDeleteModal(item);
				break;
			}
			case 'DELETEFINAL': {
				this.onDelete(item);
				break;
			}
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
	
	closeModal = () => {
		this.setState({isDeleteModalOpen:false,errors:null,warns:null});
	}
	
	onCancel = () => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::onCancel',msg:"test"});
		this.props.actions.list({state:this.props.pmworkflowstep});
	}
	
	inputChange = (type,field,value,event) => {
		utils.inputChange({type,props:this.props,field,value,event});
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
	
	goBack = () => {
		fuLogger.log({level:'TRACE',loc:'WorkflowStepContainer::goBack',msg:"test"});
		this.props.history.goBack();
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
