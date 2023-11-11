	let searchArray = new Array();
	let targetsArray = new Array();

	let baseURL = 'http://82.146.48.183:3000/api/v1/buildings/';
	let requestLimit = 1000;
	
	let url_params = { 
	building_id: '',
	current_position: '',
	end_point_id: ''
	};
	
	//global vars

	function parse_pathname()
	{
		let url = new URL(document.location.href);
		url_params.building_id = 1//url.searchParams.get('building_id');
		url_params.current_position = 1//url.searchParams.get('target_id');
		url_params.end_point_id = 3//url.searchParams.get('end_point_id');
		
		if(url_params.building_id == undefined || url_params.current_position == undefined || url_params.end_point_id == undefined)
		{
			console.error('Ошибка разбора параметров URL. Не найдены параметры building_id, target_id или end_point_id');
			return;
		}
	}

	// { PAINT_OBJECTS_THINGS -->
	
	// { ADITIONAL_CREATE_DOT_WITH_HEADER_CONTENT -->
	function fill_container_options(container, searchID, wah, margin)
	{
		container.id = 'cont' + searchID;
		container.classList.add('pathContainer');
		container.style.cssText += 'height: ' + (wah + 5) + 'px; margin-left:' + margin + 'px;';
		document.getElementById("legendContainerId").appendChild(container);
	}
	
	function fill_circle_options(circle, searchID, wah, container)
	{
		circle.id = 'circl' + searchID;
		circle.classList.add('pathCircle');
        circle.style.cssText += 'width: ' + wah + 'px; height: ' + wah + 'px;';
        document.getElementById(container.id).appendChild(circle);
	}
	
	function fill_textBox_options(textBox, searchID, container)
	{
        textBox.id = 'tbox' + searchID;
		textBox.classList.add('pathTextBox');
        document.getElementById(container.id).appendChild(textBox);
	}
	
	function fill_innerText_options(innerText, searchID, textBox)
	{
		innerText.classList.add('pathInnerText');
        innerText.textContent += searchArray[searchID].legend;
        document.getElementById(textBox.id).appendChild(innerText);
	}
	// <--ADITIONAL_CREATE_DOT_WITH_HEADER_CONTENT }
	function create_dot_with_header(i, wah, margin) // эта функция должна рисовать точку по середине экрана, рядом с точкой находится НАЗВАНИЕ
	{
		const container = document.createElement("div");
		fill_container_options(container, i, wah, margin);

        const circle = document.createElement("div");
		fill_circle_options(circle, i, wah, container);

        const textBox = document.createElement("div");
		fill_textBox_options(textBox, i, container);

        const innerText = document.createElement("p");
        fill_innerText_options(innerText, i, textBox);
		
		let text = document.getElementById('tbox' + i);
		text.onclick = function() {
			for(let id = 0; id <= i; id++)
			{
				document.getElementById('circl' + id).style.backgroundColor = 'green';
			}
			for(let id = i + 1; id < searchArray.length; id++)
			{
				document.getElementById('circl' + id).style.backgroundColor = 'red';
			}
		};
		
		let div = document.getElementById('circl' + i);
		div.onclick = function() {
			for(let id = 0; id <= i; id++)
			{
				document.getElementById('circl' + id).style.backgroundColor = 'green';
			}
			for(let id = i + 1; id < searchArray.length; id++)
			{
				document.getElementById('circl' + id).style.backgroundColor = 'red';
			}
		};
	}
	
	function horisontal_line(length, tbm, appendID)//tbm - top_bottom_margin
	{
        const line = document.createElement("div");
		line.classList.add('pathLineHorisontal');
        line.style.cssText += 'width: ' + length + 'px; margin-top: ' + tbm + 'px; margin-bottom: ' + tbm + 'px;';
        document.getElementById(appendID).appendChild(line);
	}
	
	function vertical_line(length, tbm, appendID)//tbm - top_bottom_margin
	{
        const line = document.createElement("div");
		line.classList.add('pathLineVertical');
        line.style.cssText += 'height: ' + length + 'px; margin-top: ' + tbm + 'px; margin-bottom: ' + tbm + 'px';
        document.getElementById(appendID).appendChild(line);
	}
	
	//{ ADDITIONAL_PLACE_CONTENT -->
	function clickable_picture(linke, searchID)
	{
		const picture = document.createElement("img");
		picture.id = 'pic' + searchID;
		picture.classList.add('pathPicture');
		picture.src = linke;
		document.getElementById("flexIDB" + searchID).appendChild(picture);
		let modal = document.getElementById('myModal');
		let img = document.getElementById('myImg');
		let modalImg = document.getElementById("img01");
		document.getElementById('pic' + searchID).onclick = function()
		{
			modal.style.display = "block";
			modalImg.src = this.src;
		}
		// Get the <span> element that closes the modal
		let img01 = document.getElementsByClassName("modal-content")[0];
		
		// When the user clicks on <span> (x), close the modal
		img01.onclick = function() { 
			modal.style.display = "none";
		}
	}
	
	function flexbox2_create(searchID)
	{
		const flex2 = document.createElement("div");
		flex2.id = 'flexIDB' + searchID;
		flex2.classList.add('pathFlex2');
		document.getElementById("flexMainID" + searchID).appendChild(flex2);
	}
	
	function flexbox1_create(searchID)
	{
		const flex1 = document.createElement("div");
		flex1.id = 'flexIDA' + searchID;
		flex1.classList.add('pathFlex1');
		document.getElementById("flexMainID" + searchID).appendChild(flex1);
	}
	
	function flexbox_main_create(searchID)
	{
		const flexMain = document.createElement("div");
		flexMain.id = 'flexMainID' + searchID;
		flexMain.classList.add('pathFlexMain');
		document.getElementById("legendContainerId").appendChild(flexMain);
	}
	// <--ADDITIONAL_PLACE_CONTENT }
	
	function create_place_on_way(searchID, URL)
	{
		flexbox_main_create(searchID);
		flexbox1_create(searchID);
		vertical_line(35, -4, 'flexIDA' + searchID);
		horisontal_line(50, 0, 'flexIDA' + searchID);
		flexbox2_create(searchID);
		clickable_picture("https://ih1.redbubble.net/image.719306492.2984/st,small,507x507-pad,600x600,f8f8f8.jpg", searchID);
		vertical_line(35, -4, 'flexIDA' + searchID);
	}
	
	// <--PAINT_OBJECTS_THINGS }
	
	// { THINGS_TO_WORK_WITH_LEGEND -->
	function point_type_handler(searchID, type, pictureURL)
	{
		if(searchArray[searchID].point.point_type == type)//target
		{
			create_place_on_way(searchID, pictureURL);
			return;
		}
	}
	
	function targets_on_way_handler(searchID)
	{
		//chek if we have start header, end header, crossroad or target
		if(searchID == 0)//start header
		{
			create_dot_with_header(searchID, 50, 25);
			//point_type_handler(searchID, 'target', '');
			vertical_line(70, 10, 'legendContainerId');
			return;
		}
		if(searchID == searchArray.length - 1)//end header
		{
			create_dot_with_header(searchID, 50, 25);
			//point_type_handler(searchID, 'target', '');
			return;
		}
		if(searchArray[searchID].point.point_type == 'crossroads')//crossroads
		{
			create_dot_with_header(searchID, 30, 35);
			vertical_line(70, 10, 'legendContainerId');
			return;
		}
		if(searchArray[searchID].point.point_type == 'target')//target
		{
			create_dot_with_header(searchID, 30, 35);
			create_place_on_way(searchID, '');
			return;
		}
	}
	// <--THINGS_TO_WORK_WITH_LEGEND }
	
	// { CHANGE_LIST -->
	function fill_legend_list()
	{
		for(let i = 0; i < searchArray.length; i++)
		{
			targets_on_way_handler(i);
		}
	}
	// <--CHANGE_LIST }
	
	// { PARSE -->
	function search_parse(response)
	{
		let jsonData = JSON.parse(response);
		for (let i = 0; i < jsonData.search_result.length; i++)
		{
			searchArray[i] = jsonData.search_result[i];
		}
	}
	// <--PARSE }
	
	//{ RESPONSE_THINGS -->
	function search_response_handler(response)
	{
		search_parse(response);
		fill_legend_list();
	}
	// <--RESPONSE_THINGS }

	//{ REQUEST_THINGS -->
	function search_request()
	{
		let GETRequestStr = baseURL + url_params.building_id + '/search?start_point_id=' + url_params.current_position + '&end_point_id=' + url_params.end_point_id;
		const xhr = new XMLHttpRequest();
		xhr.open('GET', GETRequestStr, false);
		xhr.send();
		//console.log(end_point_id);															//to check
		//console.log(GETRequestStr);															//to check
		console.log(xhr.response);															//to check
		search_response_handler(xhr.response);
	}
	// <--REQUEST_THINGS }

	//{ MAIN -->
	function main()
	{
		parse_pathname();
		search_request();
	}
	// <--MAIN }
	//function chpok(ButtonForLegend)
	//{
	//	elem = document.getElementById(ButtonForLegend); //находим блок div по его id, который передали в функцию
	//	state = elem.style.display; //смотрим, включен ли сейчас элемент
	//	if (state =='') elem.style.display='none'; //если включен, то выключаем
	//	else elem.style.display=''; //иначе - включаем
	//}
	function openbox(box)
	{
		let buttonTextVar = document.getElementById("buttonText");
		const button_id='open_button';
		var text = document.getElementById("legendContainerId");
		buttonClass = document.querySelector('.app-wrapper');
		buttonStyle = getComputedStyle(buttonClass);
		display	= buttonStyle.display// Получаем состояние элемента и меняем в зависимости от значения
		if(display=="none")
		{
			document.getElementById('box').style.display="block"; 
			document.getElementById(button_id).style.backgroundColor="#808080";
			buttonTextVar.textContent = "Скрыть легенду";
		}
		else
		{
			document.getElementById('box').style.display="none";
			document.getElementById(button_id).style.backgroundColor="#DCDCDC";
			buttonTextVar.textContent = "Открыть легенду";
		}
	}
	
	window.onload = function(){ 
    console.log("document.onload");  
    main(); 
  }