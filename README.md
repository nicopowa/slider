# slider

colorful mobile friendly smooth range sliders

[DEMO](https://nicopowa.github.io/slider)

## features

- mobile friendly
- single value
- multiple values
- single range
- multiple ranges
- linked ranges
- events triggers

## values | ranges

- slider mode is automatic
- number of values == number of colors = value slider
- number of values == 2x number of colors = range slider
- number of values == number of colors - 1 = linked ranges slider

## slide it

```
const someSlider = new Slider(container, options);
```

## options

- min : minimum value
- max : maximum value
- stp : step value
- rng : min range size
- num : number of values
- col : color palette
- val : initial values
- fmt : format function

## events

class exposes "on" and "off" methods

```
someSlider.on("slide", vals => console.log(vals));
```

- start : slide started
- slide : ongoing slide
- change : after slide

## styling

in css file

- slideHeight : slider height
- trackHeight : slide track height
- focusHeight : sliding track height
- trackColor : track background color
- textColor : min & max labels color
- fontSize : labels font size
- animate : sliding state animation

## dev

- no dependencies
- 6k JS + 2k CSS
- compiled & minified with [closure compiler](https://developers.google.com/closure/compiler) & [sass](https://sass-lang.com/)