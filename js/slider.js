/**
 * @force
 * @export
 * @class Slider :
 */
class Slider {

	/**
	 * @construct
	 * @param {HTMLElement|string} container :
	 * @param {!SliderOptions=} opts :
	 */
	constructor(container, opts = {}) {

		this.dec = String(opts.stp || "")
		.includes(".")
			? String(opts.stp)
			.split(".")[1].length
			: 0;

		opts = {
			min: 0,
			max: 100,
			stp: 1,
			num: 1,
			col: "#4A90E2",
			fmt: v => 
				v.toFixed(this.dec),
			val: null,
			rng: 0,
			...opts
		};

		this.track
			= this.ranges
			= this.valueBox
			= this.labelBox
			= this.minLabel
			= this.maxLabel
			= this.valueLabels
			= this._frameLoop
				= null;

		this._startVal = 0;
		this._startPos = 0;

		this._step = opts.stp;
		this._range = opts.max - opts.min;
		
		this._disp = opts.fmt;
		this._colors = [opts.col].flat();
		this._ranged = opts.rng;
		this._activeIdx = -1;
		this._isMoving = false;
		this._frameLoop = null;

		const values = opts.val
			? [opts.val].flat()
			: this._defaultValues(opts.num);

		this._num = values.length;
		this._vals = Array(this._num)
		.fill(0);
		this._targetVals = Array(this._num)
		.fill(0);
		this._min = opts.min;
		this._max = opts.max;

		this.wrap = container;

		if(typeof container === "string") 
			this.wrap = document
			.querySelector(container);

		this.wrap.classList.add("slider");
		this.wrap.tabIndex = 0;

		this._createElements();
		
		this._setupEvents();

		this.values = values;

		this._evts = new NativeEventTarget();
	
	}

	_createElements() {

		const c = cls =>
			Object.assign(
				document.createElement("div"),
				{
					className: cls 
				}
			);

		[
			this.track,
			this.valueBox,
			this.labelBox,
			this.minLabel,
			this.maxLabel
		] = ["track", "vals", "lbls", "", ""].map(c);

		this.ranges = Array(Math.max(
			this._num,
			this._colors.length
		))
		.fill(0)
		.map(() => 
			c("range"));

		this.valueLabels = Array(this._num)
		.fill(0)
		.map(() => 
			c("val"));

		this.valueBox.append(...this.valueLabels);
		this.wrap.append(this.valueBox);

		this.track.append(...this.ranges);
		this.wrap.append(this.track);

		this.labelBox.append(
			this.minLabel,
			this.maxLabel
		);
		this.wrap.append(this.labelBox);

		this.minLabel.innerText = this._disp(this._min);
		this.maxLabel.innerText = this._disp(this._max);
	
	}

	_setupEvents() {

		const move = evt => 
				this._activeIdx !== -1 && this._onMove(evt),
			up = evt => 
				this._activeIdx !== -1 && this._onUp(evt);

		this.wrap
		.addEventListener(
			"pointerdown",
			evt => 
				this._onDown(evt)
		);

		["pointermove", "pointerup", "pointercancel"].forEach(evt =>
			this.wrap
			.addEventListener(
				evt,
				evt === "pointermove" ? move : up
			));

		// this.wrap.addEventListener("keydown", evt => this._onKey(evt));
	
	}

	_defaultValues(n) {

		const stp = this._range / (n + 1);

		return Array(n)
		.fill(0)
		.map((_, i) => 
			this._roundToStep(this._min + stp * (i + 1)));
	
	}

	/**
	 * @export
	 * @getter
	 * @type {number|Array} values : slider values
	 */
	get values() {

		const vals = this._vals.map(v => 
			this._roundToStep(v));

		if(this._num === 1) 
			return vals[0];

		if(this._colors.length >= this._num) 
			return vals;

		if(this._colors.length === this._num - 1) {

			const sorted = [...vals].sort((a, b) => 
				a - b);

			return Array(sorted.length - 1)
			.fill(0)
			.map((_, i) => 
				[sorted[i], sorted[i + 1]]);
		
		}

		if(this._num % 2 === 0) {

			const ranges = [];

			for(let i = 0; i < vals.length; i += 2) 
				ranges
				.push(
					[vals[i], vals[i + 1]]
					.sort((a, b) => 
						a - b)
				);

			return ranges.length === 1 ? ranges[0] : ranges;
		
		}

		const sorted = [...vals].sort((a, b) => 
			a - b);

		return Array(sorted.length - 1)
		.fill(0)
		.map((_, i) => 
			[sorted[i], sorted[i + 1]]);
	
	}

	/**
	 * @setter
	 * @type {number|Array} values : slider values
	 */
	set values(v) {

		// IGNORE IF USER IS SLIDING ?

		const newVals = [v]
		.flat()
		.map(val => 
			(Array.isArray(val) ? val : [val]))
		.flat();

		if(newVals.length !== this._num) {

			throw new Error(this._num + " values expected");
		
		}

		this._vals = newVals.map(v => 
			this._forceRange(+v));
		this._targetVals = [...this._vals];
		this._updateUI();
	
	}

	/**
	 * @export
	 * @getter
	 * @type {Array} colors : slider colors
	 */
	get colors() {

		return this._colors;
	
	}

	/**
	 * @setter
	 * @type {Array} colors : slider colors
	 */
	set colors(c) {

		this._colors = c;

		this._updateUI();
	
	}

	_calculateLabelPositions(pos) {

		const rWidth = this.wrap.offsetWidth,
			minGap = 4;

		const labels = pos
		.map((p, i) => 
			({
				origPos: p,
				origPx: (p / 100) * rWidth,
				idx: i,
				fullWidth: this.valueLabels[i].offsetWidth,
				halfWidth: this.valueLabels[i].offsetWidth / 2
			}))
		.sort((a, b) => 
			a.origPx - b.origPx);

		const result = [...pos];
		const processEdge = (l, left) => {

			const edgePx = left ? l.halfWidth : rWidth - l.halfWidth,
				off = left ? 1 : -1;

			l.origPx = edgePx;
			result[l.idx] = (edgePx / rWidth) * 100;

			labels
			.filter(
				o =>
					o !== l
						&& Math.abs(o.origPx - l.origPx) < l.fullWidth + minGap
			)
			.forEach((n, i) => {

				n.origPx = edgePx + (i + 1) * (minGap + 2) * off;
				result[n.idx] = (n.origPx / rWidth) * 100;
			
			});
		
		};

		labels
		.filter(l => 
			l.origPx < l.halfWidth)
		.forEach(l => 
			processEdge(
				l,
				true
			));
			
		labels
		.filter(l => 
			l.origPx > rWidth - l.halfWidth)
		.forEach(l => 
			processEdge(
				l,
				false
			));

		for(let iter = 0, hasOverlap = true; hasOverlap && iter < 50; iter++) {

			hasOverlap = false;

			for(let i = 0; i < labels.length - 1; i++) {

				const [c, n] = [labels[i], labels[i + 1]],
					minSpace = (c.fullWidth + n.fullWidth) / 2 + minGap,
					space = n.origPx - c.origPx;

				if(space < minSpace) {

					hasOverlap = true;
					const adj = (minSpace - space) / 2,
						lAdj = Math.min(
							adj,
							c.origPx - c.halfWidth
						),
						rAdj = Math.min(
							adj,
							rWidth - n.halfWidth - n.origPx
						);

					c.origPx -= lAdj;
					n.origPx += rAdj;
					result[c.idx] = (c.origPx / rWidth) * 100;
					result[n.idx] = (n.origPx / rWidth) * 100;
				
				}
			
			}
		
		}

		return result;
	
	}

	_updateUI() {

		const pos = this._vals.map(
				v => 
					((v - this._min) / this._range) * 100
			),
			cLen = this._colors.length,
			sorted = this._vals
			.map((v, i) => 
				({
					v, i 
				}))
			.sort((a, b) => 
				b.v - a.v)
			.map(x => 
				x.i);

		if(cLen >= this._num) {

			pos.forEach((p, i) =>
				this._updateLine(
					this.ranges[i],
					0,
					p,
					this._colors[i],
					sorted.indexOf(i) + 1
				));
		
		}
		else if(cLen === this._num - 1) {

			const sVals = [...this._vals].sort((a, b) => 
				a - b);

			for(let i = 0; i < this._num - 1; i++) {

				const [p1, p2] = [
					((sVals[i] - this._min) / this._range) * 100,
					((sVals[i + 1] - this._min) / this._range) * 100
				];

				this._updateLine(
					this.ranges[i],
					p1,
					p2 - p1,
					this._colors[i],
					i + 1
				);
			
			}
		
		}
		else if(this._num % 2 === 0) {

			for(let i = 0; i < this._num; i += 2) {

				const [p1, p2] = [pos[i], pos[i + 1]],
					[l, r] = p1 < p2 ? [p1, p2] : [p2, p1];

				this._updateLine(
					this.ranges[i / 2],
					l,
					r - l,
					this._colors[(i / 2) % cLen],
					i / 2 + 1
				);
			
			}
		
		}
		else {

			const sVals = this._vals
			.map((v, i) => 
				({
					v, i 
				}))
			.sort((a, b) => 
				a.v - b.v);

			for(let i = 0; i < sVals.length - 1; i++) {

				const [p1, p2] = [pos[sVals[i].i], pos[sVals[i + 1].i]];

				this._updateLine(
					this.ranges[i],
					Math.min(
						p1,
						p2
					),
					Math.abs(p2 - p1),
					this._colors[i],
					i + 1
				);
			
			}
		
		}

		const adjPos = this._calculateLabelPositions(pos);

		this._vals.forEach((val, i) => {

			let cIdx;

			if(cLen >= this._num) {

				cIdx = i;
			
			}
			else if(cLen === this._num - 1) {

				const sorted = [...this._vals]
				.map((v, idx) => 
					({
						v, idx 
					}))
				.sort((a, b) => 
					a.v - b.v);
				const myPos = sorted.findIndex(x => 
					x.idx === i);

				cIdx = Math.min(
					myPos,
					cLen - 1
				);
			
			}
			else if(this._num % 2 === 0) {

				cIdx = Math.floor(i / 2) % cLen;
			
			}
			else {

				const sortedVals = [
					...new Set([...this._vals].sort((a, b) => 
						a - b))
				];

				cIdx = Math.min(
					sortedVals.indexOf(val),
					cLen - 1
				);
			
			}

			const label = this.valueLabels[i];

			label.innerText = this._disp(this._roundToStep(val));

			this._updateLabel(
				label,
				adjPos[i],
				this._colors[cIdx]
			);
		
		});
	
	}

	_updateLine(el, lft, wth, col, zdx) {

		Object.assign(
			el.style,
			{
				left: lft + "%",
				width: wth + "%",
				backgroundColor: col,
				zIndex: zdx
			}
		);
	
	}

	_updateLabel(el, lft, col) {

		const [rW, lW] = [this.wrap.offsetWidth, el.offsetWidth],
			pxPos = (lft / 100) * rW,
			edge = lW / 2;

		let tX = -50;

		if(pxPos < edge) 
			tX = -((pxPos / edge) * 50);
		else if(pxPos > rW - edge) 
			tX = -100 + ((rW - pxPos) / edge) * 50;

		Object.assign(
			el.style,
			{
				left: lft + "%",
				color: col,
				transform: `translateX(${tX}%)`
			}
		);
	
	}

	_roundToStep(v) {

		return this._forceRange(
			+parseFloat(this._step * Math.round(v / this._step))
			.toFixed(
				this.dec
			)
		);
	
	}

	_forceRange(v) {

		return Math.max(
			this._min,
			Math.min(
				this._max,
				v
			)
		);
	
	}

	_onDown(e) {

		const rect = this.wrap.getBoundingClientRect(),
			pos = (e.clientX - rect.left) / rect.width,
			val = this._min + pos * this._range;

		this._activeIdx = this._vals.reduce(
			(c, _, i) =>
				Math.abs(val - this._vals[i]) < Math.abs(val - this._vals[c])
					? i
					: c,
			0
		);
		[this._startVal, this._startPos] = [this._vals[this._activeIdx], pos];
		this._isMoving = false;
		this._slideState(true);

		this.wrap
		.setPointerCapture(e.pointerId);
	
	}

	_onMove(e) {

		const rect = this.wrap.getBoundingClientRect(),
			pos = (e.clientX - rect.left) / rect.width,
			delta = pos - this._startPos;

		let newVal = this._roundToStep(this._startVal + delta * this._range);

		if(
			this._ranged
			&& this._num % 2 === 0
			&& this._colors.length < this._num
		) {

			const pIdx
					= this._activeIdx % 2 === 0
						? this._activeIdx + 1
						: this._activeIdx - 1,
				pVal = this._vals[pIdx],
				isLower = this._activeIdx % 2 === 0;

			if(isLower ? newVal > pVal : newVal < pVal) {

				this._targetVals[pIdx] = newVal;
				this._targetVals[this._activeIdx] = pVal;
				[this._activeIdx, this._startVal, this._startPos] = [
					pIdx,
					pVal,
					pos
				];

				return this._animate();
			
			}

			newVal = isLower
				? Math.min(
					newVal,
					pVal - this._ranged
				)
				: Math.max(
					newVal,
					pVal + this._ranged
				);
		
		}

		if(!this._isMoving && newVal !== this._targetVals[this._activeIdx]) {

			this._isMoving = true;
			this._dispatch("start");
		
		}

		this._targetVals[this._activeIdx] = newVal;
		this._animate();
	
	}

	_onUp(e) {

		this.wrap
		.releasePointerCapture(e.pointerId);

		[this._activeIdx, this._isMoving] = [-1, false];

		this._slideState(false);
	
	}

	_onKey(evt) {

		// console.log("key", evt.key);

		/*

		handle multiple tabindex to select all cursors

		*/

		const keySteps = [
			["ArrowLeft", "ArrowDown"], 
			["ArrowRight", "ArrowUp"]
		];

		const idx = keySteps.findIndex(keys => 
			keys.includes(evt.key));

		if(idx != -1) {

			const dir = idx * 2 - 1;

			// NOT RESPECTING MIN RANGE
			this._targetVals[0] = this._forceRange(this._targetVals[0] + dir * this._step);
			// this._updateUI();
			// this._changes();
			this._animate();

		}

	}

	_animate() {

		if(this._frameLoop) 
			return;

		const step = () => {

			let [needsUpdate, valueChanged] = [false, false];
			const EASE = 0.2;
			const PRECISION = this._step / 10;

			this._vals.forEach((val, i) => {

				const target = this._targetVals[i];

				if(val !== target) {

					const delta = target - val;

					if(Math.abs(delta) < PRECISION) {

						this._vals[i] = target;
						valueChanged = true;
					
					}
					else {

						this._vals[i] = val + delta * EASE;
						needsUpdate = true;
					
					}
				
				}
			
			});

			if(needsUpdate || valueChanged) {

				this._updateUI();
				this._dispatch("slide");

				if(needsUpdate) {

					this._frameLoop = requestAnimationFrame(step);
				
				}
				else {

					this._frameLoop = null;
					this._changes();

					this._isMoving = false;
				
				}
			
			}
			else 
				this._frameLoop = null;
		
		};

		this._frameLoop = requestAnimationFrame(step);
	
	}

	_slideState(stt) {

		this.wrap.classList.toggle(
			"sliding",
			stt
		);
	
	}

	/**
	 * @force
	 * @export
	 * @method on :
	 * @param {string} evt :
	 * @param {Function} handler :
	 */
	on(evt, handler) {

		this._evts
		.addEventListener(
			evt,
			handler
		);

		return this;
	
	}

	/**
	 * @force
	 * @export
	 * @method off :
	 * @param {string} evt :
	 * @param {Function} handler :
	 */
	off(evt, handler) {

		this._evts
		.removeEventListener(
			evt,
			handler
		);
	
	}

	_dispatch(type) {

		this._evts.dispatchEvent(
			new CustomEvent(
				type,
				{
					detail: this.values 
				}
			)
		);
	
	}

	_changes() {

		this._dispatch("change");

	}

	destroy() {

		if(this._frameLoop) 
			cancelAnimationFrame(this._frameLoop);

		// off listeners
		this.wrap
		.remove();
	
	}

}

// closure compiler warning fix
var NativeEventTarget = self["EventTarget"];
