import { Fragment, useEffect, useRef } from 'react';
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function Home() {
  // const rootRef = useRef<HTMLDivElement>(null);
  // const controller = useSimpleFocusTrap({ root: 'secondRoot' });
  const controller = useSimpleFocusTrap();
  const clickMeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    controller({ root: ['root-one', 'root-two'], lock: false });
  }, []);

  const clickMeHandler = () => (clickMeRef.current!.tabIndex = -1);

  return (
    <Fragment>
      <section>
        <button tabIndex={1} title="-0-6">
          1
        </button>
        <button tabIndex={0} title="-3-2">
          0
        </button>
        <button tabIndex={-1} title="-2-6">
          -1
        </button>

        <div id="root-one">
          <button tabIndex={2} title="2">
            2
          </button>
          <button tabIndex={1} title="0">
            1
          </button>
          <button tabIndex={0} title="3">
            0
          </button>
          <button tabIndex={0} title="4" id="clickMe" onClick={clickMeHandler} ref={clickMeRef}>
            0
          </button>
          <button tabIndex={0} title="5">
            0
          </button>
        </div>

        <button tabIndex={1} title="-1-0">
          1
        </button>
        <button tabIndex={0} title="-6-5">
          0
        </button>
        <button tabIndex={-1} title="-1-5">
          -1
        </button>

        <div id="root-two">
          <button tabIndex={-1} title="-1-5">
            -1 before edge
          </button>
          <button tabIndex={1} title="1">
            1
          </button>
          <button tabIndex={-1} title="-6-1">
            -1 within edges
          </button>
          <button tabIndex={0} title="6">
            0
          </button>
          <button tabIndex={-1} title="-2-6">
            -1 after edge
          </button>
        </div>
      </section>
    </Fragment>
  );
}

export default Home;
