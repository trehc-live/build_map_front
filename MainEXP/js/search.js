//Variables
	//let searchBarID = document.getElementById("search_barID");
	//let searchBarIDwidth = searchBarID.style.width;
	//let searchPlacesID = document.getElementById("search_places");
	//let searchPlacesIDdisplay = searchPlacesID.style.display;
	let request_params = {
		building_id: '', 
		target_id: ''
	};
	
	let chosen_filter = '';
	const base_api_url = 'http://82.146.48.183:3000/api/v1/';
	let groups_list = [];
	let request_limit = 1000000000;

//Functions
	
	function SearchBarClick()
	{
		
	}
	
	function parse_pathname()
	{
		const url = new URL(document.location.href)
		request_params.building_id = url.searchParams.get('building_id');
		request_params.target_id = url.searchParams.get('target_id');
	}
	
	function groups_request()
	{
		const request_url = new URL(build_get_group_url(), base_api_url);
		console.log(request_url);
		const xhr = new XMLHttpRequest();
		xhr.open('GET', request_url, false);
		xhr.send();
		if (xhr.status != 200)
			throw new Error(`Ошибка при выполнении запроса: ${request_url.href}, message: ${xhr.responseText}`);

		return xhr.response;
	}
	
	function fill_groups()
	{
		let response = groups_request();
		let json_data = JSON.parse(response);
	
		if (json_data.groups == undefined)
		{
			throw new Error('Ответ api должен содержать поле groups');
		}
		for (let group of json_data.groups) 
		{
			groups_list.push(new Option(group.name, group.id));
			let p = document.createElement("p");
			let filter_elem = document.createElement("div");
			document.getElementById("filters").append(filter_elem);
			p.textContent = group.name;
			p.id = group.id;
			filter_elem.appendChild(p);
			filter_elem.classList.add("filter");
			filter_elem.onclick = function ()
			{
				let children = document.getElementById("filters").children;

				for (let i = 0; i < children.length; i++) {
				  children[i].style.background = "#FFFFFF";
				}
				
				if (chosen_filter != filter_elem.firstChild.id)
				{
					chosen_filter = filter_elem.firstChild.id;
					filter_elem.style.background = "#AAFFAA";
				}
				else
				{
					chosen_filter = ""
				}
				clear_targets_list();
				targets_request(chosen_filter, document.getElementById("search_bar_id").value);
				// sessionStorage.setItem("chosen_filter", chosen_filter);
				// alert(sessionStorage.getItem("chosen_filter"));
				
			}
			p.classList.add("filter_text");
		}
	}
	
	function build_get_group_url() 
	{
		return `buildings/${request_params.building_id}/groups`;
	}
	
	function build_get_target_url() 
	{
		return `buildings/${request_params.building_id}/targets`;
	}
	
	function targets_request(group_id, target_name)
	{
		const request_url = new URL(build_get_target_url(), base_api_url);
		request_url.searchParams.set('limit', request_limit)
		request_url.searchParams.set('filter[group_id]', group_id)
		request_url.searchParams.set('filter[target_name]', target_name)
		
		const xhr = new XMLHttpRequest();
		xhr.open('GET', request_url, false);
		xhr.send();
		if (xhr.status != 200)
			throw new Error(`Ошибка при выполнении запроса: ${request_url.href}, message: ${xhr.responseText}`);
	
		fill_targets(xhr.response);
	}
	
	function fill_targets(response)
	{
		
		var jsonData = JSON.parse(response);
		for (let i = 0; i < jsonData.targets.length; i++)
		{
			add_target_element(jsonData.targets[i]);
		}
	}
	
	function add_target_element(target)
	{
		const point_selector = document.getElementById("point_selector");
		const row = document.createElement("tr");
		row.id = target.id;
		row.onclick = function()
		{
			sessionStorage.setItem("end_point_id", row.id);
			console.log(row.id);
			//alert(sessionStorage.getItem("end_point_id"));
			document.getElementById('open_button').onclick();
			openLegend();
		}
		//\\ row.dataset.url = build_legend_url(target);

		//row.appendChild(build_cell(target.id));
		row.appendChild(build_cell(target.name));

		point_selector.appendChild(row);
	}
	
	function build_cell(value)
	{
		let cell = document.createElement("td");
		let cellText = document.createTextNode(value);
		cell.appendChild(cellText);
		return cell;
	}
	
	function search_handler()
	{
		clear_targets_list();

		targets_request(/*filters.value*/'', document.getElementById("search_bar_id").value);

	}
	
	function clear_targets_list()
	{
	  var elem = document.getElementById('point_selector');
	  elem.replaceChildren();
	}
	
	function InpClick()
	{
		let elem = document.getElementById('hider');
		hider.style.display = "block";
		zoom.enabled = false;
	}
	
	function change_legend_style()//название ОЧЕНЬ СТОИТ поменять!
	{
		let elem = document.getElementById('hider');
		hider.style.display = "none";
		
		var text = document.getElementById("legendContainerId");
		legend_class = document.querySelector('.app-wrapper');
		buttonStyle = getComputedStyle(legend_class);
		display	= buttonStyle.display// Получаем состояние элемента и меняем в зависимости от значения
		
	}
	
	function ButtonClick()
	{
		let buttonTextVar = document.getElementById("buttonText");
		const button_id = 'open_button';
		change_legend_style();
		document.getElementById('open_button').style.display="none";
		document.getElementById('box').style.display="none";
		document.getElementById(button_id).style.backgroundColor="#FFFFFF";
		buttonTextVar.textContent = "Открыть легенду";
		zoom.enabled = true;
	}
	
	function openLegend()
	{
		get_params();
		search_request();
		let buttonTextVar = document.getElementById("buttonText");
		const button_id = 'open_button';
		change_legend_style();
		document.getElementById('open_button').style.display="flex"; 
		document.getElementById(button_id).style.backgroundColor="#808080";
		document.getElementById('box').style.display="flex";
		document.getElementById(button_id).style.backgroundColor="#AAFFAA";
		buttonTextVar.textContent = "Скрыть легенду";
		zoom.enabled = false;
	}
	
	//Main
	
	console.log(document.location.href);
	//try {
		parse_pathname();
		//request_params_validation();

		fill_groups();

		targets_request('', '');
	//} catch (e) {
		//console.error(e.message);
		// И вот здесь redirect на страницу с ошибкой.
	//}
