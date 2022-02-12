import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import { PillChoice } from './types';
import ChooseYourPill from './components/choose-your-pill/ChooseYourPill';

function App() {
  const [showChoice, setShowChoice] = React.useState(false);
  const [choice, setChoice] = React.useState(PillChoice.NoChoice);

  const goAheadHandler = () => setShowChoice(true);

  const choiceHandler = (choice: PillChoice) => {
    setShowChoice(false);
    setChoice(choice);
  };

  const turnBackHandler = () => setChoice(PillChoice.NoChoice);

  const openingLine = (
    <React.Fragment>
      <h1>This is your last chance</h1>
      <p>After this, there is no turning back.</p>
      <button type="button" onClick={goAheadHandler}>
        Go ahead
      </button>
    </React.Fragment>
  );

  const bluePillLine = <h1 className="white_text">You have chosen to believe whatever you want.</h1>;

  const redPillLine = <h1 className="white_text">This is how deep the rabbit hole goes.</h1>;

  const turnBack = (
    <button type="button" onClick={turnBackHandler}>
      Turn back
    </button>
  );

  return (
    <section className="evergreen">
      {!choice && openingLine}
      {showChoice && <ChooseYourPill onChoice={choiceHandler} />}
      {choice === PillChoice.BluePill && bluePillLine}
      {choice === PillChoice.RedPill && redPillLine}
      {choice && turnBack}
    </section>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
