/* @flow */

import React from 'react';
// import ReactDOM from 'react-dom';

type Props = {
  classes: Object,
};

class App extends React.Component<Props> {
  render() {
    const { classes } = this.props;
    return <div>Hello</div>;
  }
}

export default App;
