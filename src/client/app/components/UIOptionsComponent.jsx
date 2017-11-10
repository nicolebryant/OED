/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Slider from 'react-rangeslider';
import moment from 'moment';
import 'react-rangeslider/lib/index.css';
import '../styles/react-rangeslider-fix.css';
import { chartTypes } from '../reducers/graph';

import ExportContainer from '../containers/ExportContainer';
import ChartSelectContainer from '../containers/ChartSelectContainer';
import ChartDataSelectContainer from '../containers/ChartDataSelectContainer';

export default class UIOptionsComponent extends React.Component {
	/**
	 * Initializes the component's state, binds all functions to 'this' UIOptionsComponent
	 * @param props The props passed down through the UIOptionsContainer
	 */
	constructor(props) {
		super(props);
		this.handleMeterSelect = this.handleMeterSelect.bind(this);
		this.handleBarDurationChange = this.handleBarDurationChange.bind(this);
		this.handleBarDurationChangeComplete = this.handleBarDurationChangeComplete.bind(this);
		this.handleChangeBarStacking = this.handleChangeBarStacking.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDateStartChange = this.handleDateStartChange.bind(this);
		this.handleDateEndChange = this.handleDateEndChange.bind(this);
		// todo: this should be in redux state
		this.state = {
			barDuration: 30, // barDuration in days
			newBaselineInfo: {
				meterID: null, // todo: never used at the moment, should be easier once in redux state
				startTS: '',
				endTS: ''
			}
		};
	}

	/**
	 * Called when this component mounts
	 * Dispatches a Redux action to fetch meter information
	 */
	componentWillMount() {
		this.props.fetchMetersDetailsIfNeeded();
	}

	/**
	 * Stores temporary barDuration until slider is released, used to update the UI of the slider
	 */
	handleBarDurationChange(value) {
		this.setState({ barDuration: value });
	}

	/**
	 * Handles a change in meter selection
	 * @param {Object[]} selection An array of {label: string, value: {type: string, id: int}} representing the current selection
	 */
	handleMeterSelect(selection) {
		this.props.selectMeters(selection.map(s => s.value));
	}

	/**
	 * Called when the user releases the slider, dispatch action on temporary state variable
	 */
	handleBarDurationChangeComplete(e) {
		e.preventDefault();
		this.props.changeDuration(moment.duration(this.state.barDuration, 'days'));
	}

	handleChangeBarStacking() {
		this.props.changeBarStacking();
	}

	handleSubmit(event) {
		event.preventDefault();
		this.props.createNewBaseline(this.state.newBaselineInfo);
	}

	handleDateStartChange(event) {
		this.setState({ newBaselineInfo: { meterID: this.state.newBaselineInfo.meterID, startTS: event.target.value, endTS: this.state.newBaselineInfo.endTS } });
	}

	handleDateEndChange(event) {
		this.setState({ newBaselineInfo: { meterID: this.state.newBaselineInfo.meterID, startTS: this.state.newBaselineInfo.startTS, endTS: event.target.value } });
	}

	/**
	 * @returns JSX to create the UI options side-panel (includes dynamic rendering of meter information for selection)
	 */
	render() {
		const labelStyle = {
			fontWeight: 'bold',
			margin: 0
		};

		const divTopPadding = {
			paddingTop: '15px'
		};

		const divBottomPadding = {
			paddingBottom: '15px'
		};

		return (
			<div style={divTopPadding}>
				<ChartSelectContainer />
				{ /* Controls specific to the bar chart. */}
				{this.props.chartToRender === chartTypes.compare &&
					<p style={divBottomPadding}>
						Note: group data cannot be used with the compare function at this time.
					</p>
				}
				<ChartDataSelectContainer />

				{/* Controls specific to the bar chart. */}
				{this.props.chartToRender === chartTypes.bar &&
				<div>
					<div className="checkbox">
						<label><input type="checkbox" onChange={this.handleChangeBarStacking} />Bar stacking</label>
					</div>
					<p style={labelStyle}>Bar chart interval (days):</p>
					<Slider
						min={1} max={365} value={this.state.barDuration}
						onChange={this.handleBarDurationChange}
						onChangeComplete={this.handleBarDurationChangeComplete}
					/>
				</div>
				}

				{/* We can't export compare data -- Don't render export button if looking at compare */}
				{this.props.chartToRender !== chartTypes.compare &&
				<ExportContainer />
				}

				<form onSubmit={this.handleSubmit}>
					Baseline Period Start:
					<input
						type="date" value={this.state.baselineDate.start}
						onChange={this.handleDateStartChange}
					/>

					Baseline Period End:
					<input
						type="date"
						value={this.state.baselineDate.end}
						onChange={this.handleDateEndChange}
					/>
					<input type="submit" value="Submit" />
				</form>
			</div>
		);
	}
}
