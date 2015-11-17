# Ember-g-map [![Build Status](https://travis-ci.org/asennikov/ember-g-map.svg?branch=master)](https://travis-ci.org/asennikov/ember-g-map) [![Ember Observer Score](http://emberobserver.com/badges/ember-g-map.svg)](http://emberobserver.com/addons/ember-g-map) [![Coverage Status](https://coveralls.io/repos/asennikov/ember-g-map/badge.svg?branch=master&service=github)](https://coveralls.io/github/asennikov/ember-g-map?branch=master) [![Code Climate](https://codeclimate.com/github/asennikov/ember-g-map/badges/gpa.svg)](https://codeclimate.com/github/asennikov/ember-g-map)

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

## Map with custom options

Any [custom options](https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions)
(except for `center` and `zoom` to avoid conflicts) could be set for
Google Map object on creation and updated on change.

```handlebars
{{g-map lat=37.7833 lng=-122.4167 zoom=12 options=customOptions}}
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

## Map with Info Windows

These Info Windows will be open right after component is rendered
and will be closed forever after user closes them. You can specify
optional `onClose` action to tear down anything you need when Info Window
has been closed by user.

```handlebars
{{#g-map lat=37.7833 lng=-122.4167 zoom=12 as |context|}}
  {{#g-map-infowindow context lat=37.7733 lng=-122.4067}}
    <h1>Info Window with Block</h1>
    <p>Text with {{bound}} variables</p>
    <button {{action "do"}}>Do</button>
  {{/g-map-infowindow}}
  {{g-map-infowindow context lat=37.7733 lng=-122.4067
                     title="Blockless form" message="Plain text."}}
  {{g-map-infowindow context lat=37.7733 lng=-122.4067
                     title="With action set"
                     onClose="myOnCloseAction"}}
  {{g-map-infowindow context lat=37.7733 lng=-122.4067
                     title="With closure action set"
                     onClose=(action "myOnCloseAction")}}
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

## Map with Markers and bound Info Windows

Markers can have bound Info Windows activated on click.
To properly bind Info Window with Marker you should call `g-map-marker`
in block form and set context of Info Window to the one provided by Marker.

```handlebars
{{#g-map lat=37.7833 lng=-122.4167 zoom=12 as |context|}}
  {{g-map-marker context lat=37.7933 lng=-122.4167}}
  {{#g-map-marker context lat=37.7833 lng=-122.4267 as |markerContext|}}
    {{#g-map-infowindow markerContext}}
      <h2>Bound Info Window</h2>
    {{/g-map-infowindow}}
  {{/g-map-marker}}
{{/g-map}}
```

## Grouped Markers with Info Windows

Additionally you can specify parameter `group` which ensures that only
one Info Window is open at each moment for Markers of each group.

```handlebars
{{#g-map lat=37.7833 lng=-122.4167 zoom=12 as |context|}}

  {{#g-map-marker context group="cats" lat=37.7833 lng=-122.4167 as |markerContext|}}
    {{#g-map-infowindow markerContext}}
      <h2>Cat #1</h2>
    {{/g-map-infowindow}}
  {{/g-map-marker}}
  {{#g-map-marker context group="cats" lat=37.7433 lng=-122.4467 as |markerContext|}}
    {{#g-map-infowindow markerContext}}
      <h2>Cat #2</h2>
    {{/g-map-infowindow}}
  {{/g-map-marker}}

  {{#g-map-marker context group="dogs" lat=37.7533 lng=-122.4167 as |markerContext|}}
    {{#g-map-infowindow markerContext}}
      <h2>Dog #1</h2>
    {{/g-map-infowindow}}
  {{/g-map-marker}}
  {{#g-map-marker context group="dogs" lat=37.7733 lng=-122.4467 as |markerContext|}}
    {{#g-map-infowindow markerContext}}
      <h2>Dog #2</h2>
    {{/g-map-infowindow}}
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

- Auto-closing Info Windows
- Polylines & Polygons
- Google Maps events

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
