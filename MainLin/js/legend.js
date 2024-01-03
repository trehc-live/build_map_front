	let searchArray = new Array();
	let targetsArray = new Array();

	let baseURL = 'http://82.146.48.183:3000/api/v1/buildings/';
	let requestLimit = 1000;
	
	let url_params = { 
	building_id: '',
	current_position: '',
	end_point_id: ''
	};
	
	var colors =
	{
		circle_blue: "#1500FF",
		road_blue: "#120070",
		circle_gray: "gray",
		road_gray: "#555555",
		circle_dark_green: "#2E7D33",
		circle_light_green: "#3BD445",
		light_green: "AAFFAA",
		white: "#FFFFFF",
	};
	
	let legend_len = 0;
	let legend_current = -1;
	
	//global vars

	function get_params()
	{
		let url = new URL(document.location.href);
		url_params.building_id = url.searchParams.get('building_id');
		url_params.current_position = url.searchParams.get('target_id');
		//
		//url_params.end_point_id = 3//url.searchParams.get('end_point_id');
		url_params.end_point_id = sessionStorage.getItem("end_point_id");
		
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
		document.getElementById("legendContainerId").appendChild(container);
	}
	
	function fill_circle_options(circle, searchID, wah, container)
	{
		circle.id = 'circl' + searchID;
		circle.classList.add('pathCircle');
        document.getElementById(container.id).appendChild(circle);
		if(searchID != legend_len - 1)
		{
			vertical_line(70, 10, 'circl' + searchID);
		}
		
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
		
		let cont = document.getElementById('cont' + i);
		cont.onclick = function() {
			if(legend_current != i)
			{
				for(let id = 0; id <= i; id++)
				{
					if (id != 0)
					{
						document.getElementById('circl' + id).style.backgroundColor = colors.circle_blue;
						change_color(circle_group, "circle", "fill", colors.circle_blue, id);
					}
					else
					{
						document.getElementById('circl' + id).style.backgroundColor = colors.circle_light_green;
						change_color(circle_group, "circle", "fill", colors.circle_light_green, id);
					}
					
					if(id != i)
					{
						document.getElementById('circl' + id).firstChild.style.backgroundColor = colors.road_blue;
						change_color(road_group, "line", "stroke", colors.road_blue, id);
					}			
				}
				for(let id = i + 1; id < legend_len; id++)
				{
					document.getElementById('circl' + id).style.backgroundColor = colors.circle_gray
					change_color(circle_group, "circle", "fill", colors.circle_gray, id);
					
					if(id != legend_len - 1)
					{
						document.getElementById('circl' + id).firstChild.style.backgroundColor = colors.road_gray;
						change_color(road_group, "line", "stroke", colors.road_gray, id);
					}
					if(id == i + 1)
					{
						document.getElementById('circl' + (id - 1)).firstChild.style.backgroundColor = colors.road_gray;
						change_color(road_group, "line", "stroke", colors.road_gray, id - 1);
					}
				}
				legend_current = i;
			}
			else
			{
				if (i != 0)
				{
					document.getElementById('circl' + i).style.backgroundColor = colors.circle_gray;
					change_color(circle_group, "circle", "fill", colors.circle_gray, i);
				}
				else
				{
					document.getElementById('circl' + i).style.backgroundColor = colors.circle_dark_green;
					change_color(circle_group, "circle", "fill", colors.circle_dark_green, i);
				}
				
				if(i > 0)
				{
					document.getElementById('circl' + (i - 1)).firstChild.style.backgroundColor = colors.road_gray;
					change_color(road_group, "line", "stroke", colors.road_gray, i - 1);
				}
				legend_current = i - 1;
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
        document.getElementById(appendID).appendChild(line);
	}
	
	//{ ADDITIONAL_PLACE_CONTENT -->
	// function clickable_picture(linke, searchID)
	// {
		// const picture = document.createElement("img");
		// picture.id = 'pic' + searchID;
		// picture.classList.add('pathPicture');
		// picture.src = linke;
		// document.getElementById("flexIDB" + searchID).appendChild(picture);
		// let modal = document.getElementById('myModal');
		// let img = document.getElementById('myImg');
		// let modalImg = document.getElementById("img01");
		// document.getElementById('pic' + searchID).onclick = function()
		// {
			// modal.style.display = "block";
			// modalImg.src = this.src;
		// }
		// // Get the <span> element that closes the modal
		// let img01 = document.getElementsByClassName("modal-content")[0];
		
		// // When the user clicks on <span> (x), close the modal
		// img01.onclick = function() { 
			// modal.style.display = "none";
		// }
	// }
	
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
	
	// function create_place_on_way(searchID, URL)
	// {
		// flexbox_main_create(searchID);
		// flexbox1_create(searchID);
		// vertical_line(35, -4, 'flexIDA' + searchID);
		// horisontal_line(50, 0, 'flexIDA' + searchID);
		// flexbox2_create(searchID);
		//clickable_picture("https://ih1.redbubble.net/image.719306492.2984/st,small,507x507-pad,600x600,f8f8f8.jpg", searchID);
		// vertical_line(35, -4, 'flexIDA' + searchID);
	// }
	
	// <--PAINT_OBJECTS_THINGS }
	
	// { THINGS_TO_WORK_WITH_LEGEND -->
	function point_type_handler(searchID, type, pictureURL)
	{
		if(searchArray[searchID].point.point_type == type)//target
		{
			//create_place_on_way(searchID, pictureURL);
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
			//vertical_line(70, 10, 'legendContainerId');
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
			create_dot_with_header(searchID, 50, 35);
			//vertical_line(70, 10, 'legendContainerId');
			return;
		}
		if(searchArray[searchID].point.point_type == 'target')//target
		{
			create_dot_with_header(searchID, 50, 35);
			//create_place_on_way(searchID, '');
			return;
		}
	}
	// <--THINGS_TO_WORK_WITH_LEGEND }
	
	// { CHANGE_LIST -->
	function fill_legend_list()
	{
		for(let i = 0; i < legend_len; i++) //searchArray.length
		{
			targets_on_way_handler(i);
		}
	}
	// <--CHANGE_LIST }
	
	// { PARSE -->
	function search_parse(response)
	{
		let jsonData = JSON.parse(response);
		legend_len = jsonData.search_result.length;
		for (let i = 0; i < jsonData.search_result.length; i++)
		{
			searchArray[i] = jsonData.search_result[i];
		}
		draw_seq(searchArray);
	}
	// <--PARSE }
	
	function clear_legend()
	{
		var elem = document.getElementById('legendContainerId');
		elem.innerHTML = "";
		console.log('clear!')
	}
	
	//{ RESPONSE_THINGS -->
	function search_response_handler(response)
	{
		clear_legend();
		search_parse(response);
		fill_legend_list();
	}
	// <--RESPONSE_THINGS }

	function build_get_legend_url()
	{
		return `buildings/${request_params.building_id}/search?start_point_id=${url_params.current_position}&end_point_id=${url_params.end_point_id}`;
	}

	//{ REQUEST_THINGS -->
	function search_request()
	{
		legend_current = -1;
		const request_url = new URL(build_get_legend_url(), base_api_url);
		console.log(request_url);
		const xhr = new XMLHttpRequest();
		xhr.open('GET', request_url, false);
		xhr.send();
		//console.log(end_point_id);															//to check
		//console.log(request_url);															//to check
		console.log(xhr.response);															//to check
		search_response_handler(xhr.response);
	}
	// <--REQUEST_THINGS }

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
			document.getElementById('box').style.display="flex"; 
			document.getElementById(button_id).style.backgroundColor = colors.light_green;
			buttonTextVar.textContent = "Скрыть легенду";
		}
		else
		{
			document.getElementById('box').style.display="none";
			document.getElementById(button_id).style.backgroundColor = colors.white;
			buttonTextVar.textContent = "Открыть легенду";
		}
	}
	
	//{ MAIN -->
		//parse_pathname();
		//search_request();
	// <--MAIN }
