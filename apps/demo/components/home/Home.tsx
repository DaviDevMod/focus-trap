import { Fragment, useEffect, useRef } from 'react';
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  //const controller = useSimpleFocusTrap({ root: 'secondRoot' });
  const controller = useSimpleFocusTrap();

  useEffect(() => {
    //controller([rootRef.current!, 'secondRoot']);
    controller({ root: [rootRef.current!, 'secondRoot'], lock: false });
  }, []);

  return (
    <Fragment>
      <div id="root" ref={rootRef} className="bg-blue-300">
        <fieldset>
          <legend>Choose your radio</legend>
          <div>
            <label>
              <input type="radio" name="name" value="BLUE" />
              Blue
            </label>
            <label>
              <input type="radio" name="name" value="RED" defaultChecked />
              Red
            </label>
            <label>
              <input type="radio" name="name" value="WHA" />
              Wha?
            </label>
          </div>
        </fieldset>
        <div>
          <button tabIndex={0}>zero</button>
        </div>
        <div>
          <button tabIndex={2}>TWO</button>
        </div>
        <div>
          <button tabIndex={1}>ONE</button>
        </div>
        <div>
          <button tabIndex={-1}>negative</button>
        </div>
        <div>
          <button tabIndex={0}>zero</button>
        </div>
        <div>
          <button tabIndex={-1}>negative outside edges</button>
        </div>
      </div>

      <div>
        <button tabIndex={-1}>negative outside trap</button>
      </div>
      <div>
        <button tabIndex={0}>zero outside trap</button>
      </div>
      <div>
        <button tabIndex={1}>ONE outside trap</button>
      </div>

      <div id="secondRoot" className="bg-blue-300">
        <div>
          <button tabIndex={2}>TWO</button>
        </div>
        <div>
          <button tabIndex={0}>zero</button>
        </div>
        <div>
          <button tabIndex={0}>zero</button>
        </div>
      </div>
    </Fragment>
  );
}

export default Home;
