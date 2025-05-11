window.addEventListener("load", () =>
	main());

const main = () => {

	const divIt = (par, cls = "") => {

		let div = document.createElement("div");

		if(cls)
			div.classList.add(cls);

		par.appendChild(div);

		return div;
	
	};

	const wrap = divIt(document.body, "sliders");

	const disp = (el, slider, dat) => {

		el.innerHTML = [dat]
		.flat(1)
		.map(
			(val, idx) =>
				"<font color=\"" + slider.colors[idx] + "\">" + val + "</font>"
		)
		.join("&nbsp;");
	
	};

	const slideHead = (name, wraps) => {

		const wrap = divIt(wraps, "slides");
		const what = divIt(wrap);
		const vals = divIt(wrap);

		what.innerText = name;

		return [what, vals];
	
	};

	const slideWhat = (opts, wraps) =>
		new Slider(divIt(wraps), opts);

	const slideIt = (name, opts) => {

		console.log(name, opts);

		const wraps = divIt(wrap, "wraps");
		const [what, vals] = slideHead(name, wraps);

		const slide = slideWhat(opts, wraps);

		slide.on("start", evt => {

			what.classList.add("live");
			disp(vals, slide, evt.detail);
		
		});

		slide.on("slide", evt =>
			disp(vals, slide, evt.detail));

		slide.on("change", evt => {

			what.classList.remove("live");
			disp(vals, slide, evt.detail);
		
		});

		disp(vals, slide, slide.values);

		return slide;
	
	};

	const palette = [
		"ff595e",
		"ff924c",
		"ffca3a",
		"c5ca30",
		"8ac926",
		"52a675",
		"1982c4",
		"4267ac",
		"6a4c93"
	];

	const shuffle = arr =>
		arr.sort(() =>
			Math.random() - 0.5);

	const color = (num = 1) =>
		shuffle(palette)
		.slice(0, num)
		.map(col =>
			"#" + col);

	const slideTests = {
		"single value": {
			val: 50,
			max: 100,
			col: color(),
		},
		"multiple values": {
			val: [8, 16, 32, 64],
			col: color(4),
		},
		"range + step": {
			stp: 5,
			val: [25, 75],
			col: color(),
		},
		"min range 10": {
			val: [35, 65],
			rng: 10,
			col: color(),
		},
		"3x range": {
			val: [5, 10, 20, 35, 50, 80],
			col: color(3),
		},
		"linked range": {
			max: 100,
			stp: 1,
			val: [10, 50, 70],
			col: color(2),
		},
		"linked ranges": {
			max: 100,
			stp: 1,
			val: [10, 20, 50, 70],
			col: color(3),
		},
		"time format": {
			max: 5400,
			col: color(),
			val: 3600,
			fmt: s =>
				(s < 3600 ? [60, 1] : [3600, 60, 1])
				.map(x =>
					`0${~~(s / x) % 60}`.slice(-2))
				.join(":"),
		},
		"float values": {
			min: 0,
			max: 0.1,
			stp: 0.001,
			val: [0.016, 0.032, 0.064],
			col: color(3),
		},
	};

	const heads = divIt(wrap, "heads");

	const name = divIt(heads, "name");

	name.innerHTML = "slider";

	const resetValues = divIt(heads, "values");

	resetValues.innerHTML = "values";

	resetValues.addEventListener("click", () =>
		Array.from(document.querySelectorAll(".slider"))
		.forEach(
			(slideEl, idx) => {

				const heads = slideEl.previousSibling, 
					slider = sliders[idx];

				slider.values
					= slideTests[heads.firstChild.innerText].val;

				disp(heads.lastChild, slider, slider.values);

			}
		)
	);

	const newColors = divIt(heads, "colors");

	newColors.innerHTML = "colors";

	newColors.addEventListener("click", () =>
		Array.from(document.querySelectorAll(".slider"))
		.forEach(
			(slideEl, idx) => {

				const heads = slideEl.previousSibling, 
					slider = sliders[idx];

				slider.colors
					= color(slider.colors.length);

				disp(heads.lastChild, slider, slider.values);

			}
		)
	);

	const repo = document.createElement("a");

	repo.innerHTML = "repo";
	repo.href = "https://github.com/nicopowa/slider";
	heads.appendChild(repo);

	const info = document.createElement("a");

	info.innerHTML = "info";
	info.href = "https://nicopr.fr/slider";
	heads.appendChild(info);

	const sliders = Object.entries(slideTests)
	.map(entry =>
		slideIt(...entry)
	);

};
