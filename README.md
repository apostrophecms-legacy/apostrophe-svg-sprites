# apostrophe-svg-sprites

`apostrophe-images` for SVGs in external sprite maps!
![Managing sprites with apostrophe-svg-sprites](https://github.com/apostrophecms/apostrophe-svg-sprites/raw/1.0.0/demo.gif)

This bundle provides a piece subclass that manages and renders SVG sprites referenced from external maps and an accompanying widget for display.

This bundle assumes you are compiling/managing the SVG maps on your own (Gulp, Webpack, manual). 

The bundle also assumes *either* that your shipping the files in the project level module `lib/modules/apostrophe-svg-sprites/public` or that your referencing the files on a public webserver (`http://mysite.websites/svg/icons.svg`)

This module is *not* an interface for uploading SVG files or pasting SVG markup.

Bundle consists of 

* `apostrophe-svg-sprites` as a piece subclass for managing SVGs, similar to `apostrophe-images`
* `apostrophe-svg-sprites-widgets` as a way to render the SVG on a page

`apostrophe-svg-sprites` supports multiple source maps for multiple sets of SVGs.

## Example configuration

```javascript
bundles: [ 'apostrophe-svg-sprites' ],
modules: {
  'apostrophe-svg-sprites': {
    maps: [
      {
        label: 'Social Media Icons',
        name: 'social',
        file: 'svg/social.svg' // Would be found in /public/svg/social.svg
      },
      {
        label: 'Places Icons',
        name: 'places',
        file: 'svg/places-*.svg' // filename uses a wildcard because it is part of a continuous build process
      },
      {
        label: 'Interface Icons',
        name: 'interface',
        file: 'http://mysite.websites/svg/icons.svg' // externally requested resource
      }
    ]
  },
  'apostrophe-svg-sprites-widgets': {},
}


```
## Example markup output

```HTML
  <svg>
    <use xlink:href="{{ svg.file }}#{{ svg.id }}"></use>
  </svg>
```

## Example spritemap format
Important, all `<symbol>` elements need to be peers of one another at the same node depth.

In `lib/modules/apostrophe-svg-sprites/public/svg/places.svg`

```XML
<svg xmlns="http://www.w3.org/2000/svg">
	<symbol width="24" height="24" viewBox="0 0 24 24" id="ic_ac_unit_24px" >
		<path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z" />
	</symbol>
	<symbol width="24" height="24" viewBox="0 0 24 24" id="ic_airport_shuttle_24px" >
		<path d="M17 5H3a2 2 0 0 0-2 2v9h2c0 1.65 1.34 3 3 3s3-1.35 3-3h5.5c0 1.65 1.34 3 3 3s3-1.35 3-3H23v-5l-6-6zM3 11V7h4v4H3zm3 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-6.5H9V7h4v4zm4.5 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM15 11V7h1l4 4h-5z" />
	</symbol>
</svg>
```

## Importing sprites as pieces
To make getting started easier this module provides a command line task for parsing your sprite maps and automatically creating pieces for them. 

## Requirements for import
- Sprite maps must be formatted so that all `<symbol>...<symbol/>` elements are on the same node level.
- The import uses the `maps` array from 'apostrophe-svg-sprites' configuration, so that must be set beforehand.
- `<symbol>` tags must have an id attribute `<symbol id="my-cool-icon">....</symbol>`
- `<symbol>` tags can optionally have a title attribute that will be used as the piece's title field `<symbol title="my cool icon">....</symbol>`

```bash
  node app.js apostrophe-svg-sprites:import
```

## Automating running import
Your SVG map might be being built by Gulp.js or Webpack constantly, which means your Apostrophe pieces have to stay in sync with changes. The `import` task automatically updates existing sprites's details on run, so you might want to run the task as part of your build process or before each deploy.

### To run on each deploy
Just add the task to the `/deployment/migrate` file using the existing example.

## Why use external SVG maps?

SVGs
- Resolution independent
- Small footprint
- Can be manipulated via CSS and JS

`<use>` tag
- External file is cached
- Network friendly (a single resource serves many scenarios)
- No browser penalty for multiple uses of the same SVG on a single page

## Browser Support
SVG sprite maps are supported in Chrome, Safari 7.1+, Firefox, Edge 13+, Opera. Pair this module with something like [SVG for Everybody](https://github.com/jonathantneal/svg4everybody) to get support Safari 6, IE 6+, and Edge 12.