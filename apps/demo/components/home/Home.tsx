import { Fragment, useEffect, useRef } from 'react';
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function Home() {
  // const rootRef = useRef<HTMLDivElement>(null);
  // const controller = useSimpleFocusTrap({ root: 'secondRoot' });
  const controller = useSimpleFocusTrap();

  useEffect(() => {
    controller({ root: ['root-one', 'root-two'], lock: false });
  }, []);

  return (
    <Fragment>
      <section>
        <button tabIndex={1} title="-0-4">
          1
        </button>
        <button tabIndex={0} title="-3-2">
          0
        </button>
        <button tabIndex={-1} title="-2-4">
          -1
        </button>

        <div id="root-one">
          <button tabIndex={-1} title="-2-4">
            -1 before edge
          </button>
          <button tabIndex={2} title="2">
            2
          </button>
          <button tabIndex={1} title="0">
            1
          </button>
          <button tabIndex={0} title="3">
            0
          </button>
        </div>

        <button tabIndex={1} title="-1-0">
          1
        </button>
        <button tabIndex={0} title="-4-3">
          0
        </button>
        <button tabIndex={-1} title="-1-3">
          -1
        </button>

        <div id="root-two">
          <button tabIndex={1} title="1">
            1
          </button>
          <button tabIndex={-1} title="-4-1">
            -1 within edges
          </button>
          <button tabIndex={0} title="4">
            0
          </button>
          <button tabIndex={-1} title="-2-4">
            -1 after edge
          </button>
        </div>
      </section>
    </Fragment>
  );
}

export default Home;
