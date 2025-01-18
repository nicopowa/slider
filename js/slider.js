/**
 * @force
 * @export
 * @class Slider :
 */
class Slider {
	/**
	 * @construct
	 * @param {HTMLElement} container :
	 * @param {!SliderOptions=} opts :
	 */
	constructor(container, opts = {}) {
		opts = {
			mn: 0,
			mx: 100,
			st: 1,
			nm: 1,
			cl: "#4A90E2",
			ft: (v) => 
				this.formatValue(v),
			vl: null,
			...opts,
		};

		this.rail =
			this.track =
			this.intervals =
			this.labelBox =
			this.minLabel =
			this.maxLabel =
			this.valueLabels =
				null;

		this._min = +opts.mn;
		this._max = +opts.mx;
		this._step = +opts.st;
		this._num = +opts.nm;
		this._range = this._max - this._min;
		this._disp = opts.ft;
		this._colors = Array.isArray(opts.cl) ? opts.cl : [opts.cl];

		this._vals = Array(this._num)
		.fill(0);
		this._targetVals = Array(this._num)
		.fill(0);
		this._frameLoop = null;
		this._activeIdx = -1;
		this._isMoving = false;
		this._startPos = 0;
		this._startVal = 0;
		this._dispatcher = new NativeEventTarget();

		this.wrap = container;
		this.wrap.classList.add("slider");

		this.buildDOM();
		this.setupEvents();

		opts.vl ? (this.values = opts.vl) : this.setInitialValues();
	}

	buildDOM() {
		this.rail = this.createDiv("rail");
		this.track = this.createDiv("line");
		this.intervals = Array(Math.max(this._num, this._colors.length))
		.fill(0)
		.map(() => {
			const int = this.createDiv("range");
			int.style.display = "none";
			return int;
		});

		this.labelBox = this.createDiv("lbls");
		this.minLabel = this.createDiv("lbl mn");
		this.maxLabel = this.createDiv("lbl mx");
		this.valueLabels = Array(this._num)
		.fill(0)
		.map(() => 
			this.createDiv("val"));

		this.track.append(...this.intervals);
		this.rail.appendChild(this.track);
		this.labelBox.append(this.minLabel, ...this.valueLabels, this.maxLabel);
		this.wrap.append(this.rail, this.labelBox);
	}

	createDiv(cls) {
		const div = document.createElement("div");
		div.className = cls;
		return div;
	}

	setupEvents() {
		this.rail.addEventListener("pointerdown", (e) => 
			this.onDown(e));
		this.rail.addEventListener(
			"pointermove",
			(e) => 
				this._activeIdx !== -1 && this.onMove(e)
		);
		this.rail.addEventListener(
			"pointerup",
			(e) => 
				this._activeIdx !== -1 && this.onUp(e)
		);
		this.rail.addEventListener(
			"pointercancel",
			(e) => 
				this._activeIdx !== -1 && this.onUp(e)
		);
	}

	setInitialValues() {
		const step = this._range / (this._num + 1);
		this._vals = this._vals.map(
			(_, i) =>
				(this._targetVals[i] = this.roundToStep(
					this._min + step * (i + 1)
				))
		);
		this.updateUI();
	}

	/**
	 * @force
	 * @export
	 * @getter
	 * @type {Number|Array} values :
	 */
	get values() {
		const vals = this._vals.map((v) => 
			this.roundToStep(v));

		if(this._num === 1) return vals[0];

		if(this._colors.length >= this._num) {
			return vals;
		}

		if(this._num % 2 === 0) {
			const ranges = [];
			for(let i = 0; i < vals.length; i += 2) {
				ranges.push([vals[i], vals[i + 1]].sort((a, b) => 
					a - b));
			}
			return ranges;
		}

		const sorted = [...this._vals]
		.map((v) => 
			this.roundToStep(v))
		.sort((a, b) => 
			a - b);
		const ranges = [];
		for(let i = 0; i < sorted.length - 1; i++) {
			ranges.push([sorted[i], sorted[i + 1]]);
		}
		return ranges;
	}

	/**
	 * @setter
	 */
	set values(v) {
		const newVals = Array.isArray(v)
			? Array.isArray(v[0])
				? v.flat()
				: v
			: [v];

		if(newVals.length !== this._num) {
			throw new Error("Invalid number of values");
		}

		this._vals = newVals.map((v) => 
			this.forceRange(+v));
		this._targetVals = [...this._vals];
		this.updateUI();
	}

	updateUI() {
		const positions = this._vals.map(
			(v) => 
				((v - this._min) / this._range) * 100
		);

		const sorted = this._vals
		.map((v, i) => 
			({ value: v, index: i }))
		.sort((a, b) => 
			b.value - a.value)
		.map((x) => 
			x.index);

		let lift = new Set();
		if(this._activeIdx !== -1) {
			const activePos = positions[this._activeIdx];
			positions.forEach((pos, i) => {
				if(i !== this._activeIdx && Math.abs(pos - activePos) < 4) {
					lift.add(i);
				}
			});
		}

		if(this._colors.length >= this._num) {
			positions.forEach((pos, i) => {
				const interval = this.intervals[i];
				const zIndex = sorted.indexOf(i) + 1;

				this.updateLine(interval, 0, pos, this._colors[i], zIndex);
			});
		} else {
			if(this._num % 2 === 0) {
				for(let i = 0; i < this._num; i += 2) {
					const rangeIndex = i / 2;
					const p1 = positions[i];
					const p2 = positions[i + 1];
					const [left, right] = p1 < p2 ? [p1, p2] : [p2, p1];

					this.updateLine(
						this.intervals[rangeIndex],
						left,
						right - left,
						this._colors[rangeIndex % this._colors.length],
						rangeIndex + 1
					);
				}
			} else {
				const sortedVals = this._vals
				.map((v, i) => 
					({ value: v, index: i }))
				.sort((a, b) => 
					a.value - b.value);

				for(let i = 0; i < sortedVals.length - 1; i++) {
					const p1 = positions[sortedVals[i].index];
					const p2 = positions[sortedVals[i + 1].index];
					const [left, right] = [p1, p2].sort((a, b) => 
						a - b);

					this.updateLine(
						this.intervals[i],
						left,
						right - left,
						this._colors[i],
						i + 1
					);
				}
			}
		}

		const visibleIntervals =
			this._colors.length >= this._num
				? this._num
				: this._num % 2 === 0
					? this._num / 2
					: this._num - 1;
		for(let i = visibleIntervals; i < this.intervals.length; i++) {
			this.intervals[i].style.display = "none";
		}

		this._vals.forEach((val, i) => {
			let colorIdx;
			if(this._colors.length >= this._num) {
				colorIdx = i;
			} else if(this._num % 2 === 0) {
				colorIdx = Math.floor(i / 2) % this._colors.length;
			} else {
				const sortedPos = [...this._vals]
				.sort((a, b) => 
					a - b)
				.indexOf(val);
				colorIdx = Math.min(sortedPos, this._colors.length - 1);
			}

			const zIndex = sorted.indexOf(i) + this._num + 1;

			/*this.valueLabels[i].style.cssText = `
				left: ${positions[i]}%;
				color: ${this._colors[colorIdx]};
				z-index: ${zIndex};
			`;*/

			this.updateLabel(this.valueLabels[i], positions[i], this._colors[colorIdx], zIndex);

			this.valueLabels[i].classList.toggle("lift", lift.has(i));
			this.valueLabels[i].textContent = this._disp(val);
		});

		this.minLabel.textContent = this._disp(this._min);
		this.maxLabel.textContent = this._disp(this._max);
	}

	updateLine(elt, lft, wth, bck, zdx) {
		Object.assign(elt.style, {
			display: "block",
			left: lft + "%",
			width: wth + "%",
			backgroundColor: bck,
			zIndex: zdx,
		});
	}

	updateLabel(elt, lft, clr, zdx) {
		Object.assign(elt.style, {
			display: "block",
			left: lft + "%",
			color: clr,
			zIndex: zdx,
		});
	}

	roundToStep(val) {
		return this.forceRange(this._step * Math.round(val / this._step));
	}

	forceRange(val) {
		return Math.max(this._min, Math.min(this._max, val));
	}

	onDown(evt) {
		const rect = this.rail.getBoundingClientRect();
		const pos = (evt.clientX - rect.left) / rect.width;
		const val = this._min + pos * this._range;

		this._activeIdx = this._vals.reduce(
			(closest, _, i) =>
				Math.abs(val - this._vals[i]) <
				Math.abs(val - this._vals[closest])
					? i
					: closest,
			0
		);

		this._startVal = this._vals[this._activeIdx];
		this._startPos = pos;
		this._isMoving = false;
		this.rail.setPointerCapture(evt.pointerId);
	}

	onMove(evt) {
		const rect = this.rail.getBoundingClientRect();
		const pos = (evt.clientX - rect.left) / rect.width;
		const delta = pos - this._startPos;

		const newValue = this.roundToStep(this._startVal + delta * this._range);

		if(!this._isMoving && newValue !== this._targetVals[this._activeIdx]) {
			this._isMoving = true;
			this.dispatch("start");
		}

		this._targetVals[this._activeIdx] = newValue;
		this.animate();
	}

	onUp(evt) {
		this.rail.releasePointerCapture(evt.pointerId);
		this._activeIdx = -1;
		this._isMoving = false;
	}

	animate() {
		if(this._frameLoop) return;

		const step = () => {
			let needsUpdate = false;
			let valueChanged = false;
			const EASING = 0.2;

			this._vals.forEach((val, i) => {
				const target = this._targetVals[i];
				if(val !== target) {
					const delta = target - val;
					if(Math.abs(delta) < 0.01) {
						this._vals[i] = target;
						valueChanged = true;
					} else {
						this._vals[i] = val + delta * EASING;
						needsUpdate = true;
					}
				}
			});

			if(needsUpdate || valueChanged) {
				this.updateUI();
				this.dispatch("slide");

				if(needsUpdate) {
					this._frameLoop = requestAnimationFrame(step);
				} else {
					this._frameLoop = null;
					this.dispatch("change");
					this._isMoving = false;
				}
			} else {
				this._frameLoop = null;
			}
		};

		this._frameLoop = requestAnimationFrame(step);
	}

	formatValue(val) {
		return val.toFixed(0);
	}

	/**
	 * @force
	 * @export
	 * @param {string} evt :
	 * @param {Function} handler :
	 */
	on(evt, handler) {
		this._dispatcher.addEventListener(evt, handler);
	}

	/**
	 * @force
	 * @export
	 * @param {string} evt :
	 * @param {Function} handler :
	 */
	off(evt, handler) {
		this._dispatcher.removeEventListener(evt, handler);
	}

	dispatch(type) {
		this._dispatcher.dispatchEvent(
			new CustomEvent(type, { detail: this.values })
		);
	}

	destroy() {
		this._frameLoop && cancelAnimationFrame(this._frameLoop);
		this.wrap.remove();
	}
}

var NativeEventTarget = self["EventTarget"];
