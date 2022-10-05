import React, { Component } from 'react';
import {Table, TableData} from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float', // prices are necessary to calculate the ratio
      price_def: 'float',
      ratio: 'float',  // We added 'ratio' to track stock's ratios
      timestamp: 'date', // Stocks are tracked according to time
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float', // We added 'trigger' to track the moment when upper/lower bounds are crossed
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]'); // row-pivots tales care about x-axis. This allows us to depict each datapoint based on its timestamp.
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound","trigger_alert"]'); // 'columns' allows to concentrate on a certain part of a datapoint’s data along the y-axis
      elem.setAttribute('aggregates', JSON.stringify({ // 'aggregates' allows us to handle the duplicate data and encompass them into one data point.
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
        this.table.update([
            DataManipulator.generateRow(this.props.data),
        ] as unknown as TableData);
    }
  }
}

export default Graph;
