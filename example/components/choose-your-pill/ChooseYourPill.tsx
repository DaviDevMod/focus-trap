import * as React from 'react';

import './ChooseYourPill.css';
import { PillChoice } from '../../types';
import { TrapConfig } from '../../../src';
import Modal from '../UI/modal/Modal';

interface Props {
  onChoice: (choice: PillChoice) => void;
}

const trapConfig: TrapConfig = {
  trapRoot: 'overlays',
  escaper: { identifier: 'closeModal' },
  initialFocus: 'closeModal',
};

function ChooseYourPill(props: Props) {
  const [chosenPill, setChosenPill] = React.useState(PillChoice.BluePill);

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChosenPill(event.currentTarget.value as PillChoice);
  };

  const closeHandler = () => props.onChoice(PillChoice.NoChoice);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onChoice(chosenPill);
  };

  return (
    <Modal onClose={closeHandler} rootId="overlays" trapConfig={trapConfig}>
      <fieldset className="give_choice">
        <legend>
          You take the blue pill - the story ends, you wake up in your bed and believe whatever you want to
          believe.
          <br />
          You take the red pill - you stay in Wonderland and I show you how deep the rabbit-hole goes.
        </legend>
        <form onSubmit={submitHandler}>
          <div className="options">
            <label>
              <input
                type="radio"
                name="pill"
                className="blue_pill"
                value={PillChoice.BluePill}
                checked={chosenPill === PillChoice.BluePill}
                onChange={changeHandler}
              />
              Blue pill
            </label>
            <label>
              <input
                type="radio"
                name="pill"
                className="red_pill"
                value={PillChoice.RedPill}
                checked={chosenPill === PillChoice.RedPill}
                onChange={changeHandler}
              />
              Red pill
            </label>
          </div>
          <div className="actions">
            <button id="closeModal" type="button" onClick={closeHandler}>
              Turn back
            </button>
            <button type="submit">Take the pill</button>
          </div>
        </form>
      </fieldset>
    </Modal>
  );
}

export default ChooseYourPill;
