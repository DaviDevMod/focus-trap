import { Fragment, useState } from 'react';

//import './index.css';
import { PillChoice } from '../../types/types';
import ChooseYourPill from '../choose-your-pill/ChooseYourPill';

function Home() {
  const [showChoice, setShowChoice] = useState(false);
  const [choice, setChoice] = useState(PillChoice.NoChoice);

  const goAheadHandler = () => setShowChoice(true);

  const choiceHandler = (choice: PillChoice) => {
    setShowChoice(false);
    setChoice(choice);
  };

  const turnBackHandler = () => setChoice(PillChoice.NoChoice);

  const openingLine = (
    <Fragment>
      <h1>This is your last chance</h1>
      <p>After this, there is no turning back.</p>
      <button type="button" onClick={goAheadHandler}>
        Go ahead
      </button>
    </Fragment>
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

export default Home;
