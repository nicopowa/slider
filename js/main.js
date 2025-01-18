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

	const palette = ["ff595e","ffca3a","8ac926","1982c4","6a4c93"];

	const shuffle = arr => arr.sort(() => Math.random() - 0.5);

	const color = num => 
		shuffle(palette).slice(0, num).map(col => "#" + col);

	const heads = divIt(sliders, "heads");

	const name = divIt(heads, "name");
	name.innerHTML = "slider";

	const repo = document.createElement("a");
	repo.innerHTML = "repo";
	repo.href = "https://github.com/nicopowa/slider";
	heads.appendChild(repo);

	slideIt("single value", {
		mn: 0,
		mx: 10,
		st: 1,
		nm: 1,
		cl: color(1),
	});

	slideIt("multiple values", {
		mn: 0,
		mx: 100,
		st: 1,
		nm: 3,
		cl: color(3), 
	});

	slideIt("range", {
		mn: 0,
		mx: 100,
		st: 1,
		nm: 2,
		cl: color(1), 
	});

	slideIt("2x range step", {
		mn: 0,
		mx: 100,
		st: 5,
		nm: 4,
		cl: color(2), 
	});

	slideIt("3x range", {
		mn: 0,
		mx: 100,
		st: 1,
		nm: 6,
		cl: color(3), 
	});

	slideIt("linked ranges", {
		mn: 0,
		mx: 1000,
		st: 10,
		nm: 3,
		cl: color(2), 
	});

	slideIt("time format", {
		mn: 0,
		mx: 300,
		st: 1,
		nm: 1,
		cl: color(1),
		ft: (s) => `${s/3600>=1?`${~~(s/3600)}:`:''}${`0${~~(s/3600>=1?s%3600/60:s/60)}`.slice(-2)}:${`0${~~(s%60)}`.slice(-2)}`
	});

};
