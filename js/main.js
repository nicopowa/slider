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

	const sliders = divIt(document.body, "sliders");

	const slideIt = (name, opts) => {

		const wraps = divIt(sliders, "wraps");
		const [what, vals] = slideHead(name, wraps);

		const slide = slideWhat(opts, wraps);

		const disp = (dat) =>
			(vals.innerHTML = [dat]
			.flat(1)
			.map(
				(val, idx) =>
					"<font color=\"" + opts.col[idx] + "\">" + val + "</font>"
			)
			.join("&nbsp;"));

		slide.on("start", () =>
			what.classList.add("live"));
		slide.on("slide", (evt) =>
			disp(evt.detail));
		slide.on("change", (evt) => {

			what.classList.remove("live");
			disp(evt.detail);
		
		});

		disp(slide.values);
	
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

	const palette = [
		"ff595e",
		"ff924c",
		"ffca3a",
		"c5ca30",
		"8ac926",
		"52a675",
		"1982c4",
		"4267ac",
		"6a4c93",
	];

	const shuffle = (arr) =>
		arr.sort(() =>
			Math.random() - 0.5);

	const color = (num = 1) =>
		shuffle(palette)
		.slice(0, num)
		.map((col) =>
			"#" + col);

	const heads = divIt(sliders, "heads");

	const name = divIt(heads, "name");

	name.innerHTML = "slider";

	const repo = document.createElement("a");

	repo.innerHTML = "repo";
	repo.href = "https://github.com/nicopowa/slider";
	heads.appendChild(repo);

	slideIt("single value", {
		val: 5, 
		max: 10,
		col: color(),
	});

	slideIt("multiple values", {
		val: [8, 16, 32, 64],
		col: color(4),
	});

	slideIt("range + step", {
		stp: 5,
		val: [25, 75],
		col: color(),
	});

	slideIt("min range 10", {
		val: [35, 65],
		rng: 10,
		col: color(),
	});

	slideIt("3x range", {
		val: [5, 10, 20, 35, 50, 80],
		col: color(3),
	});

	slideIt("linked range", {
		max: 100,
		stp: 1,
		val: [10, 50, 70],
		col: color(2),
	});

	slideIt("linked ranges", {
		max: 100,
		stp: 1,
		val: [10, 20, 50, 70],
		col: color(3),
	});

	slideIt("time format", {
		max: 5400,
		col: color(),
		val: 3600,
		fmt: (s) =>
			(s < 3600 ? [60, 1] : [3600, 60, 1])
			.map((x) =>
				`0${~~(s / x) % 60}`.slice(-2))
			.join(":"),
	});

};
