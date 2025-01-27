# Slider

Colorful mobile friendly smooth range sliders

[DEMO](https://nicopowa.github.io/slider)

## Features

- Mobile friendly
- Single value
- Multiple values
- Single range
- Multiple ranges
- Linked ranges
- Events

## Slide it

```
const someSlider = new Slider(container, options);
```

See examples in main.js file.

## Values | ranges

- Slider mode is automatic
- Number of values == number of colors = value slider
- Number of values == 2x number of colors = range slider
- Number of values == number of colors - 1 = linked ranges slider

## Options

- min : minimum value
- max : maximum value
- val : initial values
- col : color palette
- num : number of values (if val not defined)
- stp : step value
- rng : min range size
- fmt : format function

## Events

Use "on" and "off" methods :

```
someSlider.on("slide", vals => console.log(vals));
```

- start : slide started
- slide : ongoing slide
- change : after slide

## Data

Values getter & dispatched events data structure depends on slider mode :

- Single value : number
- Multiple values : array of numbers
- Range (single, multiple, linked) : array of ranges [min, max]

## Styling

Edit root section in CSS file :

- slideHeight : slider height
- trackHeight : slide track height
- focusHeight : sliding track height
- trackColor : track background color
- textColor : min & max labels color
- fontSize : labels font size
- animate : sliding state animation

## Code

- No dependencies
- 6k JS + 2k CSS
- Compiled & minified with [closure compiler](https://developers.google.com/closure/compiler) & [sass](https://sass-lang.com/)

## Next

- Optimize animation loop
- Minimize elements updates
- Callbacks dispatcher
- Keyboard controls
- Accessibility