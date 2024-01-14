//Main
	//From other scripts
		base_api_url = 'http://82.146.48.183:3000/api/v1/';
		
		request_params = 
		{
			building_id: '', 
			target_id: ''
		};
		
		colors =
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
			
	//Const
		const container = document.getElementById("body_id");
		const w = window.innerWidth;
		const h = window.innerHeight;
		const r = 8; //Default circle radius
		const cw = 2; //Default circle stroke width
		const lw = 2; //Default line stroke width
		const scale_divisor = 1000; //Divides coordinates used for drawing circles
		
	//Objects
		let zoom =
		{
			current: 3,
			speed: 0.1,
			max: 5,
			min: 0.5,
		}
		
		let templates =
		{
			circle: [["r", r], ["stroke", "black"], ["stroke-width", cw]],
			road: [["stroke-width", lw]],
			group: [["class", "layer"]],
		}
	
	//Classes
		class XY
		{
			constructor(x, y)
			{
				this.x = x;
				this.y = y;
			}
		}
	
	//SVG
		//Get map
			parse_pathname();

			let svg_string = get_map_svg();
			let svg_parser = new DOMParser();
	       	let svg_dom = svg_parser.parseFromString(svg_string, "image/svg+xml");
			let svg_elem = svg_dom.documentElement;
			container.append(svg_elem);
		
		//Draw on map
			//Create group for drawing
				let draw_group = create_default_group(svg_elem, "Draw");
				
			//Create starting point
				let start_coords = get_start_svg_coords();
				let start_point = draw("circle", draw_group, undefined, templates.circle, [["cx", start_coords.x], ["cy", start_coords.y], ["fill", colors.circle_dark_green]]);
				let start_viewport_coords = start_point.getBoundingClientRect();
			
			//Create group for updatable drawing
				let removable_group = create_default_group(draw_group, "Things to remove when a new end point is selected");	
				let road_group = create_default_group(removable_group, "Roads");
				let circle_group = create_default_group(removable_group, "Circles");
				
	//Move
		let initial = new XY();
		let current = new XY(-start_viewport_coords.x - r + w / 2, -start_viewport_coords.y - r + h / 2);
		let scaling = false;
		let active = false;
		translate_set(current.x, current.y, svg_elem);

	//EventListeners

		//Mobile
			container.addEventListener("touchstart", drag_start, false);
			container.addEventListener("touchmove", drag, false);
			container.addEventListener("touchend", drag_end, false);

		//Desktop
			container.addEventListener("mousedown", drag_start, false);
			container.addEventListener("mousemove", drag, false);
			container.addEventListener("mouseup", drag_end, false);
			document.addEventListener("wheel", mouse_wheel, false);
		
//Functions

	//Move
		function drag_start(e) 
		{
			if (e.type === "touchstart") //For mobile
			{
				initial.x = e.touches[0].clientX - current.x * zoom.current;
				initial.y = e.touches[0].clientY - current.y * zoom.current;
			} 
			else  //For desktop
			{
				initial.x = e.clientX - current.x * zoom.current;
				initial.y = e.clientY - current.y * zoom.current;
			}
			if (e.target === container || e.target === svg_elem) //Elements that you can click to move map
			{
				active = true;
			}
		}
		
		function drag(e)
		{
			if (active) 
			{
				if (e.type === "touchmove") //For mobile
				{	
					current.x = (e.touches[0].clientX - initial.x) / zoom.current;
					current.y = (e.touches[0].clientY - initial.y) / zoom.current;
				}
				else //For desktop
				{
					current.x = (e.clientX - initial.x) / zoom.current;
					current.y = (e.clientY - initial.y) / zoom.current;
				}
				translate_set(current.x, current.y, svg_elem);
			}
		}
		
		function drag_end(e)
		{
			initial.x = current.x;
			initial.y = current.y;
			active = false;
		}
		
		function translate_set(pos_x, pos_y, el)
		{
			el.style.transform = "translate3d(" + pos_x * zoom.current + "px, " + pos_y * zoom.current + "px, 0) scale(" + zoom.current + ")";
		}
		
	//Zoom
		function mouse_wheel(e) 
		{
			//Change zoom
				if (e.deltaY > 0) //zoom out
				{
					if (zoom.current + zoom.speed > zoom.min)
					{
						zoom.current -= zoom.speed * zoom.current;
					}
				} 
				else //zoom in
				{
					if (zoom.current - zoom.speed < zoom.max)
					{
						zoom.current += zoom.speed * zoom.current;
					}
				}
			
			//Update map position while scaling
				initial.x = e.clientX - current.x * zoom.current;
				initial.y = e.clientY - current.y * zoom.current;
				
				current.x = (e.clientX - initial.x) / zoom.current;
				current.y = (e.clientY - initial.y) / zoom.current;
				
				translate_set(current.x, current.y, svg_elem);
		}
		
	//API
		function request(request_url)
		{
			console.log(request_url);
			const xhr = new XMLHttpRequest();
			xhr.open('GET', request_url, false);
			try
			{
			  xhr.send();
			  if (xhr.status != 200)
			  {
			    alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
			  }
			  else
			  {
			    //alert(xhr.response);
			  }
			}
			catch(err)
			{
			  alert("Запрос не удался " + err.message);
			}
			return xhr.response;
		}
		
		function get_map_svg()
		{
			let json_point_data = JSON.parse(request(new URL(build_get_point_by_id_url(), base_api_url)));
			let json_building_part_data = JSON.parse(request(new URL(build_get_building_part_url(json_point_data[0].building_part_id), base_api_url)));
			let json_map_svg_data = request(json_building_part_data[0].immutable_map_url);
			return json_map_svg_data;
		}
		
		function get_start_svg_coords()
		{
			let params = build_get_point_by_id_url();
			let url = new URL(params, base_api_url);
			let resp = request(url);
			let json = JSON.parse(resp)[0];
			return new XY(json.x_value / scale_divisor, json.y_value / scale_divisor);
		}
		
	//URL
		function parse_pathname()
		{
			const url = new URL(document.location.href)
			request_params.building_id = url.searchParams.get('building_id');
			request_params.target_id = url.searchParams.get('target_id');
		}
		
		function build_get_point_by_id_url() 
		{
			return `buildings/${request_params.building_id}/points/${request_params.target_id}`;
		}
		
		function build_get_building_part_url(building_part_id) 
		{
			return `buildings/${request_params.building_id}/building_parts/${building_part_id}`;
		}
		
	//Draw
		function draw(name, append, inner, template_attributes, attributes)
		{
			let elem = document.createElementNS("http://www.w3.org/2000/svg", name);
			
			if (typeof inner !== 'undefined')
			{
				elem.innerHTML = inner;
			}

			set_attributes(elem, template_attributes);
			set_attributes(elem, attributes);
			
			append.appendChild(elem);
			return elem;
		}
		
		function set_attributes(elem, attributes)
		{
			if (typeof attributes !== 'undefined')
			{
				for (let i = 0; i < attributes.length; i++)
				{
					elem.setAttribute(attributes[i][0], attributes[i][1]);
				}
			}
		}
		
		function draw_seq(point_array)
		{
			let previous_coord = start_coords;
			
			remove_elems(circle_group, "circle");
			remove_elems(road_group, "line");
			
			for (let i = 0; i < legend_len; i++)
			{
				let point_data = point_array[i].point;
				if (i > 0)
				{
					let removable_line = draw("line", road_group, undefined, templates.road, [["x1", previous_coord.x], ["y1", previous_coord.y], ["x2", point_data.x_value / scale_divisor], ["y2", point_data.y_value / scale_divisor], ["stroke", colors.road_gray]]);
					let removable_point = draw("circle", circle_group, undefined, templates.circle, [["cx", point_data.x_value / scale_divisor], ["cy", point_data.y_value / scale_divisor], ["fill", colors.circle_gray]]);
				}	
				else
				{
					let removable_point = draw("circle", circle_group, undefined, templates.circle, [["cx", point_data.x_value / scale_divisor], ["cy", point_data.y_value / scale_divisor], ["fill", colors.circle_dark_green]]);
				}
				
				previous_coord = new XY(point_data.x_value / scale_divisor, point_data.y_value / scale_divisor);
			}
		}
		
		function remove_elems(parent, elem_name)
		{
			let elem_array = parent.querySelectorAll(elem_name);
			for (let i = 0; i < elem_array.length; i++)
			{
				elem_array[i].remove();
			}
		}
		
		function change_color(parent, elem_name, mode, color, i)
		{
			let elem_array = parent.querySelectorAll(elem_name);
			elem_array[i].setAttribute(mode, color);
		}
		
		function create_default_group(append, name)
		{
			let group = draw("g", append, undefined, templates.group, undefined);
			let group_title = draw("title", group, name, undefined, undefined);
			return group;
		}
