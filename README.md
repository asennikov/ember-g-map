# Ember-g-map [![Build Status](https://travis-ci.org/asennikov/ember-g-map.svg?branch=master)](https://travis-ci.org/asennikov/ember-g-map) [![Ember Observer Score](http://emberobserver.com/badges/ember-g-map.svg)](http://emberobserver.com/addons/ember-g-map)

An ember-cli add-on for easy integration with Google Maps.
Each object displayed on map is inserted via child component,
so you can easily declare which marker and when to display on map
using `{{#if}}` and `{{#each}}` on template level.

# Installation

* `ember install ember-g-map`

# Configuration

You must define the size of the canvas in which the map is displayed.
Simply add something similar to this to your styles:

```css
.g-map-canvas {
  width: 600px;
  height: 400px;
}
```

In `config/environment.js` you can specify additional Google Maps libraries
to be loaded along with this add-on (check the full list [here](https://developers.google.com/maps/documentation/javascript/libraries))
and optional API key for your application (additional info could be found [here](https://developers.google.com/maps/web/)).

```javascript
ENV['g-map'] = {
  libraries: ['places', 'geometry'],
  key: 'your-unique-google-map-api-key'
}
```

# Usage

## Simple map

```handlebars
{{g-map lat=37.7833 lng=-122.4167 zoom=12}}
```

## Map with Markers

Mandatory `context` attribute ties child-elements
with the main `g-map` component.

```handlebars
{{#g-map lat=37.7833 lng=-122.4167 zoom=12 as |context|}}
  {{g-map-marker context lat=37.7933 lng=-122.4167}}
  {{g-map-marker context lat=37.7833 lng=-122.4267}}
  {{g-map-marker context lat=37.7733 lng=-122.4067}}
{{/g-map}}
```

## Map fits to show all initial Markers

`shouldFit` attribute overrides `lat`, `lng`, `zoom` settings.

```handlebars
{{#g-map shouldFit=true as |context|}}
  {{g-map-marker context lat=37.7933 lng=-122.4167}}
  {{g-map-marker context lat=37.7833 lng=-122.4267}}
  {{g-map-marker context lat=37.7733 lng=-122.4067}}
{{/g-map}}
```

## Map with Markers and optional Info Windows

Markers can have optional Info Windows activated on click.
To provide content for Info Window you should call `g-map-marker`
in block form with `withInfowindow` flag set to `true`.

```handlebars
{{#g-map lat=37.7833 lng=-122.4167 zoom=12 as |context|}}
  {{g-map-marker context lat=37.7933 lng=-122.4167}}
  {{#g-map-marker context lat=37.7833 lng=-122.4267 withInfowindow=true}}
    <h2>Infowindow header</h2>
    <p>Text with {{bound}} variables</p>
    <button {{action "do"}}>Do</button>
  {{/g-map-marker}}
{{/g-map}}
```

## Map with route between 2 locations

Using Google Maps [Directions](https://developers.google.com/maps/documentation/javascript/directions) service.

```handlebars
{{#g-map lat=37.7833 lng=-122.4167 zoom=12 as |context|}}
  {{g-map-route context
                originLat=37.7933 originLng=-122.4167
                destinationLat=37.7733 destinationLng=-122.4167}}
{{/g-map}}
```

## Demo

http://asennikov.github.io/ember-g-map/

# Planned Features

- Independent Info Windows
- Auto-closing Info Windows
- Polylines & Polygons

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## Legal

[Licensed under the MIT license](http://www.opensource.org/licenses/mit-license.php)
