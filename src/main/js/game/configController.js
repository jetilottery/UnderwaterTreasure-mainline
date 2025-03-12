/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
	predefinedStyle: {
		landscape:{
			loadDiv:{
				width:960,
				height:600,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			progressBarDiv:{
				top: 480,
				left: 285,
				width:390,
				height:44,
				padding:0,
				position:'absolute'
			},
			loadingBarButton:{
				top: 3,
				left: "0%",
				width:50,
				height:37,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat',
				backgroundSize: "100% 100%"
			},
			progressDiv:{
				top: 0,
				left: 0,
				height:44,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			copyRightDiv:{
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		},
		portrait:{
			loadDiv:{
				width:600,
				height:818,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			progressBarDiv:{
				top:780,
				left:105,
				width:390,
				height:44,
				padding:0,
				position:'absolute',
			},
			loadingBarButton:{
				top: 3,
				left: "0%",
				width:50,
				height:37,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat',
				backgroundSize: "100% 100%"
			},
			progressDiv:{
				top: 0,
				left: 0,
				height:44,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			copyRightDiv:{
				width:'100%',
				textAlign:'center',
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		}
	}
});