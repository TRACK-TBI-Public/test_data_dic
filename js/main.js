/* 
	
	Main JavaScript Module 
	Project: TRACK-TBI
	Author: Leonya Ivanov
	Copyright(c) Rancho BioSciences
	Release: Oct 2021
	
*/

/* GENERAL DECLARATIONS */

const fileName='track_tbi_export';
const maxLevel=5;
const fields=['Core Assignment','Forms','Tables'];
const fieldNames=['Core Assignment','FormName','TableName'];	
const locations_file='./data_list.json';
const SelMesBeg='Select <b>';
const SelMesEnd=' </b>from the Dropdown Menu or use the <b>Searchbox</b> for fields/display names';
const dataBeg='<span class="infospan" onclick="itoggle(event,$(this));">'+'<i class="material-icons infoicon">info</i></span>';
const infoTag="div"; 
const infoDiv='<div class="infodiv" style="display:none;">';	
const infoEnd='</div>';
var counts=[];
const highSpan='<span class="high">';

/* HELPER FUNCTIONS */

/* date for exportfile */
function today() {
	var d = new Date();

	var month = d.getMonth()+1;
	var day = d.getDate();

	return d.getFullYear() + '/' +
    (month<10 ? '0' : '') + month + '/' +
    (day<10 ? '0' : '') + day;	
}


/* replace all ocurences of a string */
function replaceAll(str, search, replace) {
  return str.toString().split(search).join(replace);
}


/*  all ocurences of a string */
function getAllTween(str,b,e) {
	var result = str.match(new RegExp(b + "(.*)" + e));	
    return result;
}


/*  find string between 2 strings */
function strTween(str,b,e) {
	return str.substring( str.lastIndexOf(b) + 1, str.lastIndexOf(e));
}


/* is object empty? */
function objEmpty(obj) {
	return (Object.keys(obj).length === 0 && obj.constructor === Object);
}


/* activate search on enter key */
function search(el) { if(event.key === 'Enter' ) { window.location.href='/?q='+el.value; }
}


/* extract data fields via regex */
function matchFields (str) {
	let reg =/{{([^}]*)}}/g;
	let result = str.match(reg);
	return result;
}


/* get search term from URL */
function getTerm(){
	var term=[];
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	term['q']=urlParams.get('q');
	term['t']=urlParams.get('t');
	term['c']=urlParams.get('c');
	if ( !term['c']) { term['c']='0'; }
	return term;
}


/* is string JSON? */
function isJS(js) {
	return JSON.stringify(js).includes('{');
}


/* open table by keyword */
function findAndOpen(titWord) {
	var me=$("td[title*='"+titWord+"']");	
	me.parentsUntil( ".table1" ).show();
	me.click();    	
	me.children().click();
}


/*  callback hook (not used) */
function showHideReplace(callback) {
	//$('#json').html(replaceAll($('#json').html(),'arrow_drop_down','arrow_right'));
	callback();
}


/* toggleUI element */
function showHideThis(id,ths) {
	let htm=ths.html();		
	
	if (htm.includes('arrow_right')) {
		ths.html(htm.replace('arrow_right','arrow_drop_down'));		
	} else {
		ths.html(htm.replace('arrow_drop_down','arrow_right'));
	}
}


/* show information tables */
function itoggle(event,ths) {
	const inf='<i class="material-icons infoicon">info</i>';
	const can='<i class="material-icons infoicon">cancel</i>';
	
	$('.infodiv').not(ths).hide();

	htm=ths.text();
	
	if (htm=='info') {
		$('.infospan').html(inf);
		ths.html(can);
		ths.siblings(infoTag+':first').show();
	} else {
		$('.infospan').html(inf);
		ths.html(inf);
		ths.siblings(infoTag+':first').hide();
	} 
	
	event.stopPropagation();
}


/*  toggle subtable and initialize datatable*/
function showHide(id,ths) {			
	$(id+'_wrapper').toggle();	
	$(id).toggle();	
	
	if ( ! $.fn.DataTable.isDataTable( id ) ) {
		$(id).DataTable({
			dom: 'Bfrtip',
			"order": [[ 1, "asc" ]],
			"pageLength": 9,
			language: {
				search: "_INPUT_",
				searchPlaceholder: "Filter:",
				"info": "_START_ to _END_ of _TOTAL_"
			},
			buttons: [
			'copy',
			{extend: 'csv',
				text: 'TSV',
                fieldSeparator: '\t',
                extension: '.tsv',
				title: 'track_tbi_code_table_export',
				
			exportOptions: {
				columns: function(column, data, node) {
					if (column > 17) { //no export of columns > 17
						return false;
					}
					return true;
				},
				modifier: { selected: null }, //export all rows not only the selected ones
				
				format: {
					body: function ( data, row, column, node ) {
						return data;
					},
					header: function ( data, column ) {					
						return cleanCodHead(data);
					},
					footer: function ( data, column ) {					
						return data;
					}
				},
				
				customizeData: function (data) {			
					data.body=cleanCodBod(data.body);
					return data;
				}
			}
		}	
			/*
			{
                extend: 'csv',
                title: fileName
            },
			{
                extend: 'excel',
                title: fileName
            },
			{
                extend: 'pdf',
                title: fileName
            }
			*/
			
			]
		});	
	}
	
	let sea=$(id+'_filter');
	
	let las=$(id + " thead th:last-child");
	
	sea.appendTo(las);
	
	$(id+'_length label').html('');
	
}


/* copy string to user clipboard */
const copyToClipBoard = (str) =>
{
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};


/* display message */
function message(txt,fade) {	
	$('#message').html(txt);		
	if (fade) {
		$('#msg_container').show().delay(4000).fadeOut();
	} else {
		$('#msg_container').show();
	}	
}


/* hide message */
function hideMessage() {
	$('#message_container').hide();
}


/*  copy info to user clipboard */
function copyInfoCell(ths) {
	let htm=ths.html();	
	htm=replaceAll(htm,'<hr class="thinhr">','\n');
	htm=replaceAll(htm,highSpan,'');
	htm=replaceAll(htm,'</span>','');
	copyToClipBoard(htm);
	message('Copied to clipboard',true);
}


/* copy table to user clipboard */
function copyInfo(ths) {
	let h1=ths.text();	
	let h2=[],h0=[];
	let h3='', h4='';
	
	ths.prevAll("td").each(function(){
		h2.push($(this).text());
	});
	
	h2.reverse();
	
	ths.closest("table").parents("tr").find("td").each (function(i) {			
		if (i<2) {
			h0.push($(this).text().replace('arrow_right',''));
		}	
	}); 
	
	htm=h0[0]+"\t"+h0[1]+"\t"+h2.join("\t")+"\t"+h1;

	copyToClipBoard(htm);
	
	message('Copied to clipboard',true);
}


/* replace undefined DB values with blanks  */
function repUndef() {
	$('.table4 tr td').filter(function(){
		return $(this).text() === 'undefined';
	}).each(function(){
		$(this).siblings().first().find('i').hide();
		$(this).text("");
	});
}


/* PROJECT-SPECIFIC FUNCTIONS */


/*  create tree navigation   */
function makeTreeNav(level,P1,P2,jst) {		
	
	var cols = ['<option selected disabled value="-1">Select:</option>'];
	
	var opts=[];
	
	var tit='Select ';
	
	var jstree=jst["Cores"];
	
	var js,key;	
	
	var field=fields[level];
	
	switch (level) {
		case 0: 
			js=jstree;
			$('#L0_select').focus();
		break;
		case 1: 
			js=jstree[P1][fields[1]];
			
		break;
		case 2: 			
			js=jstree[P2][fields[1]][P1][fields[2]];				
		break;
	}
		
	tit=tit+fields[level]+':';
	
	for (var i = 0; i < js.length; i++) {
		
		key=js[i][fieldNames[level]];
		
		if (opts.indexOf(key) === -1) {
			opts.push(key);						
		}	
	}

	//opts.sort();
	
	opts.forEach((v, i) => cols.push('<option value="'+cols.length+1+'">'+v+'</option>'));
	

	$('#L'+level+'_select').html(cols.join(""));	

}


/* create last TABLE in the multi-level nav structure */
function makeLastTable(js) {
	const rd1='</td><td>';
	const rd2='</td><td>';
	const rd3='</td><td>';

	var disp='',fname='',f2name='',table2='',arrow='',info='',url='', rus='';	
	
	var fvs,rules,onclick;	
	
	var mvs=JSON.parse($('#medtree').val());	
	
	
	var table='<table class="table2 display" id="mainTable"><thead><tr><th>FieldName</th><th>Display</th><th></th></tr></thead><tbody>';
	
	for (var i = 0; i < js.length; i++) {
		fname=js[i]['FieldName'];
		disp=js[i]['Display'];
		if (!disp) {
				disp='&nbsp;';
		}
		
		fvs=js[i]['FieldValues'];
		
		rules=js[i]['Rules'];		
		
		table2='<table id="info'+i+'" class="table3 display"><thead><tr><th>Code</th><th>Lookup Value</th></tr></thead><tbody>';
		
		if (fvs.length>0) {
						
			f2name=fvs[0]["FileName"];
			
			if ((f2name!=='undefined')&&(f2name)) {					
			
					message('Loading..',false);
					
					if (mvs) {							
						hideMessage();							
						
						message('Ready.',true);
						
						table2='<table id="info'+i+'" class="table3 display"><thead><tr><th>ListId</th><th>Generic</th><th>Trade</th></tr></thead><tbody>';
						
						for (var j = 0; j < mvs.length; j++) {								
							table2=table2+'<tr><td>'+mvs[j]["MedListID"]+'</td><td title="click to copy" onclick=copyInfo($(this));>'+mvs[j]["GenericName"]+
							'</td><td title="click to copy	" onclick=copyInfo($(this));>'+mvs[j]["TradeName"]+'</td></tr>';				
						}			
						
						onclick= 'onclick="showHide(\'#info'+i+'\',$(this))"';
						arrow='<i class="material-icons" style="float:right">arrow_right</i>';							
					}	

			} else {
				for (var j = 0; j < fvs.length; j++) {
					table2=table2+'<tr><td>'+fvs[j]["LookupCode"]+'</td><td title="click to copy" onclick=copyInfo($(this));>'+fvs[j]["LookupValue"]+'</td></tr>';				
				}			
				onclick= 'onclick="showHide(\'#info'+i+'\',$(this))"';
				arrow='<i class="material-icons" style="float:right">arrow_right</i>';			
			}			
			
		}	else {
			arrow='';
			onclick='';
			table2='';
		}
		
		if (table2) {
			table2=table2+'</tbody></table>';
		}
		
		if (rules.length>0) {

			rus='<table class="allRules"><tr>'+
			'<th>RuleDefID</th>'+
			'<th>RuleName</th>'+
			'<th>Description</th>'+
			'<th>ErrorMsg</th>'+
			'<th>ExecuteEventWhen</th>'+
			'<th>QGRuleSubClassPHP</th>'+
			'<th>ExecSeqNumber</th>'+			
			'</tr>';
			
			for (var r = 0; r < rules.length; r++) {
				rus=rus+'<tr><td>'+	
						rules[r]["RuleDefID"]+rd1+
						rules[r]["RuleName"]+rd1+
						rules[r]["Description"]+rd3+
						rules[r]["ErrorMsg"]+rd2+
						rules[r]["ExecuteEventWhen"]+rd1+
						rules[r]["QGRuleSubClassPHP"]+rd1+
						rules[r]["ExecSeqNumber"]+                                            
						'</td></tr>';		
			}
			
			info=rus+'</table>';
			
			
			
		} else {
			info='';
		}
		
		
		if (info) {
			info=dataBeg+
			infoDiv+info+
			'</div>';
			
		}
				
		table=table + '<tr><td>' + fname + '</td><td ' + onclick + '>' + disp + info+arrow + '</td><td>' + table2 + '</td></tr>';
		
	}	
	
	
	table=replaceAll(table,'null','');
	
	let s=$('#searchInput').val();
	
	if (s) {
		s=s.split(' (')[0];		
		
		table=replaceAll(table,s,'<span class="highlight_container hightlight"><span class="highlight_var">'+s+'</span></span>');
	}	
	
	
	return table+'</tbody></table>'
}


/* find top level of a tree */
function findLevel1(js,fName,nName,opt) {
	for (var i = 0; i < js.length; i++) {
		if (js[i][fName]==opt) {
			return js[i][nName];
		}
	}	
	return [];	
}


/* create last TREE in the multi-level nav structure */
function makeLastTree(){
	message('Loading..',false);
	
	$('#L2_select').css('color','#000');
	
	$.ajax({
		url: './data_list.json' ,
		type: 'get',
		dataType: 'json',
		async: false,
		success: function(locations) {												
			if (locations) {

				var dir=locations.data_dir+$('#cohorts').val()+'/';
				
				var searchEP=dir+locations.data_file;
				
				var tree_file=locations.tree_file;	
								
/*
				$( "#dataName" ).autocomplete({
					data: tagDic,
					onAutocomplete: function(txt) {
						window.location.href='/?q='+txt;
					},
					limit: 10
				});
*/					



				$.ajax({
					url: searchEP+'.json' ,
					type: 'get',
					dataType: 'json',
					async: true,
					success: function(d) {															

						if (d) {							
							var opt1=$('#L0_select').find(":selected").text();
							
							var js=findLevel1(d["Cores"],"Core Assignment","Forms",opt1);
							
							var opt2=$('#L1_select').find(":selected").text();
							
							js=findLevel1(js,"FormName","Tables",opt2);					
							
							var opt3=$('#L2_select').find(":selected").text();
							
							js=findLevel1(js,"TableName","Fields",opt3);

										
							$("#json").html(makeLastTable(js));							
							
							initMain();
							
							hideMessage();
							
							message('Ready.',true);
							
							$("#json").focus();
							
							//$('.highlight_container').toggle('highlight');
						}	
					}
				});		
			}
		},		
		error: function(d){
			console.log('error',d,searchEP+'.json');
		},
	});
	
}


/* load selected branch */
function selTree(ths,level) {
	
	$('#json').html('');
	
	$('#searchInput').val('');
	
	var jstree=JSON.parse($('#jstree').val());	
	
	var L0=$('#L0_select')[0].options.selectedIndex-1;
	
	var L1=$('#L1_select').val();
	
	var i=ths[0].options.selectedIndex-1;
	
	if (i>=0) {
		var opt=ths.find(":selected").text();
		
		switch (level) {
			case 0:
				makeTreeNav(level+1,i,1,jstree);							
				$('#L0_select').css('color','#000');	
				message(SelMesBeg+fieldNames[1]+SelMesEnd,true);
				$('#L1_select').focus();				
			break;
			case 1:	
				$('#L1_select').css('color','#000');

				makeTreeNav(level+1,i,L0,jstree);	
				
				message(SelMesBeg+fieldNames[2]+SelMesEnd,true);
				$('#L2_select').focus();				
			break;
			case 2: 
			break;
		}
	}		
}


/* selected option (not used) */
function selOptOld(id,opt) {
		
	$('#'+id+' option').filter(function(i){	
		return $(this).text() === opt;		
	}).attr("selected", true);		

	
	return $('#'+id)[0].options.selectedIndex;
}


/* selected option */
function selOpt(id,opt) {
	$("#"+id+" > option").each(function(i) {
    	if (this.text==opt) {
			$(this).attr("selected", true);
			$('#'+id)[0].options.selectedIndex=i;
			return i;
		}
	});

	return $('#'+id)[0].options.selectedIndex;
}


/* create pulldown structure */
function makeSearchNav(level,P1,P2,jst) {		
	
	var col = ['<option selected disabled value="-1">Select:</option>'];
	
	var tit='Select ';
	
	var jstree=jst["Cores"];
	
	var js,key;	
	
	var field=fields[level];
	
	switch (level) {
		case 0: 
			js=jstree;
			$('#L0_select').focus();
		break;
		case 1: 
			js=jstree[P1][fields[1]];
			
		break;
		case 2: 			
			js=jstree[P2][fields[1]][P1][fields[2]];							
		break;
	}
		
	tit=tit+fields[level]+':';
	
	for (var i = 0; i < js.length; i++) {
		
		key=js[i][fieldNames[level]];
		
		if (col.indexOf(key) === -1) {
			col.push('<option value="'+col.length+'">'+key+'</option>');						
		}	
	}

	$('#L'+level+'_select').html(col.join(""));	

}


/* find and load tables based on navigation */
function searchTree(opt1,opt2,opt3) {	
	
	var jstree=JSON.parse($('#jstree').val());	
	
	var r=selOpt('L0_select',opt1);	

	makeSearchNav(1,r-1,-1,jstree);											
	
	var r2=selOpt('L1_select',opt2);
	
	makeSearchNav(2,r2-1,r-1,jstree);
	
	var r3=selOpt('L2_select',opt3);
	
	makeLastTree();
	
}


/*  find and load table based on navigation */
function loadSearch(field) {
	
	var stree=JSON.parse($('#searchtree').val())[field];

	searchTree(stree["Core Assignment"],stree["FormName"],stree["TableName"]);
	
}


/* get table entry */
function getEntry (field,data) {
	var result=[];
	for(var key in data) {
		if (key==field) {
			if (typeof data[key] === "object") {
				for(var skey in data[key]) {
					result.push (data[key][skey]);		
				}	
			} else result.push(data[key]);
		}
	}	
	return result;
}


/* is record empty? */
function isRecEmpty(rec,fi) {
	return (rec[fi].trim()=='');
}


/* is there a link in href? */
function emptyLink(a) {
	return (a.includes('href=""') || (a.includes('href ')) || (a.includes('href="undefined"')));
}


/* get link attribute of a element */
function emptyHref(a) {
		return !(a.attr('href'));
}


/*  replace all empty links (not used) */
function repEmptyLinks() {
	var els=$('li.purpleFGMenu');
	els.each(function(i,li) {
		if (emptyLink($(li).html())) {
				$(li).remove();
		}		
	});
	
	els=$('a.under_link');
	els.each(function(i,li) {
		if (emptyHref($(li))) {
				$(li).remove();
		}		
	});
}


/* expand all accordeons */
function expandAll() { 
	$(".collapsible-header").addClass("active"); 
	
	$("#expand").fadeOut(); $("#collapse").fadeIn();
	
	var elems = document.querySelectorAll('.collapsible');
	
	elems.forEach(function (el) {
		var instance = M.Collapsible.init(el);
		instance.open()
	});	
} 


/* collapse all accordeons */
function collapseAll() { 
	$(".collapsible-header").removeClass(function() { 
		return "active"; 
	}); 
	
	$("#expand").fadeIn(); 
	$("#collapse").fadeOut(); 
	var elems = document.querySelectorAll('.collapsible');
	
	elems.forEach(function (el) {
		var instance = M.Collapsible.init(el);
		instance.close()
	});
}	


/* initialize fields -- hook, not used */
function initFields() {
	/*
	$('.sidenav').sidenav();
	$(".dropdown-trigger").dropdown();
	$('.collapsible').collapsible();
	$('.fixed-action-btn').floatingActionButton();	
    $('.tooltipped').tooltip();
	*/		
}	
	
	
/* clean code table body for TSV export */	
function cleanBod(body) {
	const tags=[
	'</span>','</span>',
	'<span class=\"highlight_container hightlight\"><span class=\"highlight_var\">',
	'</tbody></table>',
	
	'<i class=\"material-icons\" style=\"float:right\">arrow_right</i>',
	'<i class=\"material-icons\" style=\"float:right\">arrow_right</i>',
	
	
	'<table id=\"info0\" class=\"table3 display\">',	
	
	'<table id=\"info2\" class=\"table3 display\">',
	
	'title=\"click to copy	\" onclick=\"copyInfo($(this));\">',	
	'title=\"click to copy\" onclick=\"copyInfo($(this));\">',
	
	'</tr></tbody></table>',
	'<td>',
	'</td>',
	'<th>',
	'<span class="infospan" onclick="itoggle(event,$(this));"><i class="material-icons infoicon">info</i><div class="infodiv" style="display:none;"><table ',
	'</div>"',
	
	];
	
	
	for (var j=0;j<body.length;j++) {
		for (var i=0;i<body[j].length;i++) {
			
			//body[j][i]=replaceAll(body[j][i],',',';');			
			
			body[j][i]=replaceAll(body[j][i],'</tr><tr>','\n\t');
			
			body[j][i]=replaceAll(body[j][i],'</tr>','\t');
			
			body[j][i]=replaceAll(body[j][i],'</td><td','\t');			
			
			body[j][i]=replaceAll(body[j][i],'</thead><tbody><tr>','\n\t');
			
			tags.forEach(function (tag) {
				body[j][i]=replaceAll(body[j][i],tag,'');

			});
			
			for (var k=0;k<1000;k++) {
				body[j][i]=replaceAll(body[j][i],'<table id="info'+k+'" class="table3 display">','');
			}
			
			body[j][i]=replaceAll(body[j][i],'<thead><tr>','\n\n\t');
			body[j][i]=replaceAll(body[j][i],'</th>','\t');			
			
			body[j][i]=replaceAll(body[j][i],'class="allRules"><tbody><tr>','\t');			
			
		}	
	}
	
	body[body.length-1][body[body.length-1].length-1]=body[body.length-1][body[body.length-1].length-1]+
		'\n\n'+
		$('#L0_select').find(":selected").text()+"\t>\t"+
		$('#L1_select').find(":selected").text()+"\t>\t"+
		$('#L2_select').find(":selected").text()+"\t\t"+
		'\nExported: \t'+today();
		
	return body;
}	

	
/* clean code header for tsv export */
function cleanCodHead(data) {
	if (data.includes('Lookup Value')) {data='Lookup Value';}
	return data;
}

	
/* clean code table body for TSV export */
function cleanCodBod(body) {
	
	
	for (var j=0;j<body.length;j++) {
		for (var i=0;i<body[j].length;i++) {
			if (body[j][i].includes('Lookup Value')) {body[j][i]='"Lookup Value"';}
		}	
	}
	
	body[body.length-1][body[body.length-1].length-1]=body[body.length-1][body[body.length-1].length-1]+
		'\n\n'+
		$('#L0_select').find(":selected").text()+"\t>\t"+
		$('#L1_select').find(":selected").text()+"\t>\t"+
		$('#L2_select').find(":selected").text()+"\t\t"+
		'\nExported: \t'+today();
		
	return body;
}
	

/* initialize data tables*/	
function initMain() {
	$('#mainTable').DataTable( {
        dom: 'Bfrtip',
		"pageLength": 30,
		language: {
			search: "_INPUT_",
			searchPlaceholder: "Filter:",
			"info": "_START_ to _END_ of _TOTAL_"
		},
        buttons: [
            /*'copy', 'excel', 'pdf',
			
			'copyFlash',
            {
                text: 'TSV',
                extend: 'csvFlash',
                fieldSeparator: '\t',
                extension: '.tsv'
            },
				
		*/				
			{extend: 'csv',
				text: 'TSV',
                fieldSeparator: '\t',
                extension: '.tsv',
				title: 'track_tbi_export',
				
			exportOptions: {
				columns: function(column, data, node) {
					if (column > 17) { //no export of columns > 17
						return false;
					}
					return true;
				},
				modifier: { selected: null }, //export all rows not only the selected ones
				
				format: {
					body: function ( data, row, column, node ) {
						return data;
					},
					header: function ( data, column ) {					
						return data;
					},
					footer: function ( data, column ) {					
						return data;
					}
				},
				
				customizeData: function (data) {			
					data.body=cleanBod(data.body);
					return data;
				}
			}
		}	
	],
			//export options
		});	
}	

	
/* encode url value */
function encode_utf8( s ){
	s=JSON.stringify(s);
	s=s.normalize();	
	s=replaceAll(s,'\u00c2',' ');
	return s;
    //return encodeURIComponent( s );
}


/* load cohort based on cohort menu */
function loadCohort(ths) {
	var url=window.location.href.split('?')[0]+'?c='+$('#cohorts').prop('selectedIndex');
	
	var term=getTerm;
	
	if (term['q']) { url=url+'&q='+term['q']; }
	if (term['t']) { url=url+'&t='+term['t']; }
	
	window.location.href=url;
}


/* initial procedure on document ready */
$(document).ready(function () {
	initFields();	
	var term=getTerm();

	$.ajax({
		url: locations_file,
		type: 'get',
		dataType: 'json',
		async: false,
		success: function(locations) {												
			if (locations) {
				
				var cohorts=locations.cohorts;				
				
				var i=0;
				
				var pref="";
				
				$.each(cohorts, function(key,value) {		
					if (i.toString()===term['c']) {											
						$('#cohorts').append($("<option selected='selected'></option>").attr("value", value).text(key));
						pref=value+'/';
					} else {
						$('#cohorts').append($("<option></option>").attr("value", value).text(key));
					}
					i++;
				});
				
				var dir=locations.data_dir+pref;
				var searchEP=dir+locations.data_file;
				var tree_file=locations.tree_file;	
				var meds_file=locations.meds_file;	
				var search_file=locations.search_file;	
				
				$.ajax({
					url: dir+tree_file+'.json',
					type: 'get',
					dataType: 'json',
					async: true,
					success: function(jstree) {															
					
						if (jstree) {								
							$('#jstree').val(JSON.stringify(jstree));
					
							$.ajax({
								url: dir+meds_file+'.json',
								type: 'get',
								dataType: 'json',
								async: true,
								success: function(mvs) {
		
									$('#medtree').val(encode_utf8(mvs));
									
									makeTreeNav(0,1,1,jstree);							
								
									$('#json').html('');
									
									message(SelMesBeg+fieldNames[0]+SelMesEnd,true);
									
									$.ajax({
										url: dir+search_file+'.json',
										type: 'get',
										dataType: 'json',
										async: true,
										success: function(seas) {
											var s=[];
											
											$('#searchtree').val(JSON.stringify(seas));											
											
											for (var key in seas) {
												s.push(key);
											}
											
											$('#searchInput').autocomplete({
										
											 source: function( request, response ) {
												var matches = $.map(s, function(sItem) {
												  if ( sItem.toUpperCase().indexOf(request.term.toUpperCase()) != -1 ) {
													return sItem;
												  }
												});
												response(matches);
											  },
											 selectFirst: true, 
											 minLength: 3,
											 select: function(e, ui) {
												 $('#searchInput').val(ui.item.label);
												 loadSearch(ui.item.label);	
												return false;
											}
											  
											});

										},		
										error: function(e){
											console.log('error',e,search_file+'.json');
										}	
									});			
									
									
								},		
								error: function(d){
									console.log('error',d,meds_file+'.json');
								}	
							});			
				
						} else {console.log('JS TREE LOADING ERROR');}
					},		
					error: function(d){
						console.log('error',d,searchEP+'.json');
					}	
				});						
			}
		},		
		error: function(d){
			console.log('error',d,searchEP+'.json');
		},
	});		

	initFields();
	expandAll();
	
	var divMon=$('.table5');
	
//	divMon.bind('contentchanged', function() {
//	hideMessage();
//	});		
});


/* initial procedure on window load */
window.onload = function () {
	$( "html" ).removeClass( "loading" );	
	
	$(".tdth").hide();
	
	$("#Cores0").hide();
	
	
	let term=getTerm();
	if (term['t']) { findAndOpen(term['t']); }

	
	$(".breadNav-drop-container").mouseover(function() {
		$(this).children('div').show();
	});
	
	$(".breadNav-drop-container").mouseout(function() {
		$(this).children('div').hide();
	});			
	
};

