---
title: Simple Usage
order: 1
---

本 Demo 演示一行文字的用法。

````jsx
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import AsyncSelect from '@goworks/async-select';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

var mock = new MockAdapter(axios, { delayResponse: 1000 });

const mockDataSource = [{
  code: "testTag1",
  name: "testTagName1"
}, {
  code: "testTag2",
  name: "testTagName2"
}, {
  code: "tag3",
  name: "TestTag3"
}, {
  code: "testTag4",
  name: "testTagName4"
}];

mock.onGet("/api/tag/search").reply(function (config) {
  const {params} = config;
  const {keyword} = params;
  return [
    200,
    {
      success: true,
      data: keyword ? mockDataSource.filter(elem => elem.name.includes(keyword)) : mockDataSource,
    },
  ];
});

class App extends Component {
  render() {
    return (
      <div>
        <AsyncSelect
          dataURL="/api/tag/search"
          dataFilter={(result) => (result || []).map((elem) => ({
            label: elem.name,
            value: elem.code,
          }))}
        />
      </div>
    );
  }
}

ReactDOM.render((
  <App />
), mountNode);
````
