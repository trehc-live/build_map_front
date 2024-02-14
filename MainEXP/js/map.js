//Main
	//From other scripts
		base_api_url = 'http://82.146.48.183:3000/api/v1/';
		
		request_params = 
		{
			building_id: '', 
			target_id: ''
		};
		parse_pathname();
		
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
			
	//Variables
		const container = document.getElementById("body_id");
		const w = window.innerWidth;
		const h = window.innerHeight;
		const r = 8; //Default circle radius
		const cw = 2; //Default circle stroke width
		const lw = 2; //Default line stroke width
		const scale_divisor = 1000; //Divides coordinates used for drawing circles
		
		const part_array = [];
		
		const el_floor_up = document.getElementById("floor_up");
		const el_floor_down = document.getElementById("floor_down");
		
		let scaling = false;
		let active = false;
	
	//Classes
		class XY
		{
			constructor(x, y)
			{
				this.x = x;
				this.y = y;
			}
		}
		
		let current;
		
		class Part
		{
			static current_part;
			static current_index = 0;
			
			static path_to;
			
			constructor(id)
			{
				//Input variables
					this.id = id;
				
				//SVG
					//Get map
						this.svg_string = 
						this.svg_elem = get_map_svg(this.id);
					
					//Draw groups
						//Create group for drawing
							this.draw_group = create_default_group(this.svg_elem, "Draw");
					
						//Create group for updatable drawing
							this.removable_group = create_default_group(this.draw_group, "Things to remove when a new end point is selected");	
							this.road_group = create_default_group(this.removable_group, "Roads");
							this.circle_group = create_default_group(this.removable_group, "Circles");
							
					container.append(this.svg_elem);
					this.hide_part();
			}
			
		//Methods
			set_current()
			{
				if (Part.current_part !== undefined)
				{
					Part.current_part.hide_part();
				}
				
				Part.current_part = this;
				
				if (current !== undefined)
				{
					translate_set(current.x, current.y, Part.current_part.svg_elem);
				}
				
				Part.current_part.show_part();
			}
			
			set_path_to()
			{
				Part.path_to = this;
			}
			
			hide_part()
			{
				hide(this.svg_elem);
			}
			
			show_part()
			{
				show(this.svg_elem);
			}
		}
		
	//Objects
		let zoom =
		{
			current: 3,
			speed: 0.1,
			max: 5,
			min: 0.5,
			enabled: true,
		}
		
		let templates =
		{
			circle: [["r", r], ["stroke", "black"], ["stroke-width", cw]],
			road: [["stroke-width", lw]],
			group: [["class", "layer"]],
		}
		
	//Starting part
		let json_point_data = JSON.parse(request(new URL(build_get_point_by_id_url(), base_api_url)));
		part_array.push(new Part(json_point_data[0].building_part_id));
		part_array[0].set_current();
		part_array[0].set_path_to();
		
		let start_coords = get_start_svg_coords();
		let start_point = draw("circle", Part.current_part.draw_group, undefined, templates.circle, [["cx", start_coords.x], ["cy", start_coords.y], ["fill", colors.circle_dark_green]]);
		let start_viewport_coords = start_point.getBoundingClientRect();
	
		let initial = new XY();
		current = new XY(-start_viewport_coords.x - r + w / 2, -start_viewport_coords.y - r + h / 2);
		
		translate_set(current.x, current.y, Part.current_part.svg_elem);

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
			if (e.target === container || e.target === Part.current_part.svg_elem) //Elements that you can click to move map
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
				translate_set(current.x, current.y, Part.current_part.svg_elem);
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
			if (zoom.enabled)
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
					
					translate_set(current.x, current.y, Part.current_part.svg_elem);
			}
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
		
		function get_map_svg(id)
		{
			let json_building_part_data = JSON.parse(request(new URL(build_get_building_part_url(id), base_api_url)));
			let json_map_svg_data = request(json_building_part_data[0].immutable_map_url);
			let svg_parser = new DOMParser();
			let svg_dom = svg_parser.parseFromString(json_map_svg_data, "image/svg+xml");
			return svg_dom.documentElement;
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
			
			part_array.forEach((part) =>
			{
				remove_elems(part.circle_group, "circle");
				remove_elems(part.road_group, "line");
			})
			
			for (let i = 0; i < legend_len; i++)
			{
				let point_data = point_array[i].point;
				
				let draw_road = true;
				if (point_data.building_part_id != Part.path_to.id)
				{
					if (part_exists(point_data.building_part_id))
					{
						part.set_path_to();
					}
					else
					{
						let part_to_push = new Part(point_data.building_part_id)						
						part_array.push(part_to_push);
						
						if (part_array.length == 2)
						{
							el_floor_up.style.backgroundColor = "white";
							el_floor_up.style.cursor = "pointer";
						}
						
						part_to_push.set_path_to();
					}
					draw_road = false;
				}

				if (i > 0)
				{
					if (draw_road)
					{
						let removable_line = draw("line", Part.path_to.road_group, undefined, templates.road, [["x1", previous_coord.x], ["y1", previous_coord.y], ["x2", point_data.x_value / scale_divisor], ["y2", point_data.y_value / scale_divisor], ["stroke", colors.road_blue]]);
					}
					
					let removable_point = draw("circle", Part.path_to.circle_group, undefined, templates.circle, [["cx", point_data.x_value / scale_divisor], ["cy", point_data.y_value / scale_divisor], ["fill", colors.circle_blue]]);
				}	
				else
				{
					let removable_point = draw("circle", Part.path_to.circle_group, undefined, templates.circle, [["cx", point_data.x_value / scale_divisor], ["cy", point_data.y_value / scale_divisor], ["fill", colors.circle_dark_green]]);
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
		
		function hide(el)
		{
			el.style.display = 'none';
		}
		
		function show(el)
		{
			el.style.display = 'block';
		}
		
	//Parts
		function part_exists(id)
		{
			for (part of part_array)
			{
				if (part.id == id)
				{
					return true;
				}
			}
			return false;
		}
		
		function FloorUp()
		{
			if (part_array[Part.current_index + 1] !== undefined)
			{
				if (part_array[Part.current_index - 1] === undefined)
				{
					el_floor_down.style.backgroundColor = "white";
					el_floor_down.style.cursor = "pointer";
				}
				
				Part.current_index++;
				part_array[Part.current_index].set_current();
			}
			
			if (part_array[Part.current_index + 1] === undefined)
			{
				el_floor_up.style.backgroundColor = "gray";
				el_floor_up.style.cursor = "default";
			}
		}
		
		function FloorDown()
		{
			if (part_array[Part.current_index - 1] !== undefined)
			{
				if (part_array[Part.current_index + 1] === undefined)
				{
					el_floor_up.style.backgroundColor = "white";
					el_floor_up.style.cursor = "pointer";
				}
				
				Part.current_index--;
				part_array[Part.current_index].set_current();
			}
			
			if (part_array[Part.current_index - 1] === undefined)
			{
				el_floor_down.style.backgroundColor = "gray";
				el_floor_down.style.cursor = "default";
			}
		}
