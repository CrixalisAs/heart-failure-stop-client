import React, {
	PureComponent,
	Component
} from 'react';
import {useDispatch} from 'react-redux';
import ReactDOM from 'react-dom';
import './index.css';
import * as echarts from 'echarts';
//import 'echarts/lib/component/legend';
import 'whatwg-fetch';
import HeadImage from './images/head_bg.png';
import BackgroundImage from './images/bg.jfif';
var colors=['#ed405d','#f78c44','#cdba00','#32dd3d','#277ace','#fff015','#49bcf7','#aa55ff','#4af0ff','#ff2ff5'];
var componentKey =0;//循环生成组件时的key
export default class Chart extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			width: '100%',
			height: '100%'
		};
		this.chart = null;
	}
	async componentDidMount() {
		// 初始化图表
		await this.initChart(this.el);
		// 将传入的配置(包含数据)注入
		this.setOption(this.props.option);
		// 监听屏幕缩放，重新绘制 echart 图表
		window.addEventListener('resize', this.resize);
	}
	componentDidUpdate() {
		// 每次更新组件都重置
		this.setOption(this.props.option);
	}
	componentWillUnmount() {
		// 组件卸载前卸载图表
		this.dispose();
	}
	render() {
		const {
			width,
			height
		} = this.state;
		return ( <
			div className = "default-chart"
			ref = {
				el => (this.el = el)
			}
			style = {
				{
					width,
					height
				}
			}
			/>
		);
	}
	initChart = el => {
		// renderer 用于配置渲染方式 可以是 svg 或者 canvas
		const renderer = this.props.renderer || 'canvas';

		return new Promise(resolve => {
			setTimeout(() => {
				this.chart = echarts.init(el, null, {
					renderer,
					width: 'auto',
					height: 'auto'
				});
				resolve();
			}, 0);
		});
	};
	setOption = option => {
		if (!this.chart) {
			return;
		}

		const notMerge = this.props.notMerge;
		const lazyUpdate = this.props.lazyUpdate;

		this.chart.setOption(option, notMerge, lazyUpdate);
	};
	dispose = () => {
		if (!this.chart) {
			return;
		}

		this.chart.dispose();
		this.chart = null;
	};
	resize = () => {
		this.chart && this.chart.resize();
	};
	getInstance = () => {
		return this.chart;
	};
}

class SurvivalChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			option: this.getOption(),
			table: []
		};
		
	}
	componentDidMount(){
		fetch("../json/survivalData.json").then(res => {
			return res.json()
		}).then(result => {
			var keys=Object.keys(result[0]);
			var item=result[0];
			var option = this.getOption();
			
			const rowData = [];
			const trData = [];
			
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				const tdData = [];
				if(i===0){
					var legend=keys.slice(1);
					option.legend.data=legend;
					
					tdData.push((<th scope="col" key={componentKey++}>{key}</th>))
				}
				else{
					var data = [];
					var xData=Object.values(item[keys[0]]);
					var yData=Object.values(item[key]);
					for (let j = 0; j < xData.length; j++) {
						data.push([xData[j],yData[j]]);
					}
					if(option.series[i-1]===undefined){
						option.series.push(JSON.parse(JSON.stringify(option.series[i-2])));
					}
					option.series[i-1].data=data;
					option.series[i-1].name=key;
					option.series[i-1].itemStyle.color=colors[i-1];
					
					tdData.push((<td key={componentKey++} width="200"><span style={{background:colors[i-1]}}>{key}</span></td>))
				}
				for (let j = 0; j < item[key].length; j++) {
					tdData.push((<td key={componentKey++}>{item[key][j]}</td>))
				}
				trData.push((<tr key={componentKey++}>{tdData}</tr>));
			}
			rowData.push((<tbody key={componentKey++}>{trData}</tbody>));
			this.setState({option: option,table:rowData});
		}).catch(err => {
			console.log(err);
		})
	}
	render() {
		return ( 
				<ul className = {"clearfix"}>
					<li>
						<div className = {"boxall"} style = {{height: 400}}>
							<div className = {"alltitle"}> 生存曲线(半年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li > 
					<li>
						<div className = {"boxall"} style = {{height: 400}}>
							<div className = {"alltitle"}> 生存曲线(一年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li > 
					<li>
						<div className = {"boxall"} style = {{height: 400}}>
							<div className = {"alltitle"}> 生存曲线(两年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li > 
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>生存曲线数据(半年)</div>
							<div className={"navboxall"}>
								<table className={"table2"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>生存曲线数据(一年)</div>
							<div className={"navboxall"}>
								<table className={"table2"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>生存曲线数据(两年)</div>
							<div className={"navboxall"}>
								<table className={"table2"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
				</ul>
		);
	}
	getOption = () => {
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					lineStyle: {
						color: '#57617B'
					}
				}
			},
			legend: {
			
				//icon: 'vertical',
				data: ['Real', 'Bi-LSTM'],
				//align: 'center',
				// right: '35%',
				top: '0',
				textStyle: {
					color: "#fff"
				},
				// itemWidth: 15,
				// itemHeight: 15,
				itemGap: 20,
			},
			grid: {
				left: '25',
				right: '20',
				top: '70',
				bottom: '20',
				containLabel: true
			},
			xAxis: [{
				name: 'Time/day',
				nameLocation: 'center',
				nameGap: 25,
				nameTextStyle: {
					color: "#ffffff"
				},
				type: 'value',
				boundaryGap: false,
				axisLabel: {
					show: true,
					textStyle: {
						color: 'rgba(255,255,255,.9)'
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				max: 200
			}],
			yAxis: [{
				name: 'Percent survival',
				nameLocation: 'center',
				nameGap: 25,
				nameTextStyle: {
					color: "#ffffff"
				},
				min: 95,
				max: 100,
				axisLabel: {
					show: true,
					textStyle: {
						color: 'rgba(255,255,255,.9)'
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				}
			}],
			series: [{
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 5,
				showSymbol: false,
				itemStyle: {
					color: '#cdba00',
				},
				data:[]
			}]
		};
	}
}
class DeathChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			option: this.getOption(),
			table: []
		};
		
	}
	componentDidMount(){
		fetch("../json/deathData.json").then(res => {
			return res.json()
		}).then(result => {
			var keys=Object.keys(result[0]);
			var item=result[0];
			var option = this.getOption();
			
			const rowData = [];
			const trData = [];
			
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if(i===0){
					var legend=keys.slice(1);
					option.legend.data=legend;
				}
				else{
					var yData=Object.values(item[key]);
					if(option.series[0].data[i-1]===undefined){
						option.series[0].data.push(JSON.parse(JSON.stringify(option.series[0].data[i-2])));
					}
					option.series[0].data[i-1].value=yData;
					option.series[0].data[i-1].name=key;
				}
			}
			rowData.push((<tbody>{trData}</tbody>));
			this.setState({option: option,table:rowData});
		}).catch(err => {
			console.log(err);
		})
	}
	render() {
		return ( 
				<ul className = {"clearfix"}>
					<li>
						<div className = {"boxall"} style = {{height: 400}}>
							<div className = {"alltitle"}> 死亡比例雷达图 </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
				</ul>
		);
	}
	getOption = () => {
		return {
			color: ["rgba(255, 69, 37, 1)", "rgba(56, 142, 255, 1)", "rgba(119, 255, 61, 1)"],
			tooltip: {
				trigger: 'axis'
			},
			legend: {
				left: 'center',
				data: ['半年', '一年', '两年'],
				textStyle: {
					color: 'rgba(255,255,255,1)',
				}
			},
			radar: [{
				indicator: [{
						text: 'Samples',
						max: 2500,
						color: 'rgba(255,255,255,1)',
					},
					{
						text: 'Average visits',
						max: 5,
						color: 'rgba(255,255,255,1)',
					},
					{
						text: 'Death',
						max: 1000,
						color: 'rgba(255,255,255,1)',
					},
					{
						text: 'Death rate(%)',
						max: 100,
						color: 'rgba(255,255,255,1)',
					}
				],
				center: ['50%', '50%'],
				radius: '70%'
			}],
			series: [{
				type: 'radar',
				tooltip: {
					trigger: 'item'
				},
				data: [{
						value: [2017, 4.88, 325, 4.36],
						name: '半年',
						areaStyle: {
							color: "rgba(240, 249, 255, .5)"
						},
					},
				]
			}]
		};
	}
}
class RelationChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			option: this.getOption(),
			table: []
		};
		
	}
	componentDidMount(){
		fetch("../json/relationData.json").then(res => {
			return res.json()
		}).then(result => {
			var keys=Object.keys(result[0]);
			var item=result[0];
			var option = this.getOption();
			
			const rowData = [];
			const trData = [];
			var tdData = [];
			
			option.xAxis.data=item[keys[0]];
			option.yAxis.data=item[keys[1]];
			option.series[0].data=item[keys[2]];
			
			for (let i = 0; i < item[keys[0]].length; i++) {
				tdData.push((<th scope="col" key={componentKey++}>{item[keys[0]][i]}</th>));
			}
			trData.push((<tr key={componentKey++}><th scope="col">Relation</th>{tdData}</tr>));
			for (let i = 0; i < item[keys[1]].length; i++) {
				tdData = [];
				tdData.push((<td key={componentKey++}><span style={{background:colors[i]}}>{item[keys[1]][i]}</span></td>));
				for (let j = i*item[keys[0]].length; j < (i+1)*item[keys[0]].length; j++) {
					tdData.push((<td key={componentKey++}>{item[keys[2]][j][2]}</td>));
				}
				trData.push((<tr key={componentKey++}>{tdData}</tr>));
			}
			rowData.push((<tbody key={componentKey++}>{trData}</tbody>));
			
			this.setState({option: option,table:rowData});
		}).catch(err => {
			console.log(err);
		})
	}
	render() {
		return ( 
				<ul className = {"clearfix"}>
					<li>
						<div className = {"boxall"} style = {{height: 500}}>
							<div className = {"alltitle"}> 风险因素之间的关系(半年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
					<li>
						<div className = {"boxall"} style = {{height: 500}}>
							<div className = {"alltitle"}> 风险因素之间的关系(一年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
					<li>
						<div className = {"boxall"} style = {{height: 500}}>
							<div className = {"alltitle"}> 风险因素之间的关系(两年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>风险因素之间的关系(半年)</div>
							<div className={"navboxall"}>
								<table className={"table1"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>风险因素之间的关系(一年)</div>
							<div className={"navboxall"}>
								<table className={"table1"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>风险因素之间的关系(两年)</div>
							<div className={"navboxall"}>
								<table className={"table1"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
				</ul>
		);
	}
	getOption = () => {
		return {
			tooltip: {
				position: 'top'
			},
			animation: false,
			grid: {
				top: '50',
				left: '90',
				bottom: '90'
			},
			xAxis: {
				type: 'category',
				axisLabel: {
					show: true,
					rotate: 90,
					textStyle: {
						color: 'rgba(255,255,255,1)',
						fontSize: 10,
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				data: [],
				splitArea: {
					show: true
				}
			},
			yAxis: {
				type: 'category',
				axisLabel: {
					show: true,
					textStyle: {
						color: 'rgba(255,255,255,1)',
						fontSize: 10,
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				data: [],
				splitArea: {
					show: true
				}
			},
			visualMap: {
				min: -1,
				max: 15,
				calculable: true,
				orient: 'horizontal',
				textGap: 100,
				top: '0',
				right: 'center',
				textStyle: {
					color: 'rgba(255,255,255,.6)',
					fontSize: 10,
				}
			},
			series: [{
				name: 'Punch Card',
				type: 'heatmap',
				data: [],
				label: {
					show: true
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				}
			}]
		};
	}
}
class HazardsChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			option: this.getOption(),
			table: []
		};
		
	}
	componentDidMount(){
		fetch("../json/hazardsData.json").then(res => {
			return res.json()
		}).then(result => {
			var keys=Object.keys(result[0]);
			var item=result[0];
			var option = this.getOption();
			
			const rowData = [];
			const trData = [];
			
			option.xAxis[0].data=item[keys[0]];
			option.series[0].data=item[keys[1]];
			
			trData.push((<tr key={componentKey++}><th scope="col">hazards ratio</th><th scope="col">value</th><th scope="col">start</th><th scope="col">end</th></tr>));
			for (let i = 1; i < item[keys[0]].length; i++) {
				const tdData = [];
				tdData.push((<td key={componentKey++}><span style={{background:colors[i-1]}}>{item[keys[0]][i]}</span></td>));
				for (let j = 0; j < 3; j++) {
					tdData.push((<td key={componentKey++}>{item[keys[1]][i][j+1]}</td>));
				}
				trData.push((<tr key={componentKey++}>{tdData}</tr>));
			}
			rowData.push((<tbody key={componentKey++}>{trData}</tbody>));
			
			this.setState({option: option,table:rowData});
		}).catch(err => {
			console.log(err);
		})
	}
	render() {
		return ( 
				<ul className = {"clearfix"}>
					<li>
						<div className = {"boxall"} style = {{height: 500}}>
							<div className = {"alltitle"}> hazards ratio(半年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
					<li>
						<div className = {"boxall"} style = {{height: 500}}>
							<div className = {"alltitle"}> hazards ratio(一年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
					<li>
						<div className = {"boxall"} style = {{height: 500}}>
							<div className = {"alltitle"}> hazards ratio(两年) </div> 
							<div className = {"navboxall"}>
								<Chart option = {this.state.option}/> 
							</div> 
						</div> 
					</li >
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>hazards ratio(半年)</div>
							<div className={"navboxall"}>
								<table className={"table2"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>hazards ratio(一年)</div>
							<div className={"navboxall"}>
								<table className={"table2"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>hazards ratio(两年)</div>
							<div className={"navboxall"}>
								<table className={"table2"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
				</ul>
		);
	}
	getOption = () => {
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					lineStyle: {
						color: '#2a7b45'
					}
				}
			},
			grid: [{
				top: 20,
				bottom: '30%'
			}],
			xAxis: [{
				name: 'HR(95% CI)',
				nameLocation: 'center',
				nameGap: 120,
				nameTextStyle: {
					color: "#ffffff"
				},
				type: 'category',
				boundaryGap: false,
				axisLabel: {
					show: true,
					rotate: 90,
					textStyle: {
						color: 'rgba(255,255,255,.9)'
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				data: []
			}],
			yAxis: [{
				name: 'Mortality less likely      Mortality more likely                                                   ',
				nameLocation: 'center',
				nameGap: 25,
				nameTextStyle: {
					color: "#ffffff"
				},
				max: 6,
				interval: 1,
				axisLabel: {
					show: true,
					rotate: 90,
					textStyle: {
						color: 'rgba(255,255,255,.9)'
					}
				},
				axisLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(255,255,255,.1)'
					}
				},
				axisPointer: {
					lineStyle: {
						width: 10
					}
				}
			}],
			series: [{
				type: 'k',
				data: [],
				lineStyle: {
					normal: {
						width: 2
					}
				},
				itemStyle: {
					normal: {
						color: '#ff0000',
						borderColor: 'rgba(255,0,0,1)',
						color0: '#ff0000',
						borderColor0: 'rgba(255,0,0,1)',
						borderWidth: 3
					}
				},
				barWidth: 10,
				markLine: {
					symbol: ['none', 'none'], //去掉箭头
					lineStyle: {
						type: 'solid',
						color: 'blue',
						width: 2
					},
					label: {
						show: false,
						position: 'left'
					},
					data: [{
							name: 'Y 轴值为 1 的水平线',
							yAxis: 1,
						},
						[{
								name: '标线1起点',
								value: 10,
								x: 0,
								y: 1
							},
							{
								name: '标线1终点',
								y: 1
							}
						]
					]
				}
			}]
		};
	}
}
class FeatureChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			table: []
		};
		
	}
	componentDidMount(){
		fetch("../json/baseData.json").then(res => {
			return res.json()
		}).then(result => {
			var keys=Object.keys(result[0]);
			var item=result[0];
			
			const rowData = [];
			const trData = [];
			var tdData = [];
			
			var colCount = 17;
			for (var i = 0; i < keys.length/colCount; i++) {
				tdData = [];
				for (let j = i*colCount; j < Math.min((i+1)*colCount,keys.length); j++) {
					tdData.push((<td key={componentKey++}>{keys[j]}</td>));
				}
				trData.push((<tr key={componentKey++}>{tdData}</tr>));
				tdData = [];
				for (let j = i*colCount; j < Math.min((i+1)*colCount,keys.length); j++) {
					tdData.push((<td key={componentKey++}>{item[keys[j]]}</td>));
				}
				trData.push((<tr key={componentKey++}>{tdData}</tr>));
			}
			rowData.push((<tbody key={componentKey++}>{trData}</tbody>));
			
			this.setState({table:rowData});
		}).catch(err => {
			console.log(err);
		})
	}
	render() {
		return ( 
				<ul className = {"clearfix"}>
					<li>
						<div className={"boxall"} style={{width:"100%"}}>
							<div className={"alltitle"}>hazards ratio(半年)</div>
							<div className={"navboxall"}>
								<table className={"table1"}>
								{
									this.state.table
								}
								</table>
							</div>
						</div>
					</li>
				</ul>
		);
	}
}
var backgoundStyle = {
	backgroundImage: `url(${BackgroundImage})`,
	backgroundSize: "cover",
	width:"100%"
};
var headStyle = {
	backgroundImage: `url(${HeadImage})`,
};				
ReactDOM.render( 
	<div style={backgoundStyle}>
		<div className={"head"} style={headStyle}>
			<div className={"weather"}><span id="showTime">浙江大学-生物医学工程-陈镇东</span></div>
			<h1>心衰分析可视化展示</h1>
		</div>
		<div className = {"mainbox"} >
			<SurvivalChart />
			<DeathChart />
			<RelationChart />
			<HazardsChart />
			<FeatureChart />
		</div>
	</div>,
	document.getElementById('root')
);
//ReactDOM.unmountComponentAtNode(document.getElementById('root'));