import React from 'react';
import { AppBar, Typography, Toolbar, Container, TextField, Card, CardContent, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, TextareaAutosize } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Moment from 'react-moment';

import './App.css';

import axios from 'axios';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			rows: [{
				O3WeekStartDate: "",
				O3Done: false,
				DateDone: "",
				Comments: "",
				Status: "",
			}],
			OracleId: '',
			existingDetails: [],
			superviseeList: [],
			response: null
		};
	}


	componentDidMount() {
		this.getSupervisseList();
		// this.getO3Details();
	}

	getSupervisseList() {
		const response = axios.get('/api/supervisee')
			.then(res => {
				const response = res.data;
				this.setState({ superviseeList: response });
			})
	}

	getO3SuperviseeDetails(OracleId) {
		const response = axios.get('/api/o3SuperviseeDetails/'+OracleId)
			.then(res => {
				const response = res.data;
				this.setState({ existingDetails: response });
				this.resetForm();
			});
	}


	addRow = () => {
		let rows = this.state.rows;
		rows.push({
			O3WeekStartDate: "",
			O3Done: false,
			DateDone: "",
			Comments: "",
			Status: "",
		});
		this.setState({ rows });
	}

	deleteRow = i => {
		let rows = this.state.rows;
		if (rows.length > 1) {
			rows.splice(i, 1);
			this.setState({ rows });
		}
	}


	submitValues = () => {
		const OracleId =  this.state.OracleId;
		const response = axios.post('/api/save03detail/'+OracleId, this.state.rows).then(res => {
			this.getO3SuperviseeDetails(this.state.OracleId);
			let existingDetails =  this.state.existingDetails;
			existingDetails.concat(this.state.rows);
			this.setState({ existingDetails });
			this.resetForm();
			
		});

	}

	resetForm(){
		this.setState({ rows: [] });
		this.addRow();

	}

	handleChange(i, e) {
		const { name, value } = e.target;
		let rows = [...this.state.rows];
		rows[i] = { ...rows[i], [name]: value };
		this.setState({ rows });
	}

	handleCheckBoxChange(i, e){
		const checked = e.target.checked;
		const { name, value } = e.target;
		let rows = [...this.state.rows];
		rows[i] = { ...rows[i], [name]: checked };
		this.setState({ rows });

	}
	setSupervisee = e => {
		this.setState({ OracleId: e.target.value });
		this.getO3SuperviseeDetails(e.target.value);
	}

	createUI() {
		return this.state.rows.map((row, i) => <TableRow key={i}>
			<TableCell><TextField type='date' name='O3WeekStartDate' value={row.O3WeekStartDate} onChange={this.handleChange.bind(this, i)} /></TableCell>
			<TableCell><Checkbox  checked ={row.O3Done}   color='primary' name='O3Done' value={row.O3Done} onChange={this.handleCheckBoxChange.bind(this, i)} /></TableCell>
			<TableCell>	<TextField type='date' name='DateDone' value={row.DateDone} onChange={this.handleChange.bind(this, i)} /></TableCell>
			<TableCell><TextareaAutosize name='Comments' value={row.Comments} onChange={this.handleChange.bind(this, i)} /></TableCell>
			<TableCell>
				<Select name='Status' value={row.Status} onChange={this.handleChange.bind(this, i)} style={{ minWidth: 120 }}>
					<MenuItem value='red'>Red</MenuItem>
					<MenuItem value='green'>Green</MenuItem>
					<MenuItem value='amber'>Amber</MenuItem>
				</Select></TableCell>
			<TableCell>
				{this.state.rows.length === 1 ? '' : <Button variant='contained' onClick={e => this.deleteRow(i)}> <DeleteIcon /></Button>}
			</TableCell>
		</TableRow>)
	}

	
	
	o3DetailUI() {
		return this.state.existingDetails.map((row, i) => <TableRow key={i}>
			<TableCell><label /><Moment format="YYYY-MM-DD">{row.DateDone}</Moment></TableCell>
			<TableCell>{row.O3Done === '1' ? <label>Yes</label> : <label>No</label>}</TableCell>
			<TableCell><label /> <Moment parse="YYYY-MM-DD HH:mm">
			{row.O3WeekStartDate}
		        </Moment></TableCell>
			<TableCell><label />{row.Comments}</TableCell>
			<TableCell >
			{row.Status == 'green'?
				<svg height="50" width="100">
					<circle cx="50" cy="30" r="10" stroke-width="3" fill="green" />
				</svg>
				: 
				<svg height="50" width="100">
					<circle cx="50" cy="30" r="10" stroke-width="3" fill="red" />
				</svg>
				}

			</TableCell>
			{/* <TableCell>
				<Button variant='contained' onClick={e => this.editO3Detail(i)}> <EditIcon /></Button>
			</TableCell> */}
		</TableRow>)
	}

	render() {
		const { OracleId } = this.state
		return (
			<div className='App'>
				<AppBar position='static'>
					<Toolbar>
						<Typography variant='h6'>O3 App</Typography>
					</Toolbar>
				</AppBar>
				<Container maxWidth='lg' style={{ marginTop: 16 }}>
					<Typography variant='h2'> O3 Tracker</Typography>
					<Card variant='outlined'>
						<CardContent style={{ textAlign: 'left' }}>Choose Supervisee
							<Button style={{ marginLeft: '91%' }} variant='contained' color='primary' onClick={this.addRow}>
								<AddIcon />
							</Button>

							{/* {this.superviseeDetail} */}
							<Select name='supervisee' value={OracleId} onChange={this.setSupervisee} style={{ minWidth: 120 }} >
								{this.state.superviseeList.map((item, i) =>
									<MenuItem key={item.OracleId} value={item.OracleId}>{item.EmployeeName}</MenuItem>
								)}
							</Select>
						</CardContent>
						<CardContent style={{ textAlign: 'left' }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>O3 Week</TableCell>
										<TableCell>Meeting Done?</TableCell>
										<TableCell>Meeting Date</TableCell>
										<TableCell>Discussion Comments</TableCell>
										<TableCell>Status of O3</TableCell>
										<TableCell>Action</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.createUI()}
								</TableBody>
							</Table>
						</CardContent>
						<CardContent>
							<Button style={{ marginLeft: '91%' }} color='primary' variant='contained' onClick={this.submitValues}>Submit</Button>
						</CardContent>
						<CardContent style={{ textAlign: 'left' }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>O3 Week</TableCell>
										<TableCell>Meeting Done?</TableCell>
										<TableCell>Meeting Date</TableCell>
										<TableCell>Discussion Comments</TableCell>
										<TableCell>Status</TableCell>
										{/* <TableCell>Edit</TableCell> */}
									</TableRow>
								</TableHead>
								<TableBody>
									{this.o3DetailUI()}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</Container>
			</div>
		);
	}
}

export default App;
