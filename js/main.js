window.addEventListener("load", () => 
	main());

const main = () => {

	const divIt = (par, cls = "") => {
		let div = document.createElement("div");
		if(cls) div.classList.add(cls);
		par.appendChild(div);
		return div;
	};

	const sliders = divIt(document.body, "sliders");

	const slideIt = (name, opts) => {
		const wraps = divIt(sliders, "wraps")
		const infos = slideHead(name, wraps);
		const slide = slideWhat(opts, wraps);
		slide.on("start", () => (
			infos.classList.add("live")
		));
		slide.on("slide", evt => (
			infos.innerText = JSON.stringify(evt.detail)
		));
		slide.on("change", evt => {
			infos.classList.remove("live");
			infos.innerText = JSON.stringify(evt.detail);
		});
		infos.innerText = JSON.stringify(slide.values);
	};
	
	const slideHead = (name, wraps) => {
		const wrap = divIt(wraps, "slides");
		const what = divIt(wrap);
		what.innerText = name;
		const vals = divIt(wrap);
		return vals;
	};
	
	const slideWhat = (opts, wraps) => 
		new Slider(divIt(wraps), opts);

	const palette = ["ff595e","ff924c","ffca3a","c5ca30","8ac926","52a675","1982c4","4267ac","6a4c93"];

	const shuffle = arr => arr.sort(() => Math.random() - 0.5);

	const color = (num = 1) => 
		shuffle(palette).slice(0, num).map(col => "#" + col);

	const heads = divIt(sliders, "heads");

	const name = divIt(heads, "name");
	name.innerHTML = "slider";

	const repo = document.createElement("a");
	repo.innerHTML = "repo";
	repo.href = "https://github.com/nicopowa/slider";
	heads.appendChild(repo);

	slideIt("single value", {
		max: 10,
		col: color(),
	});

	slideIt("multiple values", {
		val: [8, 16, 32, 64],
		col: color(4), 
	});

	slideIt("range + step", {
		stp: 5,
		num: 2,
		col: color(), 
	});

	slideIt("min range 10", {
		num: 2,
		rng: 10, 
		col: color(), 
	});

	slideIt("3x range", {
		val: [5, 10, 20, 35, 50, 80],
		col: color(3), 
	});

	slideIt("linked ranges", {
		max: 1000,
		stp: 10,
		val: [100, 500, 700],
		col: color(2), 
	});

	slideIt("time format", {
		max: 300,
		col: color(),
		val: 60, 
		fmt: (s) => `${s/3600>=1?`${~~(s/3600)}:`:''}${`0${~~(s/3600>=1?s%3600/60:s/60)}`.slice(-2)}:${`0${~~(s%60)}`.slice(-2)}`
	});

};