# Ember-g-map [![Build Status](https://travis-ci.org/asennikov/ember-g-map.svg?branch=master)](https://travis-ci.org/asennikov/ember-g-map)

An ember-cli add-on for easy integration with Google Maps.
Each object displayed on map is inserted via child component,
so you can easily declare which marker and when to display on map
using `{{#if}}` and `{{#each}}` on template level.

# Installation

* `ember install ember-g-map`

# Usage

## Simple map

```
{{g-map lat=37.7833 lng=-122.4167 zoom=12}}
```

## Map with Markers

```
{{#g-map lat=37.7833 lng=-122.4167 zoom=12}}
  {{g-map-marker lat=37.7933 lng=-122.4167}}
  {{g-map-marker lat=37.7833 lng=-122.4267}}
  {{g-map-marker lat=37.7733 lng=-122.4067}}
{{/g-map}}
```

## Map with Markers and optional Info Windows

Markers can have optional Info Windows activated on click.
To provide content for Info Window you should call `g-map-marker`
in block form with `withInfowindow` flag set to `true`.

```
{{#g-map lat=37.7833 lng=-122.4167 zoom=12}}
  {{#g-map-marker lat=37.7833 lng=-122.4267 withInfowindow=true}}
    <h2>Infowindow header</h2>
    <p>Text with {{bound}} variables</p>
    <button {{action "do"}}>Do</button>
  {{/g-map-marker}}
{{/g-map}}
```

## Map with route between 2 locations

```
{{#g-map lat=37.7833 lng=-122.4167 zoom=12}}
  {{g-map-route originLat=37.7933 originLng=-122.4167
                destinationLat=37.7733 destinationLng=-122.4167}}
{{/g-map}}
```

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
