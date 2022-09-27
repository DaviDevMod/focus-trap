import { Fragment, useEffect, useRef } from 'react';
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function Home() {
  const controller = useSimpleFocusTrap();

  useEffect(() => {
    controller({ roots: ['root-one', 'root-two'], lock: false });
  }, []);

  const activateNestedTrapHandler = () => {
    controller({ roots: 'nested-trap', lock: false });
  };

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
          <div id="nested-trap">
            <button tabIndex={0} title="3" id="activate-nested-trap" onClick={activateNestedTrapHandler}>
              0 Click me to activate a nested trap
            </button>
            <button tabIndex={0} title="4" id="modify-me">
              0
            </button>
            <button tabIndex={0} title="5">
              0
            </button>
          </div>
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
